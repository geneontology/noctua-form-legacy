import _ from 'lodash';
const each = require('lodash/forEach');


export default class NodeEvidence {
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
}