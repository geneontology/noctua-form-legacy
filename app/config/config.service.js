import _ from 'lodash';
const each = require('lodash/forEach');

import Annoton from './../annoton.js';

export default class ConfigService {
  constructor(saeConstants) {
    this.saeConstants = saeConstants;

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

    this._annotonData = {
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
    let annoton = new Annoton();
    let annotonData = JSON.parse(JSON.stringify(this._annotonData));

    each(annotonData, function (node, key) {
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

      annoton.addNode(node);
    });

    annoton.addEdge(annotonData['mf'], annotonData['gp'], self.saeConstants.edge.enabledBy);
    annoton.addEdge(annotonData['mf'], annotonData['bp'], self.saeConstants.edge.partOf);
    annoton.addEdge(annotonData['mf'], annotonData['cc'], self.saeConstants.edge.occursIn);
    annoton.addEdge(annotonData['mf'], annotonData['mf-1'], self.saeConstants.edge.hasInput);
    annoton.addEdge(annotonData['mf'], annotonData['mf-2'], self.saeConstants.edge.happensDuring);
    annoton.addEdge(annotonData['bp'], annotonData['bp-1'], self.saeConstants.edge.partOf);
    annoton.addEdge(annotonData['bp-1'], annotonData['bp-1-1'], self.saeConstants.edge.partOf);
    annoton.addEdge(annotonData['cc'], annotonData['cc-1'], self.saeConstants.edge.partOf);
    annoton.addEdge(annotonData['cc-1'], annotonData['cc-1-1'], self.saeConstants.edge.partOf);

    return annoton;

  }
}

ConfigService.$inject = ['saeConstants'];