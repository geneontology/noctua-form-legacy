//
// App Controller
//  Primary controller driving the table-mode
//

/* global angular */

export default class AppController {
  constructor(saeConstants, $scope, $rootScope, $http, $timeout, $mdDialog, $mdToast, uiGridTreeViewConstants, graph, lookup, formGrid) {
    var appCtrl = this;
    this.saeConstants = saeConstants;
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.uiGridTreeViewConstants = uiGridTreeViewConstants;
    appCtrl.$timeout = $timeout;
    appCtrl.lookup = lookup;
    appCtrl.graph = graph;
    appCtrl.formGrid = formGrid;

    var userNameInfo = document.getElementById('user_name_info');
    if (userNameInfo) {
      userNameInfo.innerHTML = '';
    }

    appCtrl.summaryView = {
      options: {
        grid: 0,
        list: 1
      },
    };
    appCtrl.summaryView.selected = 0;
    appCtrl.formGrid.initalizeForm();

    $rootScope.$on('rebuilt', function (event, data) {
      appCtrl.summaryData = data.gridData;
    });

    graph.initialize();
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
      .then(function (answer) {}, function () {});
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
      .then(function (answer) {}, function () {});
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
      .then(function (answer) {}, function () {});
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
      .then(function (answer) {}, function () {});
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
      .then(function (answer) {}, function () {});
  }

  saveAnnoton() {
    const self = this;

    if (this.graph.saveAnnoton(this.formGrid.annoton)) {
      this.formGrid.clearForm();
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

  addRootNode(entity) {
    const self = this;
    entity.setTerm(self.saeConstants.rootNode[entity.id]);
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
}
AppController.$inject = ['saeConstants', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', '$mdToast', 'uiGridTreeViewConstants', 'graph', 'lookup', 'formGrid'];