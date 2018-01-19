import _ from 'lodash';
const each = require('lodash/forEach');

import SaeGraph from './sae-graph.js';
import AnnotonError from "./parser/annoton-error.js";

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

    if (self.annotonType === 'complex') {
      if (!self.complexAnnotonData.mcNode.term.control.value.id) {
        let meta = {
          aspect: self.complexAnnotonData.mcNode.label
        }
        let error = new AnnotonError(1, "A '" + self.complexAnnotonData.mcNode.label + "' is required", meta)
        self.submitErrors.push(error);
        result = false;
      }

      if (self.complexAnnotonData.geneProducts === 0) {
        let meta = {
          aspect: self.complexAnnotonData.mcNode.label
        }
        let error = new AnnotonError(1, "At least one gene product 'has part' is required if you choose macromolecular complex", meta)
        self.submitErrors.push(error);
        result = false;
      }
    }

    return result;
  }

}