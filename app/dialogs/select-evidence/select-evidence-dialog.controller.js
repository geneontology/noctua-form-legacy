import _ from 'lodash';
const each = require('lodash/forEach');
import Util from "../../util/util.js";

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
        this.externalNodesIncluded = false;
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

    isNodeIndeterminate() {
        const self = this;
        return (self.selected.evidences.length !== 0 &&
            self.selected.evidences.length !== self.data.evidences.length);
    };

    isNodeChecked() {
        const self = this;

        return (self.selected.evidences.length === self.data.evidences.length);
    };

    toggleNode() {
        const self = this;

        if (self.selected.evidences.length === self.data.evidences.length) {
            self.selected.evidences = [];
        } else if (self.selected.evidences.length === 0 || self.selected.evidences.length > 0) {
            self.selected.evidences = self.data.evidences.slice(0);
        }
    };

    includeExternalNodes() {
        const self = this;

        if (self.data.gpNode && self.data.gpNode.term.control.value.id) {
            self.lookup.companionLookup(self.data.gpNode.term.control.value.id, self.data.aspect, self.data.params).then(function (data) {
                self.data.externalEvidences = Util.addUniqueEvidences(self.data.evidences, data);
                self.externalNodesIncluded = true;
            });
        }
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    save() {
        const self = this;

        self.$mdDialog.hide(self.selected);
    }
}

SelectEvidenceDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'lookup', 'data'];