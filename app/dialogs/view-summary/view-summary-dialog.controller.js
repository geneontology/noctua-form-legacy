import _ from 'lodash';
const each = require('lodash/forEach');

export default class EditAnnotonDIalogController {
    constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, uiGridTreeViewConstants, graph, lookup, formGrid, summaryRow) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.uiGridTreeViewConstants = uiGridTreeViewConstants;
        vm.$timeout = $timeout;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.formGrid = formGrid;
        vm.summaryRow = summaryRow;
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    openAnnotonErrorsDialogDialog(ev, annoton, errors) {
        this.$mdDialog.show({
                controller: 'AnnotonErrorsDialogController as errorsCtrl',
                templateUrl: './dialogs/annoton-errors/annoton-errors-dialog.html',
                targetEvent: ev,
                clickOutsideToClose: false,
                multiple: true,
                locals: {
                    annoton: annoton,
                    errors: errors
                }
            })
            .then(function (answer) {}, function () {});
    }

}
EditAnnotonDIalogController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', 'uiGridTreeViewConstants', 'graph', 'lookup', 'formGrid', 'summaryRow'];