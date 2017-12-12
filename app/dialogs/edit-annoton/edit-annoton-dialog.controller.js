import _ from 'lodash';
const each = require('lodash/forEach');

export default class EditAnnotonDIalogController {
    constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, uiGridTreeViewConstants, graph, lookup, formGrid, annoton) {
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
        vm.annoton = annoton
        vm.initalizeForm();
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    saveAnnoton(annoton) {
        let self = this;

        let result = self.graph.saveAnnoton(annoton, true);
        self.$mdDialog.hide(result);
    }
    getTerm(field) {
        let result = null;
        if (field && field.control.value && field.control.value.length >= 3) {
            //let oldValue = this.editingModel[field];
            // console.log('getTerm', field, oldValue, term);
            result = this.lookup.golrLookup(field); // delete?, this.fieldToRoot[field]);
            console.log('result', result);
        }
        return result;
    }

    setAnnotonType(annoton, annotonType) {
        annoton.setAnnotonType(annotonType.name);
    }

    setAnnotonModelType(annoton, annotonModelType) {
        annoton.setAnnotonModelType(annotonModelType.name);
    }

    initalizeForm() {
        const self = this;

        self.geneProduct = self.annoton.getNode('gp');
        self.groupedData = {};

        each(self.annoton.nodes, function (node) {
            if (node.displayGroup) {
                if (!self.groupedData[node.displayGroup.id]) {
                    self.groupedData[node.displayGroup.id] = {
                        label: node.displayGroup.label,
                        nodes: []
                    };
                }
                self.groupedData[node.displayGroup.id].nodes.push(node);
            }
        });
    }
}
EditAnnotonDIalogController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', 'uiGridTreeViewConstants', 'graph', 'lookup', 'formGrid', 'annoton'];