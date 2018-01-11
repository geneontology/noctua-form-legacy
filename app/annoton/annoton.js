import _ from 'lodash';
const each = require('lodash/forEach');

import SaeGraph from './sae-graph.js';

export default class Annoton extends SaeGraph {
  constructor() {
    super();
    this.annotonType = "simple";
    this.annotonModelType = 'annoton';
    this.complexAnnotonData = {
      mcNode: {},
      gpTemplateNode: {},
      geneProducts: []
    };
    this.errors = [];
    this.submitErrors = []
  }

  insertTermNode(annotonModel, id, value) {
    let node = null;

    node = _.find(annotonModel, {
      id: id
    });

    if (node) {
      node.term.control.value = value;
    }
  }

  print() {
    let result = []
    each(this.nodes, function (node) {
      result.push({
        id: node.id,
        term: node.term.control.value,
        evidence: node.evidence.control.value,
        reference: node.reference.control.value,
        with: node.with.control.value
      })
    });
    return result;
  };

  setAnnotonType(type) {
    this.annotonType = type;
  }

  setAnnotonModelType(type) {
    this.annotonModelType = type;
  }

  populateComplexData() {
    const self = this;

    let edge = self.getEdges('mc');

    self.complexAnnotonData.mcNode = self.getNode('mc');
    self.complexAnnotonData.geneProducts = [];

    each(edge.nodes, function (node) {
      self.complexAnnotonData.geneProducts.push(node.target.term.control.value);
    });
  }

  enableSubmit() {
    const self = this;
    let result = true;
    self.submitErrors = [];

    each(self.nodes, function (node) {
      result = node.enableSubmit(self.submitErrors) && result;
    })
    return result;
  }

}