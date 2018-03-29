import _ from 'lodash';
const each = require('lodash/forEach');

export default class SummaryGridService {
  constructor(saeConstants, uiGridConstants, config, $timeout, lookup) {
    this.saeConstants = saeConstants;
    this.uiGridConstants = uiGridConstants;
    this.config = config;
    this.$timeout = $timeout;
    this.lookup = lookup;
    this.annoton = this.config.createAnnotonModelFakeData();

    this.gridApi = null;


    this.columnDefs = [{
      name: 'gp',
      displayName: 'Gene Product',
      width: 200,
      field: 'gp',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'label',
      displayName: '',
      width: 200,
      field: 'label',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'term',
      displayName: 'Term',
      width: 200,
      field: 'term',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      cellTemplate: './grid-templates/summary/term-validator-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'aspect',
      displayName: 'Aspect',
      width: 60,
      field: 'aspect',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'qualifier',
      displayName: 'Qualifier',
      width: 70,
      field: 'qualifier',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'evidence',
      field: 'evidence',
      originalName: 'evidence',
      displayName: 'Evidence',
      minWidth: 200,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      cellTemplate: './grid-templates/summary/evidence-validator-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'reference',
      displayName: 'Reference',
      width: 120,
      field: 'reference',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'with',
      displayName: 'With',
      width: 120,
      field: 'with',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'assignedBy',
      displayName: 'Assigned By',
      width: 120,
      field: 'assignedBy',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }];

    this.gridOptions = {
      // rowHeight: 50,
      width: 100,
      minWidth: 100,
      exporterMenuCsv: false,
      enableGridMenu: true,
      enableCellSelection: false,
      // rowEditWaitInterval: -1,
      //  enableCellEdit: false,
      // enableCellEditOnFocus: false,
      multiSelect: false,
      // minRowsToShow: 1,
      //rowTemplate: './grid-templates/summary/row-template.html',
      showTreeExpandNoChildren: false,
      enableRowSelection: true,
      //subGridVariable will be available in subGrid scope

      // keyDownOverrides: [{keyCode: 27}]
      columnDefs: this.columnDefs,
      data: []
    };

    this.registerApi();
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

  setGrid(annotonData) {
    const self = this;
    let gridData = [];

    each(annotonData, function (row) {
      each(row.annoton.nodes, function (node) {
        let term = node.getTerm();

        if ((node.id !== 'mc' || node.id !== 'gp') && term.id) {
          gridData.push({
            gp: row.gp,
            label: node.label,
            term: term.label,
            aspect: node.aspect,
            qualifier: node.isComplement ? 'NOT' : '',
            evidence: node.evidence[0].evidence.control.value.label,
            reference: node.evidence[0].reference.control.value,
            with: node.evidence[0].with.control.value,
            assignedBy: node.evidence[0].assignedBy.control.value,
            $$treeLevel: node.treeLevel,
            annoton: node,
          })

          for (let i = 1; i < node.evidence.length; i++) {
            gridData.push({
              gp: row.gp,
              label: "''",
              evidence: node.evidence[i].evidence.control.value.label,
              reference: node.evidence[i].reference.control.value,
              with: node.evidence[i].with.control.value,
              assignedBy: node.evidence[i].assignedBy.control.value,
              $$treeLevel: node.treeLevel,
              //  annoton: node,
            })
          }
        }
      })
    });
    self.gridOptions.data = gridData;
  }


  setSubGridEdit(row) {
    const self = this;
    self.$timeout(function () {

      row.subGridOptions = JSON.parse(JSON.stringify(self._subGridEditOptions));
      // row.subGridOptions.data = row.annoton.nodes;

      self.gridApi.core.notifyDataChange(this.uiGridConstants.dataChange.ALL)
      self.gridApi.core.handleWindowResize();
    });
  }

  showErrorColumn() {
    return true;
  }

}
SummaryGridService.$inject = ['saeConstants', 'uiGridConstants', 'config', '$timeout', 'lookup'];