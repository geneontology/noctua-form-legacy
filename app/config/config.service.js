import _ from 'lodash';
const each = require('lodash/forEach');

import AnnotonNode from './../annoton/annoton-node.js';
import Annoton from './../annoton/annoton.js';

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
      "evidence": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
        fq: [
          'document_category:"ontology_class"',
          'regulates_closure:"ECO:0000352"'
        ],
      })
    };

    this._complexAnnotonData = {
      "mc": {
        'id': 'mc',
        "label": 'Macromolecular Complex',
        "displayGroup": this.saeConstants.displayGroup.mc,
        "term": {
          "ontologyClass": [],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure:"GO:0032991"'
              ],
            }),
          }
        }
      }
    }

    this._annotonData = {
      "gp": {
        "label": 'Gene Product',
        "displayGroup": this.saeConstants.displayGroup.gp,
        "term": {
          "ontologyClass": [],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure:"CHEBI:33695"'
              ],
            }),
          }
        }
      },
      'mf': {
        "label": 'Molecular Function',
        "displayGroup": this.saeConstants.displayGroup.mf,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
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
        "displayGroup": this.saeConstants.displayGroup.mf,
        "term": {
          "ontologyClass": [],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure:"CHEBI:23367"' //Generak Molecule + GP
              ],
            }),
          }
        }
      },
      'mf-2': {
        "label": 'Happens During (Temporal Phase)',
        "displayGroup": this.saeConstants.displayGroup.mf,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure:"GO:0044848"'
              ],
            }),
          }
        }
      },
      'bp': {
        "label": 'Biological Process',
        "displayGroup": this.saeConstants.displayGroup.bp,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
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
        "displayGroup": this.saeConstants.displayGroup.bp,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
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
        "displayGroup": this.saeConstants.displayGroup.bp,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
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
        "displayGroup": this.saeConstants.displayGroup.cc,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
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
        "displayGroup": this.saeConstants.displayGroup.cc,
        "term": {
          "ontologyClass": ['cl'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure:"CL:0000003"'
              ],
            }),
          }
        }
      },
      'cc-1-1': {
        "label": 'Part Of (Anatomy)',
        "displayGroup": this.saeConstants.displayGroup.cc,
        "term": {
          "ontologyClass": ['uberon'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'regulates_closure:"UBERON:0000061"'
              ],
            }),
          }
        }
      },
    }
  }

  addComplexAnnotonData(annoton) {
    const self = this;

    let annotonNode = new AnnotonNode();
    let complexAnnotonData = JSON.parse(JSON.stringify(self._complexAnnotonData.mc));

    annotonNode.id = complexAnnotonData.id;
    annotonNode.ontologyClass = complexAnnotonData.ontologyClass;
    annotonNode.label = complexAnnotonData.label;
    annotonNode.displayGroup = complexAnnotonData.displayGroup;
    annotonNode.setTermLookup(complexAnnotonData.term.lookup.requestParams);
    annotonNode.setTermOntologyClass(complexAnnotonData.term.ontologyClass);
    annotonNode.setEvidenceOntologyClass('eco');
    annotonNode.setEvidenceLookup(self.requestParams["evidence"]);

    annoton.complexAnnotonData.gpTemplateNode = JSON.parse(JSON.stringify(annoton.getNode('gp')));
    annoton.complexAnnotonData.mcNode = annotonNode;
  }

  createAnnotonModel() {
    const self = this;
    let annoton = new Annoton();
    let annotonData = JSON.parse(JSON.stringify(self._annotonData));

    each(annotonData, function (node, key) {
      let annotonNode = new AnnotonNode()
      annotonNode.id = key;
      annotonNode.ontologyClass = node.ontologyClass;
      annotonNode.label = node.label;
      annotonNode.displayGroup = node.displayGroup;
      annotonNode.setTermLookup(node.term.lookup.requestParams);
      annotonNode.setTermOntologyClass(node.term.ontologyClass);
      annotonNode.setEvidenceOntologyClass('eco');
      annotonNode.setEvidenceLookup(self.requestParams["evidence"]);

      annotonData[key].node = annotonNode
      annoton.addNode(annotonNode);
    });

    annoton.addEdgeById('mf', 'gp', self.saeConstants.edge.enabledBy);
    annoton.addEdgeById('mf', 'bp', self.saeConstants.edge.partOf);
    annoton.addEdgeById('mf', 'cc', self.saeConstants.edge.occursIn);
    annoton.addEdgeById('mf', 'mf-1', self.saeConstants.edge.hasInput);
    annoton.addEdgeById('mf', 'mf-2', self.saeConstants.edge.happensDuring);
    annoton.addEdgeById('bp', 'bp-1', self.saeConstants.edge.partOf);
    annoton.addEdgeById('bp-1', 'bp-1-1', self.saeConstants.edge.partOf);
    annoton.addEdgeById('cc', 'cc-1', self.saeConstants.edge.partOf);
    annoton.addEdgeById('cc-1', 'cc-1-1', self.saeConstants.edge.partOf);

    //self.addComplexAnnotonData(annoton);
    return annoton;

  }

  createComplexAnnotonModel() {
    const self = this;
    let annoton = new Annoton();
    let annotonComplexData = JSON.parse(JSON.stringify(self._complexAnnotonData));
    let annotonData = Object.assign(annotonComplexData, JSON.parse(JSON.stringify(self._annotonData)));

    delete annotonData.gp;
    annoton.annotonType = self.saeConstants.annotonType.options.complex.name;

    each(annotonData, function (node, key) {
      let annotonNode = new AnnotonNode()

      annotonNode.id = key;
      annotonNode.ontologyClass = node.ontologyClass;
      annotonNode.label = node.label;
      annotonNode.displayGroup = node.displayGroup;
      annotonNode.setTermLookup(node.term.lookup.requestParams);
      annotonNode.setTermOntologyClass(node.term.ontologyClass);
      annotonNode.setEvidenceOntologyClass('eco');
      annotonNode.setEvidenceLookup(self.requestParams["evidence"]);

      //annotonData[key].node = annotonNode
      annoton.addNode(annotonNode);
    });

    annoton.addEdgeById('mf', 'mc', self.saeConstants.edge.enabledBy);
    annoton.addEdgeById('mf', 'bp', self.saeConstants.edge.partOf);
    annoton.addEdgeById('mf', 'cc', self.saeConstants.edge.occursIn);
    annoton.addEdgeById('mf', 'mf-1', self.saeConstants.edge.hasInput);
    annoton.addEdgeById('mf', 'mf-2', self.saeConstants.edge.happensDuring);
    annoton.addEdgeById('bp', 'bp-1', self.saeConstants.edge.partOf);
    annoton.addEdgeById('bp-1', 'bp-1-1', self.saeConstants.edge.partOf);
    annoton.addEdgeById('cc', 'cc-1', self.saeConstants.edge.partOf);
    annoton.addEdgeById('cc-1', 'cc-1-1', self.saeConstants.edge.partOf);

    annoton.complexAnnotonData.gpTemplateNode = self.generateNode('gp');

    // self.addComplexAnnotonData(annoton);
    return annoton;

  }

  generateNode(id) {
    const self = this;

    let nodeData = JSON.parse(JSON.stringify(self._annotonData[id]));
    let annotonNode = new AnnotonNode()

    annotonNode.id = id;
    annotonNode.ontologyClass = nodeData.ontologyClass;
    annotonNode.label = nodeData.label;
    annotonNode.displayGroup = nodeData.displayGroup;
    annotonNode.setTermLookup(nodeData.term.lookup.requestParams);
    annotonNode.setTermOntologyClass(nodeData.term.ontologyClass);
    annotonNode.setEvidenceOntologyClass('eco');
    annotonNode.setEvidenceLookup(self.requestParams["evidence"]);

    return annotonNode;
  }

  addGPAnnotonData(annoton, id) {
    const self = this;

    let nodeData = JSON.parse(JSON.stringify(self._annotonData['gp']));
    let annotonNode = new AnnotonNode()

    annotonNode.id = id;
    annotonNode.ontologyClass = nodeData.ontologyClass;
    annotonNode.label = nodeData.label;
    annotonNode.displayGroup = nodeData.displayGroup;
    annotonNode.setTermLookup(nodeData.term.lookup.requestParams);
    annotonNode.setTermOntologyClass(nodeData.term.ontologyClass);
    annotonNode.setEvidenceOntologyClass('eco');
    annotonNode.setEvidenceLookup(self.requestParams["evidence"]);

    // annotonData[id].node = annotonNode;
    annoton.addNode(annotonNode);

    annoton.addEdgeById('mc', id, self.saeConstants.edge.hasPart);
    // return annoton;
  }

  createAnnotonModelFakeData() {
    const self = this;
    let annoton = this.createAnnotonModel();
    let nodes = [{
        "id": "gp",
        "term": {
          "id": "UniProtKB:O95477",
          "label": "ABCA1 Hsap (UniProtKB:O95477)"
        },
        "evidence": {},
        "reference": "",
        "with": ""
      },
      {
        "id": "mf",
        "term": {
          "id": "GO:0017127",
          "label": "cholesterol transporter activity (GO:0017127)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "mf-1",
        "term": {
          "id": "UniProtKB:P02649",
          "label": "APOE Hsap (UniProtKB:P02649)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "mf-2",
        "term": {
          "id": "GO:0000279",
          "label": "M phase (GO:0000279)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "bp",
        "term": {
          "id": "GO:0006869",
          "label": "lipid transport (GO:0006869)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "bp-1",
        "term": {
          "id": "GO:0042632",
          "label": "cholesterol homeostasis (GO:0042632)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "bp-1-1",
        "term": {
          "id": "GO:0003013",
          "label": "circulatory system process (GO:0003013)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "cc",
        "term": {
          "id": "GO:0005886",
          "label": "plasma membrane (GO:0005886)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "cc-1",
        "term": {
          "id": "CL:2000054",
          "label": "hepatic pit cell (CL:2000054)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      },
      {
        "id": "cc-1-1",
        "term": {
          "id": "UBERON:0002107",
          "label": "liver (UBERON:0002107)"
        },
        "evidence": {
          "id": "ECO:0000314",
          "label": "direct assay evidence used in manual assertion (ECO:0000314)"
        },
        "reference": "PMID:1234",
        "with": ""
      }
    ]

    each(nodes, function (node) {
      let annotonNode = annoton.getNode(node.id);
      let evidence = {
        evidence: node.evidence,
        reference: node.reference,
        with: node.with,
      }
      annotonNode.setTerm(node.term);
      annotonNode.setEvidence(evidence);
    });
    return annoton;
  }
}

ConfigService.$inject = ['saeConstants'];