import _ from 'lodash';
const each = require('lodash/forEach');

export default class AnnotonNode {
  constructor() {
    this.id;
    this.ontologyClass = [];
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
    this.errors = {
      cardinality: [],
      ontology: []
    };
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

  static isType(typeId, id) {
    let n = typeId.toLowerCase();
    if (n.includes(id)) {

    } else if (n.includes('go')) {

    }

  }

}