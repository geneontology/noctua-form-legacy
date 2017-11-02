
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
      cellTemplate: './grid-templates/label-cell-template.html',
      cellTooltip: function (row, col) {
        return row.entity.tooltip ? row.entity.tooltip : row.entity.label;
      },
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
      cellTemplate: './grid-templates/description-cell-template.html',
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
      cellTemplate: './grid-templates/evidence-cell-template.html',
      enableCellEdit: true,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'reference',
      displayName: 'Reference',
      width: 300,
      field: 'reference',
      resizable: false,
      cellTemplate: './grid-templates/reference-cell-template.html',
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
      cellTemplate: './grid-templates/with-cell-template.html',
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
      rowTemplate: './grid-templates/row-template.html',
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
      'termAppender': '',
      'label': 'Molecular Function',
      $$treeLevel: 0
    }, {
      'term': 'GP',
      'termAppender': 'a',
      'label': 'Has Input (Gene Product/Chemical)',
      $$treeLevel: 1
    }, {
      'term': 'BP',
      'phase': 'Biological Phase',
      'label': 'Happens During (Temporal Phase)',
      $$treeLevel: 1
    }, {
      'term': 'BP',
      'label': 'Biological Process',
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
      'term': 'CL',
      'label': 'Part Of (Cell Type)',
      $$treeLevel: 1
    }, {
      'term': '',
      'label': 'Part Of (Anatomy)',
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


