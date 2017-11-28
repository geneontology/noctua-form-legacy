import _ from 'lodash';
const each = require('lodash/forEach');

export default class SummaryGridService {
  constructor(saeConstants, config, $timeout, lookup) {
    this.saeConstants = saeConstants
    this.config = config;
    this.$timeout = $timeout;
    this.lookup = lookup;
    this.annoton = this.config.createAnnotonModelFakeData();

    this.gridApi = null;
    this.columnDefs = [{
      name: 'command',
      displayName: 'Command',
      width: 120,
      field: 'Command',
      resizable: false,
      cellTemplate: './grid-templates/summary/actions-cell-template.html',
      //headerCellTemplate: 'uigridActionHeader',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'gp',
      field: 'gp',
      originalName: 'gp',
      displayName: 'Gene Product',
      width: 200,
      minWidth: 200,
      enableCellEdit: false,
      enableCellEditOnFocus: false
    }, {
      name: 'mf',
      field: 'mf',
      originalName: 'mf',
      displayName: 'Molecular Function',
      minWidth: 250,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    }, {
      name: 'Evidence',
      field: 'Evidence.label',
      originalName: 'Evidence',
      displayName: 'Evidence',
      minWidth: 250,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    }];


    this._subColumnDefs = [{
      name: 'label',
      displayName: '',
      width: '25%',
      field: 'label',
      resizable: false,
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'term',
      displayName: 'Term',
      width: 200,
      field: 'term',
      resizable: false,
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'evidence',
      field: 'evidence',
      originalName: 'evidence',
      displayName: 'Evidence',
      minWidth: 200,
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
      width: 120,
      field: 'reference',
      resizable: false,
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
      width: 120,
      field: 'with',
      resizable: false,
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }];

    this._subColumnDefsEdit = [{
      name: 'label',
      displayName: '',
      width: '25%',
      field: 'label',
      resizable: false,
      cellTemplate: './grid-templates/label-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
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
      name: 'evidence',
      field: 'evidence',
      originalName: 'evidence',
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
      width: 120,
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
      rowHeight: 40,
      width: 100,
      minWidth: 100,
      enableCellSelection: false,
      // rowEditWaitInterval: -1,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      multiSelect: false,
      // minRowsToShow: 1,
      //rowTemplate: 'rowTemplate.html',
      showTreeExpandNoChildren: false,
      expandableRowTemplate: './grid-templates/summary/expandable-row-template.html',
      expandableRowHeight: 450,
      enableRowSelection: true,
      //subGridVariable will be available in subGrid scope
      expandableRowScope: {
        subGridVariable: 'subGridScopeVariable'
      },
      // keyDownOverrides: [{keyCode: 27}]
      columnDefs: this.columnDefs,
      data: []
    };

    this._subGridOptions = {
      rowHeight: 40,
      width: 100,
      minWidth: 100,
      enableCellSelection: false,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      multiSelect: false,
      rowTemplate: 'rowTemplate.html',
      columnDefs: this._subColumnDefs,
      data: []
    };
  }

  registerApi() {
    const self = this;
    self.gridOptions.onRegisterApi = function (gridApi) {
      self.gridApi = gridApi;

      self.$timeout(function () {
        // self.gridApi.core.handleWindowResize();
      }, 0);
    };
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

  setSubGrid(parentGridData) {
    const self = this;
    each(parentGridData, function (row) {
      let gridData = [];
      row.subGridOptions = JSON.parse(JSON.stringify(self._subGridOptions));
      each(row.annoton.nodes, function (node) {
        gridData.push({
          label: node.label,
          term: node.term.control.value.label,
          evidence: node.evidence.control.value.label,
          reference: node.reference.control.value
        })
      })

      row.subGridOptions.data = gridData;
    });
  }

}
SummaryGridService.$inject = ['saeConstants', 'config', '$timeout', 'lookup'];