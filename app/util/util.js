import _ from 'lodash';
const each = require('lodash/forEach');
const uuid = require('uuid/v1');
import Evidence from "../annoton/evidence.js";

export default class Util {

    static getMFNodes(annotons, except) {
        let result = [];

        each(annotons, function (annotonData) {
            each(annotonData.annoton.nodes, function (node) {
                if (node.id === 'mf') {
                    result.push({
                        node: node,
                        annoton: annotonData.annoton
                    })
                }
            });
        });

        return result;
    }

    static getUniqueEvidences(annotons, result) {
        if (!result) {
            result = [];
        }

        function find(data, evidence) {
            return _.find(data, function (x) {
                // console.log(x.isEvidenceEqual(evidence))
                return x.isEvidenceEqual(evidence)
            })
        }

        each(annotons, function (annotonData) {
            each(annotonData.annoton.nodes, function (node) {
                each(node.evidence, function (evidence) {
                    if (evidence.hasValue()) {
                        if (!Util.evidenceExists(result, evidence)) {
                            result.push(evidence);
                        }
                    }
                });
            });
        });

        return result;
    }

    static evidenceExists(data, evidence) {
        return _.find(data, function (x) {
            // console.log(x.isEvidenceEqual(evidence))
            return x.isEvidenceEqual(evidence)
        })
    }

    static addUniqueEvidences(existingEvidence, data) {
        let result = [];

        each(data, function (annotation) {
            each(annotation.annotations, function (node) {
                each(node.evidence, function (evidence) {
                    if (evidence.hasValue()) {
                        if (!Util.evidenceExists(result, evidence)) {
                            result.push(evidence);
                        }
                    }
                });
            });
        });

        return result;
    }

    static addUniqueEvidencesFromAnnoton(annoton) {
        let result = [];

        each(annoton.nodes, function (node) {
            each(node.evidence, function (evidence) {
                if (evidence.hasValue()) {
                    if (!Util.evidenceExists(result, evidence)) {
                        result.push(evidence);
                    }
                }
            });
        });

        return result;
    }
}