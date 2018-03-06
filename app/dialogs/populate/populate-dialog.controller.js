export default class PopulateDialogController {
    constructor($scope, $rootScope, $mdDialog, lookup) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$mdDialog = $mdDialog;
        this.lookup = lookup;

        this.initialize();

    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    initialize() {
        const self = this;

        self.lookup.companionLookup().then(function (data) {
            self.data = data;
        });
    }

}

PopulateDialogController.$inject = ['$scope', '$rootScope', '$mdDialog', 'lookup'];