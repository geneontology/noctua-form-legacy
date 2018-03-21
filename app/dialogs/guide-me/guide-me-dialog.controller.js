import _ from 'lodash';
const each = require('lodash/forEach');

export default class GuideMeDialogController {
    constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, WizardHandler, graph, lookup, formGrid, data) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.$timeout = $timeout;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.formGrid = formGrid;
        vm.data = data;
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

}
GuideMeDialogController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', 'WizardHandler', 'graph', 'lookup', 'formGrid', 'data'];