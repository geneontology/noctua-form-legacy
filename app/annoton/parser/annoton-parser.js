import _ from 'lodash';
const each = require('lodash/forEach');


export default class AnnotonParser {
  constructor() {
    this.saeConstants = {};
    this.rules = [];
    this.errors = [];
  }

  parseCardinality(node, edges) {
    const self = this;
    let edges2 = [];
    let result = true;
    let errors = [];

    each(edges, function (edge) {
      let predicateId = edge.predicate_id();
      if (_.includes(edges2, predicateId)) {
        errors.push("More than 1 " + predicateId);
        result = false;
      }
      edges2.push(predicateId)
    });
    if (errors.length !== 0) {
      self.errors.push(errors);
      node.errors.push(errors);
    }
    return result;
  }

  parseNodeOntology(node, ontologyId) {
    const self = this;
    let result = true;
    let errors = [];
    let prefix = ontologyId.split(":")[0].toLowerCase();
    each(node.ontologyClass, function (ontologyClass) {
      if (ontologyClass !== prefix) {
        errors.push("Wrong ontology class " + prefix + "Expected " + JSON.stringify(node.ontologyClass));
        result = false;
      }
    });
    if (errors.length !== 0) {
      self.errors.push(errors);
      node.errors.push(errors);
    }

    return result;
  }

  printErrors() {
    const self = this;
    console.log(self.errors);
  }
}