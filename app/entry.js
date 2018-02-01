// https://berkeleybop.github.io/bbop-graph-noctua/doc/graph.html#fold_evidence

// Main program
// Root of all the imports/requires

window.tableviewWorkbenchVersion = '0.1.1';

import angular from 'angular';
import nguibootstrap from 'angular-ui-bootstrap';

import 'angular-aria/angular-aria.js';
import 'angular-animate/angular-animate.js';
import 'angular-material/angular-material.js';


import '../node_modules/angular-material/angular-material.css';
import 'jsonformatter';
import 'jsonformatter/dist/json-formatter.min.css';
import './index.scss';
import 'font-awesome/css/font-awesome.min.css';

import AppController from 'app.controller';
import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';
import AnnotonErrorsDialogController from './dialogs/annoton-errors/annoton-errors-dialog.controller.js';
import EditAnnotonDialogController from './dialogs/edit-annoton/edit-annoton-dialog.controller.js';
import AddEvidenceDialogController from './dialogs/add-evidence/add-evidence-dialog.controller.js';
import GeneListDialogController from './dialogs/gene-list/gene-list-dialog.controller.js';
import ViewSummaryDialogController from './dialogs/view-summary/view-summary-dialog.controller.js';


import ConfigService from './config/config.service.js';
import FormGridService from './grids/form-grid.service.js';
import GraphService from './graph.service.js';
import LookupService from './lookup.service.js';
//import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';

var app = angular.module('TVApp', ['ngMaterial',
  nguibootstrap,
  'jsonFormatter'
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
        "label": 'Single Gene Product'
      },
      'complex': {
        "name": 'complex',
        "label": 'Macromolecular Complex'
      }
    }
  },
  "annotonModelType": {
    "options": {
      "default": {
        "name": 'default',
        "label": 'Default'
      },
      "ccOnly": {
        "name": 'ccOnly',
        "label": 'CC only'
      },
      "bpOnly": {
        "name": 'bpOnly',
        "label": 'BP only'
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
    enabledBy: {
      id: 'RO:0002333',
      label: 'enabled by'
    },
    hasInput: {
      id: 'RO:0002233',
      label: 'has input'
    },
    happensDuring: {
      id: 'RO:0002092',
      label: 'happens during'
    },
    occursIn: {
      id: 'BFO:0000066',
      label: 'occurs in'
    },
    partOf: {
      id: 'BFO:0000050',
      label: 'part of'
    },
    hasPart: {
      id: 'BFO:0000051',
      label: 'has part'
    },
    upstreamOfOrWithin: {
      id: 'RO:0002264',
      label: 'upstream of or within'
    },
    upstreamOf: {
      id: 'RO:0002263',
      label: 'upstream of'
    }
  },
  "closure": {
    "mc": 'GO:0032991'
  },
  canDuplicateEdges: [{
    name: 'hasPart',
    term: 'BFO:0000051'
  }],
  evidenceAutoPopulate: {
    nd: {
      evidence: {
        'id': 'ECO:0000307',
        'label': 'no biological data found used in manual assertion'
      },
      reference: 'GO_REF:0000015'
    }
  },
  rootNode: {
    mf: {
      'id': 'GO:0003674',
      'label': 'molecular_function'
    },
    bp: {
      'id': 'GO:0008150',
      'label': 'biological_process'
    },
    cc: {
      'id': 'GO:0005575',
      'label': 'cellular_component'
    }
  },
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
app.controller('GeneListDialogController', GeneListDialogController)
app.controller('AddEvidenceDialogController', AddEvidenceDialogController)
app.controller('ViewSummaryDialogController', ViewSummaryDialogController)

app.service('config', ConfigService);
app.service('formGrid', FormGridService);
app.service('graph', GraphService);
app.service('lookup', LookupService);