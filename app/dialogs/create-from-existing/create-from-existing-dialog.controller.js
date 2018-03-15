import _ from 'lodash';
const each = require('lodash/forEach');


export default class CreateFromExistingDialogController {
    constructor($scope, $rootScope, $mdDialog, lookup, data) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.lookup = lookup;
        this.data = data
        this.selected = {
            annoton: {},
            nodes: []
        };

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

    toggleNode(node) {
        const self = this;

        if (self.selected.annoton.id !== node.term.control.value.id) {
            self.selected.nodes = [];
        }

        let idx = self.selected.nodes.indexOf(node);
        self.selected.annoton = node.term.control.value;
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

    select(selectedAnnoton) {
        const self = this;

        each(self.annotons, function (annoton) {
            annoton.selected = false;
        })
        selectedAnnoton.selected = true;
        self.selectedAnnoton = selectedAnnoton;
    }



}

CreateFromExistingDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'lookup', 'data'];