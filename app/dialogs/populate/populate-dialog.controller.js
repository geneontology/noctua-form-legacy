//
// Controller
//  Primary controller driving the table-mode
//

/* global angular */

export default class PopulateDialogController {
    constructor($scope, $rootScope, lookup) {
        var populateCtrl = this;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
    }
}

PopulateDialogController.$inject = ['$scope', '$rootScope', 'lookup'];
