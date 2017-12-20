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

import AppController from 'app.controller';
import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';
import AnnotonErrorsDialogController from './dialogs/annoton-errors/annoton-errors-dialog.controller.js';
import EditAnnotonDialogController from './dialogs/edit-annoton/edit-annoton-dialog.controller.js';

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
        "label": 'SINGLE GENE PRODUCT'
      },
      'complex': {
        "name": 'complex',
        "label": 'MACROMOLECULAR COMPLEX'
      }
    }
  },
  "annotonModelType": {
    "options": {
      "annoton": {
        "name": 'annoton',
        "label": 'DEFAULT'
      },
      "candidate": {
        "name": 'candidate',
        "label": 'COMPONENT ONLY'
      }
    }
  },
  "displaySection": {
    "gp": {
      id: "gp",
      label: 'Gene Product'
    },
    "fd": {
      id: "fd",
      label: 'Macromolecular Complex'
    },
  },
  "displayGroup": {
    "gp": {
      id: "gp",
      shorthand: "GP",
      label: 'Gene Product'
    },
    "mc": {
      id: "mc",
      shorthand: "MC",
      label: 'Macromolecular Complex'
    },
    "mf": {
      id: "mf",
      shorthand: "MF",
      label: 'Molecular Function'
    },
    "bp": {
      id: "bp",
      shorthand: "BP",
      label: 'Biological Process'
    },
    "cc": {
      id: "cc",
      shorthand: "CC",
      label: 'Location of Activity'
    }
  },
  'edge': {
    enabledBy: 'RO:0002333',
    hasInput: 'RO:0002233',
    happensDuring: 'RO:0002092',
    occursIn: 'BFO:0000066',
    partOf: 'BFO:0000050',
    hasPart: 'BFO:0000051',
  },
  "closure": {
    "mc": 'GO:0032991'
  },
  canDuplicateEdges: [{
    name: 'hasPart',
    term: 'BFO:0000051'
  }],
  causalEdges: [{
    name: 'causally upstream of or within',
    term: 'RO:0002418'
  }, {
    name: 'causally upstream of',
    term: 'RO:0002411'
  }, {
    name: 'causally upstream of, positive effect',
    term: 'RO:0002304'
  }, {
    name: 'causally upstream of, negative effect',
    term: 'RO:0002305'
  }, {
    name: 'immediately causally upstream of',
    term: 'RO:0002412'
  }, {
    name: 'directly provides input for',
    term: 'RO:0002413'
  }, {
    name: 'regulates',
    term: 'RO:0002211'
  }, {
    name: 'negatively regulates',
    term: 'RO:0002212'
  }, {
    name: 'directly negatively regulates',
    term: 'RO:0002630'
  }, {
    name: 'positively regulates',
    term: 'RO:0002213'
  }, {
    name: 'directly positively regulates',
    term: 'RO:0002629'
  }],
  rootMF: 'GO:0003674',
  noDataECO: 'ECO:0000035',
});

app.controller('AppController', AppController);
app.controller('PopulateDialogController', PopulateDialogController);
app.controller('AnnotonErrorsDialogController', AnnotonErrorsDialogController)
app.controller('EditAnnotonDialogController', EditAnnotonDialogController)
app.service('config', ConfigService);
app.service('formGrid', FormGridService);
app.service('summaryGrid', SummaryGridService);
app.service('graph', GraphService);
app.service('lookup', LookupService);