import _ from 'lodash';
const each = require('lodash/forEach');

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
    this.evidence = {
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
    this.reference = {
      "validation": {
        "errors": []
      },
      "control": {
        "placeholder": '',
        "value": ''
      }
    };
    this.with = {
      "validation": {
        "errors": []
      },
      "control": {
        "placeholder": '',
        "value": ''
      }
    };
    this.errors = []
    this.status = '0';
  }

  setTermLookup(value) {
    this.term.lookup.requestParams = value;
  }

  setEvidenceLookup(value) {
    this.evidence.lookup.requestParams = value;
  }

  setTerm(value) {
    if (value) {
      this.term.control.value = value;
    }
  }

  setEvidence(value) {
    if (value) {
      this.evidence.control.value = value.evidence;
      this.reference.control.value = value.reference;
      this.with.control.value = value.with;
    }
  }

  setTermOntologyClass(value) {
    this.term.ontologyClass = value;
  }

  setEvidenceOntologyClass(value) {
    this.evidence.ontologyClass = value;
  }

  clearValues() {
    const self = this;

    self.term.control.value = null;
    self.evidence.control.value = null;
    self.reference.control.value = null;
    self.with.control.value = null;
  }

  copyValues(node) {
    const self = this;

    self.term.control.value = node.term.control.value;
    self.evidence.control.value = node.evidence.control.value;
    self.reference.control.value = node.reference.control.value;
    self.with.control.value = node.with.control.value;
  }


  //addError

  static isType(typeId, id) {
    let n = typeId.toLowerCase();
    if (n.includes(id)) {

    } else if (n.includes('go')) {

    }

  }

}