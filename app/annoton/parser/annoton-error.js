import _ from 'lodash';
const each = require('lodash/forEach');


export default class AnnotonError {
  constructor(type, message, meta) {
    this.type = type;
    this.message = message;
    this.meta = meta;
  }
}