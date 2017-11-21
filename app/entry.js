// https://berkeleybop.github.io/bbop-graph-noctua/doc/graph.html#fold_evidence

// Main program
// Root of all the imports/requires

window.tableviewWorkbenchVersion = '0.1.1';

import angular from 'angular';
import 'angular-ui-grid/ui-grid.min.js';
import nguibootstrap from 'angular-ui-bootstrap';

import 'angular-aria/angular-aria.js';
import 'angular-animate/angular-animate.js';
import 'angular-material/angular-material.js';


import '../node_modules/angular-material/angular-material.css';
import 'jsonformatter';
import 'jsonformatter/dist/json-formatter.min.css';
import '../node_modules/angular-ui-grid/ui-grid.min.css';
import './index.scss';
import 'font-awesome/css/font-awesome.min.css';

//import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';

var app = angular.module('TVApp', ['ngMaterial',
  nguibootstrap,
  'jsonFormatter',
  'ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav',
  'ui.grid.autoResize', 'ui.grid.resizeColumns',
  'ui.grid.treeView'
]);
app.config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {

  // Enable the hover preview feature
  JSONFormatterConfigProvider.hoverPreviewEnabled = true;
}]);

app.constant('saeConstants', {
  'edge': {
    enabledBy: 'RO:0002333',
    partOf: 'BFO:0000050',
    occursIn: 'BFO:0000066',
    happensDuring: 'RO:0002092'
  },
  rootMF: 'GO:0003674',
  noDataECO: 'ECO:0000035',


})

import TVController from 'TVController';
app.controller('TVController', TVController);

import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';
app.controller('PopulateDialogController', PopulateDialogController);

import SaeGraphService from './sae-graph.service.js';
app.service('saeGraph', SaeGraphService);
import FormGridService from './form-grid.service.js';
app.service('formGrid', FormGridService);
//import GraphService from './graph-old.service.js';
import GraphService from './graph.service.js';
app.service('graph', GraphService);
import LookupService from './lookup.service.js';
app.service('lookup', LookupService);