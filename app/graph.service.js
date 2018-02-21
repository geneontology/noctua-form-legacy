import Annoton from './annoton/annoton.js';
import AnnotonParser from './annoton/parser/annoton-parser.js';
import AnnotonError from "./annoton/parser/annoton-error.js";
import Evidence from './annoton/evidence.js';

const each = require('lodash/forEach');
var model = require('bbop-graph-noctua');
var amigo = require('amigo2');
var golr_response = require('bbop-response-golr');
var golr_manager = require('bbop-manager-golr');
var golr_conf = require("golr-conf");
var node_engine = require('bbop-rest-manager').node;
var barista_response = require('bbop-response-barista');
var minerva_requests = require('minerva-requests');
var jquery_engine = require('bbop-rest-manager').jquery;
var class_expression = require('class-expression');
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

const rootMF = 'GO:0003674';
const noDataECO = 'ECO:0000035';

export default class GraphService {
  constructor(saeConstants, config, $q, $rootScope, $timeout, $mdDialog, lookup, formGrid) {
    this.config = config;
    this.saeConstants = saeConstants
    this.$q = $q;
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
    this.lookup = lookup;
    this.formGrid = formGrid;
  }

  initialize() {
    console.log('initialize');
    const self = this;
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
        'your operation was likely not performed');
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
      self.model_id = local_id = global_id = resp.data().id;


      // let reqs = new minerva_requests.request_set(manager.user_token(), local_id);
      //  const defaultTitle = 'Model involving ' + 'pppp';
      // reqs.add_annotation_to_model(annotationTitleKey, defaultTitle);

      self.graph.load_data_basic(resp.data());

      self.modelTitle = null;
      self.modelState = null;
      let annotations = self.graph.get_annotations_by_key(annotationTitleKey);
      let stateAnnotations = self.graph.get_annotations_by_key('state');

      if (annotations.length > 0) {
        self.modelTitle = annotations[0].value(); // there should be only one
      }

      if (stateAnnotations.length > 0) {
        self.modelState = stateAnnotations[0].value(); // there should be only one
      }

      // self.graphPreParse(self.graph);
      let annotons = self.graphToAnnotons(self.graph);
      let ccComponents = self.graphToCCOnly(self.graph);

      self.title = self.graph.get_annotations_by_key('title');

      self.$timeout(() => {
        self.$rootScope.$emit('rebuilt', {
          gridData: {
            annotons: self.annotonsToTable(self.graph, annotons),
            ccComponents: self.ccComponentsToTable(self.graph, ccComponents)
          }
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

  addModel() {
    const self = this
    self.manager.add_model();
  }

  setGolr() {
    // var term_id = _param(req, 'term_id', null);
    var term_id = "";

    // Setup manager and basic.
    var gconf = new golr_conf.conf(amigo.data.golr);
    var engine = new node_engine(golr_response);
    var manager = new golr_manager(local_golr_server, gconf, engine, 'async');
    manager.set_personality('ontology');
    manager.set_facet_limit(0); // care not about facets
    manager.add_query_filter('document_category', 'ontology_class');

    // Let's get information by target.
    var max_result_count = 100;
    manager.set_results_count(max_result_count);
    manager.set_targets([term_id], ['annotation_class']);

    // Failure callbacks.
    manager.register('error', function (resp, man) {});

    // Success callback.
    manager.register('search', function (resp, man) {

      // See what we got.
      if (resp.documents().length === 0) {
        console.log('Unknown ID: ' + term_id);
      } else if (resp.documents().length > 1) {
        console.log('Ambiguous ID: ' + term_id);
      } else {
        // Good response.
        console.log('Found information for: ' + term_id);
        console.log(resp.get_doc(0));
      }

      //res.json(envl.structure());
    });

    // Trigger async try.
    manager.search();
  }

  getNodeLabel(node) {
    var label = '';
    if (node) {
      each(node.types(), function (in_type) {

        let type;
        if (in_type.type() === 'complement') {
          type = in_type.complement_class_expression();
        } else {
          type = in_type;
        }

        label += type.class_label() +
          ' (' + type.class_id() + ')';
      });
    }

    return label;
  }

  getNodeId(node) {
    var result = null;
    if (node) {
      each(node.types(), function (in_type) {
        let type;
        if (in_type.type() === 'complement') {
          type = in_type.complement_class_expression();
        } else {
          type = in_type;
        }

        result = type.class_id();
      });
    }

    return result;
  }

  getNodeIsComplement(node) {
    var result = true;
    if (node) {
      each(node.types(), function (in_type) {
        let t = in_type.type();
        result = result && (t === 'complement');
      });
    }

    return result;
  }

  subjectToTerm(graph, object) {
    const self = this;

    let node = graph.get_node(object);
    let result = {
      term: {
        id: self.getNodeId(node),
        label: self.getNodeLabel(node),
      },
      isComplement: self.getNodeIsComplement(node)
    }

    return result;
  }

  edgeToEvidence(graph, edge) {
    const self = this;
    const evidenceAnnotations = edge.get_annotations_by_key('evidence');
    let result = [];

    each(evidenceAnnotations, function (evidenceAnnotation) {
      let annotationId = evidenceAnnotation.value();
      let annotationNode = graph.get_node(annotationId);
      let evidence = new Evidence();
      if (annotationNode) {
        evidence.setEvidence({
          id: self.getNodeId(annotationNode),
          label: self.getNodeLabel(annotationNode)
        });

        let sources = annotationNode.get_annotations_by_key('source');
        let withs = annotationNode.get_annotations_by_key('with');
        if (sources.length > 0) {
          evidence.setReference(sources[0].value());
        }
        if (withs.length > 0) {
          evidence.setWith(withs[0].value());
        }
        result.push(evidence);
      }
    });

    return result;
  }

  graphPreParseNodes(graph) {
    const self = this;
    var promises = [];

    each(graph.all_nodes(), function (node) {
      //isaClosure(a, b)
      //let termId = self.getNodeId(node)
      console.log('--- ', node);
    });
  }

  isaClosure(a, b, node) {
    const self = this;
    let deferred = self.$q.defer();

    self.lookup.isaClosure(a, b).then(function (data) {
      if (!node.saeParser) {
        node.saeParser = {}
      }
      node.saeParser[a] = data;
      node.metadata({
        a: 12
      });
      // console.log("aaaa", node)
      deferred.resolve(data);
    });

    return deferred.promise;
  }

  foo(subjectNode, objectNode, predicateId, promises) {
    const self = this;

    let subjectTermId = self.getNodeId(subjectNode);
    let objectTermId = self.getNodeId(objectNode);

    if (self.config.closureCheck[predicateId]) {
      each(self.config.closureCheck[predicateId].nodes, function (node) {
        if (node.object) {
          promises.push(self.isaClosure(node.object.id, objectTermId, objectNode));
        } else {
          promises.push(self.isaClosure(node.subject.id, subjectTermId, subjectNode));
        }
      });
    }
  }

  xgraphPreParse(graph) {
    const self = this;
    let deferred = self.$q.defer();
    var promises = [];

    each(graph.all_nodes(), function (node) {
      //isaClosure(a, b)
      //let termId = self.getNodeId(node)
      node.metadata({
        a: 124555
      });
    });

    each(graph.all_edges(), function (edge) {
      //subject
      let subjectNode = graph.get_node(edge.subject_id());
      let subjectNodeTermId = self.getNodeId(subjectNode);
      //object
      let objectNode = graph.get_node(edge.object_id());
      let objectNodeTermId = self.getNodeId(objectNode);
      subjectNode.metadata({
        a: 124
      });

      //self.foo(subjectNode, objectNode, edge.predicate_id(), promises);
    });

    self.$timeout(() => {
      self.graphPreParseNodes(graph);
    }, 10000);

    self.$q.all(promises).then(function (data) {
      console.log("done", data)
      //self.graphPreParseNodes(graph);
    });
  }


  graphPreParse(graph) {
    const self = this;

    each(graph.all_edges(), function (edge) {
      let subjectNode = graph.get_node(edge.subject_id());
      let objectNode = graph.get_node(edge.object_id());

      objectNode.metadata({
        b: 1245678
      });

      subjectNode.metadata({
        a: 124
      });
    });

    each(graph.all_nodes(), function (node) {
      console.log(node)
    });
  }

  graphToAnnotons(graph) {
    const self = this;
    var annotons = [];

    each(graph.all_edges(), function (e) {
      if (e.predicate_id() === self.saeConstants.edge.enabledBy.id) {
        let mfId = e.subject_id();
        let gpId = e.object_id();
        let mfSubjectNode = self.subjectToTerm(graph, mfId);
        let gpSubjectNode = self.subjectToTerm(graph, gpId);
        let annoton = null;

        if (gpSubjectNode.term.id && gpSubjectNode.term.id.startsWith('GO')) {
          annoton = self.config.createAnnotonModel(
            self.saeConstants.annotonType.options.complex.name,
            self.saeConstants.annotonModelType.options.default.name
          );
        } else {
          annoton = self.config.createAnnotonModel(
            self.saeConstants.annotonType.options.simple.name,
            self.saeConstants.annotonModelType.options.default.name
          );
        }

        let evidence = self.edgeToEvidence(graph, e);
        let mfEdgesIn = graph.get_edges_by_subject(mfId);
        let annotonNode = annoton.getNode('mf');

        annoton.parser = new AnnotonParser(self.saeConstants);

        annotonNode.setTerm(mfSubjectNode.term);
        annotonNode.setEvidence(evidence);
        annotonNode.setIsComplement(mfSubjectNode.isComplement)
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
    const self = this;
    let edge = annoton.getEdges(annotonNode.id);

    each(mfEdgesIn, function (toMFEdge) {
      if (!toMFEdge) {
        return;
      }
      let predicateId = toMFEdge.predicate_id();
      let evidence = self.edgeToEvidence(graph, toMFEdge);
      let toMFObject = toMFEdge.object_id();

      if (annotonNode.id === "mc" && predicateId === self.saeConstants.edge.hasPart.id) {
        self.config.addGPAnnotonData(annoton, toMFObject);
      }

      each(edge.nodes, function (node) {
        if (predicateId === node.edge.id) {
          if (predicateId === self.saeConstants.edge.hasPart.id && toMFObject !== node.target.id) {
            //do nothing
          } else {
            let subjectNode = self.subjectToTerm(graph, toMFObject);

            node.target.modelId = toMFObject;
            node.target.setEvidence(evidence);
            node.target.setTerm(subjectNode.term);
            node.target.setIsComplement(subjectNode.isComplement)

            //self.check

            if (subjectNode.term && subjectNode.term.id) {
              annoton.parser.parseNodeOntology(node.target, subjectNode.term.id);
            }
            self.graphToAnnatonDFS(graph, annoton, graph.get_edges_by_subject(toMFObject), node.target);
          }
        }
      });
    });

    annoton.parser.parseCardinality(graph, annotonNode, mfEdgesIn, edge.nodes);

  }


  graphToCCOnly(graph) {
    const self = this;
    var annotons = [];

    each(graph.all_edges(), function (e) {
      if (e.predicate_id() === self.saeConstants.edge.partOf.id) {
        let gpId = e.subject_id();
        let ccId = e.object_id();
        let gpSubjectNode = self.subjectToTerm(graph, gpId);
        let ccSubjectNode = self.subjectToTerm(graph, ccId);
        let annoton = null;

        //  if (gpSubjectNode.term.id && gpSubjectNode.term.id.startsWith('GO')) {
        //  annoton = self.config.createComplexAnnotonModel();
        // } else {
        annoton = self.config.createAnnotonModel(
          self.saeConstants.annotonType.options.simple.name,
          self.saeConstants.annotonModelType.options.ccOnly.name
        );
        //   }

        let evidence = self.edgeToEvidence(graph, e);
        let ccEdgesIn = graph.get_edges_by_subject(ccId);
        let annotonNode = annoton.getNode('gp');

        annoton.parser = new AnnotonParser(self.saeConstants);

        annotonNode.setTerm(gpSubjectNode.term);
        annotonNode.setEvidence(evidence);
        annotonNode.setIsComplement(gpSubjectNode.isComplement)
        annotonNode.modelId = gpId;

        self.graphToCCOnlyDFS(graph, annoton, ccEdgesIn, annotonNode);

        if (annoton.annotonType === self.saeConstants.annotonType.options.complex.name) {
          annoton.populateComplexData();
        }
        annotons.push(annoton);
      }
    });

    return annotons;
  }

  graphToCCOnlyDFS(graph, annoton, ccEdgesIn, annotonNode) {
    const self = this;
    let edge = annoton.getEdges(annotonNode.id);

    each(ccEdgesIn, function (toCCEdge) {
      if (!toCCEdge) {
        return;
      }
      let predicateId = toCCEdge.predicate_id();
      let evidence = self.edgeToEvidence(graph, toCCEdge);
      let toMFObject = toCCEdge.object_id();

      if (annotonNode.id === "mc" && predicateId === self.saeConstants.edge.hasPart.id) {
        self.config.addGPAnnotonData(annoton, toMFObject);
      }

      each(edge.nodes, function (node) {
        if (predicateId === node.edge.id) {
          if (predicateId === self.saeConstants.edge.hasPart.id && toMFObject !== node.target.id) {
            //do nothing
          } else {
            let subjectNode = self.subjectToTerm(graph, toMFObject);

            node.target.modelId = toMFObject;
            node.target.setEvidence(evidence);
            node.target.setTerm(subjectNode.term);
            node.target.setIsComplement(subjectNode.isComplement)

            //self.check

            if (subjectNode.term && subjectNode.term.id) {
              annoton.parser.parseNodeOntology(node.target, subjectNode.term.id);
            }
            self.graphToAnnatonDFS(graph, annoton, graph.get_edges_by_subject(toMFObject), node.target);
          }
        }
      });
    });

    annoton.parser.parseCardinality(graph, annotonNode, ccEdgesIn, edge.nodes);

  }


  graphToAnnatonDFSError(annoton, annotonNode) {
    const self = this;
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
    let bpNode = annoton.getNode('bp');
    let ccNode = annoton.getNode('cc');

    let row = {
      gp: gpNode.term.control.value.label,
      mf: mfNode.term.control.value.label,
      bp: bpNode.term.control.value.label,
      cc: ccNode.term.control.value.label,
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
      annotonPresentation: self.formGrid.getAnnotonPresentation(annoton),
    }

    row.mf = mfNode.term.control.value.label;
    row.evidence = mfNode.evidence

    return row;
  }

  ccComponentsToTable(graph, annotons) {
    const self = this;
    let result = [];

    each(annotons, function (annoton) {
      let annotonRows = self.ccComponentsToTableRows(graph, annoton);

      result = result.concat(annotonRows);
    });

    return result;
  }

  ccComponentsToTableRows(graph, annoton) {
    const self = this;
    let result = [];

    let gpNode = null;

    if (annoton.annotonType === self.saeConstants.annotonType.options.simple.name) {
      gpNode = annoton.getNode('gp');
    } else {
      gpNode = annoton.getNode('mc');
    }
    let ccNode = annoton.getNode('cc');

    let row = {
      gp: gpNode.term.control.value.label,
      cc: ccNode.term.control.value.label,
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
      annotonPresentation: self.formGrid.getAnnotonPresentation(annoton),
    }

    row.evidence = gpNode.evidence

    return row;
  }

  addIndividual(reqs, node) {
    node.saveMeta = {};
    if (node.term.control.value && node.term.control.value.id) {
      if (node.isComplement) {
        let ce = new class_expression();
        ce.as_complement(node.term.control.value.id);
        node.saveMeta.term = reqs.add_individual(ce);
      } else {
        node.saveMeta.term = reqs.add_individual(node.term.control.value.id);
      }
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
      if (subject && target && edge) {
        if (edgeNode.target.edgeOption) {
          edgeNode.edge = edgeNode.target.edgeOption.selected
        }
        edgeNode.target.saveMeta.edge = reqs.add_fact([
          node.saveMeta.term,
          edgeNode.target.saveMeta.term,
          edgeNode.edge.id
        ]);

        if (edgeNode.target.id === 'gp') {
          each(node.evidence, function (evidence) {
            let evidenceWith = evidence.with.control.value ? evidence.with.control.value : null;
            reqs.add_evidence(evidence.evidence.control.value.id, [evidence.reference.control.value], evidenceWith, edgeNode.target.saveMeta.edge);
          });
        } else {
          each(edgeNode.target.evidence, function (evidence) {
            let evidenceWith = evidence.with.control.value ? evidence.with.control.value : null;
            reqs.add_evidence(evidence.evidence.control.value.id, [evidence.reference.control.value], evidenceWith, edgeNode.target.saveMeta.edge);
          });
        }
      }
    });
  }

  convertToComplex(annoton) {
    const self = this;
    let mcNode = annoton.getNode('mc');

    mcNode.copyValues(annoton.complexAnnotonData.mcNode);

    each(annoton.complexAnnotonData.geneProducts, function (geneProduct) {
      let id = 'gp-' + annoton.nodes.length;
      let node = self.config.addGPAnnotonData(annoton, id);
      node.setTerm(geneProduct);
    });

  }

  convertToSimple(annoton) {
    const self = this;
    let simpleAnnoton = self.config.createAnnotonModel(
      annoton.annotonType,
      annoton.annotonModelType
    );
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

  saveModelAnnotation(key, value) {
    const self = this;

    let annotations = self.graph.get_annotations_by_key(key);
    let reqs = new minerva_requests.request_set(self.manager.user_token(), local_id);

    each(annotations, function (annotation) {
      reqs.remove_annotation_from_model(key, annotation.value())
    });

    reqs.add_annotation_to_model(key, value);
    self.manager.request_with(reqs);
  }

  annotonAdjustments(annoton) {
    const self = this;
    let infos = [];

    switch (annoton.annotonModelType) {
      case self.saeConstants.annotonModelType.options.default.name:
        {
          let mfNode = annoton.getNode('mf');
          let ccNode = annoton.getNode('cc');
          let cclNode = annoton.getNode('cc-1');
          let cc11Node = annoton.getNode('cc-1-1');

          if (!ccNode.hasValue()) {
            if (cclNode.hasValue()) {
              annoton.addEdge(mfNode, cclNode, self.saeConstants.edge.occursIn);
              let meta = {
                aspect: cc1Node.label,
                subjectNode: {
                  label: mfNode.term.control.value.label
                },
                edge: {
                  label: self.saeConstants.edge.occursIn
                },
                targetNode: {
                  label: cc1Node.term.control.value.label
                },
              }
              let info = new AnnotonError(2, "No CC found, added  ", meta);

              infos.push(info);
            } else if (cc11Node.hasValue()) {}
          }
          break;
        }
      case self.saeConstants.annotonModelType.options.bpOnly.name:
        {
          let mfNode = annoton.getNode('mf');
          let bpNode = annoton.getNode('bp');

          break;
        }
    }
    return infos;
  }

  adjustAnnoton(annoton) {
    const self = this;

    switch (annoton.annotonModelType) {
      case self.saeConstants.annotonModelType.options.default.name:
        {
          let mfNode = annoton.getNode('mf');
          let ccNode = annoton.getNode('cc');
          let cc1Node = annoton.getNode('cc-1');
          let cc11Node = annoton.getNode('cc-1-1');

          if (!ccNode.hasValue()) {
            if (cc1Node.hasValue()) {
              ccNode.setTerm(self.saeConstants.rootNode[ccNode.id]);
              ccNode.evidence = cc1Node.evidence;
            } else if (cc11Node.hasValue()) {
              ccNode.setTerm(self.saeConstants.rootNode[ccNode.id]);
              ccNode.evidence = cc11Node.evidence;
              annoton.addEdge(ccNode, cc11Node, self.saeConstants.edge.partOf);
            }
          }
          break;
        }
      case self.saeConstants.annotonModelType.options.bpOnly.name:
        {
          let mfNode = annoton.getNode('mf');
          let bpNode = annoton.getNode('bp');

          mfNode.evidence = bpNode.evidence;
          break;
        }
    }
  }

  saveAnnoton(annoton, edit, addNew) {
    const self = this;
    const manager = this.manager;
    let reqs = new minerva_requests.request_set(manager.user_token(), local_id);
    let geneProduct;
    let infos;

    if (annoton.annotonType === self.saeConstants.annotonType.options.complex.name) {
      self.convertToComplex(annoton);
      geneProduct = annoton.getNode('mc');
    } else {
      geneProduct = annoton.getNode('gp');
    }

    infos = self.annotonAdjustments(annoton);

    if (infos) {

    }

    self.adjustAnnoton(annoton);

    if (edit) {
      each(annoton.nodes, function (node) {
        self.deleteIndividual(reqs, node);
      });
    }

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

    reqs.store_model(local_id);

    if (addNew) {
      reqs.add_model();
    }

    return manager.request_with(reqs);
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
GraphService.$inject = ['saeConstants', 'config', '$q', '$rootScope', '$timeout', '$mdDialog', 'lookup', 'formGrid'];