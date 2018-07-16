/**
 * Component
 * ui-input
 */

class uiInputCtrl {

    /* @ngInject */
    constructor($scope, $element, $attrs, $timeout, $injector) {
        this.$scope = $scope
        this.$attrs = $attrs
        this.$timeout = $timeout
        this.$translate = $injector.has('$translate') ? $injector.get('$translate') : null

        this.ngModelCtrl = $element.controller('ngModel')
        this.uiFormCtrl = $element.controller('uiForm')

        this.inputElem = $element.find('input')

        this.uiOperationStatus = {}

        this.processing = false

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
            validate: this.validate.bind(this)
        }

        $scope.$watch(() => this.ngModelCtrl.$error, this.handleErrorChange.bind(this), true)
    }

    $onInit() {
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

        // Set interface methods
        if (this.interface) {
            Object.assign(this.interface, this.uiInputInterface)
        }
    }

    $onDestroy() {
        if (this.uiFormCtrl) {
            this.uiFormCtrl.deregisterChildInterface(this.uiInputInterface)
        }
    }

    /**
     * Return true if label sholud be offset.
     *
     * @return {Boolean}
     */
    offsetLabel() {
        return this.isFocused || this.hasContent()
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

        return this.ngModelCtrl.$valid
    }

    /**
     * Run sync / async check.
     */
    runCheck() {
        // Don't check if model hasn't changed
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
            console.warn('ui-input@asyncCheck: Executed expression has to return a promise.')
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
     * Handle input focus event.
     */
    handleFocus() {
        this.isFocused = true
    }

    /**
     * Handle input blur event.
     */
    handleBlur() {
        this.isFocused = false

        // TODO: Trigger Sync

        // Trigger check
        if (this.syncCheck || this.asyncCheck) {
            this.runCheck()
        }
    }

    /**
     * Handle ngModel change.
     */
    handleChange() {
        this.ngModelCtrl.$setViewValue(this.modelValue)
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

    const needsStatus = 'sync' in $attrs || 'syncCheck' in $attrs || 'asyncCheck' in $attrs

    return `
        <!-- Label -->
        <label ng-class="{ offset: $ctrl.offsetLabel() }" translate>{{ ::$ctrl.label }}</label>

        <!-- Input -->
        <input
            type="${type}"
            ng-model="$ctrl.modelValue"
            ng-model-options="$ctrl.modelOptions"
            ng-focus="$ctrl.handleFocus()"
            ng-blur="$ctrl.handleBlur()"
            ng-change="$ctrl.handleChange()"
            ${$attrs.name ? `name="${$attrs.name}"` : ''}
            ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
        >

        <!-- Operation Status -->
        ${needsStatus && '<ui-operation-status interface="$ctrl.uiOperationStatus"></ui-operation-status>'}

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
        type: '@?',
        name: '@?',
        autocomplete: '@?',
        interface: '=?',
        noDebounce: '@?',
        match: '<?',
        syncCheck: '&?',
        asyncCheck: '&?',
        checkMessage: '@?'
    }
}
