import Annoton from './annoton/annoton.js';
import AnnotonParser from './annoton/parser/annoton-parser.js';
import AnnotonError from "./annoton/parser/annoton-error.js";
import Evidence from './annoton/evidence.js';

const each = require('lodash/forEach');
const forOwn = require('lodash/forOwn');
const uuid = require('uuid/v1');
const annotationTitleKey = 'title';

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
var local_id = typeof global_id !== 'undefined' ? global_id : 'global_id';
var local_golr_server = typeof global_golr_server !== 'undefined' ? global_golr_server : 'global_id';
var local_barista_location = typeof global_barista_location !== 'undefined' ? global_barista_location : 'global_barista_location';
var local_minerva_definition_name = typeof global_minerva_definition_name !== 'undefined' ? global_minerva_definition_name : 'global_minerva_definition_name';
var local_barista_token = typeof global_barista_token !== 'undefined' ? global_barista_token : 'global_barista_token';
var local_collapsible_relations = typeof global_collapsible_relations !== 'undefined' ? global_collapsible_relations : 'global_collapsible_relations';

export default class GraphService {
  constructor(saeConstants, config, $http, $q, $rootScope, $timeout, $mdDialog, dialogService, lookup, formGrid) {
    this.config = config;
    this.saeConstants = saeConstants
    this.$http = $http;
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
    this.linker = new amigo.linker();
    this.manager = null;
    this.graph = null;
    this.loggedIn = local_barista_token && (local_barista_token.length > 0);
    this.lookup = lookup;
    this.formGrid = formGrid;
    this.dialogService = dialogService;
    this.userInfo = {
      groups: [],
      selectedGroup: {}
    }
    this.modelInfo = {
      graphEditorUrl: ""
    }

    this.localClosures = [];
  }

  initialize() {
    const self = this;

    self.getUserInfo();
    self.createGraphUrls(self.model_id);

    this.engine = new jquery_engine(barista_response);
    this.engine.method('POST');
    var manager = new minerva_manager(
      this.barista_location,
      this.minerva_definition_name,
      this.barista_token,
      this.engine, 'async');

    this.manager = manager;

    function _shields_up() {}

    function _shields_down() {}

    // Internal registrations.
    manager.register('prerun', _shields_up);
    manager.register('postrun', _shields_down, 9);
    manager.register('manager_error',
      function (resp) {
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
      var perm_flag = 'InsufficientPermissionsException';
      var token_flag = 'token';
      if (resp.message() && resp.message().indexOf(perm_flag) !== -1) {
        alert('Error: it seems like you do not have permission to ' +
          'perform that operation. Did you remember to login?');
      } else if (resp.message() && resp.message().indexOf(token_flag) !== -1) {
        alert('Error: it seems like you have a bad token...');
      } else {
        console.log('error:', resp, resp.message_type(), resp.message());
      }
    }, 10);

    manager.register('meta', function ( /* resp , man */ ) {
      console.log('## a meta callback?');
    });

    function rebuild(resp) {
      let noctua_graph = model.graph;

      self.graph = new noctua_graph();
      self.model_id = local_id = global_id = resp.data().id;
      self.graph.load_data_basic(resp.data());

      self.modelTitle = null;
      self.modelState = null;

      self.createGraphUrls(self.model_id);
      let annotations = self.graph.get_annotations_by_key(annotationTitleKey);
      let stateAnnotations = self.graph.get_annotations_by_key('state');

      if (annotations.length > 0) {
        self.modelTitle = annotations[0].value(); // there should be only one
      }

      if (stateAnnotations.length > 0) {
        self.modelState = stateAnnotations[0].value(); // there should be only one
      }

      self.graphPreParse(self.graph).then(function (data) {
          let deferred = self.$q.defer();
          deferred.resolve(data);
          return deferred.promise;
        })
        .then(function (data) {
          return self.graphToCCOnly(self.graph);
        })
        .then(function (data) {
          let annotons = self.graphToAnnotons(self.graph);
          self.gridData = {
            annotons: [...self.annotonsToTable(self.graph, annotons), ...self.ccComponentsToTable(self.graph, data)]
          };

          self.$timeout(() => {
            self.$rootScope.$emit('rebuilt', {
              gridData: self.gridData
            });
          }, 10);
        });

      self.title = self.graph.get_annotations_by_key('title');
    }

    manager.register('merge', function ( /* resp */ ) {
      manager.get_model(self.model_id);
    });
    manager.register('rebuild', function (resp) {
      rebuild(resp);
    }, 10);

    manager.get_model(this.model_id);
  }

  createGraphUrls(modelId) {
    const self = this;

    let baristaParams = {
      'barista_token': this.barista_token
    }

    let modelIdParams = {
      'model_id': modelId
    }

    function parameterize(params) {
      return Object.keys(params).map(key => key + '=' + params[key]).join('&');
    }

    self.modelInfo.goUrl = 'http://www.geneontology.org/';
    self.modelInfo.noctuaUrl = window.location.origin + "?" + (this.loggedIn ? parameterize(baristaParams) : '');
    self.modelInfo.owlUrl = window.location.origin + "/download/" + modelId + "/owl";
    self.modelInfo.gpadUrl = window.location.origin + "/download/" + modelId + "/gpad";
    self.modelInfo.graphEditorUrl = window.location.origin + "/editor/graph/" + modelId + "?" + (this.loggedIn ? parameterize(baristaParams) : '');
    self.modelInfo.saeUrl = window.location.origin + '/workbench/simple-annoton-editor?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : '');
    self.modelInfo.logoutUrl = self.barista_location + '/logout?' + parameterize(baristaParams) + '&amp;return=' + window.location.origin + '/workbench/simple-annoton-editor?' + parameterize(baristaParams)
    self.modelInfo.loginUrl = self.barista_location + '/login?return=' + window.location.origin + '/workbench/simple-annoton-editor';

    //Workbenches 
    self.modelInfo.workbenches = [{
      label: 'Annotation Preview',
      url: window.location.origin + '/workbench/annpreview?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: 'Function Companion',
      url: window.location.origin + '/workbench/companion?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: 'Cytoscape Layout Tool',
      url: window.location.origin + '/workbench/cytoview?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: "Gosling (Noctua's little GOOSE)",
      url: window.location.origin + '/workbench/gosling-model?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: 'Inference Explanations',
      url: window.location.origin + '/workbench/inferredrelations?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: 'Macromolecular Complex Creator',
      url: window.location.origin + '/workbench/mmcc?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: 'Pathway View',
      url: window.location.origin + '/workbench/pathwayview?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }, {
      label: 'Annotation Preview',
      url: window.location.origin + '/workbench/simple-annoton-editor?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : ''),
    }]
  }

  getUserInfo() {
    const self = this;
    let url = self.barista_location + "/user_info_by_token/" + self.barista_token;

    return this.$http.get(url)
      .then(function (response) {
        if (response.data && response.data.groups && response.data.groups.length > 0) {
          self.userInfo.name = response.data['nickname'];
          self.userInfo.groups = response.data['groups'];
          self.userInfo.selectedGroup = self.userInfo.groups[0];
          self.manager.use_groups([self.userInfo.selectedGroup.id]);
        }
      });
  }

  addModel() {
    const self = this
    self.manager.add_model();
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
        let assignedBys = annotationNode.get_annotations_by_key('providedBy');
        if (sources.length > 0) {
          evidence.setReference(sources[0].value(), self.linker.url(sources[0].value()));
        }
        if (withs.length > 0) {
          if (withs[0].value().startsWith('gomodel')) {
            evidence.setWith(withs[0].value());
          } else {
            evidence.setWith(withs[0].value(), self.linker.url(withs[0].value()));
          }
        }
        if (assignedBys.length > 0) {
          evidence.setAssignedBy(assignedBys[0].value(), assignedBys[0].value());
        }
        result.push(evidence);
      }
    });

    return result;
  }

  graphPreParse(graph) {
    const self = this;
    var promises = [];

    each(graph.get_nodes(), function (node) {
      let termId = self.getNodeId(node);

      each(graph.get_edges_by_subject(node.id()), function (e) {
        let predicateId = e.predicate_id();
        let objectNode = graph.get_node(e.object_id())
        let objectTermId = self.getNodeId(objectNode);

        if (self.config.closureCheck[predicateId]) {
          each(self.config.closureCheck[predicateId].closures, function (closure) {
            if (closure.subject) {
              promises.push(self.isaClosurePreParse(termId, closure.subject.id, node));
            }

            if (objectTermId && closure.object) {
              promises.push(self.isaClosurePreParse(objectTermId, closure.object.id, node));
            }
          });
        }
      });
    });

    return self.$q.all(promises).then(function (data) {
      // console.log('all closures', self.lookup.getAllLocalClosures())

      // each(data, function (entity) {
      //entity.annoton.parser.parseNodeOntology(entity.node);
      // });
    });
  }

  isaClosurePreParse(a, b, node) {
    const self = this;
    let deferred = self.$q.defer();

    self.lookup.isaClosure(a, b).then(function (data) {
      let nodeId = node.id();

      self.lookup.addLocalClosure(a, b, data);

      deferred.resolve({
        node: node,
        result: data
      });
    });

    return deferred.promise;
  }

  isaNodeClosure(a, b, node, annoton) {
    const self = this;
    let deferred = self.$q.defer();

    self.lookup.isaClosure(a, b).then(function (data) {
      if (data) {
        node.closures.push(a);
        //annoton.parser.parseNodeOntology(node, data);
      }
      // console.log("node closure", data, node);
      deferred.resolve({
        annoton: annoton,
        node: node,
        result: data
      });
    });

    return deferred.promise;
  }

  determineAnnotonType(gpObjectNode) {
    const self = this;

    if (self.lookup.getLocalClosure(gpObjectNode.term.id, self.saeConstants.closures.gp.id)) {
      return self.saeConstants.annotonType.options.simple.name;
    } else if (self.lookup.getLocalClosure(gpObjectNode.term.id, self.saeConstants.closures.mc.id)) {
      return self.saeConstants.annotonType.options.complex.name;
    }

    return null;
  }

  determineAnnotonModelType(mfNode, mfEdgesIn) {
    const self = this;
    let result = self.saeConstants.annotonModelType.options.default.name;

    if (mfNode.term.id === self.saeConstants.rootNode.mf.id) {
      each(mfEdgesIn, function (toMFEdge) {
        let predicateId = toMFEdge.predicate_id();

        if (_.find(self.saeConstants.causalEdges, {
            id: predicateId
          })) {
          result = self.saeConstants.annotonModelType.options.bpOnly.name;
        }
      });
    }

    return result;
  }

  graphToAnnotons(graph) {
    const self = this;
    var annotons = [];

    each(graph.all_edges(), function (e) {
      if (e.predicate_id() === self.saeConstants.edge.enabledBy.id) {
        let mfId = e.subject_id();
        let gpId = e.object_id();
        let evidence = self.edgeToEvidence(graph, e);
        let mfEdgesIn = graph.get_edges_by_subject(mfId);
        let mfSubjectNode = self.subjectToTerm(graph, mfId);
        let gpObjectNode = self.subjectToTerm(graph, gpId);
        let gpVerified = false;
        let isDoomed = false
        let annotonType = self.determineAnnotonType(gpObjectNode);
        let annotonModelType = self.determineAnnotonModelType(mfSubjectNode, mfEdgesIn);

        let annoton = self.config.createAnnotonModel(
          annotonType ? annotonType : self.saeConstants.annotonType.options.simple.name,
          annotonModelType
        );

        let annotonNode = annoton.getNode('mf');
        annotonNode.setTerm(mfSubjectNode.term);
        annotonNode.setEvidence(evidence);
        annotonNode.setIsComplement(mfSubjectNode.isComplement);
        annotonNode.modelId = mfId;

        annoton.parser = new AnnotonParser(self.saeConstants);

        if (annotonType) {
          if (!self.lookup.getLocalClosure(mfSubjectNode.term.id, self.saeConstants.closures.mf.id)) {
            isDoomed = true;
          }
        } else {
          annoton.parser.setCardinalityError(annotonNode, gpObjectNode.term, self.saeConstants.edge.enabledBy.id);
        }

        if (isDoomed) {
          annoton.parser.setCardinalityError(annotonNode, gpObjectNode.term, self.saeConstants.edge.enabledBy.id);
        }

        self.graphToAnnatonDFS(graph, annoton, mfEdgesIn, annotonNode, isDoomed);

        annotons.push(annoton);
      }
    });

    self.parseNodeClosure(annotons);

    return annotons;
  }

  graphToCCOnly(graph) {
    const self = this;
    var annotons = [];

    each(graph.all_edges(), function (e) {
      if (e.predicate_id() === self.saeConstants.edge.partOf.id) {
        let predicateId = e.predicate_id();
        let gpId = e.subject_id();
        let ccId = e.object_id();
        let evidence = self.edgeToEvidence(graph, e);
        let gpEdgesIn = graph.get_edges_by_subject(gpId);
        let ccObjectNode = self.subjectToTerm(graph, ccId);
        let gpSubjectNode = self.subjectToTerm(graph, gpId);
        let gpVerified = false;
        let isDoomed = false
        let annotonType = self.determineAnnotonType(gpSubjectNode);

        let annoton = self.config.createAnnotonModel(
          annotonType ? annotonType : self.saeConstants.annotonType.options.simple.name,
          self.saeConstants.annotonModelType.options.ccOnly.name
        );

        let annotonNode = annoton.getNode('gp');
        annotonNode.setTerm(gpSubjectNode.term);
        annotonNode.setEvidence(evidence);
        annotonNode.setIsComplement(gpSubjectNode.isComplement);
        annotonNode.modelId = gpId;

        annoton.parser = new AnnotonParser(self.saeConstants);

        if (annotonType) {
          let closureRange = self.lookup.getLocalClosureRange(ccObjectNode.term.id, self.config.closureCheck[predicateId]);

          if (!closureRange) {
            isDoomed = true;
          }

          if (isDoomed) {
            annoton.parser.setCardinalityError(annotonNode, ccObjectNode.term, predicateId);
          }

          self.graphToAnnatonDFS(graph, annoton, gpEdgesIn, annotonNode, isDoomed);

          if (annoton.annotonType === self.saeConstants.annotonType.options.complex.name) {
            annoton.populateComplexData();
          }

          annotons.push(annoton);
        } else {
          annoton.parser.setCardinalityError(annotonNode, ccObjectNode.term, predicateId);
          //  self.graphToAnnatonDFS(graph, annoton, ccEdgesIn, annotonNode, true);
        }
      }
    });

    self.parseNodeClosure(annotons);

    return annotons;
  }

  graphToAnnatonDFS(graph, annoton, mfEdgesIn, annotonNode, isDoomed) {
    const self = this;
    let edge = annoton.getEdges(annotonNode.id);

    if (annoton.parser.parseCardinality(graph, annotonNode, mfEdgesIn, edge.nodes)) {
      each(mfEdgesIn, function (toMFEdge) {
        let predicateId = toMFEdge.predicate_id();
        let evidence = self.edgeToEvidence(graph, toMFEdge);
        let toMFObject = toMFEdge.object_id();

        if (annotonNode.id === "mc" && predicateId === self.saeConstants.edge.hasPart.id) {
          self.config.addGPAnnotonData(annoton, toMFObject);
        }

        if (annoton.annotonModelType === self.saeConstants.annotonModelType.options.bpOnly.name) {
          let causalEdge = _.find(self.saeConstants.causalEdges, {
            id: predicateId
          })

          if (causalEdge) {
            self.adjustBPOnly(annoton, causalEdge);
          }
        }

        each(edge.nodes, function (node) {
          if (predicateId === node.edge.id) {
            if (predicateId === self.saeConstants.edge.hasPart.id && toMFObject !== node.object.id) {
              //do nothing
            } else {
              let subjectNode = self.subjectToTerm(graph, toMFObject);

              node.object.modelId = toMFObject;
              node.object.setEvidence(evidence);
              node.object.setTerm(subjectNode.term);
              node.object.setIsComplement(subjectNode.isComplement)

              //self.check
              let closureRange = self.lookup.getLocalClosureRange(subjectNode.term.id, self.config.closureCheck[predicateId]);

              if (!closureRange && !_.find(self.saeConstants.causalEdges, {
                  id: predicateId
                })) {
                isDoomed = true;
                annoton.parser.setCardinalityError(annotonNode, node.object.getTerm(), predicateId);
              }

              if (isDoomed) {
                annoton.parser.setNodeWarning(node.object)
              }

              self.graphToAnnatonDFS(graph, annoton, graph.get_edges_by_subject(toMFObject), node.object, isDoomed);
            }
          }
        });
      });

    }

    return annoton;

  }

  parseNodeClosure(annotons) {
    const self = this;
    let promises = [];

    each(annotons, function (annoton) {
      each(annoton.nodes, function (node) {
        let term = node.getTerm();
        if (term) {
          promises.push(self.isaNodeClosure(node.lookupGroup, term.id, node, annoton));

          forOwn(annoton.edges, function (srcEdge, key) {
            each(srcEdge.nodes, function (srcNode) {
              //  let nodeExist = destAnnoton.getNode(key);
              //  if (nodeExist && srcNode.object.hasValue()) {
              //   destAnnoton.addEdgeById(key, srcNode.object.id, srcNode.edge);
              //   }
            });
          });
        }
      });
    });

    self.$q.all(promises).then(function (data) {
      console.log('done node clodure', data)

      each(data, function (entity) {
        //entity.annoton.parser.parseNodeOntology(entity.node);
      });
    });
  }

  graphToAnnatonDFSError(annoton, annotonNode) {
    const self = this;
    let edge = annoton.getEdges(annotonNode.id);

    each(edge.nodes, function (node) {
      node.object.status = 2;
      self.graphToAnnatonDFSError(annoton, node.object);
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

    let gpNode = annoton.getGPNode();

    let row = {
      gp: gpNode.term.control.value.label,
      original: JSON.parse(JSON.stringify(annoton)),
      annoton: annoton,
      annotonPresentation: self.formGrid.getAnnotonPresentation(annoton),
    }

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

    let gpNode = annoton.getGPNode();
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
      if (node.modelId) {
        node.saveMeta.term = node.modelId;
      } else if (node.isComplement) {
        let ce = new class_expression();
        ce.as_complement(node.term.control.value.id);
        node.saveMeta.term = reqs.add_individual(ce);

      } else {
        node.saveMeta.term = reqs.add_individual(node.term.control.value.id);
      }

      node.modelId = node.saveMeta.term;
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
      let object = edgeNode.object ? edgeNode.object.saveMeta.term : null;

      if (subject && object && edge) {
        if (edgeNode.object.edgeOption) {
          edgeNode.edge = edgeNode.object.edgeOption.selected
        }
        edgeNode.object.saveMeta.edge = reqs.add_fact([
          node.saveMeta.term,
          edgeNode.object.saveMeta.term,
          edgeNode.edge.id
        ]);


        if (edgeNode.object.id === 'gp') {
          each(node.evidence, function (evidence) {
            let evidenceReference = evidence.reference.control.value;
            let evidenceWith = evidence.with.control.value;

            reqs.add_evidence(evidence.evidence.control.value.id, evidenceReference, evidenceWith, edgeNode.object.saveMeta.edge);
          });
        } else {
          each(edgeNode.object.evidence, function (evidence) {
            let evidenceReference = evidence.reference.control.value;
            let evidenceWith = evidence.with.control.value;
            // if (edgeNode.object.aspect === 'P') {
            //  let gpNode = annoton.getGPNode();
            //  if (gpNode && gpNode.modelId) {
            // evidenceWith.push(gpNode.modelId)
            //  }
            // }
            reqs.add_evidence(evidence.evidence.control.value.id, evidenceReference, evidenceWith, edgeNode.object.saveMeta.edge);
          });
        }
      }
    });
  }

  evidenceUseGroups(reqs, evidence) {
    const self = this;
    let assignedBy = evidence.getAssignedBy();

    if (assignedBy) {
      reqs.use_groups(['http://purl.obolibrary.org/go/groups/' + assignedBy]);
    } else if (self.userInfo.groups.length > 0) {
      reqs.use_groups([self.userInfo.selectedGroup.id]);
    } else {
      reqs.use_groups([]);
    }
  }

  adjustBPOnly(annoton, srcEdge) {
    const self = this;
    let mfNode = annoton.getNode('mf');
    let bpNode = annoton.getNode('bp');



    if (mfNode && bpNode && annoton.annotonModelType === self.saeConstants.annotonModelType.options.bpOnly.name) {
      mfNode.displaySection = self.saeConstants.displaySection.fd;
      mfNode.displayGroup = self.saeConstants.displayGroup.mf;
      annoton.editEdge('mf', 'bp', srcEdge);
      bpNode.relationship = annoton.getEdge('mf', 'bp').edge;
    }
  }

  saveModelGroup() {
    const self = this

    self.manager.use_groups([self.userInfo.selectedGroup.id]);
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

  checkIfNodeExist(srcAnnoton) {
    const self = this;
    let infos = [];

    each(srcAnnoton.nodes, function (srcNode) {
      let srcTerm = srcNode.getTerm();

      if (srcTerm.id && !srcNode.modelId) {
        let meta = {
          aspect: srcNode.label,
          subjectNode: {
            node: srcNode,
            label: srcNode.term.control.value.label
          },
          linkedNodes: []
        }

        each(self.gridData.annotons, function (annotonData) {
          each(annotonData.annoton.nodes, function (node) {

            if (srcTerm.id === node.getTerm().id) {
              if (!_.find(meta.linkedNodes, {
                  modelId: node.modelId
                })) {
                meta.linkedNodes.push(node);
              }
            }
          });
        });

        if (meta.linkedNodes.length > 0) {
          let info = new AnnotonError('error', 5, "Instance exists " + srcNode.term.control.value.label, meta);

          infos.push(info);
        }
      }

    });

    return infos;
  }

  annotonAdjustments(annoton) {
    const self = this;
    let infos = []; //self.checkIfNodeExist(annoton);

    switch (annoton.annotonModelType) {
      case self.saeConstants.annotonModelType.options.default.name:
        {
          let mfNode = annoton.getNode('mf');
          let ccNode = annoton.getNode('cc');
          let cc1Node = annoton.getNode('cc-1');
          let cc11Node = annoton.getNode('cc-1-1');
          let cc111Node = annoton.getNode('cc-1-1-1');

          if (!ccNode.hasValue()) {
            if (cc1Node.hasValue()) {
              let meta = {
                aspect: cc1Node.label,
                subjectNode: {
                  label: mfNode.term.control.value.label
                },
                edge: {
                  label: self.saeConstants.edge.occursIn
                },
                objectNode: {
                  label: cc1Node.term.control.value.label
                },
              }
              let info = new AnnotonError('error', 2, "No CC found, added  ", meta);

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

  createSave(srcAnnoton) {
    const self = this;
    let destAnnoton = new Annoton();
    destAnnoton.copyStructure(srcAnnoton);

    let skipNodeDFS = function (sourceId, objectId) {
      const self = this;
      let srcEdge = srcAnnoton.edges[objectId];

      if (srcEdge) {
        each(srcEdge.nodes, function (srcNode) {
          let nodeExist = destAnnoton.getNode(sourceId) && destAnnoton.getNode(srcNode.object.id);
          if (nodeExist && srcNode.object.hasValue()) {
            destAnnoton.addEdgeById(sourceId, srcNode.object.id, srcNode.edge);
          } else {
            skipNodeDFS(sourceId, srcNode.object.id);
          }
        });
      }
    }

    each(srcAnnoton.nodes, function (srcNode) {
      if (srcNode.hasValue()) {
        let destNode = srcNode;

        if (destAnnoton.annotonType === self.saeConstants.annotonType.options.simple.name) {
          if (srcNode.displayGroup.id !== self.saeConstants.displayGroup.mc.id) {
            destAnnoton.addNode(destNode);
          }
        } else {
          if (srcNode.id !== 'gp') {
            destAnnoton.addNode(destNode);
          }
        }
      }
    });

    forOwn(srcAnnoton.edges, function (srcEdge, key) {
      each(srcEdge.nodes, function (srcNode) {
        let nodeExist = destAnnoton.getNode(key);
        if (nodeExist && srcNode.object.hasValue()) {
          destAnnoton.addEdgeById(key, srcNode.object.id, srcNode.edge);
        } else {
          skipNodeDFS(key, srcNode.object.id);
        }
      });
    });

    console.log('create save', destAnnoton);

    return destAnnoton;
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
          let cc111Node = annoton.getNode('cc-1-1-1');

          if (!ccNode.hasValue()) {
            if (cc1Node.hasValue()) {
              ccNode.setTerm(self.saeConstants.rootNode[ccNode.id]);
              ccNode.evidence = cc1Node.evidence;
            } else if (cc11Node.hasValue()) {
              ccNode.setTerm(self.saeConstants.rootNode[ccNode.id]);
              ccNode.evidence = cc11Node.evidence;
            } else if (cc111Node.hasValue()) {
              ccNode.setTerm(self.saeConstants.rootNode[ccNode.id]);
              ccNode.evidence = cc111Node.evidence;
            }
          }
          break;
        }
      case self.saeConstants.annotonModelType.options.bpOnly.name:
        {
          let mfNode = annoton.getNode('mf');
          let bpNode = annoton.getNode('bp');

          mfNode.setTerm({
            id: 'GO:0003674',
            label: 'molecular_function'
          });
          mfNode.evidence = bpNode.evidence;
          break;
        }
    }

    return self.createSave(annoton);
  }

  saveGP(gp, success) {
    const self = this;

    let manager = new minerva_manager(
      self.barista_location,
      self.minerva_definition_name,
      self.barista_token,
      self.engine, 'async');

    manager.register('manager_error',
      function (resp) {
        console.log('There was a manager error (' +
          resp.message_type() + '): ' + resp.message());
      }, 10);

    manager.register('warning', function (resp /*, man */ ) {
      alert('Warning: ' + resp.message() + '; ' +
        'your operation was likely not performed');
    }, 10);
    manager.register('error', function (resp /*, man */ ) {
      var perm_flag = 'InsufficientPermissionsException';
      var token_flag = 'token';
      if (resp.message() && resp.message().indexOf(perm_flag) !== -1) {
        alert('Error: it seems like you do not have permission to ' +
          'perform that operation. Did you remember to login?');
      } else if (resp.message() && resp.message().indexOf(token_flag) !== -1) {
        alert('Error: it seems like you have a bad token...');
      } else {
        console.log('error:', resp, resp.message_type(), resp.message());
      }
    }, 10);
    manager.register('meta', function ( /* resp , man */ ) {
      console.log('## a meta callback?');
    });

    manager.register('merge', function (resp) {
      let individuals = resp.individuals();
      if (individuals.length > 0) {
        let gpResponse = individuals[0];

        gp.modelId = gpResponse.id;
        success(gpResponse);
      }
    }, 10);

    let reqs = new minerva_requests.request_set(manager.user_token(), local_id);
    reqs.add_individual(gp.getTerm().id);
    return manager.request_with(reqs);
  }

  saveAnnoton(annoton) {
    const self = this;
    let geneProduct;

    if (annoton.annotonType === self.saeConstants.annotonType.options.complex.name) {
      geneProduct = annoton.getNode('mc');
    } else {
      geneProduct = annoton.getNode('gp');
    }

    function success(gpIndividual) {
      const manager = self.manager;
      let reqs = new minerva_requests.request_set(manager.user_token(), local_id);

      if (!self.modelTitle) {
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

      if (self.userInfo.groups.length > 0) {
        reqs.use_groups([self.userInfo.selectedGroup.id]);
      }

      return manager.request_with(reqs);
    }

    //return self.saveGP(geneProduct, success);

    return success();

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
GraphService.$inject = ['saeConstants', 'config', '$http', '$q', '$rootScope', '$timeout', '$mdDialog', 'dialogService', 'lookup', 'formGrid'];