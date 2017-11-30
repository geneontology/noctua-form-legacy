import _ from 'lodash';
const each = require('lodash/forEach');


export default class AnnotonParser {
  constructor() {
    this.saeConstants = {};
    this.rules = [];
    this.errors = [];
  }

  parseCardinality(node, sourceEdges, targetEdges) {
    const self = this;
    let edges2 = [];
    let result = true;
    let errors = [];

    each(sourceEdges, function (edge) {
      let predicateId = edge.predicate_id();
      if (_.includes(edges2, predicateId)) {
        errors.push("More than 1 " + predicateId);
        result = false;
      }

      let v = _.find(targetEdges, function (node) {
        return node.edgeId === predicateId
      });

      if (v) {
        edges2.push(predicateId);
      } else {
        errors.push("Not accepted " + predicateId);
        result = false;
      }

    });

    //each(edge.nodes, function (node) {


    if (errors.length !== 0) {
      self.errors.push(errors);
      node.errors.cardinality.push(errors);
      node.status = 'error';
    }
    return result;
  }

  parseNodeOntology(node, ontologyId) {
    const self = this;
    let result = true;
    let errors = [];
    let prefix = ontologyId.split(":")[0].toLowerCase();
    each(node.term.ontologyClass, function (ontologyClass) {
      if (ontologyClass !== prefix) {
        errors.push("Wrong ontology class " + prefix + "Expected " + JSON.stringify(node.term.ontologyClass));
        result = false;
      }
    });
    if (errors.length !== 0) {
      self.errors.push(errors);
      node.errors.ontology.push(errors);
      node.term.validation.errors.push(errors);
    }

    return result;
  }

  printErrors() {
    const self = this;
    console.log(self.errors);
  }
}