
export default class CommonService {
  constructor($timeout, $rootScope) {
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;

    this.gridApi = null;
    this.columnDefs = [{
      name: 'label',
      displayName: '',
      width: 200,
      field: 'label',
      resizable: false,
      cellTemplate: 'cellTemplate.html',
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
      cellTemplate: './grid-templates/textbox-cell-template.html',
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
      rowHeight: 35,
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
    const self = this;
    self.gridOptions.onRegisterApi = function (gridApi) {
      self.gridApi = gridApi;

      self.$timeout(function () {
        self.gridApi.core.handleWindowResize();
      }, 0);
    };
  }

  initalizeForm() {
    const self = this;
    let data = [{
      'term': 'MF',
      'label': 'Molecular Funtion',
      $$treeLevel: 0
    }, {
      'term': 'BP',
      'label': 'Biological Proccess',
      $$treeLevel: 0
    }, {
      'term': 'BP',
      'label': 'Part Of (BP)',
      $$treeLevel: 1
    }, {
      'term': 'BP',
      'label': 'Part Of (BP)',
      $$treeLevel: 2
    }, {
      'term': 'CC',
      'label': 'Cellular Component',
      $$treeLevel: 0
    }, {
      'term': 'CC',
      'label': 'Happens During',
      $$treeLevel: 1
    }, {
      'term': 'CC',
      'label': 'Part Of',
      $$treeLevel: 2
    }];

    self.gridOptions.data = data;


  }

  expandAll() {
    const self = this;
    self.$timeout(function () {
      self.gridApi.treeBase.expandAllRows();
    });
  }

}
CommonService.$inject = ['$timeout', '$rootScope'];


