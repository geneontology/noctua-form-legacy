// https://berkeleybop.github.io/bbop-graph-noctua/doc/graph.html#fold_evidence

// Main program
// Root of all the imports/requires

window.tableviewWorkbenchVersion = '0.1.1';

import angular from 'angular';

//const angular = require('angular');
import nguibootstrap from 'angular-ui-bootstrap';
import 'angular-ui-grid/ui-grid.min.js';

import 'angular-aria/angular-aria.js';
import 'angular-animate/angular-animate.js';
import 'angular-material/angular-material.js';
import '../node_modules/angular-joyride/dist/joyride.js'
import '../node_modules/angular-wizard/dist/angular-wizard.js'

import '../node_modules/material-steppers/dist/material-steppers.js'
import '../node_modules/material-steppers/dist/material-steppers.css'

import '../node_modules/angular-ui-grid/ui-grid.min.css';
import '../node_modules/angular-wizard/dist/angular-wizard.css'
import '../node_modules/angular-joyride/dist/joyride.css'
import '../node_modules/angular-material/angular-material.css';
import 'jsonformatter';
import 'jsonformatter/dist/json-formatter.min.css';
import './index.scss';
import 'font-awesome/css/font-awesome.min.css';

import AppController from 'app.controller';
//Dialogs
import ConnectActivityDialogController from './dialogs/connect-activity/connect-activity-dialog.controller.js';
import PreviewAnnotonDialogController from './dialogs/preview-annoton/preview-annoton-dialog.controller.js';

import AnnotonSectionDialogController from './dialogs/annoton-section/annoton-section-dialog.controller.js';
import BeforeSaveDialogController from './dialogs/before-save/before-save-dialog.controller.js';
import LinkToExistingDialogController from './dialogs/link-to-existing/link-to-existing-dialog.controller.js'
import CreateFromExistingDialogController from './dialogs/create-from-existing/create-from-existing-dialog.controller.js'
import SelectEvidenceDialogController from './dialogs/select-evidence/select-evidence-dialog.controller.js'
import PopulateDialogController from './dialogs/populate/populate-dialog.controller.js';
import AnnotonErrorsDialogController from './dialogs/annoton-errors/annoton-errors-dialog.controller.js';
import EditAnnotonDialogController from './dialogs/edit-annoton/edit-annoton-dialog.controller.js';
import EditAnnotonNodeDialogController from './dialogs/edit-annoton-node/edit-annoton-node-dialog.controller.js';
import AddEvidenceDialogController from './dialogs/add-evidence/add-evidence-dialog.controller.js';
import GeneListDialogController from './dialogs/gene-list/gene-list-dialog.controller.js';
import ViewSummaryDialogController from './dialogs/view-summary/view-summary-dialog.controller.js';
import GuideMeDialogController from './dialogs/guide-me/guide-me-dialog.controller.js';

//Services
import DialogService from './dialogs/dialog.service';
import ConfigService from './config/config.service.js';
import FormGridService from './grids/form-grid.service.js';
import SummaryGridService from './grids/summary-grid.service.js';
import GraphService from './graph.service.js';
import LookupService from './lookup.service.js';

var app = angular.module('TVApp', ['ngMaterial',
  'mdSteppers',
  'mgo-angular-wizard',
  nguibootstrap,
  'angular-joyride',
  'jsonFormatter',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.rowEdit',
  'ui.grid.cellNav',
  'ui.grid.moveColumns',
  'ui.grid.autoResize',
  'ui.grid.resizeColumns',
  'ui.grid.treeView',
  'ui.grid.expandable',
  'ui.grid.selection',
  'ui.grid.exporter',
  'ui.grid.pinning'
]);
app.config(['JSONFormatterConfigProvider', function (JSONFormatterConfigProvider) {

  // Enable the hover preview feature
  JSONFormatterConfigProvider.hoverPreviewEnabled = true;
}]);

var edge = {
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
  upstreamOf: {
    id: 'RO:0002411',
    actsId: 'RO:0002263',
    label: 'acts upstream of'
  },
  upstreamOfOrWithin: {
    id: 'RO:0002418',
    actsId: 'RO:0002264',
    label: 'acts upstream of or within'
  },
  upstreamOfPositiveEffect: {
    id: 'RO:0002304',
    actsId: 'RO:0004034',
    label: 'acts upstream of, positive effect'
  },
  upstreamOfNegativeEffect: {
    id: 'RO:0002305',
    actsId: 'RO:0004035',
    label: 'acts upstream of, negative effect'
  },
  upstreamOfOrWithinPositiveEffect: {
    id: 'RO:0002629',
    actsId: 'RO:0004032',
    label: 'acts upstream of or within, positive effect'
  },
  upstreamOfOrWithinNegativeEffect: {
    id: 'RO:0002630',
    actsId: 'RO:0004033',
    label: 'acts upstream of or within, negative effect'
  },
}


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
  "modelState": {
    "options": {
      'development': {
        "name": 'development',
        "label": 'Development'
      },
      'production': {
        "name": 'production',
        "label": 'Production'
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
  edge: edge,
  noDuplicateEdges: [
    'RO:0002333',
    'RO:0002092',
    'BFO:0000066',
    'BFO:0000050'
  ],
  canDuplicateEdges: [{
    label: 'hasPart',
    id: 'BFO:0000051'
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

  closures: {
    mf: {
      'id': 'GO:0003674',
    },
    bp: {
      'id': 'GO:0008150',
    },
    cc: {
      'id': 'GO:0005575',
    },
    gp: {
      'id': 'CHEBI:33695',
    },
    gpHasInput: {
      'id': 'CHEBI:23367',
    },
    mc: {
      'id': 'GO:0032991'
    },
    tp: {
      'id': 'GO:0044848'
    },
    cl: {
      'id': 'CL:0000003'
    },
    ub: {
      'id': 'UBERON:0000061'
    }
  },
  causalEdges: [{
    label: 'regulates',
    id: 'RO:0002211'
  }, {
    label: 'causally upstream of or within',
    id: 'RO:0002418'
  }, {
    label: 'causally upstream of',
    id: 'RO:0002411'
  }, {
    label: 'causally upstream of, positive effect',
    id: 'RO:0002304'
  }, {
    label: 'causally upstream of, negative effect',
    id: 'RO:0002305'
  }, {
    label: 'immediately causally upstream of',
    id: 'RO:0002412'
  }, {
    label: 'directly provides input for',
    id: 'RO:0002413'
  }, {
    label: 'negatively regulates',
    id: 'RO:0002212'
  }, {
    label: 'directly negatively regulates',
    id: 'RO:0002630'
  }, {
    label: 'positively regulates',
    id: 'RO:0002213'
  }, {
    name: 'directly positively regulates',
    id: 'RO:0002629'
  }]
});

app.controller('AppController', AppController);
app.controller('ConnectActivityDialogController', ConnectActivityDialogController)
app.controller('PreviewAnnotonDialogController', PreviewAnnotonDialogController)

app.controller('AnnotonSectionDialogController', AnnotonSectionDialogController)
app.controller('BeforeSaveDialogController', BeforeSaveDialogController)
app.controller('CreateFromExistingDialogController', CreateFromExistingDialogController);
app.controller('LinkToExistingDialogController', LinkToExistingDialogController);
app.controller('SelectEvidenceDialogController', SelectEvidenceDialogController);
app.controller('PopulateDialogController', PopulateDialogController);
app.controller('AnnotonErrorsDialogController', AnnotonErrorsDialogController)
app.controller('EditAnnotonDialogController', EditAnnotonDialogController)
app.controller('EditAnnotonNodeDialogController', EditAnnotonNodeDialogController)
app.controller('GeneListDialogController', GeneListDialogController)
app.controller('AddEvidenceDialogController', AddEvidenceDialogController)
app.controller('ViewSummaryDialogController', ViewSummaryDialogController)
app.controller('GuideMeDialogController', GuideMeDialogController)

app.service('dialogService', DialogService);
app.service('config', ConfigService);
app.service('formGrid', FormGridService);
app.service('summaryGrid', SummaryGridService);
app.service('graph', GraphService);
app.service('lookup', LookupService);