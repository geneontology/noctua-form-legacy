import _ from 'lodash';
const each = require('lodash/forEach');


export default class Evidence {
  constructor() {
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

  }

  setEvidenceLookup(value) {
    this.evidence.lookup.requestParams = value;
  }

  setEvidenceOntologyClass(value) {
    this.evidence.ontologyClass = value;
  }

  setEvidence(value) {
    if (value) {
      this.evidence.control.value = value.evidence;
      this.reference.control.value = value.reference;
      this.with.control.value = value.with;
    }
  }

  clearValues() {
    const self = this;

    self.evidence.control.value = null;
    self.reference.control.value = null;
    self.with.control.value = null;
  }

  copyValues(node) {
    const self = this;

    self.evidence.control.value = node.evidence.control.value;
    self.reference.control.value = node.reference.control.value;
    self.with.control.value = node.with.control.value;
  }
}