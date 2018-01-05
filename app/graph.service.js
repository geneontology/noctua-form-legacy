import Annoton from './annoton/annoton.js';
import AnnotonParser from './annoton/parser/annoton-parser.js';

const each = require('lodash/forEach');
var model = require('bbop-graph-noctua');
var barista_response = require('bbop-response-barista');
var minerva_requests = require('minerva-requests');
var jquery_engine = require('bbop-rest-manager').jquery;
var minerva_manager = require('bbop-manager-minerva');
const annotationTitleKey = 'title';

//
//  Globals passed to Workbench from Noctua
/* global global_id */
/* global global_golr_server */
/* global global_barista_location */
/* global global_minerva_definition_name */
/* global global_barista_token */
/* global global_collapsible_relations */
var local_id = typeof global_id !== 'undefined' ? global_id : 'global_id';
var local_golr_server = typeof global_golr_server !== 'undefined' ? global_golr_server : 'global_id';
var local_barista_location = typeof global_barista_location !== 'undefined' ? global_barista_location : 'global_barista_location';
var local_minerva_definition_name = typeof global_minerva_definition_name !== 'undefined' ? global_minerva_definition_name : 'global_minerva_definition_name';
var local_barista_token = typeof global_barista_token !== 'undefined' ? global_barista_token : 'global_barista_token';
var local_collapsible_relations = typeof global_collapsible_relations !== 'undefined' ? global_collapsible_relations : 'global_collapsible_relations';

const PredicateEnabledBy = 'RO:0002333';
const PredicatePartOf = 'BFO:0000050';
const PredicateOccursIn = 'BFO:0000066';
const rootMF = 'GO:0003674';
const noDataECO = 'ECO:0000035';

export default class GraphService {
  constructor(saeConstants, config, $rootScope, $timeout, $mdDialog, formGrid) {
    this.config = config;
    this.saeConstants = saeConstants
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
    this.$mdDialog = $mdDialog;
    this.model_id = local_id;
    this.golr_server = local_golr_server;
    this.barista_location = local_barista_location;
    this.minerva_definition_name = local_minerva_definition_name;
    this.barista_token = local_barista_token;
    this.collapsible_relations = local_collapsible_relations;
    this.engine = null;
    this.manager = null;
    this.graph = null;
    this.loggedIn = local_barista_token && (local_barista_token.length > 0);
    this.formGrid = formGrid;
  }

  initialize() {
    console.log('initialize');
    var self = this;
    this.engine = new jquery_engine(barista_response);
    this.engine.method('POST');
    var manager = new minerva_manager(
      this.barista_location,
      this.minerva_definition_name,
      this.barista_token,
      this.engine, 'async');

    this.manager = manager;

    function _shields_up() {
      // console.log('_shields_up');
    }

    function _shields_down() {
      // console.log('_shields_down');
    }

    // Internal registrations.
    manager.register('prerun', _shields_up);
    manager.register('postrun', _shields_down, 9);
    manager.register('manager_error',
      function (resp /*, man */ ) {
        console.log('There was a manager error (' +
          resp.message_type() + '): ' + resp.message());
      }, 10);

    // Likely the result of unhappiness on Minerva.
    manager.register('warning', function (resp /*, man */ ) {
      alert('Warning: ' + resp.message() + '; ' +
        'your opera tion was likely not performed');
    }, 10);

    // Likely the result of serious unhappiness on Minerva.
    manager.register('error', function (resp /*, man */ ) {
      // Do something different if we think that this is a
      // permissions issue.
      var perm_flag = 'InsufficientPermissionsException';
      var token_flag = 'token';
      if (resp.message() && resp.message().indexOf(perm_flag) !== -1) {
        alert('Error: it seems like you do not have permission to ' +
          'perform that operation. Did you remember to login?');
      } else if (resp.message() && resp.message().indexOf(token_flag) !== -1) {
        alert('Error: it seems like you have a bad token...');
      } else {
        console.log('error:', resp, resp.message_type(), resp.message());
        // // Generic error.
        // alert('Error (' +
        // resp.message_type() + '): ' +
        // resp.message() + '; ' +
        // 'your operation was likely not performed.');
      }
    }, 10);

    // ???
    manager.register('meta', function ( /* resp , man */ ) {
      console.log('## a meta callback?');
    });

    function rebuild(resp) {
      var noctua_graph = model.graph;
      self.graph = new noctua_graph();
      self.graph.load_data_basic(resp.data());

      self.modelTitle = null;
      var annotations = self.graph.get_annotations_by_key(annotationTitleKey);
      if (annotations.length > 0) {
        self.modelTitle = annotations[0].value(); // there should be only one
      }

      let annotons = self.graphToAnnotons(self.graph);
      let gridData = self.annotonsToTable(self.graph, annotons);

      self.title = self.graph.get_annotations_by_key('title');

      self.$timeout(() => {
        self.$rootScope.$emit('rebuilt', {
          gridData: gridData
        });
      }, 10);
    }

    manager.register('merge', function ( /* resp */ ) {
      manager.get_model(self.model_id);
    });
    manager.register('rebuild', function (resp) {
      rebuild(resp);
    }, 10);

    manager.get_model(this.model_id);
  }


  getNodeLabel(node) {
    var label = '';
    if (node) {
      each(node.types(), function (in_type) {
        label += in_type._class_label +
          ' (' + in_type._class_id + ')';
      });
    }

    return label;
  }

  getNodeId(node) {
    var result = null;
    if (node) {
      each(node.types(), function (in_type) {
        result = in_type._class_id;
      });
    }

    return result;
  }

  subjectToTerm(graph, object) {
    const self = this;

    let gp = graph.get_node(object);
    let result = {
      id: self.getNodeId(gp),
      label: self.getNodeLabel(gp)
    }

    return result;
  }

  edgeToEvidence(graph, edge) {
    var result = null;

    var evidenceAnnotations = edge.get_annotations_by_key('evidence');
    if (evidenceAnnotations.length > 0) {
      var firstAnnotationId = evidenceAnnotations[0].value();
      var firstAnnotationNode = graph.get_node(firstAnnotationId);
      if (firstAnnotationNode) {
        result = {
          evidence: {
            id: this.getNodeId(firstAnnotationNode),
            label: this.getNodeLabel(firstAnnotationNode)
          },
          reference: '',
          with: ''
        };

        let sources = firstAnnotationNode.get_annotations_by_key('source');
        let withs = firstAnnotationNode.get_annotations_by_key('with');
        if (sources.length > 0) {
          result.reference = sources[0].value();
        }
        if (withs.length > 0) {
          result.with = withs[0].value();
        }
      }
    }

    return result;
  }

  graphToAnnotons(graph) {
    var self = this;
    var annotons = [];

    each(graph.all_edges(), function (e) {
      if (e.predicate_id() === self.saeConstants.edge.enabledBy) {
        let mfId = e.subject_id();
        let gpId = e.object_id();
        let mfTerm = self.subjectToTerm(graph, mfId);
        let gpTerm = self.subjectToTerm(graph, gpId);
        let annoton = null;

        if (gpTerm.id === self.saeConstants.closure.mc) {
          annoton = self.config.createComplexAnnotonModel();
        } else {
          annoton = self.config.createAnnotonModel();
        }

        let evidence = self.edgeToEvidence(graph, e);
        let mfEdgesIn = graph.get_edges_by_subject(mfId);
        let annotonNode = annoton.getNode('mf');

        annoton.parser = new AnnotonParser();
        annoton.parser.saeConstants = self.saeConstants

        annotonNode.setTerm(mfTerm);
        annotonNode.setEvidence(evidence);
        annotonNode.modelId = mfId;

        self.graphToAnnatonDFS(graph, annoton, mfEdgesIn, annotonNode);

        if (annoton.annotonType === self.saeConstants.annotonType.options.complex.name) {
          annoton.populateComplexData();
        }
        annotons.push(annoton);
      }
    });

    return annotons;
  }

  graphToAnnatonDFS(graph, annoton, mfEdgesIn, annotonNode) {
    var self = this;
    let edge = annoton.getEdges(annotonNode.id);

    each(mfEdgesIn, function (toMFEdge) {
      if (!toMFEdge) {
        return;
      }
      let predicateId = toMFEdge.predicate_id();
      let evidence = self.edgeToEvidence(graph, toMFEdge);
      let toMFObject = toMFEdge.object_id();

      if (predicateId === self.saeConstants.edge.hasPart) {
        self.config.addGPAnnotonData(annoton, toMFObject);
      }

      each(edge.nodes, function (node) {
        if (predicateId === node.edgeId) {
          if (predicateId === self.saeConstants.edge.hasPart && toMFObject !== node.target.id) {
            //do nothing
          } else {
            let term = self.subjectToTerm(graph, toMFObject);

            node.target.modelId = toMFObject;
            node.target.setEvidence(evidence);
            node.target.setTerm(term);

            //self.check

            if (term) {
              annoton.parser.parseNodeOntology(node.target, term.id);
            }
            self.graphToAnnatonDFS(graph, annoton, graph.get_edges_by_subject(toMFObject), node.target);
          }
        }
      });
    });

    annoton.parser.parseCardinality(annotonNode, mfEdgesIn, edge.nodes);

  }

  graphToAnnatonDFSError(annoton, annotonNode) {
    var self = this;
    let edge = annoton.getEdges(annotonNode.id);

    each(edge.nodes, function (node) {
      node.target.status = 2;
      self.graphToAnnatonDFSError(annoton, node.target);
    });
  }

  annotonsToTable(graph, annotons) {
    const self = this;
    let result = [];

    each(annotons, function (annoton) {
      let annotonRows = self.annotonToTableRows(graph, annoton);

      result = result.concat(annotonRows);
    });

    return result;
  }

  annotonToTableRows(graph, annoton) {
    const self = this;
    let result = [];

    let gpNode = null;

    if (annoton.annotonType === self.saeConstants.annotonType.options.simple.name) {
      gpNode = annoton.getNode('gp');
    } else {
      gpNode = annoton.getNode('mc');
    }
    let mfNode = annoton.getNode('mf');

    let row = {
      gp: gpNode.term.control.value.label,
      mf: "",
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
      annotonPresentation: self.formGrid.getAnnotonPresentation(annoton)
    }

    if (mfNode.evidence.control.value) {
      row.mf = mfNode.term.control.value.label;
      row.evidence = mfNode.evidence.control.value;
    }

    return row;
  }

  addIndividual(reqs, node) {
    node.saveMeta = {};
    if (node.term.control.value && node.term.control.value.id) {
      node.saveMeta.term = reqs.add_individual(node.term.control.value.id);
    }
  }

  deleteIndividual(reqs, node) {
    if (node.modelId) {
      reqs.remove_individual(node.modelId);
    }
  }

  addFact(reqs, annoton, node) {
    let edge = annoton.getEdges(node.id);

    each(edge.nodes, function (edgeNode) {
      let subject = node.saveMeta.term;
      let target = edgeNode.target.saveMeta.term;
      let edgeId = edgeNode.edgeId;
      if (subject && target && edge) {
        edgeNode.target.saveMeta.edge = reqs.add_fact([
          node.saveMeta.term,
          edgeNode.target.saveMeta.term,
          edgeNode.edgeId
        ]);
        if (edgeNode.target.id === 'gp') {
          reqs.add_evidence(node.evidence.control.value.id, [node.reference.control.value], null, edgeNode.target.saveMeta.edge);
        } else {
          reqs.add_evidence(edgeNode.target.evidence.control.value.id, [edgeNode.target.reference.control.value], null, edgeNode.target.saveMeta.edge);
        }
      }
    });
  }

  convertToComplex(annoton) {
    const self = this;
    let complexAnnoton = self.config.createComplexAnnotonModel();
    complexAnnoton.complexAnnotonData = annoton.complexAnnotonData;

    let mcNode = complexAnnoton.getNode('mc');
    mcNode.copyValues(annoton.complexAnnotonData.mcNode);

    each(complexAnnoton.nodes, function (complexNode) {
      let node = annoton.getNode(complexNode.id);
      if (node) {
        complexNode.copyValues(node);
      }
    });

    each(complexAnnoton.complexAnnotonData.geneProducts, function (geneProduct) {
      let id = 'gp-' + complexAnnoton.nodes.length;
      let node = self.config.addGPAnnotonData(complexAnnoton, id);
      node.setTerm(geneProduct);
    });

    return complexAnnoton;

  }

  convertToSimple(annoton) {
    const self = this;
    let simpleAnnoton = self.config.createComplexAnnotonModel();
    let mcNode = annoton.getNode('mc');
    let mcEdge = annoton.getEdges('mc');

    annoton.complexAnnotonData.mcNode.copyValues(mcNode);

    each(simpleAnnoton.nodes, function (simpleNode) {
      var node = annoton.getNode(node.id);
      if (node) {
        simpleNode.copyValues(node);
      }
    });

    simpleAnnoton.complexAnnotonData.geneProducts = [];
    each(mcEdge.nodes, function (node) {
      var node = annoton.getNode(node.id);
      if (node) {
        simpleAnnoton.complexAnnotonData.geneProducts.push(node);
      }
    });

    annoton = simpleAnnoton;

  }

  saveAnnoton(annoton, edit) {
    console.log('save annoton', annoton)
    const self = this;
    const manager = this.manager;

    if (annoton.annotonType === self.saeConstants.annotonType.options.complex.name) {
      annoton = self.convertToComplex(annoton);
    }

    let reqs = new minerva_requests.request_set(manager.user_token(), local_id);

    if (edit) {
      each(annoton.nodes, function (node) {
        self.deleteIndividual(reqs, node);
      });
    }

    let geneProduct = annoton.getNode('gp');

    if (!this.modelTitle) {
      const defaultTitle = 'Model involving ' + geneProduct.term.control.value.label;
      reqs.add_annotation_to_model(annotationTitleKey, defaultTitle);
    }

    each(annoton.nodes, function (node) {
      self.addIndividual(reqs, node);
    });

    each(annoton.nodes, function (node) {
      self.addFact(reqs, annoton, node);
    });

    manager.request_with(reqs);
  }

  deleteAnnoton(annoton, ev) {
    const self = this;

    var confirm = self.$mdDialog.confirm()
      .title('Delete Annoton')
      .textContent('All of the nodes associated with this annoton model will be deleted')
      .ariaLabel('Delete Annoton')
      .targetEvent(ev)
      .ok('OK')
      .cancel('Cancel');

    self.$mdDialog.show(confirm).then(function () {
      let reqs = new minerva_requests.request_set(self.manager.user_token(), local_id);

      each(annoton.nodes, function (node) {
        self.deleteIndividual(reqs, node);
      });
      self.manager.request_with(reqs);
    }, function () {

    });
  }

}
GraphService.$inject = ['saeConstants', 'config', '$rootScope', '$timeout', '$mdDialog', 'formGrid'];