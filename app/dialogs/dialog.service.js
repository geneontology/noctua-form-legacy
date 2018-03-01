export default class DialogService {
  constructor(saeConstants, $rootScope, $mdDialog, $mdToast) {
    var appCtrl = this;
    this.saeConstants = saeConstants;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;

  }

  openGeneListnDialogDialog(ev, row) {
    this.$mdDialog.show({
      controller: 'GeneListnDialogController as annotonCtrl',
      templateUrl: './dialogs/gene-list/gene-list-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        row: row
      }
    })
  }

  openViewSummaryDialogDialog(ev, summaryRow) {
    this.$mdDialog.show({
      controller: 'ViewSummaryDialogController as annotonCtrl',
      templateUrl: './dialogs/view-summary/view-summary-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        summaryRow: summaryRow
      }
    })
  }

  openEditAnnotonDialogDialog(ev, row) {
    this.$mdDialog.show({
      controller: 'EditAnnotonDialogController as annotonCtrl',
      templateUrl: './dialogs/edit-annoton/edit-annoton-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        row: row
      }
    })
  }

  openAddEvidenceDialogDialog(ev, entity) {
    this.$mdDialog.show({
      controller: 'AddEvidenceDialogController as annotonCtrl',
      templateUrl: './dialogs/add-evidence/add-evidence-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        entity: entity
      }
    })
  }

  openAnnotonErrorsDialogDialog(ev, annoton, errors) {
    this.$mdDialog.show({
      controller: 'AnnotonErrorsDialogController as errorsCtrl',
      templateUrl: './dialogs/annoton-errors/annoton-errors-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        annoton: annoton,
        errors: errors
      }
    })
  }

  openSuccessfulSaveToast() {
    const self = this;
    self.$mdToast.show(
      self.$mdToast.simple()
      .textContent('Annoton Saved Successfully')
      .position('top right')
      .action('OK')
      .theme("success-toast")
      .hideDelay(10000)
    );
  }
}
DialogService.$inject = ['saeConstants', '$rootScope', '$mdDialog', '$mdToast'];