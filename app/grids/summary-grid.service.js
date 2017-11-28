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
      name: 'Command',
      displayName: '',
      width: 30,
      field: '',
      resizable: false,
      cellTemplate: 'uigridActionCell',
      headerCellTemplate: 'uigridActionHeader',
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

    this.gridOptions = {
      rowHeight: 40,
      width: 100,
      minWidth: 100,
      enableCellSelection: false,
      // rowEditWaitInterval: -1,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      multiSelect: false,
      rowTemplate: 'rowTemplate.html',
      showTreeExpandNoChildren: false,
      expandableRowTemplate: './../grid-templates/summary/expandable-row-template.html',
      expandableRowHeight: 150,
      enableRowSelection: true,
      //subGridVariable will be available in subGrid scope
      expandableRowScope: {
        subGridVariable: 'subGridScopeVariable'
      },
      // keyDownOverrides: [{keyCode: 27}]
      columnDefs: this.columnDefs,
      data: []
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
   * Expands all nodes. Expanded state is the default on initialization 
   */
  expandAll() {
    const self = this;
    self.$timeout(function () {
      self.gridApi.treeBase.expandAllRows();
    });
  }

}
SummaryGridService.$inject = ['saeConstants', 'config', '$timeout', 'lookup'];