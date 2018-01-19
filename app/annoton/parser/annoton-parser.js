import _ from 'lodash';
const each = require('lodash/forEach');

import AnnotonError from './annoton-error.js';

export default class AnnotonParser {
  constructor() {
    this.saeConstants = {};
    this.rules = [];
    this.errors = [];
    this.clean = true;
  }

  parseCardinality(graph, node, sourceEdges, targetEdges) {
    const self = this;

    let edges2 = [];
    let result = true;
    let error = ""

    each(sourceEdges, function (edge) {
      let predicateId = edge.predicate_id();
      let predicateLabel = self.getPredicateLabel(predicateId);
      let allowedEdge = self.allowedEdge(predicateId);

      if (!allowedEdge) {
        if (_.includes(edges2, predicateId)) {
          let meta = {
            aspect: node.label,
            subjectNode: {
              label: node.term.control.value.label
            },
            edge: {
              label: predicateLabel
            },
            targetNode: {
              label: self.getNodeLabel(graph, edge.object_id())
            },
          }
          error = new AnnotonError(3, "More than 1 " + predicateLabel + " found", meta)
          self.errors.push(error);
          result = false;
        }

        let v = _.find(targetEdges, function (node) {
          return node.edgeId === predicateId
        });

        if (v) {
          if (!self.canDuplicateEdge(predicateId)) {
            edges2.push(predicateId);
          }
        } else {
          let meta = {
            aspect: node.label,
            subjectNode: {
              label: node.term.control.value.label
            },
            edge: {
              label: predicateLabel
            },
            targetNode: {
              label: self.getNodeLabel(graph, edge.object_id())
            },
          }
          error = new AnnotonError(2, "Not accepted triple ", meta);
          self.errors.push(error);
          node.errors.push(error);
          result = false;
        }
      }
    });

    self.clean &= result;
    return result;
  }

  getPredicateLabel(id) {
    const self = this;
    let label = _.findKey(self.saeConstants.edge, function (val) {
      return val === id;
    });
    return label ? label : id;
  }

  parseNodeOntology(node, ontologyId) {
    const self = this;
    let result = true;
    let error = "";
    let prefix = ontologyId.split(":")[0].toLowerCase();

    each(node.term.ontologyClass, function (ontologyClass) {
      if (ontologyClass !== prefix) {
        let meta = {
          aspect: node.label,
          subjectNode: {
            label: node.term.control.value.label
          }
        }
        error = new AnnotonError(4, "Wrong ontology class " + prefix + ". Expected " + JSON.stringify(node.term.ontologyClass), meta);
        self.errors.push(error);
        node.errors.push(error);
        result = false;
      }
    });

    self.clean &= result;
    return result;
  }

  printErrors() {
    const self = this;
    console.log(self.errors);
  }

  allowedEdge(predicateId) {
    const self = this;
    return _.find(self.saeConstants.causalEdges, function (edge) {
      return edge.term === predicateId
    });
  }

  canDuplicateEdge(predicateId) {
    const self = this;
    return _.find(self.saeConstants.canDuplicateEdges, function (edge) {
      return edge.term === predicateId
    });
  }

  getNodeLabel(graph, object) {
    const self = this;
    let label = '';
    let node = graph.get_node(object);

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
}