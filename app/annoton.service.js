import _ from 'lodash';
const each = require('lodash/forEach');

import SaeGraph from './sae-graph.js';

export default class AnnotonService {
  constructor(saeConstants, config, $timeout) {
    this.config = config;
    this.saeConstants = saeConstants
    this.$timeout = $timeout;
  }

  createModel() {
    return this.config.createAnnotonModel();
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

  getNode(annotonModel, id) {
    let node = null;
    node = _.find(annotonModel.nodes, {
      id: id
    });

    return node;
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

  insertEvidenceNode(annotonModel, id, value) {
    let node = null;
    node = _.find(annotonModel, {
      id: id
    });

    if (node && value) {
      node.evidence.control.value = value.evidence;
      node.reference.control.value = value.reference;
      node.with.control.value = value.with;
    }
  }

}
AnnotonService.$inject = ['saeConstants', 'config', '$timeout'];