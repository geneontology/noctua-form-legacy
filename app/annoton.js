import _ from 'lodash';
const each = require('lodash/forEach');

import SaeGraph from './sae-graph.js';

export default class Annoton {
  constructor() {
    this.model = new SaeGraph();
  }

  getModel() {
    return this.model;
  }

  addNode(node) {
    this.model.addNode(node);
  }

  getNode(id) {
    return this.model.getNode(id);
  }

  insertNode(id, key, value) {
    let node = null;
    for (var row of data) {
      result = _.find(data, {
        id: row.id
      });
    }

    if (node) {
      node[key].id = value;
    }
  }

  addEdge(source, target, edge) {
    this.model.addEdge(source, target, edge)
  }

  getEdges(id) {
    return this.model.getEdges(id);
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
    each(this.model.nodes, function (node) {
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

  static setTerm(node, value) {
    if (node && value) {
      node.term.control.value = value;
    }
  }

  static setEvidence(node, value) {
    if (node && value) {
      node.evidence.control.value = value.evidence;
      node.reference.control.value = value.reference;
      node.with.control.value = value.with;
    }
  }

}