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

        this.gridApi = null;
        this.columnDefs = [{
            name: 'term',
            displayName: 'Term',
            width: 200,
            field: 'term',
            resizable: false,
            cellTemplate: './grid-templates/term-cell-template.html',
            headerCellTemplate: './grid-templates/header-cell-template.html',
            enableCellEdit: false,
            enableCellSelection: false,
            enableCellEditOnFocus: false,
            enableSorting: false,
            allowCellFocus: false,
            enableHiding: false,
            enableColumnMenu: false
        }, {
            name: 'Evidence',
            field: 'Evidence.label',
            originalName: 'Evidence',
            displayName: 'Evidence',
            minWidth: 200,
            enableCellEdit: false,
            enableCellSelection: false,
            enableCellEditOnFocus: false,
            enableSorting: false,
            allowCellFocus: false,
            enableHiding: false,
            enableColumnMenu: false
        }, {
            name: 'reference',
            displayName: 'Reference',
            width: 120,
            field: 'reference',
            resizable: false,
            enableCellEdit: false,
            enableCellSelection: false,
            enableCellEditOnFocus: false,
            enableSorting: false,
            allowCellFocus: false,
            enableHiding: false,
            enableColumnMenu: false
        }, {
            name: 'with',
            displayName: 'With',
            width: 120,
            field: 'with',
            resizable: false,
            cellTemplate: './grid-templates/with-cell-template.html',
            headerCellTemplate: './grid-templates/header-cell-template.html',
            enableCellEdit: false,
            enableCellSelection: false,
            enableCellEditOnFocus: false,
            enableSorting: false,
            allowCellFocus: false,
            enableHiding: false,
            enableColumnMenu: false
        }];

        this.gridOptions = {
            rowHeight: 41,
            width: 100,
            minWidth: 100,
            enableCellSelection: false,
            // rowEditWaitInterval: -1,
            enableCellEdit: false,
            enableCellEditOnFocus: false,
            multiSelect: false,
            showTreeExpandNoChildren: false,
            showTreeRowHeader: false,
            // keyDownOverrides: [{keyCode: 27}]
            columnDefs: this.columnDefs,
            data: []
        };

        this.gridOptions.data = [{
                'term': 'chol',
                'reference': 'P1',
                'evidence': 'ooo'
            },
            {
                'term': 'chol2',
                'reference': 'P1',
                'evidence': 'ooo'
            }

        ]
    }

    registerApi() {
        const self = this;
        self.gridOptions.onRegisterApi = function (gridApi) {
            self.gridApi = gridApi;

            self.$timeout(function () {
                self.gridApi.core.handleWindowResize();
            }, 0);
        };
    }
}

PopulateDialogController.$inject = ['$scope', '$rootScope', 'lookup'];