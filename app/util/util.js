import _ from 'lodash';
const each = require('lodash/forEach');
const uuid = require('uuid/v1');
import Evidence from "../annoton/evidence.js";

export default class Util {

    static getUniqueEvidences(annotons) {
        let result = [];

        each(annotons, function (annotonData) {
            each(annotonData.annoton.nodes, function (node) {
                each(node.evidence, function (evidence) {
                    result.push(evidence);
                });
            });
        });

        return result;
    }
}