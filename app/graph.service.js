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
  constructor($rootScope, $timeout) {
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
  }

  initialize() {
    console.log('initialize');
    var that = this;
    this.engine = new jquery_engine(barista_response);
    this.engine.method('POST');
    var manager = new minerva_manager(
      this.barista_location,
      this.minerva_definition_name,
      this.barista_token,
      this.engine, 'async');

    this.manager = manager;
    function _shields_up(){
      // console.log('_shields_up');
    }
    function _shields_down(){
      // console.log('_shields_down');
    }

    // Internal registrations.
    manager.register('prerun', _shields_up);
    manager.register('postrun', _shields_down, 9);
    manager.register('manager_error',
      function(resp /*, man */){
        console.log('There was a manager error (' +
          resp.message_type() + '): ' + resp.message());
      }, 10);

    // Likely the result of unhappiness on Minerva.
    manager.register('warning', function(resp /*, man */){
      alert('Warning: ' + resp.message() + '; ' +
        'your operation was likely not performed');
    }, 10);

    // Likely the result of serious unhappiness on Minerva.
    manager.register('error', function(resp /*, man */){
      // Do something different if we think that this is a
      // permissions issue.
      var perm_flag = 'InsufficientPermissionsException';
      var token_flag = 'token';
      if( resp.message() && resp.message().indexOf(perm_flag) !== -1 ){
        alert('Error: it seems like you do not have permission to ' +
        'perform that operation. Did you remember to login?');
      }
      else if( resp.message() && resp.message().indexOf(token_flag) !== -1 ){
        alert('Error: it seems like you have a bad token...');
      }
      else {
        console.log('error:', resp, resp.message_type(), resp.message());
        // // Generic error.
        // alert('Error (' +
        // resp.message_type() + '): ' +
        // resp.message() + '; ' +
        // 'your operation was likely not performed.');
      }
    }, 10);

    // ???
    manager.register('meta', function(/* resp , man */){
      console.log('## a meta callback?');
    });

    function rebuild(resp) {
      var noctua_graph = model.graph;
      that.graph = new noctua_graph();
      that.graph.load_data_basic(resp.data());

      that.modelTitle = null;
      var annotations = that.graph.get_annotations_by_key(annotationTitleKey);
      if (annotations.length > 0) {
        that.modelTitle = annotations[0].value(); // there should be only one
      }

      let annotons = that.graphToAnnotons(that.graph);
      let gridData = that.annotonsToTable(that.graph, annotons);

      that.title = that.graph.get_annotations_by_key('title');

      that.$timeout(() => {
        that.$rootScope.$emit('rebuilt', {
          gridData: gridData
        });
      }, 10);
    }

    manager.register('merge', function(/* resp */) {
      manager.get_model(that.model_id);
    });
    manager.register('rebuild', function(resp) {
      rebuild(resp);
    }, 10);

    manager.get_model(this.model_id);
  }


  getNodeLabel(node) {
    var label = '';
    if (node) {
      each(node.types(), function(in_type) {
        label += in_type._class_label +
                  ' (' + in_type._class_id + ')';
      });
    }

    return label;
  }

  getNodeId(node) {
    var result = null;
    if (node) {
      each(node.types(), function(in_type) {
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

  edgeToEvidence(graph, edge) {
    var result = null;

    // console.log('edgeToEvidence', edge);
    var evidenceAnnotations = edge.get_annotations_by_key('evidence');
    if (evidenceAnnotations.length > 0) {
      var firstAnnotationId = evidenceAnnotations[0].value();
      var firstAnnotationNode = graph.get_node(firstAnnotationId);
      if (firstAnnotationNode) {
        // console.log('...firstAnnotationId', firstAnnotationId);
        // console.log('...firstAnnotationNode', firstAnnotationNode);
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
        // console.log('...sources', sources);
        // console.log('...withs', withs);
        if (sources.length > 0) {
          result.reference = sources[0].value();
        }
        if (withs.length > 0) {
          result.with = withs[0].value();
        }
        // console.log('...evidenceLabel', edge, firstAnnotationId, firstAnnotationNode);
      }
    }

    return result;
  }


  graphToAnnotons(graph) {
    var that = this;
    // graph.fold_evidence();
    // graph.fold_go_noctua(global_collapsible_relations);

    // First pass through the edges to locate the GPs

    var annotons = [];

    each(graph.all_edges(), function(e) {
      // console.log('e', e, e.predicate_id(), this.idToPredicateLabel(e.predicate_id()));
      if (e.predicate_id() === PredicateEnabledBy) {
        let mfId = e.subject_id();

        let annoton = {
          GP: null,
          MF: mfId,
          MFe: null,
          BP: null,
          BPe: null,
          CC: null,
          CCe: null
        };

        let mfEdgesIn = graph.get_edges_by_subject(mfId);
        each(mfEdgesIn, function(toMFEdge) {
          let predicateId = toMFEdge.predicate_id();
          let predicateLabel = that.idToPredicateLabel(e.predicate_id());
          let evidence = that.edgeToEvidence(graph, toMFEdge);
          let toMFObject = toMFEdge.object_id();

          if (predicateId === PredicateEnabledBy) {
            // console.log('......PredicateEnabledBy GP', toMFObject);
            annoton.GP = toMFObject;
            annoton.MFe = evidence;
          }
          else if (predicateId === PredicatePartOf) {
            // console.log('......PredicatePartOf BP', toMFObject);
            annoton.BP = toMFObject;
            annoton.BPe = evidence;
          }
          else if (predicateId === PredicateOccursIn) {
            // console.log('......PredicateOccursIn BP', toMFObject);
            annoton.CC = toMFObject;
            annoton.CCe = evidence;
          }
          else {
            console.log('......mfEdgesIn UNKNOWN PREDICATE', predicateId, predicateLabel, toMFEdge);
          }
        });
        annotons.push(annoton);
      }
    });

    // console.log('annotons', annotons);

    return annotons;
  }


  annotonToTableRows(graph, annoton) {
    let result = [];

    let gp = graph.get_node(annoton.GP);
    let gpID = this.getNodeId(gp);
    let gpLabel = this.getNodeLabel(gp);
    let mf = graph.get_node(annoton.MF);
    let mfID = this.getNodeId(mf);
    let mfLabel = this.getNodeLabel(mf);
    let bp = graph.get_node(annoton.BP);
    let bpID = this.getNodeId(bp);
    let bpLabel = this.getNodeLabel(bp);
    let cc = graph.get_node(annoton.CC);
    let ccID = this.getNodeId(cc);
    let ccLabel = this.getNodeLabel(cc);

    let summaryAspect = '';
    let summaryTerm = '';
    let summaryEvidence = '';
    let summaryReference = '';
    let summaryWith = '';

    let mfRow = {
      Aspect: 'F',
      Term: mfLabel,
      $$treeLevel: 1
    };
    summaryAspect += 'F';
    summaryTerm += '• ' + mfLabel;

    if (annoton.MFe) {
      mfRow.Evidence = annoton.MFe.evidence;
      mfRow.Reference = annoton.MFe.reference;
      mfRow.With = annoton.MFe.with;

      summaryEvidence += '• ' + annoton.MFe.evidence.label;
      summaryReference += '• ' + annoton.MFe.reference;
      summaryWith += '• ' + annoton.MFe.with;
    }
    result.push(mfRow);

    if (bp) {
      let bpRow = {
        Aspect: 'P',
        Term: bpLabel,
        $$treeLevel: 1
      };

      summaryAspect += 'P';
      summaryTerm += '\n• ' + bpLabel;
      if (annoton.BPe) {
        bpRow.Evidence = annoton.BPe.evidence;
        bpRow.Reference = annoton.BPe.reference;
        bpRow.With = annoton.BPe.with;

        summaryEvidence += '\n• ' + annoton.BPe.evidence.label;
        summaryReference += '\n• ' + annoton.BPe.reference;
        summaryWith += '\n• ' + annoton.BPe.with;
      }
      result.push(bpRow);
    }

    if (cc) {
      let ccRow = {
        Aspect: 'C',
        Term: ccLabel,
        $$treeLevel: 1
      };

      summaryAspect += 'C';
      summaryTerm += '\n• ' + ccLabel;
      if (annoton.CCe) {
        ccRow.Evidence = annoton.CCe.evidence;
        ccRow.Reference = annoton.CCe.reference;
        ccRow.With = annoton.CCe.with;

        summaryEvidence += '\n• ' + annoton.CCe.evidence.label;
        summaryReference += '\n• ' + annoton.CCe.reference;
        summaryWith += '\n• ' + annoton.CCe.with;
      }
      result.push(ccRow);
    }

    result.unshift({
      Aspect: summaryAspect,
      GP: gpLabel,
      Term: summaryTerm,
      Evidence: {
        label: summaryEvidence
      },
      Reference: summaryReference,
      With: summaryWith,
      original: {
        GP: {id: gpID, label: gpLabel},
        MF: mf ? {id: mfID, label: mfLabel} : null,
        MFe: annoton.MFe,
        BP: bp ? {id: bpID, label: bpLabel} : null,
        BPe: annoton.BPe,
        CC: cc ? {id: ccID, label: ccLabel} : null,
        CCe: annoton.CCe
      },
      Annoton: annoton,
      $$treeLevel: 0
    });

    // console.log('annotonToTableRows', annoton, result);

    return result;
  }

  editingModelToTableRows(graph, annoton) {
    // console.log('editingModelToTableRows', annoton);
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


  annotonsToTable(graph, annotons) {
    const that = this;
    let result = [];

    each(annotons, function(annoton) {
      let annotonRows = that.annotonToTableRows(graph, annoton);

      result = result.concat(annotonRows);
    });

    return result;
  }


  saveEditingModel(editingModel) {
    // console.log('saveEditingModel', editingModel, editingModel.Annoton)
    const manager = this.manager;

    var reqs = new minerva_requests.request_set(manager.user_token(), local_id);

    if (editingModel.Annoton) {
      this.addDeletionToRequestSet(reqs, editingModel.Annoton);
    }

    if (!this.modelTitle) {
      const defaultTitle = 'Model involving ' + editingModel.GP.label;
      reqs.add_annotation_to_model(annotationTitleKey, defaultTitle);
    }

    var tempGPID = reqs.add_individual(editingModel.GP.id);
    var tempMFID = editingModel.MF ?
                    reqs.add_individual(editingModel.MF.id) :
                    null;
    var tempBPID = editingModel.BP ?
                    reqs.add_individual(editingModel.BP.id) :
                    null;
    var tempCCID = editingModel.CC ?
                    reqs.add_individual(editingModel.CC.id) :
                    null;

    let MFe = editingModel.MFe;
    if (!tempMFID) {
      if (tempBPID) {
        // create a dummy MF instance to connect to BP;
        // NOTE: if all we have is a CCID (i.e. no MF, np BP) then
        // the assumption is the curator is making a weak gp-part-of-cc statement.
        // we handle this further on
        tempMFID = reqs.add_individual(rootMF);
      }
    }

    if (tempMFID) {
      var edgeGPMF = reqs.add_fact([
        tempMFID,
        tempGPID,
        PredicateEnabledBy
      ]);

      if (MFe) {
        var tempEvidenceMGGPID = reqs.add_individual(MFe.id);
        reqs.add_annotation_to_fact('evidence', tempEvidenceMGGPID, null, edgeGPMF);
        if (MFe.reference) {
          reqs.add_annotation_to_individual('source', MFe.reference, null, tempEvidenceMGGPID);
        }
        if (MFe.with) {
          reqs.add_annotation_to_individual('with', MFe.with, null, tempEvidenceMGGPID);
        }
      }
    }

    if (tempBPID) {
      var edgeGPBP = reqs.add_fact([
        tempMFID,
        tempBPID,
        PredicatePartOf
      ]);

      if (editingModel.BPe) {
        var tempEvidenceBPGPID = reqs.add_individual(editingModel.BPe.id);
        reqs.add_annotation_to_fact('evidence', tempEvidenceBPGPID, null, edgeGPBP);
        if (editingModel.BPe.reference) {
          reqs.add_annotation_to_individual('source', editingModel.BPe.reference, null, tempEvidenceBPGPID);
        }
        if (editingModel.BPe.with) {
          reqs.add_annotation_to_individual('with', editingModel.BPe.with, null, tempEvidenceBPGPID);
        }
      }
    }

    if (tempCCID) {
      var edgeGPCC = null;
      if (tempMFID) {
        edgeGPCC = reqs.add_fact([
          tempMFID,
          tempCCID,
          PredicateOccursIn
        ]);
      }
      else {
        edgeGPCC = reqs.add_fact([
          tempGPID,
          tempCCID,
          PredicatePartOf
        ]);
        
      }

      if (editingModel.CCe) {
        var tempEvidenceCCGPID = reqs.add_individual(editingModel.CCe.id);
        reqs.add_annotation_to_fact('evidence', tempEvidenceCCGPID, null, edgeGPCC);
        if (editingModel.CCe.reference) {
          reqs.add_annotation_to_individual('source', editingModel.CCe.reference, null, tempEvidenceCCGPID);
        }
        if (editingModel.CCe.with) {
          reqs.add_annotation_to_individual('with', editingModel.CCe.with, null, tempEvidenceCCGPID);
        }
      }
    }

    // console.log('saveEditingModel', editingModel, reqs);
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
GraphService.$inject = ['$rootScope', '$timeout'];
