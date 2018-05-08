import _ from 'lodash';
const each = require('lodash/forEach');
const uuid = require('uuid/v1');
import SaeGraph from './sae-graph.js';
import AnnotonError from "./parser/annoton-error.js";

export default class Annoton extends SaeGraph {
  constructor() {
    super();
    this.annotonType = "simple";
    this.annotonModelType = 'default';
    this.complexAnnotonData = {
      mcNode: {},
      gpTemplateNode: {},
      geneProducts: []
    };
    this.errors = [];
    this.submitErrors = [];
    this.id = uuid();
  }

  getGPNode() {
    const self = this;

    if (self.annotonType === 'simple') {
      return self.getNode('gp');
    } else {
      return self.getNode('mc');
    }
    return null;
  }

  copyStructure(srcAnnoton) {
    const self = this;

    self.annotonType = srcAnnoton.annotonType;
    self.annotonModelType = srcAnnoton.annotonModelType;
    self.complexAnnotonData = srcAnnoton.complexAnnotonData;
  }

  copyValues(srcAnnoton) {
    const self = this;

    each(self.nodes, function (destNode) {
      let srcNode = srcAnnoton.getNode(destNode.id);
      if (srcNode) {
        destNode.copyValues(srcNode);
      }
    });
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

  addEdgeOptionById(id, edgeOption) {
    const self = this;

    let node = self.getNode(id);
    node.addEdgeOption(edgeOption)
  }

  enableSubmit() {
    const self = this;
    let result = true;
    self.submitErrors = [];

    each(self.nodes, function (node) {
      result = node.enableSubmit(self.submitErrors, self) && result;
    })

    if (self.annotonType === 'simple') {
      let gp = self.getNode('gp');
      gp.term.control.required = false;
      if (!gp.term.control.value.id) {
        gp.term.control.required = true;
        let meta = {
          aspect: self.label
        }
        let error = new AnnotonError('error', 1, "A '" + gp.label + "' is required", meta)
        self.submitErrors.push(error);
        result = false;
      }
    }

    /*
    if (self.annotonType === 'complex') {
      if (self.complexAnnotonData.mcNode.term.control.value && !self.complexAnnotonData.mcNode.term.control.value.id) {
        let meta = {
          aspect: self.complexAnnotonData.mcNode.label
        }
        let error = new AnnotonError('error', 1, "A '" + self.complexAnnotonData.mcNode.label + "' is required", meta)
        self.submitErrors.push(error);
        result = false;
      }

      if (self.complexAnnotonData.geneProducts === 0) {
        let meta = {
          aspect: self.complexAnnotonData.mcNode.label
        }
        let error = new AnnotonError('error', 1, "At least one gene product 'has part' is required if you choose macromolecular complex", meta)
        self.submitErrors.push(error);
        result = false;
      }
    }
    */

    return result;
  }

}