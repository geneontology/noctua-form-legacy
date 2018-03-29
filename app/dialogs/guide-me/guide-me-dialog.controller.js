import _ from 'lodash';
const each = require('lodash/forEach');

export default class GuideMeDialogController {
    constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, $mdStepper, WizardHandler, graph, lookup, formGrid, data) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.$timeout = $timeout;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.$mdStepper = $mdStepper;
        vm.formGrid = formGrid;
        vm.data = data;
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }


    previousStep() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.back();
    };
    cancel() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.back();
    };
    nextStep() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.next();
    };
    toggleMobileStepText() {
        this.isMobileStepText = !this.isMobileStepText;
    };
    toggleLinear() {
        this.isLinear = !this.isLinear;
    };
    toggleAlternative() {
        this.isAlternative = !this.isAlternative;
    };
    toggleVertical() {
        this.isVertical = !this.isVertical;
    };
    showError() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.error('Wrong campaign');
    };
    clearError() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.clearError();
    };
    showFeedback() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.showFeedback('Step 1 looks great! Step 2 is comming up.');
    };
    clearFeedback() {
        var steppers = this.$mdStepper('stepper-demo');
        steppers.clearFeedback();
    };

}
GuideMeDialogController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', '$mdStepper', 'WizardHandler', 'graph', 'lookup', 'formGrid', 'data'];