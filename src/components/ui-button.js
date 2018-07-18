/**
 * Component
 * ui-button
 */

class uiButtonCtrl {

    /* @ngInject */
    constructor($element) {
        this.uiFormCtrl = $element.controller('uiForm')
    }

    $onInit() {
        this.processing = false
    }

    /**
     * Return disabled state.
     *
     * @return {Boolean}
     */
    isDisabled() {
        return this.uiFormCtrl ? this.uiFormCtrl.submitDisabled : this.disabled
    }

    /**
     * Return processing state.
     *
     * @return {Boolean}
     */
    isProcessing() {
        return this.uiFormCtrl ? this.uiFormCtrl.processing : this.processing
    }

}

/* @ngInject */
const template = function($attrs) {
    const type = $attrs.type || 'button'

    return `
        <button
            type="${type}"
            ng-class="{
                disabled: $ctrl.disabled(),
                processing: $ctrl.isProcessing()
            }"
            ui-defer-transition
        >
            <!-- Label -->
            <span translate>
                <span ng-transclude>{{ $ctrl.label }}</span>
            </span>

            <!-- Spinner -->
            <div class="spinner-container">
                <ui-spinner visible="$ctrl.isProcessing()"></ui-spinner>
            </div>
        </button>
    `
}

export default {
    controller: uiButtonCtrl,
    template,
    require: ['^uiForm'],
    bindings: {
        type: '@?',
        label: '<?',
        disabled: '<?',
        processing: '<?'
    },
    transclude: true
}
