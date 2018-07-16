/**
 * Component
 * ui-spinner
 */

class uiSpinnerCtrl {

    /* @ngInject */
    constructor($element) {
        this.elem = $element
    }

    $onChanges() {
        if (this.visible) {
            this.elem.addClass('visible')
        } else {
            this.elem.removeClass('visible')
        }
    }

}

export default {
    controller: uiSpinnerCtrl,
    template: '',
    bindings: {
        visible: '<'
    }
}
