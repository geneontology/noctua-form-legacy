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
        this.selectedRow = {};
        this.rows = {}

        this.initialize();

    }

    initialize() {
        const self = this;

        self.lookup.companionLookup(self.data.gpNode.term.control.value.id, self.data.aspect, self.data.params).then(function (data) {
            self.rows = data;
        });
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    save() {
        const self = this;

        self.$mdDialog.hide(self.selectedRow);
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