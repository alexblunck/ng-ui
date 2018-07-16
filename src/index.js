const angular = window.angular

import uiTip from './directives/ui-tip'

import uiButton from './components/ui-button'
import uiForm from './components/ui-form'
import uiIcon from './components/ui-icon'
import uiInput from './components/ui-input'
import uiOperationStatus from './components/ui-operation-status'
import uiSpinner from './components/ui-spinner'

export default angular
    .module('@blunck/ng-ui', [])
    .directive({ uiTip })
    .component({ uiButton })
    .component({ uiForm })
    .component({ uiIcon })
    .component({ uiInput })
    .component({ uiOperationStatus })
    .component({ uiSpinner })
    .name