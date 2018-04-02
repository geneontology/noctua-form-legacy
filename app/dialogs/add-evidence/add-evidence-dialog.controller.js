import _ from 'lodash';
const each = require('lodash/forEach');

export default class AddEvidenceDialogController {
    constructor(saeConstants, $scope, $rootScope, $mdDialog, graph, lookup, formGrid, entity) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.formGrid = formGrid;
        vm.entity = entity;
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    saveAnnoton(annoton) {
        let self = this;

        let result = self.graph.saveAnnoton(annoton, true);
        self.$mdDialog.hide(result);
    }

}
AddEvidenceDialogController.$inject = ['saeConstants', '$scope', '$rootScope', '$mdDialog', 'graph', 'lookup', 'formGrid', 'entity'];