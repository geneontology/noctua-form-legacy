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

import TVController from 'TVController';
import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';
import ConfigService from './config/config.service.js';
import FormGridService from './grids/form-grid.service.js';
import SummaryGridService from './grids/summary-grid.service.js';
//import GraphService from './graph-old.service.js';
import GraphService from './graph.service.js';
import LookupService from './lookup.service.js';
//import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';

var app = angular.module('TVApp', ['ngMaterial',
  nguibootstrap,
  'jsonFormatter',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.rowEdit',
  'ui.grid.cellNav',
  'ui.grid.autoResize',
  'ui.grid.resizeColumns',
  'ui.grid.treeView',
  'ui.grid.expandable',
  'ui.grid.selection',
  'ui.grid.pinning'
]);
app.config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {

  // Enable the hover preview feature
  JSONFormatterConfigProvider.hoverPreviewEnabled = true;
}]);

app.constant('saeConstants', {
  "annotonType": {
    "options": {
      'simple': {
        "name": 'simple',
        "label": 'SINGLE GENE'
      },
      'complex': {
        "name": 'complex',
        "label": 'MULTIPLE GENES'
      }
    }
  },
  "annotonModelType": {
    "options": [{
        "name": 'annoton',
        "label": 'ANNOTON'
      },
      {
        "name": 'candidate',
        "label": 'CANDIDATE'
      }
    ]
  },
  "displayGroup": {
    "gp": {
      id: "gp",
      label: 'Gene Product'
    },
    "mf": {
      id: "mf",
      label: 'Molecula Function'
    },
    "bp": {
      id: "bp",
      label: 'Biological Process'
    },
    "cc": {
      id: "cc",
      label: 'Cellular Component'
    }
  },
  'edge': {
    enabledBy: 'RO:0002333',
    hasInput: 'RO:0002233',
    happensDuring: 'RO:0002092',
    occursIn: 'BFO:0000066',
    partOf: 'BFO:0000050',
  },
  rootMF: 'GO:0003674',
  noDataECO: 'ECO:0000035',


})

app.controller('TVController', TVController);
app.controller('PopulateDialogController', PopulateDialogController);
app.service('config', ConfigService);
app.service('formGrid', FormGridService);
app.service('summaryGrid', SummaryGridService);
app.service('graph', GraphService);
app.service('lookup', LookupService);