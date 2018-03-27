import _ from 'lodash';
const each = require('lodash/forEach');


export default class BeforeSaveDialogController {
    constructor($scope, $rootScope, $mdDialog, dialogService, lookup, data) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.lookup = lookup;
        this.dialogService = dialogService;
        this.data = data;
        this.nodes = [];
        this.selected = {
            nodes: {}
        };

        this.initialize();
    }

    initialize() {
        const self = this;

        each(self.data.annoton.nodes, function (node) {
            self.selected.nodes[node.id] = {
                node: null
            };
        });
    }

    isNodeChecked(srcNode, linkedNode) {
        const self = this;

        return self.selected.nodes[srcNode.id].node && self.selected.nodes[srcNode.id].node.modelId === linkedNode.modelId;
    };

    toggleNode(srcNode, linkedNode) {
        const self = this;

        if (self.selected.nodes[srcNode.id].node) {
            self.selected.nodes[srcNode.id].node = null;
            srcNode.modelId = null
        } else {
            self.selected.nodes[srcNode.id].node = linkedNode;
            srcNode.modelId = linkedNode.modelId;
        }
    };

    closeDialog() {
        this.$mdDialog.cancel();
    }

    save() {
        const self = this;

        self.$mdDialog.hide(self.selected);
    }
}

BeforeSaveDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'dialogService', 'lookup', 'data'];