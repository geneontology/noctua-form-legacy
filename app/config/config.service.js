import _ from 'lodash';
const each = require('lodash/forEach');

import SaeGraph from './../sae-graph.js';

export default class ConfigService {
  constructor(saeConstants, $http, $timeout, $rootScope) {
    this.saeConstants = saeConstants;
    this.name = 'DefaultLookupName';
    this.$http = $http;
    this.$timeout = $timeout;
    this.$rootScope = $rootScope;

    this.baseRequestParams = {
      defType: 'edismax',
      indent: 'on',
      qt: 'standard',
      wt: 'json',
      rows: '10',
      start: '0',
      fl: '*,score',
      'facet': true,
      'facet.mincount': 1,
      'facet.sort': 'count',
      'facet.limit': '25',
      'json.nl': 'arrarr',
      packet: '1',
      callback_type: 'search',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure^1',
        'regulates_closure_label_searchable^1'
      ],
      _: Date.now()
    };

    this.requestParams = {
      "evidence": Object.assign({}, this.baseRequestParams, {
        fq: [
          'document_category:"ontology_class"',
          'regulates_closure:"ECO:0000352"'
        ],
      })
    };

    this._annoton = {
      "gp": {
        "label": 'Gene Product',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                // 'regulates_closure:"CHEBI:23367"'//Generak Molecule + GP
                'regulates_closure:"CHEBI:33695"' //GP
              ],
            }),
          }
        }
      },
      'mf': {
        "label": 'Molecular Function',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"molecular_function"'
              ],
            }),
          }
        }
      },
      'mf-1': {
        "label": 'Has Input (Gene Product/Chemical)',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"molecular_function"'
              ],
            }),
          }
        }
      },
      'mf-2': {
        "label": 'Happens During (Temporal Phase)',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"molecular_function"'
              ],
            }),
          }
        }
      },
      'bp': {
        "label": 'Biological Process',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"biological_process"'
              ],
            }),
          }
        }
      },
      'bp-1': {
        "label": 'Part Of (BP)',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"biological_process"'
              ],
            }),
          }
        }
      },
      'bp-1-1': {
        "label": 'Part Of (BP)',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"biological_process"'
              ],
            }),
          }
        }
      },
      'cc': {
        "label": 'Cellular Component',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"cellular_component"'
              ],
            }),
          }
        }
      },
      'cc-1': {
        "label": 'Part Of (Cell Type)',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"cellular_component"'
              ],
            }),
          }
        }
      },
      'cc-1-1': {
        "label": 'Part Of (Anatomy)',
        "term": {
          "lookup": {
            "requestParams": Object.assign({}, this.baseRequestParams, {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure_label:"cellular_component"'
              ],
            }),
          }
        }
      },
    }

  }

  createAnnotonModel() {
    const self = this;
    let graph = new SaeGraph();
    let annoton = JSON.parse(JSON.stringify(this._annoton));

    each(annoton, function (node, key) {
      node.id = key;
      node.term.control = {
        "placeholder": '',
        "value": ''
      };
      node.evidence = {
        "control": {
          "placeholder": '',
          "value": ''
        },
        "lookup": {
          "requestParams": self.requestParams["evidence"]
        }
      };
      node.reference = {
        "control": {
          "placeholder": '',
          "value": ''
        }
      };
      node.with = {
        "control": {
          "placeholder": '',
          "value": ''
        }
      };

      graph.addNode(node);
    });

    graph.addEdge(annoton['gp'], annoton['mf'], self.saeConstants.edge.enabledBy);
    graph.addEdge(annoton['mf'], annoton['bp'], self.saeConstants.edge.partOf);
    graph.addEdge(annoton['mf'], annoton['cc'], self.saeConstants.edge.occursIn);
    graph.addEdge(annoton['mf'], annoton['mf-1'], self.saeConstants.edge.hasInput);
    graph.addEdge(annoton['mf'], annoton['mf-2'], self.saeConstants.edge.happensDuring);
    graph.addEdge(annoton['bp'], annoton['bp-1'], self.saeConstants.edge.partOf);
    graph.addEdge(annoton['bp-1'], annoton['bp-1-1'], self.saeConstants.edge.partOf);
    graph.addEdge(annoton['cc'], annoton['cc-1'], self.saeConstants.edge.partOf);
    graph.addEdge(annoton['cc-1'], annoton['cc-1-1'], self.saeConstants.edge.partOf);

    return graph;

  }
}

ConfigService.$inject = ['saeConstants', '$http', '$timeout', '$location', '$sce', '$rootScope', '$mdDialog'];