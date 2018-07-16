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

    isProcessing() {
        return this.uiFormCtrl ? this.uiFormCtrl.processing : this.processing
    }

}

/* @ngInject */
const template = function($attrs) {
    const type = $attrs.type || 'button'

    return `
        <button type="${type}" ng-class="{ disabled: $ctrl.disabled, processing: $ctrl.isProcessing() }">
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
        processing: '<?',
        disabled: '<?'
    },

    transclude: true
}
