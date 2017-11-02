import _ from 'lodash';

export default class LookupService {
  constructor($http, $timeout, $location, $sce, $rootScope) {
    this.name = 'DefaultLookupName';
    this.$http = $http;
    this.$timeout = $timeout;
    this.$location = $location;
    this.$sce = $sce;
    this.$rootScope = $rootScope;
  }

  golrLookup(field, oldValue, val) {
    /* global global_golr_neo_server */
    var golrURLBase = `${global_golr_neo_server}/select`;

    var baseRequestParams = {
      defType: 'edismax',
      indent: 'on',
      qt: 'standard',
      wt: 'json',
      rows: '10',
      start: '0',
      fl: '*,score',
      'facet': true,
      'facet.mincount': 1,
      'facet.sort': 'count',
      'facet.limit': '25',
      'json.nl': 'arrarr',
      packet: '1',
      callback_type: 'search',
      _: Date.now()
    };

    // var requestParamsGP1 = Object.assign({}, baseRequestParams, {
    //   q: val + '*',
    //   'facet.field': 'category',
    //   fq: 'document_category:"general"',
    //   qf: [
    //     'entity^3',
    //     'entity_label_searchable^3',
    //     'general_blob_searchable^3'
    //   ],
    // });

    var requestParamsGP = Object.assign({}, baseRequestParams, {
      q: val + '*',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        // 'regulates_closure:"CHEBI:23367"'//Generak Molecule + GP
        'regulates_closure:"CHEBI:33695"'//GP
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure^1',
        'regulates_closure_label_searchable^1'
      ],
    });

    var requestParamsMF = Object.assign({}, baseRequestParams, {
      q: val + '*',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        'regulates_closure_label:"molecular_function"'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure_label_searchable^1'
      ],
    });

    var requestParamsBP = Object.assign({}, baseRequestParams, {
      q: val + '*',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        'regulates_closure_label:"biological_process"'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure_label_searchable^1'
      ],
    });


    var requestParamsCC = Object.assign({}, baseRequestParams, {
      q: val + '*',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        'regulates_closure_label:"cellular_component"'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure_label_searchable^1'
      ],
    });


    var requestParamsEvidence = Object.assign({}, baseRequestParams, {
      q: val + '*',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        'source:"eco"'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure^1',
        'regulates_closure_label_searchable^1'
      ],
    });

    var requestParamsCL = Object.assign({}, baseRequestParams, {
      q: val + '*',
      'facet.field': [
        'source',
        'subset',
        'regulates_closure_label',
        'is_obsolete'
      ],
      fq: [
        'document_category:"ontology_class"',
        'source:"eco"'
      ],
      qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'regulates_closure^1',
        'regulates_closure_label_searchable^1'
      ],
    });





    let fieldToParams = {
      GP: requestParamsGP,
      MF: requestParamsMF,
      MFe: requestParamsEvidence,
      BP: requestParamsBP,
      CL: requestParamsCL,
      BPe: requestParamsEvidence,
      CC: requestParamsCC,
      CCe: requestParamsEvidence
    };

    var requestParams = fieldToParams[field];
    // console.log('golrLookup', field, requestParams);

    var trusted = this.$sce.trustAsResourceUrl(golrURLBase);
    return this.$http.jsonp(
      trusted,
      {
        // withCredentials: false,
        jsonpCallbackParam: 'json.wrf',
        params: requestParams
      })
      .then(
      function (response) {
        var data = response.data.response.docs;
        var result = data.map(function (item) {
          if (false && field === 'GP') {
            return {
              id: item.entity,
              label: item.entity_label
            };
          }
          else {
            return {
              id: item.annotation_class,
              label: item.annotation_class_label
            };
          }
        });
        // console.log('GOLR success', response, requestParams, data, result);
        return result;
      },
      function (error) {
        console.log('GOLR error: ', golrURLBase, requestParams, error);
      }
      );
  }

  ensureUnderscores(curie) {
    return curie.replace(/:/, '_');
  }

  ensureColons(curie) {
    return curie.replace(/_/, ':');
  }

  inlineLookup(colName, oldValue, val/*, acEntry */) {
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

    return new Promise(function (resolve/*, reject */) {
      setTimeout(function () {
        resolve(matches);
      }, 20);
    });

    // return matches;
  }
}
LookupService.$inject = ['$http', '$timeout', '$location', '$sce', '$rootScope'];


