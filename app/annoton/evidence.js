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

    this.assignedBy = {
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

  getAssignedBy(value) {
    return this.assignedBy.control.value;
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

  hasValue() {
    const self = this;

    return self.evidence.control.value.id && self.reference.control.value;
  }

  setAssignedBy(value, link) {
    this.assignedBy.control.value = value;
    this.assignedBy.control.link = {
      label: value,
      url: link
    }
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
    this.reference.control.link = {
      label: value,
      url: link
    }
  }

  setWith(value, link) {
    this.with.control.value = value;
    if (link) {
      this.with.control.link = {
        label: value,
        url: link
      }
    }

  }


  clearValues() {
    const self = this;

    self.setEvidence(null);
    self.setReference(null);
    self.setWith(null);
    self.setAssignedBy(null);
  }

  copyValues(evidence, except) {
    const self = this;

    self.setEvidence(evidence.getEvidence());
    !_.includes(except, 'reference') ? self.setReference(evidence.getReference()) : angular.noop;
    !_.includes(except, 'with') ? self.setWith(evidence.getWith()) : angular.noop;
    !_.includes(except, 'assignedBy') ? self.setAssignedBy(evidence.getAssignedBy()) : angular.noop;;
  }

  isEvidenceEqual(evidence) {
    const self = this;
    let result = true;


    result = result && _.isEqual(self.getEvidence(), evidence.getEvidence());
    result = result && _.isEqual(self.getReference(), evidence.getReference());
    result = result && _.isEqual(self.getWith(), evidence.getWith());

    // console.log(result, '-', self.getEvidence(), evidence.getEvidence())
    return result;
  }


  enableSubmit(errors, node, position) {
    const self = this;
    let result = true;
    var pattern = new RegExp("^\\w+\\s*:\\s*\\d+$");


    if (!self.evidence.control.value.id) {
      self.evidence.control.required = true;
      let meta = {
        aspect: node.label
      }
      let error = new AnnotonError('error', 1, "No evidence for '" + node.label + "': evidence(" + position + ")", meta)
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
      let error = new AnnotonError('error', 1, "You provided an evidence for '" + node.label + "' but no reference: evidence(" + position + ")", meta)
      errors.push(error);
      result = false;
    } else if (self.reference.control.value) {

      let found = self.reference.control.value.trim().match(pattern);
      self.reference.control.required = true;
      if (!found) {
        let meta = {
          aspect: node.label
        }
        let error = new AnnotonError('error', 1, "The proper format for references in a GO annotation is 'DB:accession_number': evidence(" + position + ")", meta)
        errors.push(error);
        result = false;
      }
    } else {
      self.reference.control.required = false;
    }
    return result;
  }
}