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
      displayName: 'Annotated Entity',
      width: 150,
      minWidth: 100,
      maxWidth: 200,
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
      name: 'relationship',
      displayName: 'Relationship',
      width: 85,
      minWidth: 50,
      maxWidth: 120,
      field: 'relationship',
      resizable: false,
      //headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: true,
      enableColumnMenu: false
    }, {
      name: 'aspect',
      displayName: 'Aspect',
      width: 55,
      minWidth: 55,
      maxWidth: 55,
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
      name: 'term',
      displayName: 'Term',
      width: '20%',
      minWidth: 100,
      maxWidth: 500,
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
      name: 'extRelationship',
      displayName: 'Relationship(ext)',
      width: 110,
      minWidth: 110,
      maxWidth: 110,
      field: 'extRelationship',
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
      name: 'extension',
      displayName: 'Extension',
      width: '20%',
      minWidth: 100,
      maxWidth: 500,
      field: 'extension',
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
      name: 'evidence',
      field: 'evidence',
      originalName: 'evidence',
      displayName: 'Evidence',
      width: '20%',
      minWidth: 100,
      maxWidth: 500,
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
      width: 100,
      minWidth: 80,
      maxWidth: 120,
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
      minWidth: 100,
      maxWidth: 180,
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
      minWidth: 100,
      maxWidth: 200,
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
      rowTemplate: './grid-templates/summary/row-template.html',
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

    let colors = ["#EEE", '#e0eee0'];

    each(annotonData, function (row, key) {
      row.color = colors[key % 2];
      self.setGridDFS(row, gridData, row.annoton.edges.mf)
    });
    self.gridOptions.data = gridData;
  }

  setGridDFS(row, gridData, edge) {
    const self = this;

    if (edge && edge.nodes) {
      each(edge.nodes, function (node) {
        let term = node.target.getTerm();
        let extension = node.target.treeLevel > 0;

        if (node.id !== 'mc' && node.target.id !== 'gp' && term.id) {
          gridData.push({
            color: row.color,
            id: 1,
            gp: row.gp,
            relationship: extension ? '' : node.target.isComplement ? 'NOT ' : node.edge.label,
            extRelationship: extension ? node.edge.label : '',
            term: extension ? '' : term.label,
            extension: extension ? term.label : '',
            aspect: node.target.aspect,
            evidence: node.target.evidence[0].evidence.control.value.label,
            reference: node.target.evidence[0].reference.control.value,
            with: node.target.evidence[0].with.control.value,
            assignedBy: node.target.evidence[0].assignedBy.control.value,
            // $$treeLevel: node.treeLevel,
            node: node.target,
          })

          for (let i = 1; i < node.target.evidence.length; i++) {
            gridData.push({
              gp: row.gp,
              evidence: node.target.evidence[i].evidence.control.value.label,
              reference: node.target.evidence[i].reference.control.value,
              with: node.target.evidence[i].with.control.value,
              assignedBy: node.target.evidence[i].assignedBy.control.value,
              // $$treeLevel: node.treeLevel,
              //  annoton: node,
            })
          }
        }

        self.setGridDFS(row, gridData, row.annoton.edges[node.target.id])
      });
    }

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