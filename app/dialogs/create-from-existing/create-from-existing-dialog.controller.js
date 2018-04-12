import _ from 'lodash';
const each = require('lodash/forEach');


export default class CreateFromExistingDialogController {
    constructor($scope, $rootScope, $mdDialog, dialogService, lookup, data) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.lookup = lookup;
        this.dialogService = dialogService;
        this.data = data;
        this.selected = {
            annoton: {},
            nodes: []
        };
    }

    enableToggle(entity) {
        const self = this;

        if (self.data.entityFilter) {
            return self.data.entityFilter.lookupGroup !== entity.lookupGroup;
        }
        return false;
    }

    openSelectEvidenceDialog(ev, node) {
        const self = this;

        let data = {
            node: node,
            evidences: node.evidence
        }

        let success = function (selected) {

        }

        self.dialogService.openSelectEvidenceDialog(ev, data, success);
    }

    toggleAnnoton(annoton) {
        const self = this;

        if (!self.selected.annoton) {
            self.selected = {
                annoton: {},
                nodes: []
            };
        }

        self.toggleAll(annoton);
        self.selected.annoton = annoton
    };

    isAnnotonChecked(annoton) {
        const self = this;

        return (self.selected.annoton.id === annoton.id && self.selected.nodes.length === annoton.nodes.length);
    };

    toggleNode(annoton, node) {
        const self = this;

        if (self.selected.annoton.id !== annoton.id) {
            self.selected.nodes = [];
        }

        let idx = self.selected.nodes.indexOf(node);
        self.selected.annoton = annoton;
        if (idx > -1) {
            self.selected.nodes.splice(idx, 1);
        } else {
            self.selected.nodes.push(node);
        }
    };

    exists(node) {
        const self = this;

        return self.selected.nodes.indexOf(node) > -1;
    };

    isAnnotonIndeterminate(annoton) {
        const self = this;
        return (self.selected.nodes.length !== 0 &&
            self.selected.nodes.length !== annoton.nodes.length);
    };

    toggleAll(annoton) {
        const self = this;

        if (self.selected.nodes.length === annoton.nodes.length) {
            self.selected.nodes = [];
        } else if (self.selected.nodes.length === 0 || self.selected.nodes.length > 0) {
            self.selected.nodes = annoton.nodes.slice(0);
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

CreateFromExistingDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'dialogService', 'lookup', 'data'];