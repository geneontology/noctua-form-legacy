import _ from 'lodash';
const each = require('lodash/forEach');

import {
  read
} from 'fs';

import AnnotonNode from './annoton/annoton-node.js';
import Evidence from './annoton/evidence.js';
import {
  ECHILD
} from 'constants';

export default class LookupService {
  constructor($http, $q, $timeout, $location, $sce, $rootScope, $mdDialog) {
    this.name = 'DefaultLookupName';
    this.$http = $http;
    this.$q = $q;
    this.$timeout = $timeout;
    this.$location = $location;
    this.$sce = $sce;
    this.$rootScope = $rootScope;
    this.$mdDialog = $mdDialog;

    /* global global_golr_neo_server */
    this.golrURLBase = `${global_golr_neo_server}/select`;
    this.trusted = this.$sce.trustAsResourceUrl(this.golrURLBase);

  }

  golrLookup(field) {
    const self = this;
    field.lookup.requestParams.q = field.control.value + '*';

    return this.$http.jsonp(
        self.trusted, {
          // withCredentials: false,
          jsonpCallbackParam: 'json.wrf',
          params: field.lookup.requestParams
        })
      .then(function (response) {
          var data = response.data.response.docs;
          var result = data.map(function (item) {
            return {
              id: item.annotation_class,
              label: item.annotation_class_label
            };
          });
          // console.log('GOLR success', response, requestParams, data, result);
          return result;
        },
        function (error) {
          console.log('GOLR error: ', self.golrURLBase, field.lookup.requestParams, error);
        }
      );
  }

  companionLookup(gp, aspect, params) {
    const self = this;
    let deferred = self.$q.defer();

    let requestParams = {
      defType: 'edismax',
      qt: 'standard',
      indent: 'on',
      wt: 'json',
      rows: 10,
      start: 0,
      fl: "*,score",
      facet: true,
      'facet.mincount': 1,
      'facet.sort': 'count',
      'json.nl': 'arrarr',
      "facet.limit": 25,
      fq: [
        'document_category: "annotation"',
        'aspect: "' + aspect + '"',
        'bioentity: "' + gp + '"'
      ],
      'facet.field': [
        'source',
        'assigned_by',
        'aspect',
        'evidence_type_closure',
        'panther_family_label',
        'qualifier',
        'taxon_label',
        'annotation_class_label',
        'regulates_closure_label',
        'annotation_extension_class_closure_label'
      ],
      q: '*:*',
      packet: '1',
      callback_type: 'search',
      _: Date.now()
    }


    self.$http.jsonp(
        self.$sce.trustAsResourceUrl('http://amigo-dev-golr.berkeleybop.org/select'), {
          // withCredentials: false,
          jsonpCallbackParam: 'json.wrf',
          params: requestParams
        })
      .then(function (response) {
          var docs = response.data.response.docs;
          let result = [];
          let annoton
          // console.log('poo', data);

          each(docs, function (doc) {
            let annotonNode = new AnnotonNode();
            let evidence = new Evidence();

            evidence.setEvidence({
              id: doc.evidence,
              label: doc.evidence_label
            });
            evidence.setReference();
            if (doc.reference.length > 0) {
              evidence.setReference(doc.reference[0]);
            }
            annotonNode.setTerm({
              id: doc.annotation_class,
              label: doc.annotation_class_label
            })
            annotonNode.evidence[0] = evidence;
            result.push(annotonNode);

          });

          deferred.resolve(result);
        },
        function (error) {
          console.log('Companion Lookup: ', error);
          deferred.reject(error);
        }
      ).catch(function (response) {
        deferred.reject(response);
      });;

    return deferred.promise;
  }

  isaClosure(a, b) {
    const self = this;
    let deferred = self.$q.defer();

    let requestParams = {
      q: b,
      defType: 'edismax',
      indent: 'on',
      qt: 'standard',
      wt: 'json',
      rows: '2',
      start: '0',
      fl: '*,score',
      'facet': true,
      'facet.mincount': 1,
      'facet.sort': 'count',
      'facet.limit': '25',
      'json.nl': 'arrarr',
      packet: '1',
      callback_type: 'search',
      'facet.field': [
        'source',
        'subset',
        'idspace',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        'isa_closure:' + '"' + a + '"'
      ],
      qf: [
        'annotation_class^3',
        //'annotation_class_label_searchable^5.5',
        //'description_searchable^1',
        //'comment_searchable^0.5',
        //'synonym_searchable^1',
        // 'alternate_id^1',
        'isa_closure^1',
        //'regulates_closure_label_searchable^1'
      ],
      _: Date.now()
    };


    this.$http.jsonp(
        self.trusted, {
          // withCredentials: false,
          jsonpCallbackParam: 'json.wrf',
          params: requestParams
        })
      .then(function (response) {
          var data = response.data.response.docs;
          var result = data.length > 0;
          // console.log('GOLR success', response, requestParams, data, result);
          console.log(a, b, result);

          deferred.resolve(result);
        },
        function (error) {
          console.log('GOLR isClosure error: ', error);
          deferred.reject(error);
        }
      ).catch(function (response) {
        deferred.reject(response);
      });;

    return deferred.promise;
  }

  openPopulateDialog(ev) {
    this.$mdDialog.show({
        controller: 'PopulateDialogController as populateCtrl',
        templateUrl: './dialogs/populate/populate-dialog.html',
        targetEvent: ev,
        clickOutsideToClose: true,
      })
      .then(function (answer) {}, function () {});
  }


  ensureUnderscores(curie) {
    return curie.replace(/:/, '_');
  }

  ensureColons(curie) {
    return curie.replace(/_/, ':');
  }

  inlineLookup(colName, oldValue, val /*, acEntry */ ) {
    var inlineBlock = this.parsedConfig.inline;

    var terms = [];
    if (inlineBlock && inlineBlock[colName]) {
      terms = inlineBlock[colName];
    }

    var matches = [];

    val = val || '';
    if (val !== null) {
      var valUpper = val.toUpperCase();
      _.each(terms, function (v) {
        if (v.label.toUpperCase().indexOf(valUpper) >= 0) {
          matches.push(v);
        }
      });
    }

    return new Promise(function (resolve /*, reject */ ) {
      setTimeout(function () {
        resolve(matches);
      }, 20);
    });

    // return matches;
  }
}




























LookupService.$inject = ['$http', '$q', '$timeout', '$location', '$sce', '$rootScope', '$mdDialog'];