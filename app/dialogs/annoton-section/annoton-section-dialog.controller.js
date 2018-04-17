import _ from 'lodash';
const each = require('lodash/forEach');

export default class AnnotonSectionDialogController {
    constructor(saeConstants, $scope, $rootScope, $mdDialog, graph, lookup, formGrid, data) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.formGrid = formGrid;
        vm.data = data;

        console.log(data)
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

}

AnnotonSectionDialogController.$inject = ['saeConstants', '$scope', '$rootScope', '$mdDialog', 'graph', 'lookup', 'formGrid', 'data'];