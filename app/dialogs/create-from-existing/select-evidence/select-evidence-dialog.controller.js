import _ from 'lodash';
const each = require('lodash/forEach');


export default class SelectEvidenceDialogController {
    constructor($scope, $rootScope, $mdDialog, lookup, data) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.lookup = lookup;
        this.data = data
        this.selected = {
            evidences: []
        };
    }


    toggleEvidence(evidence) {
        const self = this;

        let idx = self.selected.evidences.indexOf(evidence);

        if (idx > -1) {
            self.selected.evidences.splice(idx, 1);
        } else {
            self.selected.evidences.push(evidence);
        }
    };

    exists(evidence) {
        const self = this;

        return self.selected.evidences.indexOf(evidence) > -1;
    };

    isNodeIndeterminate(node) {
        const self = this;
        return (self.selected.evidences.length !== 0 &&
            self.selected.evidences.length !== data.evidences.length);
    };

    toggleAll(node) {
        const self = this;

        if (self.selected.evidences.length === node.evidences.length) {
            self.selected.evidences = [];
        } else if (self.selected.evidences.length === 0 || self.selected.evidences.length > 0) {
            self.selected.evidences = node.evidences.slice(0);
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

SelectEvidenceDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'lookup', 'data'];