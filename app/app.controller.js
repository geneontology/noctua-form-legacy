//
// App Controller
//  Primary controller driving the table-mode
//

/* global angular */

import _ from 'lodash';
const each = require('lodash/forEach');
import AnnotonError from "./annoton/parser/annoton-error.js";

export default class AppController {
  constructor(saeConstants, uiGridTreeViewConstants, $scope, $rootScope, $http, $timeout, $mdDialog, $mdToast, config, joyrideService, dialogService, graph, lookup, formGrid, summaryGrid) {
    var appCtrl = this;
    this.saeConstants = saeConstants;
    this.uiGridTreeViewConstants = uiGridTreeViewConstants;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$timeout = $timeout;
    this.config = config;
    this.joyrideService = joyrideService;
    this.dialogService = dialogService;
    this.lookup = lookup;
    this.graph = graph;
    this.formGrid = formGrid;
    this.summaryGrid = summaryGrid;

    this.viewMode = {
      options: {
        grid: 1,
        linear: 2,
        table: 3,
        graph: 4
      }
    };
    this.viewMode.selected = this.viewMode.options.table;

    var userNameInfo = document.getElementById('user_name_info');
    if (userNameInfo) {
      userNameInfo.innerHTML = '';
    }

    appCtrl.formGrid.initalizeForm();

    $rootScope.$on('rebuilt', function (event, data) {
      appCtrl.summaryData = data.gridData;
      // appCtrl.summaryGrid.gridOptions.data = data.gridData.annotons;
      appCtrl.summaryGrid.gridOptions.appScopeProvider = appCtrl;
      //  appCtrl.summaryGrid.gridOptions.expandableRowScope = appCtrl;
      appCtrl.summaryGrid.setGrid(data.gridData.annotons)
      appCtrl.summaryGrid.registerApi();
      // appCtrl.summaryGrid.expandAll();


      console.log('poo', appCtrl.graph.modelInfo.graphEditorUrl);
    });




    graph.initialize();
    this.config.createJoyrideSteps();
    //graph.setGolr();
    // this.lookup.isaClosure(1, "CL:0000003", 'CL:0010015')
    // this.lookup.isaClosure(2, "CHEBI:23367", 'GO:0071079')
    // this.lookup.isaClosure(3, "GO:0032991", 'GO:0006869')
    // this.lookup.isaClosure(4, "GO:0008150", 'GO:0005575')
    // this.lookup.isaClosure(5, "GO:0008150", 'GO:000686



  }
  expandAll() {
    $scope.gridApi.treeBase.expandAllRows();
  };
  setView(view) {
    this.viewMode.selected = view;
  }



  onSelected(m, item, model, label) {
    m = item;
    console.log(m, "aa", item, "m", model, "l", label);
  }

  openGuideMeDialog(ev) {
    const self = this;

    let data = {

    };

    let success = function (selected) {
      // self.formGrid.cloneForm(selected.annoton, selected.nodes);
    }

    self.dialogService.openGuideMeDialog(ev, data, success);
  }

  openCreateFromExistingDialog(ev, entity) {
    const self = this;

    let data = {
      entityFilter: entity,
      annotonData: self.summaryData.annotons
    };

    let success = function (selected) {
      self.formGrid.cloneForm(selected.annoton, selected.nodes);
    }

    self.dialogService.openCreateFromExistingDialog(ev, data, success);
  }

  openLinkToExistingDialog(ev, entity) {
    const self = this;

    let data = {
      entity: entity,
      annotonData: self.summaryData.annotons
    };

    let success = function (selected) {
      self.formGrid.linkFormNode(entity, selected.node);
    }

    self.dialogService.openLinkToExistingDialog(ev, data, success);
  }

  openPopulateDialog(ev, entity) {
    const self = this;
    let gpNode = self.formGrid.annotonPresentation.geneProduct;

    if (gpNode && gpNode.term.control.value.id) {
      let data = {
        gpNode: gpNode,
        aspect: entity.aspect,
        entity: entity,
        params: {
          term: entity.term.control.value.id,
          evidence: entity.evidence[0].evidence.control.value.id
        }
      }
      let success = function (selected) {
        entity.setTerm(selected.term);
        entity.resetEvidence();
        for (let i = 0; i < selected.annotations.length; i++) {
          let evidence = entity.evidence[0];
          if (i > 0) {
            evidence = entity.addEvidence()
          }

          evidence.setEvidence(selected.annotations[i].evidence[0].getEvidence());
          evidence.setReference(selected.annotations[i].evidence[0].getReference());
          evidence.setWith(selected.annotations[i].evidence[0].getWith());
          evidence.setAssignedBy(selected.annotations[i].evidence[0].getAssignedBy());
        };
      }
      self.dialogService.openPopulateDialog(ev, data, success);
    } else {
      let errors = [];
      let meta = {
        aspect: gpNode ? gpNode.label : 'Gene Product'
      }
      let error = new AnnotonError(1, "Please enter a gene product", meta)
      errors.push(error);
      self.dialogService.openAnnotonErrorsDialog(ev, entity, errors)
    }

  }

  saveAnnoton() {
    const self = this;
    let infos;

    let saveAnnoton = function (selected) {
      //self.formGrid.linkFormNode(entity, selected.node);
      self.graph.saveAnnoton(self.formGrid.annoton).then(function (data) {
        self.formGrid.clearForm();
        self.dialogService.openSuccessfulSaveToast();
      });
    }

    infos = self.graph.annotonAdjustments(self.formGrid.annoton);

    //temporarily off
    if (infos.length > 0) {
      let data = {
        annoton: self.formGrid.annoton,
        infos: infos
      };

      //self.dialogService.openBeforeSaveDialog(null, data, saveAnnoton);
      saveAnnoton();
    } else {
      saveAnnoton();
    }
  }

  toggleIsComplement(entity, ev) {
    const self = this;
    let canToggle = true;
    let errors = [];

    each(entity.nodeGroup.nodes, function (node) {
      if (node.treeLevel > 0) {
        let nodeEmpty = !node.hasValue();
        canToggle = canToggle && nodeEmpty
        if (!nodeEmpty) {
          let meta = {
            aspect: node.label
          }
          let error = new AnnotonError(1, "Cannot add 'NOT', Remove '" + node.label + "'  value (" + node.term.control.value.label + ")", meta)
          errors.push(error);
        }
      }
    });

    if (canToggle) {
      entity.toggleIsComplement();
    } else {
      self.dialogService.openAnnotonErrorsDialog(ev, entity, errors)
    }

  }

  addRootNode(entity) {
    const self = this;
    entity.setTerm(self.saeConstants.rootNode[entity.id]);
  }

  addNDEvidence(evidence) {
    const self = this;
    evidence.setEvidence(self.saeConstants.evidenceAutoPopulate['nd'].evidence);
    evidence.setReference(self.saeConstants.evidenceAutoPopulate['nd'].reference);
  }

  editRow(row) {
    const self = this;

    self.formGrid.clearForm();

    self.formGrid.gridOptions.data = row.annoton.nodes;
    console.log(JSON.stringify(row.annoton.print()))
  }

  deleteRow(row) {
    if (window.confirm('Are you sure you wish to delete this row?')) {
      this.graph.deleteAnnoton(row.Annoton);
    }
  }

  startGuide() {
    const self = this;
    let canToggle = true;
    let errors = [];

    self.joyrideService.start = true;
    self.joyrideService.config = {
      overlay: true,
      onStepChange: function () {},
      onStart: function () {},
      onFinish: function () {},
      steps: self.config.createJoyrideSteps()
    }
  }
}
AppController.$inject = ['saeConstants', 'uiGridTreeViewConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', '$mdToast', 'config', 'joyrideService', 'dialogService', 'graph', 'lookup', 'formGrid', 'summaryGrid'];