/**
 * Directive
 * <any ui-scrollbar="{Object} [delegate]">
 */

import zen from 'zenscroll'
import PerfectScrollbar from 'perfect-scrollbar'

export default function uiScrollbar() {

    const directive = {
        restrict: 'A',
        controller: controller
    }
    return directive

    //////////////////////////////

    /* @ngInject */
    function controller($scope, $element, $attrs) {
        const scroller = zen.createScroller($element[0])
        let scrollbar = null

        //////////////////////////////

        this.$onInit = () => {
            // Initialize perfect scrollbar
            scrollbar = new PerfectScrollbar($element[0], {
                suppressScrollX: true
            })

            // Expose delegate methods
            const delegate = $scope.$eval($attrs.uiScrollbar)

            if (delegate) {
                delegate.element = $element[0]
                delegate.update = update
                delegate.disable = disable
                delegate.remove = remove
                delegate.scrollToTop = scrollToTop
                delegate.scrollToBottom = scrollToBottom
                delegate.canScroll = canScroll
                delegate.didScroll = didScroll
                delegate.didScrollToBottom = didScrollToBottom
            }
        }

        //////////////////////////////

        /**
         * Update perfect scrollbar.
         */
        function update() {
            if (scrollbar) {
                scrollbar.update()
            }
        }

        /**
         * Disable scrolling.
         *
         * @param {Boolean} disableScroll
         */
        function disable(disableScroll) {
            if (scrollbar) {
                remove()

                scrollbar = new PerfectScrollbar($element[0], {
                    suppressScrollX: true,
                    suppressScrollY: disableScroll
                })
            }
        }

        /**
         * Remove perfect scrollbar completely.
         */
        function remove() {
            if (scrollbar) {
                scrollbar.destroy()
                scrollbar = null
            }
        }

        /**
         * Scroll to top of element.
         *
         * @param {Boolean} [animated]
         */
        function scrollToTop(animated = true) {
            update()

            if (animated) {
                scroller.toY(0)
            } else {
                $element[0].scrollTop = 0
            }
        }

        /**
         * Scroll to bottom of element.
         */
        function scrollToBottom() {
            update()
            scroller.toY($element[0].scrollHeight)
        }

        /**
         * Returns true if element can be scrolled.
         *
         * @return {Boolean}
         */
        function canScroll() {
            return $element[0].clientHeight < $element[0].scrollHeight
        }

        /**
         * Returns true if element was already scrolled.
         *
         * @return {Boolean}
         */
        function didScroll() {
            return $element[0].scrollTop !== 0
        }

        /**
         * Returns true if element was scrolled to bottom.
         *
         * @return {Boolean}
         */
        function didScrollToBottom() {
            return $element[0].scrollTop + $element[0].clientHeight === $element[0].scrollHeight
        }

    }

}
