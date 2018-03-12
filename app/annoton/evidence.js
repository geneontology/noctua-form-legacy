import _ from 'lodash';
const each = require('lodash/forEach');

import AnnotonError from "./parser/annoton-error.js";

export default class Evidence {
  constructor() {
    this.evidence = {
      "validation": {
        "errors": []
      },
      "control": {
        "required": false,
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
        "required": false,
        "placeholder": '',
        "value": '',
        "link": ''
      }
    };
    this.with = {
      "validation": {
        "errors": []
      },
      "control": {
        "required": false,
        "placeholder": '',
        "value": '',
        "link": ''
      }
    };

  }

  getEvidence(value) {
    return this.evidence.control.value;
  }

  getReference(value) {
    return this.reference.control.value;
  }

  getWith(value) {
    return this.with.control.value;
  }

  setEvidenceLookup(value) {
    this.evidence.lookup.requestParams = value;
  }

  setEvidenceOntologyClass(value) {
    this.evidence.ontologyClass = value;
  }

  setEvidence(value) {
    this.evidence.control.value = value;
  }

  setReference(value, link) {
    this.reference.control.value = value;
    this.reference.control.link = link;
  }

  setWith(value, link) {
    this.with.control.value = value;
    this.with.control.link = link;
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

  enableSubmit(errors, node) {
    const self = this;
    let result = true;
    var pattern = new RegExp("^.+:.+$");


    if (!self.evidence.control.value.id) {
      self.evidence.control.required = true;
      let meta = {
        aspect: node.label
      }
      let error = new AnnotonError(1, "No evidence for '" + node.label + "'", meta)
      errors.push(error);
      result = false;
    } else {
      self.evidence.control.required = false;
    }

    if (self.evidence.control.value.id && !self.reference.control.value) {
      self.reference.control.required = true;
      let meta = {
        aspect: node.label
      }
      let error = new AnnotonError(1, "You provided an evidence for '" + node.label + "' but no reference", meta)
      errors.push(error);
      result = false;
    } else if (self.reference.control.value) {

      let found = self.reference.control.value.match(pattern);
      self.reference.control.required = true;
      if (!found) {
        let meta = {
          aspect: node.label
        }
        let error = new AnnotonError(1, "The proper format for references in a GO annotation is 'DB:accession_number '", meta)
        errors.push(error);
        result = false;
      }
    } else {
      self.reference.control.required = false;
    }
    return result;
  }
}