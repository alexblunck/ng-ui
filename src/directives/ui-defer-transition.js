/**
 * Directive
 * <any ui-defer-transitio={[offset]}n>
 */

 /* @ngInject */
export default function uiDeferTransition($timeout) {
    return {
        restrict: 'A',
        link: (scope, elem, attrs) => {
            elem.css('transition', 'none')

            const offset = Number(attrs.uiDeferTransition) || 0

            $timeout(() => {
                elem.css('transition', '')
            }, offset)
        }
    }
}
