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
        'isa_closure_label',
        'is_obsolete'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'isa_closure^1',
        'isa_closure_label_searchable^1'
      ],
      _: Date.now()
    };

    this.requestParams = {
      "evidence": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
        fq: [
          'document_category:"ontology_class"',
          'isa_closure:"ECO:0000352"'
        ],
      })
    };

    this._annotonData = {
      "mc": {
        'id': 'mc',
        "label": 'Macromolecular Complex',
        "displaySection": this.saeConstants.displaySection.gp,
        "displayGroup": this.saeConstants.displayGroup.mc,
        "lookupGroup": 'GO:0032991',
        'treeLevel': 0,
        "term": {
          "ontologyClass": [],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0032991"'
              ],
            }),
          }
        }
      },
      "gp": {
        "label": 'Gene Product',
        "displaySection": this.saeConstants.displaySection.gp,
        "displayGroup": this.saeConstants.displayGroup.gp,
        "lookupGroup": 'CHEBI:33695',
        'treeLevel': 0,
        "term": {
          "ontologyClass": [],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"CHEBI:33695"'
                //'isa_closure:"CHEBI:23367"'
              ],
            }),
          }
        }
      },
      'mf': {
        "label": 'Molecular Function',
        'aspect': 'F',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.mf,
        "lookupGroup": 'GO:0003674',
        'treeLevel': 0,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0003674"'
              ],
            }),
          }
        }
      },
      'mf-1': {
        "label": 'Has Input (Gene Product/Chemical)',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.mf,
        "lookupGroup": 'CHEBI:23367',
        'treeLevel': 1,
        "term": {
          "ontologyClass": [],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"CHEBI:23367"' //Generic Molecule + GP
              ],
            }),
          }
        }
      },
      'mf-2': {
        "label": 'Happens During (Temporal Phase)',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.mf,
        "lookupGroup": 'GO:0044848',
        'treeLevel': 1,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0044848"'
              ],
            }),
          }
        }
      },
      'cc': {
        "label": 'Cellular Component',
        'aspect': 'C',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.cc,
        "lookupGroup": 'GO:0005575',
        'treeLevel': 0,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0005575"'
              ],
            }),
          }
        }
      },
      'cc-1': {
        "label": 'Part Of (CC)',
        'aspect': 'C',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.cc,
        "lookupGroup": 'GO:0005575',
        'treeLevel': 1,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0005575"'
              ],
            }),
          }
        }
      },
      'cc-1-1': {
        "label": 'Part Of (Cell Type)',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.cc,
        "lookupGroup": 'CL:0000003',
        'treeLevel': 2,
        "term": {
          "ontologyClass": ['cl'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"CL:0000003"'
              ],
            }),
          }
        }
      },
      'cc-1-1-1': {
        "label": 'Part Of (Anatomy)',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.cc,
        "lookupGroup": 'UBERON:0000061',
        'treeLevel': 3,
        "term": {
          "ontologyClass": ['uberon'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"UBERON:0000061"'
              ],
            }),
          }
        }
      },
      'bp': {
        "label": 'Biological Process',
        'aspect': 'P',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.bp,
        "lookupGroup": 'GO:0008150',
        'treeLevel': 0,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0008150"'
              ],
            }),
          }
        }
      },
      'bp-1': {
        "label": 'Part Of (BP)',
        'aspect': 'P',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.bp,
        "lookupGroup": 'GO:0008150',
        'treeLevel': 1,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0008150"'
              ],
            }),
          }
        }
      },
      'bp-1-1': {
        "label": 'Part Of (BP)',
        'aspect': 'P',
        "displaySection": this.saeConstants.displaySection.fd,
        "displayGroup": this.saeConstants.displayGroup.bp,
        "lookupGroup": 'GO:0008150',
        'treeLevel': 2,
        "term": {
          "ontologyClass": ['go'],
          "lookup": {
            "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
              fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0008150"'
              ],
            }),
          }
        }
      },
    }

    this._modelRelationship = {
      default: {
        nodes: [
          'mf', 'mf-1', 'mf-2', 'bp', 'bp-1', 'bp-1-1', 'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
        ],
        triples: [{
          subject: 'mf',
          object: 'bp',
          edge: this.saeConstants.edge.partOf
        }, {
          subject: 'mf',
          object: 'cc',
          edge: this.saeConstants.edge.occursIn
        }, {
          subject: 'mf',
          object: 'mf-1',
          edge: this.saeConstants.edge.hasInput
        }, {
          subject: 'mf',
          object: 'mf-2',
          edge: this.saeConstants.edge.happensDuring
        }, {
          subject: 'bp',
          object: 'bp-1',
          edge: this.saeConstants.edge.partOf
        }, {
          subject: 'bp-1',
          object: 'bp-1-1',
          edge: this.saeConstants.edge.partOf
        }, {
          subject: 'cc',
          object: 'cc-1',
          edge: this.saeConstants.edge.partOf
        }, {
          subject: 'cc-1',
          object: 'cc-1-1',
          edge: this.saeConstants.edge.partOf
        }, {
          subject: 'cc-1-1',
          object: 'cc-1-1-1',
          edge: this.saeConstants.edge.partOf
        }],
        simple: {
          node: 'gp',
          triple: {
            subject: 'mf',
            object: 'gp',
            edge: this.saeConstants.edge.enabledBy
          }
        },
        complex: {
          node: 'mc',
          triple: {
            subject: 'mf',
            object: 'mc',
            edge: this.saeConstants.edge.enabledBy
          }
        }
      },
      ccOnly: {
        nodes: [
          'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
        ],
        triples: [{
          subject: 'cc',
          object: 'cc-1',
          edge: this.saeConstants.edge.partOf
        }, {
          subject: 'cc-1',
          object: 'cc-1-1',
          edge: this.saeConstants.edge.partOf,
        }, {
          subject: 'cc-1-1',
          object: 'cc-1-1-1',
          edge: this.saeConstants.edge.partOf
        }],
        simple: {
          node: 'gp',
          triple: {
            subject: 'gp',
            object: 'cc',
            edge: this.saeConstants.edge.partOf
          }
        },
        complex: {
          node: 'mc',
          triple: {
            subject: 'mc',
            object: 'cc',
            edge: this.saeConstants.edge.partOf
          }
        }
      },
      bpOnly: {
        nodes: [
          'mf', 'bp'
        ],
        overrides: {
          mf: {
            id: 'mf',
            display: {
              displaySection: '',
              displayGroup: '',
            },
            term: {
              id: 'GO:0003674',
              label: 'molecular_function'
            }
          }
        },
        triples: [{
          subject: 'mf',
          object: 'bp',
          edge: this.saeConstants.edge.upstreamOfOrWithin,
          edgeOption: {
            selected: this.saeConstants.edge.upstreamOfOrWithin,
            options: [
              this.saeConstants.edge.upstreamOfOrWithin,
              this.saeConstants.edge.upstreamOf,
              this.saeConstants.edge.upstreamOfPositiveEffect,
              this.saeConstants.edge.upstreamOfNegativeEffect,
              this.saeConstants.edge.upstreamOfOrWithinPositiveEffect,
              this.saeConstants.edge.upstreamOfOrWithinNegativeEffect,
            ]
          }
        }],
        simple: {
          node: 'gp',
          triple: {
            subject: 'mf',
            object: 'gp',
            edge: this.saeConstants.edge.enabledBy
          }
        },
        complex: {
          node: 'mc',
          triple: {
            subject: 'mf',
            object: 'mc',
            edge: this.saeConstants.edge.enabledBy
          }
        }
      },
    }


    this.closureCheck = {}

    this.closureCheck[this.saeConstants.edge.enabledBy.id] = {
      edge: this.saeConstants.edge.enabledBy,
      nodes: [{
        object: this.saeConstants.closures.mf
      }, {
        subject: this.saeConstants.closures.gp
      }, {
        subject: this.saeConstants.closures.mc
      }]
    };

    this.closureCheck[this.saeConstants.edge.upstreamOf.id] = {
      edge: this.saeConstants.edge.upstreamOf,
      nodes: [{
        object: this.saeConstants.closures.bp
      }, {
        subject: this.saeConstants.closures.mf
      }]
    }

    this.closureCheck[this.saeConstants.edge.upstreamOfOrWithin.id] = {
      edge: this.saeConstants.edge.upstreamOfOrWithin,
      nodes: [{
        object: this.saeConstants.closures.bp
      }, {
        subject: this.saeConstants.closures.mf
      }]
    }

    this.closureCheck[this.saeConstants.edge.partOf.id] = {
      edge: this.saeConstants.edge.partOf,
      nodes: [{
        subject: this.saeConstants.closures.bp
      }, {
        subject: this.saeConstants.closures.cl
      }, {
        subject: this.saeConstants.closures.ub
      }, {
        subject: this.saeConstants.closures.gp
      }, {
        object: this.saeConstants.closures.bp
      }, {
        object: this.saeConstants.closures.cl
      }, {
        object: this.saeConstants.closures.ub
      }, {
        object: this.saeConstants.closures.cc
      }]
    };

    this.closureCheck[this.saeConstants.edge.occursIn.id] = {
      edge: this.saeConstants.edge.occursIn,
      nodes: [{
        object: this.saeConstants.closures.bp
      }, {
        subject: this.saeConstants.closures.mf
      }]
    }

    this.closureCheck[this.saeConstants.edge.hasInput.id] = {
      edge: this.saeConstants.edge.hasInput,
      nodes: [{
        object: this.saeConstants.closures.mf
      }, {
        subject: this.saeConstants.closures.gp
      }, {
        subject: this.saeConstants.closures.mc
      }]
    };

    this.closureCheck[this.saeConstants.edge.happensDuring.id] = {
      edge: this.saeConstants.edge.happensDuring,
      nodes: [{
        subject: this.saeConstants.closures.mf
      }, {
        object: this.saeConstants.closures.tp
      }]
    }

    this.closureCheck[this.saeConstants.edge.hasPart.id] = {
      edge: this.saeConstants.edge.hasPart,
      nodes: [{
        subject: this.saeConstants.closures.mc
      }, {
        object: this.saeConstants.closures.gp
      }]
    }
  }

  createAnnotonModel(annotonType, modelType, srcAnnoton) {
    const self = this;
    let annoton = new Annoton();
    let modelIds = _.cloneDeep(self._modelRelationship);

    let gp = modelIds[modelType][annotonType];

    annoton.setAnnotonType(annotonType);
    annoton.setAnnotonModelType(modelType);

    each(modelIds[modelType].nodes, function (id) {
      annoton.addNode(self.generateNode(id));
    });

    annoton.addNode(self.generateNode(gp.node));
    annoton.addEdgeById(gp.triple.subject, gp.triple.object, gp.triple.edge);

    each(modelIds[modelType].triples, function (triple) {
      annoton.addEdgeById(triple.subject, triple.object, triple.edge);
      if (triple.edgeOption) {
        annoton.addEdgeOptionById(triple.object, triple.edgeOption);
      }
    });

    annoton.complexAnnotonData.gpTemplateNode = self.generateNode('gp');
    annoton.complexAnnotonData.mcNode = self.generateNode('mc')

    if (srcAnnoton) {
      annoton.copyValues(srcAnnoton);
    }

    each(modelIds[modelType].overrides, function (overridesData) {
      let node = annoton.getNode(overridesData.id);
      overridesData.term ? node.setTerm(overridesData.term) : angular.noop;
      overridesData.display ? node.setDisplay(overridesData.display) : angular.noop;
    });

    return annoton;
  }

  generateNode(id) {
    const self = this;

    let nodeData = JSON.parse(JSON.stringify(self._annotonData[id]));
    let annotonNode = new AnnotonNode()

    annotonNode.id = id;
    annotonNode.aspect = nodeData.aspect;
    annotonNode.ontologyClass = nodeData.ontologyClass;
    annotonNode.label = nodeData.label;
    annotonNode.displaySection = nodeData.displaySection;
    annotonNode.displayGroup = nodeData.displayGroup;
    annotonNode.lookupGroup = nodeData.lookupGroup;
    annotonNode.treeLevel = nodeData.treeLevel;
    annotonNode.setTermLookup(nodeData.term.lookup.requestParams);
    annotonNode.setTermOntologyClass(nodeData.term.ontologyClass);
    annotonNode.setEvidenceMeta('eco', self.requestParams["evidence"]);

    return annotonNode;
  }

  addGPAnnotonData(annoton, id) {
    const self = this;

    let nodeData = JSON.parse(JSON.stringify(self._annotonData['gp']));
    let annotonNode = new AnnotonNode()

    annotonNode.id = id;
    annotonNode.aspect = nodeData.aspect;
    annotonNode.ontologyClass = nodeData.ontologyClass;
    annotonNode.label = "has part (GP)";
    annotonNode.displaySection = nodeData.displaySection;
    annotonNode.displayGroup = nodeData.displayGroup;
    annotonNode.lookupGroup = nodeData.lookupGroup;
    annotonNode.treeLevel = 1;
    annotonNode.setTermLookup(nodeData.term.lookup.requestParams);
    annotonNode.setTermOntologyClass(nodeData.term.ontologyClass);
    annotonNode.setEvidenceMeta('eco', self.requestParams["evidence"]);

    // annotonData[id].node = annotonNode;
    annoton.addNode(annotonNode);

    annoton.addEdgeById('mc', id, self.saeConstants.edge.hasPart);

    return annotonNode;
  }

  createAnnotonModelFakeData() {
    const self = this;

    let annoton = self.createAnnotonModel(
      self.saeConstants.annotonType.options.simple.name,
      self.saeConstants.annotonModelType.options.default.name
    );
    let nodes = [{
      "id": "gp",
      "term": {
        "id": "UniProtKB:O95477",
        "label": "ABCA1 Hsap (UniProtKB:O95477)"
      },
      "evidence": {},
      "reference": "",
      "with": ""
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
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
    }, {
      "id": "cc-1",
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
    }, {
      "id": "cc-1-1",
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
    }, {
      "id": "cc-1-1-1",
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
    }]

    each(nodes, function (node) {
      let annotonNode = annoton.getNode(node.id);

      annotonNode.setTerm(node.term);
      annotonNode.evidence[0].setEvidence(node.evidence);
      annotonNode.evidence[0].setReference(node.reference);
    });
    return annoton;
  }

  createJoyrideSteps() {
    const self = this;

    let steps = [{
      type: 'element',
      selector: "#sae-model-section",
      title: "Model Creation",
      content: `Define model's title and state. <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'bottom'
    }, {
      type: 'element',
      selector: "#sae-gp-section",
      title: "Enter gene product",
      content: `Enter gene product or macromolecular complex to be annotated <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'bottom'
    }, {
      type: 'element',
      selector: "#sae-gp-toggle-button",
      title: "Select",
      content: `Toggle between gene product or macromolecular complex <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'left'
    }, {
      type: 'element',
      selector: "#sae-fd-section",
      title: "Enter Molecular Function",
      content: `Enter the molecular function, evidence, and reference. Then enter other optional fields <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'top'
    }, {
      type: 'element',
      selector: "#sae-submit-row",
      title: "Create The Activity",
      content: 'Check if there are any errors (create button not greyed out). Add the new activity to a model. <a href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>',
      placement: 'top'
    }, {
      type: 'element',
      selector: "#sae-start-model-button",
      title: "Model Creation",
      content: `You can also start a new model <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'left'
    }, {
      type: 'element',
      selector: "#sae-molecular-activities",
      title: "Molecular Activities in the Model",
      content: 'This is where all the molecular activities in this model appear.',
      placement: 'top'
    }];

    return steps;
  }
}

ConfigService.$inject = ['saeConstants'];