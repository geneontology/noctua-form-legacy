//
// TVController
//  Primary controller driving the table-mode
//

/* global angular */

export default class TVController {
  constructor($scope, $rootScope, $http, $timeout, uiGridTreeViewConstants, graph, lookup, formGrid) {
    var tvc = this;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.uiGridTreeViewConstants = uiGridTreeViewConstants;
    tvc.$timeout = $timeout;
    tvc.lookup = lookup;
    tvc.graph = graph;
    tvc.formGrid = formGrid;

    var userNameInfo = document.getElementById('user_name_info');
    if (userNameInfo) {
      userNameInfo.innerHTML = '';
    }

    tvc.viewMode = {
      options: {
        grid: 1,
        linear: 2,
        table: 3,
        graph: 4
      }
    };
    tvc.viewMode.selected = tvc.viewMode.options.grid;

    /* Init the grid form */
    tvc.formGrid.registerApi();
    tvc.formGrid.initalizeForm();
    tvc.formGrid.expandAll();

    /* Attach the tvc to the gridScope */
    tvc.formGrid.gridOptions.appScopeProvider = tvc;

    tvc.clearForm();

    tvc.gridApi = null;
    tvc.gridOptions = {
      rowHeight: 120,
      width: 100,
      minWidth: 100,
      enableCellSelection: false,
      // rowEditWaitInterval: -1,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      multiSelect: false,
      rowTemplate: 'rowTemplate.html',
      showTreeExpandNoChildren: false
      // keyDownOverrides: [{keyCode: 27}]
    };

    let columnDefs = [];

    let commandColumn = {
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
    };
    columnDefs.push(commandColumn);

    columnDefs.push({
      name: 'GP',
      field: 'GP',
      originalName: 'GP',
      displayName: 'GP',
      width: 200,
      minWidth: 200,
      enableCellEdit: false,
      enableCellEditOnFocus: false
    });
    columnDefs.push({
      name: 'Aspect',
      field: 'Aspect',
      originalName: 'Aspect',
      displayName: 'Aspect',
      width: 55,
      maxWidth: 55,
      enableSorting: false,
      enableColumnMenu: false,
      // maxWidth: 200,
      enableCellEdit: false,
      enableCellEditOnFocus: false
    });
    columnDefs.push({
      name: 'Term',
      field: 'Term',
      originalName: 'Term',
      displayName: 'Term',
      minWidth: 250,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    });
    columnDefs.push({
      name: 'Evidence',
      field: 'Evidence.label',
      originalName: 'Evidence',
      displayName: 'Evidence',
      minWidth: 250,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    });
    columnDefs.push({
      name: 'Reference',
      field: 'Reference',
      originalName: 'Reference',
      displayName: 'Reference',
      minWidth: 100,
      maxWidth: 140,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    });
    columnDefs.push({
      name: 'With',
      field: 'With',
      originalName: 'With',
      displayName: 'With',
      minWidth: 100,
      maxWidth: 140,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      cellTemplate: 'cellTemplate.html'
    });
    tvc.gridOptions.columnDefs = columnDefs;

    tvc.gridOptions.onRegisterApi = function (gridApi) {
      tvc.gridApi = gridApi;
      tvc.$scope.gridApi = gridApi;

      tvc.$timeout(function () {
        tvc.gridApi.core.handleWindowResize();
      }, 0);
    };

    $rootScope.$on('rebuilt', function (event, data) {
      const gridData = data.gridData;
      tvc.clearForm();

      tvc.gridOptions.data = gridData;
    });

    graph.initialize();
  }

  setView(view) {
    this.viewMode.selected = view;
  }

  getTerm(field) {
    let result = null;
    if (field.control.value && field.control.value.length >= 3) {
      //let oldValue = this.editingModel[field];
      // console.log('getTerm', field, oldValue, term);
      result = this.lookup.golrLookup(field); // delete?, this.fieldToRoot[field]);
      // console.log('result', result);
    }
    return result;
  }

  getTerm2(field, term) {
    let result = null;
    if (term && term.length >= 3) {
      let oldValue = this.editingModel[field];
      // console.log('getTerm', field, oldValue, term);
      result = this.lookup.golrLookup(field, oldValue, term); // delete?, this.fieldToRoot[field]);
      // console.log('result', result);
    }
    return result;
  }

  termSelected( /* field , term */ ) {
    // console.log('termSelected', field, this.editingModel[field], term);
  }

  loadEditingModel(annoton) {
    // console.log('loadEditingModel', annoton);
    this.editingModel = annoton;
  }

  fillModelWithFakeData() {
    this.loadEditingModel({
      GP: {
        id: 'MGI:MGI:4367793',
        label: 'Sho2 Mmus'
      },
      GPa: {
        id: 'UniProtKB:O95477',
        label: 'Sho2 Mmus'
      },

      MF: {
        id: 'GO:0045551',
        label: 'cinnamyl-alcohol dehydrogenase activity'
      },
      MFe: {
        id: 'ECO:0006017',
        label: 'traceable author statement from published clinical study used in manual assertion',
        reference: 'PMID:1234',
        with: 'PMID:5678'
      },

      BP: {
        id: 'GO:0046577',
        label: 'long-chain-alcohol oxidase activity'
      },
      BPe: {
        id: 'ECO:0000501',
        label: 'evidence used in automatic assertion',
        reference: 'r2',
        with: 'w2'
      },

      CC: {
        id: 'GO:0047639',
        label: 'alcohol oxidase activity'
      },
      CL: {
        id: 'CL:2000054',
        label: 'alcohol oxidase activity'
      },
      CCe: {
        id: 'ECO:0005542',
        label: 'biological system reconstruction evidence by exper…ence from single species used in manual assertion',
        reference: 'r3',
        with: 'w3'
      }
    });
  }

  clearForm() {
    this.editingModel = {
      GP: null,
      GPa: null,
      MF: null,
      MFe: null,
      BP: null,
      BPe: null,
      CC: null,
      CL: null,
      CCe: null
    };

    this.$timeout(() => {
      const element = angular.element('#GPFocus');
      element.focus();
    });
  }

  saveRowEnabled(patternForm) {
    let reasons = [];

    if (this.editingModel) {
      if (!this.editingModel.GP) {
        reasons.push('Select a Gene Product (GP)');
      }

      let hasAtLeastOneElement = false;

      if (reasons.length === 0 && this.editingModel.MF) {
        if (!this.editingModel.MFe) {
          reasons.push('Select Evidence for the MF.');
        } else {
          hasAtLeastOneElement = true;
        }
      }

      if (reasons.length === 0 && this.editingModel.BP) {
        if (!this.editingModel.BPe) {
          reasons.push('Select Evidence for the BP');
        } else {
          hasAtLeastOneElement = true;
        }
      }

      if (reasons.length === 0 && this.editingModel.CC) {
        if (!this.editingModel.CCe) {
          reasons.push('Select Evidence for the CC');
        } else {
          hasAtLeastOneElement = true;
        }
      }

      if (reasons.length === 0 && !hasAtLeastOneElement) {
        reasons.push('At least one Aspect required.');
      }

      if (reasons.length === 0 && patternForm.referenceMF.$error.pattern) {
        reasons.push('Please use CURIE format for MF Reference.');
      }
      if (reasons.length === 0 && patternForm.referenceBP.$error.pattern) {
        reasons.push('Please use CURIE format for BP Reference.');
      }
      if (reasons.length === 0 && patternForm.referenceCC.$error.pattern) {
        reasons.push('Please use CURIE format for CC Reference.');
      }
      if (reasons.length === 0 && patternForm.withMF.$error.pattern) {
        reasons.push('Please use CURIE format for MF With.');
      }
      if (reasons.length === 0 && patternForm.withBP.$error.pattern) {
        reasons.push('Please use CURIE format for BP With.');
      }
      if (reasons.length === 0 && patternForm.withCC.$error.pattern) {
        reasons.push('Please use CURIE format for CC With.');
      }
    }

    // console.log('saveRowEnabled', this.editingModel, reasons);
    return reasons;
  }


  saveRow() {
    this.graph.saveEditingModel(this.formGrid.gridOptions.data);
  }


  editRow(row) {
    this.clearForm();
    let annoton = {
      GP: row.original.GP,
      MF: row.original.MF,
      Annoton: row.Annoton
    };

    if (row.original.MFe) {
      annoton.MFe = {
        id: row.original.MFe.evidence.id,
        label: row.original.MFe.evidence.label,
        reference: row.original.MFe.reference,
        with: row.original.MFe.with
      };
    }

    if (row.original.BP) {
      annoton.BP = row.original.BP;

      if (row.original.BPe) {
        annoton.BPe = {
          id: row.original.BPe.evidence.id,
          label: row.original.BPe.evidence.label,
          reference: row.original.BPe.reference,
          with: row.original.BPe.with
        };
      }
    }

    if (row.original.CC) {
      annoton.CC = row.original.CC;

      if (row.original.CCe) {
        annoton.CCe = {
          id: row.original.CCe.evidence.id,
          label: row.original.CCe.evidence.label,
          reference: row.original.CCe.reference,
          with: row.original.CCe.with
        };
      }
    }

    // console.log('row.original', row.original, annoton);
    this.loadEditingModel(annoton);
  }

  deleteRow(row) {
    if (window.confirm('Are you sure you wish to delete this row?')) {
      this.graph.deleteAnnoton(row.Annoton);
    }
  }
}
TVController.$inject = ['$scope', '$rootScope', '$http', '$timeout', 'uiGridTreeViewConstants', 'graph', 'lookup', 'formGrid'];