export default class DialogService {
  constructor(saeConstants, $rootScope, $mdDialog, $mdToast) {
    var appCtrl = this;
    this.saeConstants = saeConstants;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;

  }

  openGuideMeDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'GuideMeDialogController as annotonCtrl',
      templateUrl: './dialogs/guide-me/guide-me-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      multiple: true,
      locals: {
        data: data
      }
    }).then(success)
  }

  openGeneListnDialog(ev, row) {
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

  openViewSummaryDialog(ev, summaryRow) {
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

  openEditAnnotonDialog(ev, row) {
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

  openAddEvidenceDialog(ev, entity) {
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

  openAnnotonErrorsDialog(ev, annoton, errors) {
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

  openCreateFromExistingDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'CreateFromExistingDialogController as annotonCtrl',
      templateUrl: './dialogs/create-from-existing/create-from-existing-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    }).then(success)
  }

  openLinkToExistingDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'LinkToExistingDialogController as annotonCtrl',
      templateUrl: './dialogs/link-to-existing/link-to-existing-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    }).then(success)
  }

  openSelectEvidenceDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'SelectEvidenceDialogController as annotonCtrl',
      templateUrl: './dialogs/create-from-existing/select-evidence/select-evidence-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      multiple: true,
      locals: {
        data: data
      }
    }).then(success)
  }


  openPopulateDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'PopulateDialogController as annotonCtrl',
      templateUrl: './dialogs/populate/populate-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    }).then(success)
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