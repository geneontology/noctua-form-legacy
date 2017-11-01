
export default class CommonService {
  constructor($timeout, $rootScope) {
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;
    this.test = 'I am working';

    this.gridApi = null;
    this.columnDefs = [{
      name: 'term',
      displayName: '',
      width: 200,
      field: 'term',
      resizable: false,
      cellTemplate: 'uigridActionCell',
      headerCellTemplate: 'uigridActionHeader',
      enableCellEdit: true,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'description',
      displayName: '',
      width: 300,
      field: 'description',
      resizable: false,
      cellTemplate: 'cellTemplate.html',
      enableCellEdit: true,
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
      minWidth: 250,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    }, {
      name: 'reference',
      displayName: 'Reference',
      width: 300,
      field: 'reference',
      resizable: false,
      cellTemplate: 'cellTemplate.html',
      enableCellEdit: true,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'with',
      displayName: 'With',
      width: 300,
      field: 'with',
      resizable: false,
      cellTemplate: 'cellTemplate.html',
      enableCellEdit: true,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }];

    this.gridOptions = {
      rowHeight: 120,
      width: 100,
      minWidth: 100,
      enableCellSelection: false,
      // rowEditWaitInterval: -1,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      multiSelect: false,
      // rowTemplate: 'rowTemplate.html',
      showTreeExpandNoChildren: false,
      // keyDownOverrides: [{keyCode: 27}]
      columnDefs: this.columnDefs
    };

  }

  registerApi() {
    let self = this;
    self.gridOptions.onRegisterApi = function (gridApi) {
      self.gridApi = gridApi;

      self.$timeout(function () {
        self.gridApi.core.handleWindowResize();
      }, 0);
    };
  }



}
CommonService.$inject = ['$timeout', '$rootScope'];


