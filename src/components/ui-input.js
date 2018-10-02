/**
 * Component
 * ui-input
 */

class uiInputCtrl {

    /* @ngInject */
    constructor($scope, $element, $attrs, $transclude, $timeout, $injector, $log) {
        this.$scope = $scope
        this.$attrs = $attrs
        this.$timeout = $timeout
        this.$log = $log
        this.$translate = $injector.has('$translate') ? $injector.get('$translate') : null

        this.ngModelCtrl = $element.controller('ngModel')
        this.uiFormCtrl = $element.controller('uiForm')

        this.elem = $element
        this.inputElem = $element.find('input')

        this.uiOperationStatus = {}
        this.scrollbar = {}

        this.hasLeftTransclude = $transclude.isSlotFilled('left')
        this.hasRightTransclude = $transclude.isSlotFilled('right')
        this.processing = false
        this.syncError = null
        this.customError = null

        this.modelOptions = {
            updateOn: 'default blur',
            debounce: {
                default: 'noDebounce' in $attrs ? 0 : 250,
                blur: 0
            },
            allowInvalid: true
        }

        this.ngModelCtrl.$overrideModelOptions({
            allowInvalid: true
        })

        this.uiInputInterface = {
            validate: this.validate.bind(this),
            isValid: this.isValid.bind(this),
            focus: this.focus.bind(this),
            setError: this.setError.bind(this)
        }

        $scope.$watch(() => this.ngModelCtrl.$error, this.handleErrorChange.bind(this), true)

        this.handleKeyUp = this.handleKeyUp.bind(this)
    }

    $onInit() {
        if (!this.name) {
            this.$log.warn('ui-input: No "name" attribute is set.')
        }

        if (this.uiFormCtrl) {
            this.uiFormCtrl.registerChildInterface(this.uiInputInterface)
        }

        this.ngModelCtrl.$render = () => {
            this.modelValue = this.ngModelCtrl.$viewValue
        }

        // Email validator
        if (this.type === 'email') {
            const pattern = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$', 'i')

            this.ngModelCtrl.$validators.email = () => {
                return pattern.test(this.modelValue)
            }
        }

        // Match validator
        if ('match' in this.$attrs) {
            this.ngModelCtrl.$validators.match = () => {
                return this.modelValue === this.match
            }
        }

        // Year validator
        if ('year' in this.$attrs) {
            const pattern = new RegExp('^\\d{4}$')

            this.ngModelCtrl.$validators.year = () => {
                return pattern.test(this.modelValue)
            }
        }

        // Set interface methods
        if (this.interface) {
            Object.assign(this.interface, this.uiInputInterface)
        }

        // If focus attribute is present, focus input
        if ('focus' in this.$attrs && this.$attrs.focus.length === 0) {
            this.focus()
        }
        // If focus binding is true, focus input
        else if (this._focus === true) {
            this.focus()
        }

        // Listen for keyup events if sync is enabled
        if (this.sync) {
            this.inputElem.on('keyup', this.handleKeyUp)
        }
    }

    $onDestroy() {
        if (this.uiFormCtrl) {
            this.uiFormCtrl.deregisterChildInterface(this.uiInputInterface)
        }

        if (this.sync) {
            this.inputElem.off('keyup', this.handleKeyUp)
        }
    }

    /**
     * Return true if label sholud be offset.
     *
     * @return {Boolean}
     */
    offsetLabel() {
        return this.hasLeftTransclude || this.isFocused || this.hasContent()
    }

    /**
     * Return true if input has text value.
     *
     * @return {Boolean}
     */
    hasContent() {
        return !!String(this.inputElem.val()).length
    }

    /**
     * Validate input.
     *
     * @return {Boolean}
     */
    validate() {
        this.ngModelCtrl.$setDirty()

        // Run sync check if validate is called before blur event can
        // trigger check
        if (this.syncCheck) {
            this.runSyncCheck()
        }

        return this.ngModelCtrl.$valid
    }

    /**
     * Return true if model value is considered valid.
     *
     * @return {Boolean}
     */
    isValid() {
        return this.ngModelCtrl.$valid
    }

    /**
     * Focus input element.
     */
    focus() {
        this.$timeout(() => {
            this.inputElem[0].focus()
        })
    }

    /**
     * Set custom error.
     *
     * @param {String|null} error
     */
    setError(error) {
        this.customError = error

        if (error) {
            this.ngModelCtrl.$setValidity('custom', false)
            this.ngModelCtrl.$setDirty()
        } else {
            this.ngModelCtrl.$setValidity('custom', true)
        }
    }

    /**
     * Run sync / async check.
     */
    runCheck() {
        // Don't check if model value hasn't changed
        if (this.ngModelCtrl.$pristine) {
            return
        }

        const errors = this.ngModelCtrl.$error
        const errorCount = Object.keys(errors).length
        const hasCheckError = 'check' in errors

        // Don't run check if other validation errors exist
        if (errorCount > 0 && !(errorCount === 1 && hasCheckError)) {
            return
        }

        if (this.syncCheck) {
            this.$timeout(() => this.runSyncCheck())
        } else if (this.asyncCheck) {
            this.runAsyncCheck()
        }
    }

    /**
     * Check model value if it is considered valid by executing "sync-check"
     * expression binding, which is expected to return a boolean.
     */
    runSyncCheck() {
        const valid = this.syncCheck()

        this.ngModelCtrl.$setValidity('check', valid)
    }

    /**
     * Check model value if it is considered valid by executing "async-check"
     * expression binding, which is expected to return a promise that
     * resolves to an object with a boolean "valid" property.
     */
    runAsyncCheck() {
        // Set processing state
        this.processing = true
        this.uiOperationStatus.setProcessing(true)

        // Execute expression, expect promise to be returned
        const promise = this.asyncCheck()

        if (!promise || !promise.then) {
            this.$log.warn('ui-input@asyncCheck: Executed expression has to return a promise.')
            return
        }

        // Set model validity when promise resolves
        promise
            .then(res => {
                this.processing = false

                const tip = this.$translate ? 'ACTION.RETRY' : 'Retry'

                this.uiOperationStatus.finish(res.valid, tip, this.runAsyncCheck.bind(this))

                this.ngModelCtrl.$setValidity('check', res.valid)
            })
    }

    /**
     * Sync model value by executing "sync" expression, which is
     * expected to return a Promise.
     */
    runSync() {
        // Don't sync if model value hasn't changed
        if (this.ngModelCtrl.$pristine) {
            return
        }

        const errors = this.ngModelCtrl.$error
        const errorCount = Object.keys(errors).length
        const hasSyncError = 'sync' in errors

        // Don't run check if other validation errors exist
        if (errorCount > 0 && !(errorCount === 1 && hasSyncError)) {
            return
        }

        // Set processing state
        this.processing = true
        this.uiOperationStatus.setProcessing(true)

        // Execute expression, expect promise to be returned
        const promise = this.sync()

        if (!promise || !promise.then) {
            this.$log.warn('ui-input@sync: Executed expression has to return a promise.')
            return
        }

        // Set model validity when promise resolves
        promise
            .then(res => {
                this.syncError = null
                this.processing = false

                this.uiOperationStatus.finish(true)

                this.ngModelCtrl.$setValidity('sync', true)
                this.ngModelCtrl.$setPristine(true)
            })
            .catch(res => {
                if (res.status === 422 && res.data.errors) {
                    this.syncError = res.data.errors.value[0]
                }

                this.processing = false

                const tip = this.$translate ? 'ACTION.RETRY' : 'Retry'

                this.uiOperationStatus.finish(false, tip, this.runSync.bind(this))
                this.ngModelCtrl.$setValidity('sync', false)
            })
    }

    /**
     * Handle input focus event.
     */
    handleFocus() {
        this.isFocused = true

        this.elem.addClass('focused')

        // Reset custom error
        this.setError(null)

        // If suggestions are enabled, scroll to top
        if (this.suggestions) {
            this.scrollbar.scrollToTop(false)
        }
    }

    /**
     * Handle input blur event.
     */
    handleBlur() {
        this.isFocused = false

        this.elem.removeClass('focused')

        // Trigger check
        if (this.syncCheck || this.asyncCheck) {
            this.runCheck()
        }

        // Trigger Sync
        if (this.sync) {
            this.$timeout(() => this.runSync())
        }
    }

    /**
     * Handle keyup event.
     *
     * @param {Event} event
     */
    handleKeyUp(event) {
        if (this.sync && event.code === 'Enter') {
            event.stopPropagation()
            document.activeElement.blur()
            this.sync()
        }
    }

    /**
     * Handle input container click event.
     *
     * @param {Event} event
     */
    handleContainerClick(event) {
        if (event.target.nodeName !== 'INPUT') {
            this.focus()
        }
    }

    /**
     * Handle suggestion click event.
     *
     * @param {String} suggestion
     */
    handleSuggestionClick(suggestion) {
        this.modelValue = suggestion
        this.handleChange()
    }

    /**
     * Handle ngModel change.
     */
    handleChange() {
        this.ngModelCtrl.$setViewValue(this.modelValue)

        if (this.onChange) {
            this.onChange()
        }
    }

    /**
     * Handle changing ngModelCtrl.$error object.
     *
     * @param {Object} $error
     */
    handleErrorChange($error) {
        // Required
        if ($error.required) {
            this.error = this.$translate ? 'ERROR.REQUIRED' : 'Required'
        }
        // Minlength
        else if ($error.minlength) {
            const length = this.$attrs.minlength

            if (this.$translate) {
                this.error = this.$translate.instant('ERROR.MINLENGTH', { length })
            } else {
                this.error = `${length} or more characters`
            }
        }
        // Maxlength
        else if ($error.minlength) {
            const length = this.$attrs.maxlength

            if (this.$translate) {
                this.error = this.$translate.instant('ERROR.MAXLENGTH', { length })
            } else {
                this.error = this.$translate ? 'ERROR.INVALID_EMAIL' : 'Invalid email'
            }
        }
        // Email
        else if ($error.email) {
            this.error = 'Invalid email'
        }
        // Year
        else if ($error.year) {
            this.error = this.$translate ? 'ERROR.INVALID_YEAR' : 'Invalid year'
        }
        // Match
        else if ($error.match) {
            this.error = this.$translate ? 'ERROR.FIELD_MISMATCH' : 'Fields don\'t match'
        }
        // Check
        else if ($error.check) {
            if (this.checkMessage) {
                this.error = this.checkMessage
            } else {
                this.error = this.$translate ? 'ERROR.INVALID' : 'Invalid'
            }
        }
        // Sync
        else if ($error.sync) {
            if (this.syncError) {
                this.error = this.syncError
            } else {
                this.error = this.$translate ? 'ERROR.SYNC_FAILED' : 'Sync failed'
            }
        }
        // Custom
        else if ($error.custom) {
            this.error = this.customError
        }
        // No error
        else {
            this.error = null
        }
    }

}

/* @ngInject */
const template = function($attrs) {
    const type = $attrs.type || 'text'

    let autocomplete = null

    if ($attrs.autocomplete) {
        autocomplete = $attrs.autocomplete
    } else if (type === 'email') {
        autocomplete = 'email'
    }

    // Attr: no-autocomplete
    if ('noAutocomplete' in $attrs) {
        autocomplete = 'off'
    }

    // Attr: suggestions
    if ('suggestions' in $attrs) {
        autocomplete = 'off'
    }

    const needsStatus = 'sync' in $attrs || 'syncCheck' in $attrs || 'asyncCheck' in $attrs

    return `
        <!-- Label -->
        <label
            ng-class="{ offset: $ctrl.offsetLabel() }"
            ui-defer-transition
            translate
        >{{ ::$ctrl.label }}</label>

        <div
            class="input-container"
            ng-class="{ disabled: $ctrl.disabled }"
            ng-click="$ctrl.handleContainerClick($event)"
        >
            <!-- Transclude - Left -->
            <div class="ui-input-left" ng-transclude="left"></div>

            <!-- Input -->
            <input
                type="${type}"
                ng-model="$ctrl.modelValue"
                ng-model-options="$ctrl.modelOptions"
                ng-focus="$ctrl.handleFocus()"
                ng-blur="$ctrl.handleBlur()"
                ng-change="$ctrl.handleChange()"
                ng-disabled="$ctrl.disabled"
                ${$attrs.placeholder ? `
                placeholder="${$attrs.placeholder}"
                translate-attr="${`{ placeholder: '${$attrs.placeholder}' }`}"
                ` : ''}
                translate-values="$ctrl.placeholderTranslateValues"
                ${$attrs.name ? `name="{{ $ctrl.name }}"` : ''}
                ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
                ${'noSpellcheck' in $attrs ? 'spellcheck="false"' : ''}
            >

            <!-- Transclude - Right -->
            <div class="ui-input-right" ng-transclude="right"></div>
        </div>

        <!-- Operation Status -->
        ${needsStatus ? '<ui-operation-status interface="$ctrl.uiOperationStatus"></ui-operation-status>' : ''}

        <!-- Suggestions -->
        <div class="suggestions" ng-if="$ctrl.suggestions" ui-scrollbar="$ctrl.scrollbar">
            <div
                class="suggestion"
                ng-repeat="suggestion in $ctrl.suggestions"
                ng-click="$ctrl.handleSuggestionClick(suggestion)"
                ng-bind="suggestion"
            ></div>
        </div>

        <!-- Error -->
        <div class="error" ng-show="$ctrl.error" translate>{{ $ctrl.error }}</div>
    `
}

export default {
    controller: uiInputCtrl,
    template,
    require: ['ngModel', '^uiForm'],
    bindings: {
        label: '@?',
        placeholder: '@?',
        placeholderTranslateValues: '<?',
        type: '@?',
        name: '@?',
        autocomplete: '@?',
        noAutocomplete: '@?',
        interface: '=?',
        noDebounce: '@?',
        match: '<?',
        syncCheck: '&?',
        asyncCheck: '&?',
        checkMessage: '@?',
        sync: '&?',
        disabled: '<?',
        _focus: '<?focus',
        suggestions: '<?',
        onChange: '&?'
    },
    transclude: {
        left: '?uiInputLeft',
        right: '?uiInputRight'
    }
}
