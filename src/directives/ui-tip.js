/**
 * Directive
 * <any ui-tip="{Expression}">
 */

const angular = window.angular

/* @ngInject */
export default function uiTip($compile, $window, $document) {

    const directive = {
        restrict: 'A',
        scope: {},
        bindToController: {
            text: '<uiTip',
            disabled: '<?uiTipDisabled'
        },
        controller: controller,
        controllerAs: '$uiTip'
    }
    return directive

    //////////////////////////////

    function template () {
        return `
            <div class="ab-tip" ng-class="{ disabled: $uiTip.disabled }" translate>{{ $uiTip.text }}</div>
        `
    }

    //////////////////////////////

    /* @ngInject */
    function controller($scope, $element, $attrs) {
        const isGlobal = 'uiTipGlobal' in $attrs
        let viewElem = null

        const vm = this

        //////////////////////////////

        $element.on('mouseenter', handleMouseEnter)
        $element.on('mouseleave', handleMouseLeave)
        $element.on('click', handleClick)

        //////////////////////////////

        vm.$onInit = () => {
            viewElem = angular.element(template())

            $compile(viewElem)($scope)

            if (isGlobal) {
                $document.find('body').append(viewElem)
            } else {
                $element.append(viewElem)
            }

            checkPositionProperty()
        }

        vm.$onDestroy = () => {
            $element.off('mouseenter', handleMouseEnter)
            $element.off('mouseleave', handleMouseLeave)
            $element.off('click', handleClick)

            // Remove tip view element from dom
            viewElem.remove()
        }

        //////////////////////////////

        /**
         * Handle mousenter event.
         */
        function handleMouseEnter() {
            position()
            viewElem.addClass('visible')
        }

        /**
         * Handle mouseleave event.
         */
        function handleMouseLeave() {
            viewElem.removeClass('visible')
        }

        /**
         * Handle click event.
         */
        function handleClick() {
            viewElem.removeClass('visible')
        }

        /**
         * Position tip view centered above trigger element.
         */
        function position() {
            const rect = $element[0].getBoundingClientRect()

            if (isGlobal) {
                viewElem.css({
                    top: (rect.top - viewElem[0].offsetHeight - 6) + $window.scrollY + 'px',
                    left: (rect.left + ((rect.width - viewElem[0].offsetWidth) / 2)) + $window.scrollX + 'px'
                })
            } else {
                viewElem.css({
                    left: ((rect.width - viewElem[0].offsetWidth) / 2) + 'px'
                })
            }
        }

        /**
         * Log warning if ab-tip directive was added to element
         * with a position css property of "static" since that
         * could cause tip to be layout incorrectly.
         */
        function checkPositionProperty() {
            const debugInfoEnabled = !!$element.scope()

            // Only check if debug info is enabled
            if (debugInfoEnabled) {
                const positionValue = $window.getComputedStyle($element[0]).getPropertyValue('position')

                if (positionValue === 'static') {
                    console.warn('ui-tip: Directive added to statically positioned element.')
                }
            }
        }

    }


}
