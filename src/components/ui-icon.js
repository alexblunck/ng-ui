/**
 * Component
 * ui-icon
 */

const icons = {
    '16-checkmark': '<svg viewBox="0 0 16 16" width="16" height="16"><g fill="#323232"><polygon fill="#323232" points="12.4,6 11,4.6 7,8.6 5,6.6 3.6,8 7,11.4"></polygon></g></svg>',
    '16-x': '<svg viewBox="0 0 16 16" width="16" height="16"><g fill="#323232"><polygon fill="#323232" points="10.1,4.5 8,6.6 5.9,4.5 4.5,5.9 6.6,8 4.5,10.1 5.9,11.5 8,9.4 10.1,11.5 11.5,10.1 9.4,8 11.5,5.9"></polygon></g></svg>'
}

class uiIconCtrl {

    /* @ngInject */
    constructor($element) {
        this.elem = $element
    }

    $onInit() {
        const svgElem = this.elem.find('svg')
        const height = svgElem.attr('height')

        this.elem.css('height', `${height}px`)
    }

}

/* @ngInject */
const template = function($attrs) {
    const markup = icons[$attrs.name]

    return markup
}

export default {
    controller: uiIconCtrl,
    template,
    bindings: {
        name: '@'
    }
}
