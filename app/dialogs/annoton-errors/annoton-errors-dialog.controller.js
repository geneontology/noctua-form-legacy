import _ from 'lodash';
const each = require('lodash/forEach');

export default class AnnotonErrorsDIalogController {
    constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, graph, lookup, formGrid, annoton, errors) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.$timeout = $timeout;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.formGrid = formGrid;
        vm.annoton = annoton;
        vm.errors = errors;
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }



}
AnnotonErrorsDIalogController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', 'graph', 'lookup', 'formGrid', 'annoton', 'errors'];