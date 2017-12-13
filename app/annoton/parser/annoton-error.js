import _ from 'lodash';
const each = require('lodash/forEach');


export default class AnnotonError {
  constructor(type, message) {
    this.type = type;
    this.message = message;
  }
}