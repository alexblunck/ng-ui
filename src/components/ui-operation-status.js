/**
 * Component
 * ui-operation-status
 */

import { debounce } from 'lodash'

class uiOperationStatusCtrl {

    /* @ngInject */
    constructor($scope, $timeout) {
        this.$scope = $scope
        this.$timeout = $timeout

        this.promise = null
        this.processing = false
        this.finished = false
        this.succeeded = false
        this.tip = null
        this.retryFunction = null
    }

    $onInit() {
        Object.assign(this.interface, {
            setProcessing: this.setProcessing.bind(this),
            finish: debounce(this.finish.bind(this), 300)
        })
    }

    /**
     * Set processing state.
     *
     * @param {Boolean} processing
     */
    setProcessing(processing) {
        // Cancel hide timeout
        if (this.promise) {
            this.$timeout.cancel(this.promise)
        }

        this.finished = false
        this.processing = processing
        this.retryFunction = null
    }

    /**
     * End processing state.
     *
     * @param {Boolean}  succeeded
     * @param {String}   tip       - Tip to display on hover
     * @param {Function} retry     - Function that can be triggered on click
     */
    finish(succeeded = true, tip, retry) {
        this.tip = tip
        this.processing = false
        this.finished = true
        this.succeeded = succeeded
        this.retryFunction = retry

        // If successful hide after 2 seconds
        if (succeeded) {
            this.promise = this.$timeout(() => {
                this.finished = false
            }, 2000)
        }

        this.$scope.$applyAsync()
    }

    /**
     * Execute retry function.
     */
    triggerRetry() {
        if (this.retryFunction) {
            this.retryFunction()
            this.retryFunction = null
        }
    }

}

const template = `
    <div class="ui-operation-status" ng-class="{ retry: !!$ctrl.retryFunction && !$ctrl.succeeded }">
        <!-- Tip -->
        <div
            class="tip"
            ng-show="$ctrl.finished && $ctrl.tip"
            ui-tip="$ctrl.tip"
            ng-click="$ctrl.triggerRetry()"
        ></div>

        <!-- Spinner -->
        <ui-spinner visible="$ctrl.processing"></ui-spinner>

        <!-- Icon - Checkmark -->
        <ui-icon name="16-checkmark" ng-class="{ visible: $ctrl.finished && $ctrl.succeeded }"></ui-icon>

        <!-- Icon - X -->
        <ui-icon name="16-x" ng-class="{ visible: $ctrl.finished && !$ctrl.succeeded }"></ui-icon>
    </div>
`

export default {
    controller: uiOperationStatusCtrl,
    template,
    bindings: {
        interface: '='
    }
}
