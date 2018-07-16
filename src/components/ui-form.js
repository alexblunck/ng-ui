/**
 * Component
 * ui-form
 */

class uiFormCtrl {

    /* @ngInject */
    constructor($scope, $element) {
        this.$scope = $scope
        this.$element = $element

        this.childInterfaces = []
        this.processing = false
        this.error = null
        this.message = null
    }

    $onInit() {
        // Set interface methods
        if (this.interface) {
            Object.assign(this.interface, {
                validate: this.validate.bind(this),
                isValid: this.isValid.bind(this),
                setProcessing: this.setProcessing.bind(this),
                setError: this.setError.bind(this),
                setMessage: this.setMessage.bind(this),
                reset: this.reset.bind(this)
            })
        }
    }

    /**
     * Validate form by calling validate
     * on all chil interfaces.
     *
     * @return {Boolean}
     */
    validate() {
        this.childInterfaces.map(child => {
            child.validate()
        })

        return this.isValid()
    }

    /**
     * Return true if form is considered valid.
     *
     * @return {Boolean}
     */
    isValid() {
        return this.$scope.$form.$valid
    }

    /**
     * Set processing state.
     */
    setProcessing(processing) {
        this.processing = processing

        if (processing) {
            this.$element.addClass('processing')
        } else {
            this.$element.removeClass('processing')
        }
    }

    /**
     * Set error message.
     *
     * @param {String} error
     */
    setError(error) {
        this.error = error
    }

    /**
     * Set message.
     *
     * @param {String} message
     */
    setMessage(message) {
        this.message = message
    }

    /**
     * Return form to it's prisitine state.
     */
    reset() {
        this.$scope.$form.$setPristine()
        this.error = null
        this.message = null
    }

    /**
     * Register child interface.
     *
     * @param {Object} child
     */
    registerChildInterface(child) {
        this.childInterfaces.push(child)
    }

    /**
     * Deregister child interface.
     *
     * @param {Object} child
     */
    deregisterChildInterface(child) {
        const index = this.childInterfaces.indexOf(child)
        this.childInterfaces.splice(index, 1)
    }

    /**
     * Handle form submit event.
     */
    handleSubmit() {
        if (!this.validate() || this.submitDisabled) {
            return
        }

        if (this.interface && this.interface.onSubmit) {
            document.activeElement.blur()
            this.reset()
            // this.$scope.$form.$setSubmitted()
            this.setProcessing(true)

            this.interface.onSubmit({
                finish: this.setProcessing.bind(this, false),
                reset: this.reset.bind(this),
                setError: this.setError.bind(this),
                setMessage: this.setMessage.bind(this)
            })
        }
    }

}

const template = `
    <!-- Form -->
    <form
        name="$form"
        ng-class="{
            'submit-disabled': $ctrl.submitDisabled
        }"
        ng-submit="$ctrl.handleSubmit()"
        novalidate
        ng-transclude
    ></form>

    <!-- Error -->
    <div class="error" ng-if="$ctrl.error" translate>{{ $ctrl.error }}</div>

    <!-- Message -->
    <div class="message" ng-if="$ctrl.message" translate>{{ $ctrl.message }}</div>
`

export default {
    controller: uiFormCtrl,
    template,
    bindings: {
        submitDisabled: '<?',
        interface: '=?'
    },
    transclude: true
}
