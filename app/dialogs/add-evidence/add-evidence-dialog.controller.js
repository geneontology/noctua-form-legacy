import _ from 'lodash';
const each = require('lodash/forEach');
import Util from "../../util/util.js";

export default class AddEvidenceDialogController {
  constructor(saeConstants, $scope, $rootScope, $mdDialog, dialogService, graph, lookup, formGrid, data) {
    var vm = this;
    vm.saeConstants = saeConstants;
    vm.$scope = $scope;
    vm.$rootScope = $rootScope;
    vm.$mdDialog = $mdDialog;
    vm.dialogService = dialogService;
    vm.lookup = lookup;
    vm.graph = graph;
    vm.formGrid = formGrid;
    vm.data = data;
  }

  closeDialog() {
    this.$mdDialog.cancel();
  }

  openSelectEvidenceDialog(ev, entity) {
    const self = this;

    let evidences = Util.addUniqueEvidencesFromAnnoton(self.data.annoton);
    Util.getUniqueEvidences(self.data.summaryData.annotons, evidences);

    let gpNode = self.data.annoton.getGPNode();

    let data = {
      readonly: false,
      gpNode: gpNode,
      aspect: self.data.entity.aspect,
      node: self.data.entity,
      evidences: evidences,
      params: {
        term: self.data.entity.term.control.value.id,
      }
    }

    let success = function (selected) {
      self.data.entity.addEvidences(selected.evidences, ['assignedBy']);
    }

    self.dialogService.openSelectEvidenceDialog(ev, data, success);
  }

}
AddEvidenceDialogController.$inject = ['saeConstants', '$scope', '$rootScope', '$mdDialog', 'dialogService', 'graph', 'lookup', 'formGrid', 'data'];