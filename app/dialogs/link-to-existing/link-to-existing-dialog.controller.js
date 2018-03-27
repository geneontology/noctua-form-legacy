import _ from 'lodash';
const each = require('lodash/forEach');


export default class LinkToExistingDialogController {
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
            node: null
        };

        this.initialize()
    }

    initialize() {
        const self = this;

        self.nodes = [];
        each(self.data.annotonData, function (annotonData) {
            each(annotonData.annoton.nodes, function (node) {
                if (node.getTerm().id && self.data.entity.lookupGroup === node.lookupGroup) {
                    if (!_.find(self.nodes, {
                            modelId: node.modelId
                        })) {
                        self.nodes.push(node);
                    }
                }
            })
        });
    }

    isNodeChecked(node) {
        const self = this;

        return self.selected.node && self.selected.node.modelId === node.modelId;
    };

    toggleNode(node) {
        const self = this;

        if (self.selected.node && self.selected.node.id === node.id) {
            self.selected.node = null;
        } else {
            self.selected.node = node;
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

LinkToExistingDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'dialogService', 'lookup', 'data'];