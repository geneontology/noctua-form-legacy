import _ from 'lodash';
import {
  read
} from 'fs';

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