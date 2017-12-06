import _ from 'lodash';
const each = require('lodash/forEach');

export default class FormGridService {
  constructor(saeConstants, config, $timeout, lookup) {
    this.saeConstants = saeConstants
    this.config = config;
    this.$timeout = $timeout;
    this.lookup = lookup;
    this.annoton = this.config.createAnnotonModel();


    this.gridApi = null;
    this.columnDefs = [{
      name: 'label',
      displayName: '',
      width: '25%',
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
      noTabInterference: false,
      headerRowHeight: 50,
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
      showTreeRowHeader: true,
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

  setAnnotonType(annoton, annotonType) {
    annoton.setAnnotonType(annotonType.name);
  }

  setAnnotonModelType(annoton, annotonType) {
    annoton.setAnnotonModelType(annotonType.name);
  }

  /**
   *  Populates the tree grid with GO Terms, MF, CC, BP as roots
   */
  initalizeForm() {
    const self = this;

    self.geneProduct = self.annoton.getNode('gp');
    self.groupedData = {};

    each(self.annoton.nodes, function (node) {
      if (node.displayGroup) {
        if (!self.groupedData[node.displayGroup.id]) {
          self.groupedData[node.displayGroup.id] = {
            label: node.displayGroup.label,
            nodes: []
          };
        }
        self.groupedData[node.displayGroup.id].nodes.push(node);
      }
    });


    self.gridOptions.data = self.annoton.nodes;

  }

  initalizeFormData() {
    const self = this;

    this.annoton = this.config.createAnnotonModelFakeData();
    self.initalizeForm()

  }


  clearForm() {
    this.initalizeForm();
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
FormGridService.$inject = ['saeConstants', 'config', '$timeout', 'lookup'];