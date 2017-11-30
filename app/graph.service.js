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
  constructor(saeConstants, config, $rootScope, $timeout, formGrid) {
    this.config = config;
    this.saeConstants = saeConstants
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
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

  idToAspectLabel(predicateId) {
    const knownAspects = {
      PredicateEnabledBy: 'F',
      PredicatePartOf: 'P',
      PredicateOccursIn: 'C'
    };
    return knownAspects[predicateId] || '?aspect?';
  }

  idToPredicateLabel(id) {
    const knownPredicates = {
      'RO:0002333': 'enabled by',
      'BFO:0000050': 'part of',
      'BFO:0000066': 'occurs in'
    };
    return knownPredicates[id] || id;
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
        let annoton = self.config.createAnnotonModel();
        let mfTerm = self.subjectToTerm(graph, mfId);
        let evidence = self.edgeToEvidence(graph, e);
        let mfEdgesIn = graph.get_edges_by_subject(mfId);
        let annotonNode = annoton.getNode('mf');

        annotonNode.setTerm(mfTerm);
        annotonNode.setEvidence(evidence);

        self.graphToAnnatonDFS(graph, annoton, mfEdgesIn, annotonNode);
        annotons.push(annoton);
      }
    });

    return annotons;
  }

  graphToAnnatonDFS(graph, annoton, mfEdgesIn, annotonNode) {
    var self = this;
    let edge = annoton.getEdges(annotonNode.id);

    var parser = new AnnotonParser();
    parser.saeConstants = self.saeConstants

    parser.parseCardinality(annotonNode, mfEdgesIn);

    each(mfEdgesIn, function (toMFEdge) {
      if (!toMFEdge) {
        return;
      }
      let predicateId = toMFEdge.predicate_id();
      let predicateLabel = self.idToPredicateLabel(predicateId);
      let evidence = self.edgeToEvidence(graph, toMFEdge);
      let toMFObject = toMFEdge.object_id();

      each(edge.nodes, function (node) {
        if (predicateId === node.edgeId) {
          let term = self.subjectToTerm(graph, toMFObject);
          node.target.setEvidence(evidence);
          node.target.setTerm(term);
          if (term) {
            parser.parseNodeOntology(node.target, term.id);
          }
          self.graphToAnnatonDFS(graph, annoton, graph.get_edges_by_subject(toMFObject), node.target);
        }
      });
    });

    parser.printErrors();
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

    let gpNode = annoton.getNode('gp');
    let mfNode = annoton.getNode('mf');
    let bpNode = annoton.getNode('bp');
    let ccNode = annoton.getNode('cc');

    let summaryTerm = '';
    let summaryEvidence = '';
    let summaryReference = '';
    let summaryWith = '';

    let row = {
      gp: gpNode.term.control.value.label,
      mf: summaryTerm,
      Evidence: {
        label: summaryEvidence
      },
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
    }

    let mfRow = {
      Term: mfNode.term.control.value.label,
      $$treeLevel: 1
    };
    // summaryTerm += '• ' + mfNode.term.control.value.label;

    if (mfNode.evidence.control.value) {
      row.mf = mfNode.term.control.value.label;
      row.Evidence = mfNode.evidence.control.value;
      mfRow.Reference = mfNode.reference.control.value;
      mfRow.With = mfNode.with.control.value;

      summaryEvidence += '• ' + mfNode.evidence.control.value.label;
      summaryReference += '• ' + mfNode.reference.control.value;
      summaryWith += '• ' + mfNode.with.control.value;
    }
    result.push(mfRow);

    result.unshift({
      GP: gpNode.term.control.value.label,
      Term: summaryTerm,
      Evidence: {
        label: summaryEvidence
      },
      Reference: summaryReference,
      With: summaryWith,
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
      $$treeLevel: 0
    });

    // console.log('annotonToTableRows', annoton, result);

    return row;
  }






  editingModelToTableRows(graph, annoton) {
    let result = [];

    let gpLabel = annoton.GP.label;
    let mfLabel = annoton.MF.label;

    result.push({
      Aspect: 'FPC',
      GP: gpLabel,
      Term: 'TERM',
      Evidence: 'EVIDENCE',
      Reference: 'REFERENCE',
      With: 'WITH',
      $$treeLevel: 0
    });
    result.push({
      Aspect: 'F',
      GP: gpLabel,
      Term: mfLabel,
      Evidence: annoton.MFe,
      Reference: annoton.MFe.reference,
      With: annoton.MFe.with,
      $$treeLevel: 1
    });
    if (annoton.BP) {
      let bpLabel = annoton.BP.label;
      result.push({
        Aspect: 'P',
        GP: gpLabel,
        Term: bpLabel,
        Evidence: annoton.BPe.evidence,
        Reference: annoton.BPe.reference,
        With: annoton.BPe.with,
        $$treeLevel: 1
      });
    }

    if (annoton.CC) {
      let ccLabel = annoton.CC.label;
      result.push({
        Aspect: 'C',
        GP: gpLabel,
        Term: ccLabel,
        Evidence: annoton.CCe.evidence,
        Reference: annoton.CCe.reference,
        With: annoton.CCe.with,
        $$treeLevel: 1
      });
    }

    return result;
  }



  addIndividual(reqs, node) {
    node.saveMeta = {};
    node.saveMeta.term = node.term.control.value.id ? reqs.add_individual(node.term.control.value.id) : null
    // data.saveMeta.evidence = reqs.add_individual(data.evidence.id);
    //  reqs.add_evidence(data.reference.control.id, data.reference.control.value, data.with.control.value, data.saveMeta.evidence);

  }

  addFact(reqs, annoton, node) {
    let edge = annoton.getEdges(node.id);
    each(edge.nodes, function (edgeNode) {
      edgeNode.target.saveMeta.edge = reqs.add_fact([
        node.saveMeta.term,
        edgeNode.target.saveMeta.term,
        edgeNode.edgeId
      ]);
    });
    if (node.saveMeta.edge) {
      reqs.add_evidence(node.evidence.control.value.id, [node.reference.control.value], null, node.saveMeta.edge);
    }
  }


  saveEditingModel(annoton) {
    console.log('save annoton', annoton)
    const self = this;
    const manager = this.manager;

    let geneProduct = annoton.getNode('gp');

    var reqs = new minerva_requests.request_set(manager.user_token(), local_id);

    //if (editingModel.Annoton) {
    //    this.addDeletionToRequestSet(reqs, editingModel.Annoton);
    // }

    if (!this.modelTitle) {
      const defaultTitle = 'Model involving ' + geneProduct.term.control.value.label;
      reqs.add_annotation_to_model(annotationTitleKey, defaultTitle);
    }

    //self.addIndividual(reqs, geneProduct);

    each(annoton.nodes, function (node) {
      self.addIndividual(reqs, node);
    });

    each(annoton.nodes, function (node) {
      self.addFact(reqs, annoton, node);
    });

    // console.log('saveEditingModel', editingModel, reqs);
    // console.log('structure', reqs.structure());
    // reqs.store_model();
    manager.request_with(reqs);
  }


  addDeletionToRequestSet(reqs, annoton) {
    reqs.remove_individual(annoton.GP);
    if (annoton.MF) {
      reqs.remove_individual(annoton.MF);
    }
    if (annoton.BP) {
      reqs.remove_individual(annoton.BP);
    }
    if (annoton.CC) {
      reqs.remove_individual(annoton.CC);
    }
  }

  deleteAnnoton(annoton) {
    const reqs = new minerva_requests.request_set(this.manager.user_token(), local_id);
    this.addDeletionToRequestSet(reqs, annoton);
    // reqs.store_model(local_id);
    this.manager.request_with(reqs);
  }
}
GraphService.$inject = ['saeConstants', 'config', '$rootScope', '$timeout', 'formGrid'];