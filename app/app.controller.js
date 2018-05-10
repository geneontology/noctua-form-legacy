//
// App Controller
//  Primary controller driving the table-mode
//

/* global angular */

import _ from 'lodash';
const each = require('lodash/forEach');
import AnnotonError from "./annoton/parser/annoton-error.js";
import Util from "./util/util.js";

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

    this.summaryViewMode = {
      options: {
        table: {
          id: 'table',
          label: 'Table'
        },
        grid: {
          id: 'grid',
          label: 'Grid'
        }
      }
    };

    this.summaryViewMode.selected = this.summaryViewMode.options.table;

    var userNameInfo = document.getElementById('user_name_info');
    if (userNameInfo) {
      userNameInfo.innerHTML = '';
    }

    appCtrl.formGrid.initalizeForm();

    appCtrl.summaryGrid.setGridScope(appCtrl);

    $rootScope.$on('rebuilt', function (event, data) {
      appCtrl.summaryData = data.gridData;
      appCtrl.summaryGrid.setGrid(data.gridData.annotons)
    });

    graph.initialize();
    this.config.createJoyrideSteps();
  }

  expandAll() {
    $scope.gridApi.treeBase.expandAllRows();
  };

  setSummaryView(view) {
    this.summaryViewMode.selected = view;
  }

  onSelected(m, item, model, label) {
    m = item;
    console.log(m, "aa", item, "m", model, "l", label);
  }


  openEditAnnotonNodeDialog(ev, annoton, entity) {
    const self = this;

    let data = {
      annoton: self.formGrid.annoton,
      entity: self.formGrid.annoton.getNode('mf')
    };

    let success = function (selected) {
      // self.formGrid.cloneForm(selected.annoton, selected.nodes);
    }

    self.dialogService.openEditAnnotonNodeDialog(ev, data, success);
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


  openConnectActivityDialog(ev, annoton, entity) {
    const self = this;

    let data = {
      summaryData: self.summaryData,
      annoton: annoton,
      entity: entity
    }

    self.dialogService.openConnectActivityDialog(ev, data);
  }

  openPreviewAnnotonDialog(ev, annoton, entity) {
    const self = this;

    let data = {
      summaryData: self.summaryData,
      annoton: annoton,
      entity: entity
    }

    self.dialogService.openPreviewAnnotonDialog(ev, data);
  }

  openAddEvidenceDialog(ev, entity) {
    const self = this;

    let data = {
      summaryData: self.summaryData,
      annoton: self.formGrid.annoton,
      entity: entity
    }

    self.dialogService.openAddEvidenceDialog(ev, data);
  }

  openAnnotonSectionDialog(ev, entity) {
    const self = this;

    let displaySectionId = self.config.generateAnnotonSection(self.formGrid.annoton,
      self.saeConstants.annotonModelType.options.ccOnly.name, entity);

    let displaySection = self.formGrid.addAnnotonPresentation(self.formGrid.annoton, displaySectionId);

    let data = {
      displaySection: displaySection,
      node: entity
    }

    self.dialogService.openAnnotonSectionDialog(ev, data);
  }

  openSelectEvidenceDialog(ev, entity) {
    const self = this;

    let evidences = Util.addUniqueEvidencesFromAnnoton(self.formGrid.annoton);
    Util.getUniqueEvidences(self.summaryData.annotons, evidences);

    let gpNode = self.formGrid.annotonPresentation.geneProduct;

    let data = {
      readonly: false,
      gpNode: gpNode,
      aspect: entity.aspect,
      node: entity,
      evidences: evidences,
      params: {
        term: entity.term.control.value.id,
      }
    }

    let success = function (selected) {
      entity.addEvidences(selected.evidences, ['assignedBy']);
    }

    self.dialogService.openSelectEvidenceDialog(ev, data, success);
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
        readonly: false,
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
      let error = new AnnotonError('error', 1, "Please enter a gene product", meta)
      errors.push(error);
      self.dialogService.openAnnotonErrorsDialog(ev, entity, errors)
    }

  }

  openPopulateReadonlyDialog(ev, annoton, entity) {
    const self = this;
    let gpNode = annoton.getNode('gp');

    let data = {
      readonly: true,
      gpNode: gpNode,
      aspect: entity.aspect,
      entity: entity,
      params: {
        term: entity.term.control.value.id,
      }
    }
    self.dialogService.openPopulateDialog(ev, data);

  }

  saveAnnoton() {
    const self = this;
    let infos;

    let saveAnnoton = function (selected) {
      //self.formGrid.linkFormNode(entity, selected.node);
      let annoton = self.graph.adjustAnnoton(self.formGrid.annoton)
      self.graph.saveAnnoton(annoton).then(function (data) {
        self.formGrid.clearForm();
        self.dialogService.openSuccessfulSaveToast();
      });
    }

    infos = self.graph.annotonAdjustments(self.formGrid.annoton);
    // self.graph.createSave(self.formGrid.annoton);
    //temporarily off
    if (infos.length > 0) {
      let data = {
        annoton: self.formGrid.annoton,
        infos: infos
      };

      self.dialogService.openBeforeSaveDialog(null, data, saveAnnoton);
      /// saveAnnoton();
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
          let error = new AnnotonError('error', 1, "Cannot add 'NOT', Remove '" + node.label + "'  value (" + node.term.control.value.label + ")", meta)
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

  addHasPartGP(annoton) {

    const self = this;

    self.config.addGPAnnotonData(annoton);
    self.formGrid.initalizeForm();
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