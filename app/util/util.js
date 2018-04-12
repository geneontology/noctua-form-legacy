import _ from 'lodash';
const each = require('lodash/forEach');
const uuid = require('uuid/v1');
import Evidence from "../annoton/evidence.js";

export default class Util {

    static getUniqueEvidences(annotons) {
        let result = [];

        function find(data, evidence) {
            return _.find(data, function (x) {
                console.log(x.isEvidenceEqual(evidence))
                return x.isEvidenceEqual(evidence)
            })
        }

        each(annotons, function (annotonData) {
            each(annotonData.annoton.nodes, function (node) {
                each(node.evidence, function (evidence) {
                    if (evidence.hasValue()) {
                        if (!find(result, evidence)) {
                            result.push(evidence);
                        }
                    }
                });
            });
        });

        return result;
    }
}