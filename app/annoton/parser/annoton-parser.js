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

  parseCardinality(node, sourceEdges, targetEdges) {
    const self = this;

    let edges2 = [];
    let result = true;
    let error = ""

    each(sourceEdges, function (edge) {
      let predicateId = edge.predicate_id();
      let allowedEdge = self.allowedEdge(predicateId);

      if (!allowedEdge) {
        if (_.includes(edges2, predicateId)) {
          error = new AnnotonError(1, "More than 1 " + self.getPredicateLabel(predicateId))
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
          error = new AnnotonError(1, "Not accepted edge " + self.getPredicateLabel(predicateId));
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
        error = new AnnotonError(1, "Wrong ontology class " + prefix + ". Expected " + JSON.stringify(node.term.ontologyClass));
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
}