import _ from 'lodash';
const each = require('lodash/forEach');
const uuid = require('uuid/v1');
import AnnotonNode from '../../annoton/annoton-node.js';
import Annoton from '../../annoton/annoton.js';

export default class EditAnnotonNodeDialogController {
    constructor(saeConstants, config, $scope, $rootScope, $http, $timeout, $mdDialog, graph, lookup, formGrid, data) {
        var vm = this;
        vm.saeConstants = saeConstants;
        vm.config = config;
        vm.$scope = $scope;
        vm.$rootScope = $rootScope;
        vm.$mdDialog = $mdDialog;
        vm.$timeout = $timeout;
        vm.lookup = lookup;
        vm.graph = graph;
        vm.formGrid = formGrid;
        vm.data = data;
        vm.entity = vm.data.entity;

        vm.initialize();
    }

    initialize() {
        let self = this;

        self.entity.setEvidenceMeta('eco', self.config.requestParams["evidence"]);
        self.annoton = new Annoton();
        self.entity = self.config.generateNode(self.data.entity.id);
        self.entity.copyValues(self.data.entity);
        self.annoton.addNode(self.entity);
        // self.annoton.gp = 
    }

    closeDialog() {
        this.$mdDialog.cancel();
    }

    saveAnnoton(annoton) {
        let self = this;

        let result = self.graph.saveAnnoton(annoton, true);
        self.$mdDialog.hide(result);
    }


}
EditAnnotonNodeDialogController.$inject = ['saeConstants', 'config', '$scope', '$rootScope', '$http', '$timeout', '$mdDialog', 'graph', 'lookup', 'formGrid', 'data'];