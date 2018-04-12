import _ from 'lodash';
const each = require('lodash/forEach');

import Evidence from './evidence.js';
import AnnotonError from "./parser/annoton-error.js";
import {
  ECHILD
} from 'constants';

export default class AnnotonNode {
  constructor() {
    this.id;
    this.nodeGroup = {}
    this.annoton = null;
    this.ontologyClass = [];
    this.modelId;
    this.isComplement = false;
    this.term = {
      "validation": {
        "errors": []
      },
      "control": {
        "required": false,
        "placeholder": '',
        "value": '',
        "searchText": ''
      },
      "lookup": {
        "category": "",
        "requestParams": null
      }
    };
    this.edgeOption;
    this._evidenceMeta = {
      lookupBase: "",
      ontologyClass: "eco"
    };
    this.evidence = [];
    this.assignedBy = null;
    this.evidenceRequiredList = ['mf', 'bp', 'cc', 'mf-1', 'mf-2', 'bp-1', 'bp-1-1', 'cc-1', 'cc-1-1', 'c-1-1-1']
    this.evidenceNotRequiredList = ['GO:0003674', 'GO:0008150', 'GO:0005575'];
    this.errors = [];
    this.status = '0';

  }

  getTerm(value) {
    return this.term.control.value;
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

  setDisplay(value) {
    if (value) {
      this.displaySection = value.displaySection;
      this.displayGroup = value.displayGroup;
    }
  }


  addEdgeOption(edgeOption) {
    const self = this;

    self.edgeOption = edgeOption;
  }

  setEvidence(evidence) {
    const self = this;

    if (evidence && evidence.length > 0) {
      self.evidence = evidence;
    }
  }

  addEvidence() {
    const self = this;
    let evidence = new Evidence();

    evidence.setEvidenceLookup(JSON.parse(JSON.stringify(self._evidenceMeta.lookupBase)));
    evidence.setEvidenceOntologyClass(self._evidenceMeta.ontologyClass);

    self.evidence.push(evidence);
    return evidence;
  }

  removeEvidence(evidence) {
    const self = this;

    if (self.evidence.length > 1) {
      self.evidence = _.remove(self.evidence, evidence);
    } else {
      self.evidence[0].clearValues();
    }
  }

  resetEvidence() {
    const self = this;

    self.evidence = [self.evidence[0]];
  }

  setTermOntologyClass(value) {
    this.term.ontologyClass = value;
  }

  toggleIsComplement() {
    const self = this;

    self.isComplement = !self.isComplement;
    self.nodeGroup.isComplement = self.isComplement;
  }

  setIsComplement(complement) {
    const self = this;

    self.isComplement = complement;
  }

  hasValue() {
    const self = this;

    return self.term.control.value.id;
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

  copyEvidence(evidences) {
    const self = this;

    each(evidences, function (srcEvidence, i) {
      let destEvidence;

      if (i === 0) {
        destEvidence = self.evidence[0];
      } else {
        destEvidence = self.addEvidence()
      }

      destEvidence.copyValues(srcEvidence);

    });
  }

  selectEdge(edge) {
    console.log("I am selected ", edge);
  }

  enableRow() {
    const self = this;
    let result = true;

    if (self.nodeGroup) {
      if (self.nodeGroup.isComplement && self.treeLevel > 0)[
        result = false
      ]
    }

    return result;
  }

  enableSubmit(errors) {
    const self = this;
    let result = true;


    if (self.id === 'mf' && !self.term.control.value.id) {
      self.term.control.required = true;
      let meta = {
        aspect: self.label
      }
      let error = new AnnotonError(1, "A '" + self.label + "' is required", meta)
      errors.push(error);
      result = false;
    } else {
      self.term.control.required = false;
    }

    if (self.term.control.value.id && self.evidenceRequiredList.includes(self.id) &&
      !self.evidenceNotRequiredList.includes(self.term.control.value.id)) {
      each(self.evidence, function (evidence) {
        if (self.term.control.value.id)
          result = evidence.enableSubmit(errors, self) && result;
      })
    }

    return result;
  }

  static isType(typeId, id) {
    let n = typeId.toLowerCase();
    if (n.includes(id)) {

    } else if (n.includes('go')) {

    }

  }

}