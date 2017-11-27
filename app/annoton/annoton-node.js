import _ from 'lodash';
const each = require('lodash/forEach');

export default class AnnotonNode {
  constructor() {
    this.id;
    this.term = {
      control: {
        "placeholder": '',
        "value": ''
      }
    };
    this.evidence = {
      "control": {
        "placeholder": '',
        "value": ''
      },
      "lookup": {
        //   "requestParams": self.requestParams["evidence"]
      }
    };
    this.reference = {
      "control": {
        "placeholder": '',
        "value": ''
      }
    };
    this.with = {
      "control": {
        "placeholder": '',
        "value": ''
      }
    };
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

}