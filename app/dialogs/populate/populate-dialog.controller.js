import _ from 'lodash';
const each = require('lodash/forEach');


export default class PopulateDialogController {
    constructor($scope, $rootScope, $mdDialog, lookup, data) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.lookup = lookup;
        this.data = data
        this.selected = {
            term: {},
            annotations: []
        };
        this.rows = {}

        this.initialize();

    }

    initialize() {
        const self = this;

        self.lookup.companionLookup(self.data.gpNode.term.control.value.id, self.data.aspect, self.data.params).then(function (data) {
            self.rows = data;
        });
    }


    toggleRow(row) {
        const self = this;

        if (!self.selected.term.id) {
            self.selected = {
                term: {},
                annotations: []
            };
        }

        self.toggleAll(row);
        self.selected.term = row.term
    };

    isRowChecked(row) {
        const self = this;

        return (self.selected.term.id === row.term.id && self.selected.annotations.length === row.annotations.length);
    };

    toggleAnnotation(item) {
        const self = this;

        if (self.selected.term.id !== item.term.control.value.id) {
            self.selected.annotations = [];
        }

        let idx = self.selected.annotations.indexOf(item);
        self.selected.term = item.term.control.value;
        if (idx > -1) {
            self.selected.annotations.splice(idx, 1);
        } else {
            self.selected.annotations.push(item);
        }
    };

    exists(item) {
        const self = this;

        return self.selected.annotations.indexOf(item) > -1;
    };

    isRowIndeterminate(row) {
        const self = this;
        return (self.selected.annotations.length !== 0 &&
            self.selected.annotations.length !== row.annotations.length);
    };

    toggleAll(row) {
        const self = this;

        if (self.selected.annotations.length === row.annotations.length) {
            self.selected.annotations = [];
        } else if (self.selected.annotations.length === 0 || self.selected.annotations.length > 0) {
            self.selected.annotations = row.annotations.slice(0);
        }
    };

    closeDialog() {
        this.$mdDialog.cancel();
    }

    save() {
        const self = this;

        self.$mdDialog.hide(self.selected);
    }

    select(selectedRow) {
        const self = this;

        each(self.rows, function (row) {
            row.selected = false;
        })
        selectedRow.selected = true;
        self.selectedRow = selectedRow;
    }



}

PopulateDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'lookup', 'data'];