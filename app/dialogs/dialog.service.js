export default class DialogService {
  constructor(saeConstants, $rootScope, $mdDialog, $mdToast) {
    var appCtrl = this;
    this.saeConstants = saeConstants;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;

  }

  openConnectActivityDialog(ev, data) {
    this.$mdDialog.show({
      controller: 'ConnectActivityDialogController as annotonCtrl',
      templateUrl: './dialogs/connect-activity/connect-activity-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    })
  }

  openPreviewAnnotonDialog(ev, data) {
    this.$mdDialog.show({
      controller: 'PreviewAnnotonDialogController as annotonCtrl',
      templateUrl: './dialogs/preview-annoton/preview-annoton-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    })
  }






  openBeforeSaveDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'BeforeSaveDialogController as annotonCtrl',
      templateUrl: './dialogs/before-save/before-save-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    }).then(success)
  }

  openGuideMeDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'GuideMeDialogController as appCtrl',
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

  openAnnotonSectionDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'AnnotonSectionDialogController as annotonCtrl',
      templateUrl: './dialogs/annoton-section/annoton-section-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      multiple: true,
      locals: {
        data: data
      }
    }).then(success)
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

  openEditAnnotonNodeDialog(ev, data, success) {
    this.$mdDialog.show({
      controller: 'EditAnnotonNodeDialogController as annotonCtrl',
      templateUrl: './dialogs/edit-annoton-node/edit-annoton-node-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
      }
    }).then(success)
  }

  openAddEvidenceDialog(ev, data) {
    this.$mdDialog.show({
      controller: 'AddEvidenceDialogController as annotonCtrl',
      templateUrl: './dialogs/add-evidence/add-evidence-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: false,
      locals: {
        data: data
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
      templateUrl: './dialogs/select-evidence/select-evidence-dialog.html',
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