//
// App Controller
//  Primary controller driving the table-mode
//

/* global angular */

import _ from 'lodash';
const each = require('lodash/forEach');
import AnnotonError from "./annoton/parser/annoton-error.js";

export default class AppController {
  constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, $mdToast, config, joyrideService, dialogService, graph, lookup, formGrid) {
    var appCtrl = this;
    this.saeConstants = saeConstants;
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

    var userNameInfo = document.getElementById('user_name_info');
    if (userNameInfo) {
      userNameInfo.innerHTML = '';
    }

    appCtrl.formGrid.initalizeForm();

    $rootScope.$on('rebuilt', function (event, data) {
      appCtrl.summaryData = data.gridData;
    });

    graph.initialize();
    this.config.createJoyrideSteps();
    //graph.setGolr();
    // this.lookup.isaClosure(1, "CL:0000003", 'CL:0010015')
    // this.lookup.isaClosure(2, "CHEBI:23367", 'GO:0071079')
    // this.lookup.isaClosure(3, "GO:0032991", 'GO:0006869')
    // this.lookup.isaClosure(4, "GO:0008150", 'GO:0005575')
    // this.lookup.isaClosure(5, "GO:0008150", 'GO:0006869')
  }

  setView(view) {
    this.viewMode.selected = view;
  }

  getTerm(field) {
    let result = null;
    if (field && field.control.value && field.control.value.length >= 3) {
      result = this.lookup.golrLookup(field);
      // console.log('result', result);
    }
    return result;
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

  saveAnnoton(addNew) {
    const self = this;

    self.graph.saveAnnoton(self.formGrid.annoton, null, addNew).then(function (data) {
      self.formGrid.clearForm();
      self.dialogService.openSuccessfulSaveToast();
    });
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
AppController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', '$mdToast', 'config', 'joyrideService', 'dialogService', 'graph', 'lookup', 'formGrid'];