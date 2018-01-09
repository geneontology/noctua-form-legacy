import _ from 'lodash';
const each = require('lodash/forEach');

import Evidence from './evidence.js';

export default class AnnotonNode {
  constructor() {
    this.id;
    this.ontologyClass = [];
    this.modelId;
    this.term = {
      "validation": {
        "errors": []
      },
      "control": {
        "placeholder": '',
        "value": ''
      },
      "lookup": {
        "requestParams": null
      }
    };
    this._evidenceMeta = {
      lookupBase: "",
      ontologyClass: "eco"
    };
    this.evidence = [];
    this.errors = [];
    this.status = '0';

  }

  setTermLookup(value) {
    this.term.lookup.requestParams = value;
  }

  setEvidenceMeta(ontologyClass, lookupBase) {
    this._evidenceMeta.lookupBase = lookupBase;
    this._evidenceMeta.ontologyClass = ontologyClass;
    this.addEvidence();
  }

  setTerm(value) {
    if (value) {
      this.term.control.value = value;
    }
  }

  setEvidence(evidence) {
    const self = this;

    self.evidence = evidence;
  }

  addEvidence() {
    const self = this;
    let evidence = new Evidence();

    evidence.setEvidenceLookup(JSON.parse(JSON.stringify(self._evidenceMeta.lookupBase)));
    evidence.setEvidenceOntologyClass(self._evidenceMeta.ontologyClass);

    self.evidence.push(evidence);
  }

  removeEvidence(evidence) {
    const self = this;

    if (self.evidence.length > 1) {
      self.evidence = _.remove(self.evidence, evidence);
    } else {
      self.evidence[0].clearValues();
    }
  }

  setTermOntologyClass(value) {
    this.term.ontologyClass = value;
  }


  clearValues() {
    const self = this;

    self.term.control.value = null;
    self.evidence = [];
    self.addEvidence();
  }

  copyValues(node) {
    const self = this;

    self.term.control.value = node.term.control.value;
    self.evidence = node.evidence;
  }


  //addError

  static isType(typeId, id) {
    let n = typeId.toLowerCase();
    if (n.includes(id)) {

    } else if (n.includes('go')) {

    }

  }

}