import _ from 'lodash';
const each = require('lodash/forEach');


export default class AnnotonError {
  constructor(category, type, message, meta) {
    this.category = category;
    this.type = type;
    this.message = message;
    this.meta = meta;
  }
}