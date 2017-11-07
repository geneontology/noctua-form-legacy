
export default class FormGridService {
  constructor($timeout) {
    this.$timeout = $timeout;
    this.gridApi = null;
    this.columnDefs = [{
      name: 'label',
      displayName: '',
      width: 200,
      field: 'label',
      resizable: false,
      cellTemplate: './grid-templates/label-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
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
      displayName: 'Term',
      width: 200,
      field: 'description',
      resizable: false,
      cellTemplate: './grid-templates/description-cell-template.html',
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
      cellTemplate: './grid-templates/evidence-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
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
      width: '200',
      field: 'reference',
      resizable: false,
      cellTemplate: './grid-templates/reference-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
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
      width: '10%',
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

  /**
   *  Populates the tree grid with GO Terms, MF, CC, BP as roots
   */
  initalizeForm() {
    const self = this;
    let data = [{
      'term': 'MF',
      'label': 'Molecular Function',
      $$treeLevel: 0
    }, {
      'term': 'GP',
      'label': 'Has Input (Gene Product/Chemical)',
      $$treeLevel: 1
    }, {
      'term': 'BP',
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

  /**
   * Expands all nodes. Expanded state is the default on initialization 
   */
  expandAll() {
    const self = this;
    self.$timeout(function () {
      self.gridApi.treeBase.expandAllRows();
    });
  }

}
FormGridService.$inject = ['$timeout', '$rootScope'];


