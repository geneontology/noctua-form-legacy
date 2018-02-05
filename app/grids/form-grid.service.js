import _ from 'lodash';
const each = require('lodash/forEach');

export default class FormGridService {
  constructor(saeConstants, config, $timeout, lookup) {
    this.saeConstants = saeConstants
    this.config = config;
    this.$timeout = $timeout;
    this.lookup = lookup;
    this.annoton = this.config.createAnnotonModel(
      this.saeConstants.annotonType.options.simple.name,
      this.saeConstants.annotonModelType.options.default.name
    );

  }

  setAnnotonType(annoton, annotonType) {
    annoton.setAnnotonType(annotonType.name);

    const self = this;

    self.annoton = self.config.createAnnotonModel(
      annotonType.name,
      annoton.annotonModelType)
    self.initalizeForm();
  }

  setAnnotonModelType(annoton, annotonModelType) {
    const self = this;

    self.annoton = self.config.createAnnotonModel(
      annoton.annotonType,
      annotonModelType.name)
    self.initalizeForm();
  }

  getAnnotonPresentation(annoton) {
    const self = this;

    let result = {
      geneProduct: annoton.getNode('gp'),
      gp: {},
      fd: {},
    }

    each(annoton.nodes, function (node) {
      if (node.displaySection && node.displayGroup) {
        if (!result[node.displaySection.id][node.displayGroup.id]) {
          result[node.displaySection.id][node.displayGroup.id] = {
            shorthand: node.displayGroup.shorthand,
            label: node.displayGroup.label,
            nodes: []
          };
        }
        result[node.displaySection.id][node.displayGroup.id].nodes.push(node);
        node.nodeGroup = result[node.displaySection.id][node.displayGroup.id];
        if (node.isComplement) {
          node.nodeGroup.isComplement = true;
        }
      }
    });

    return result;

  }

  /**
   *  Populates the grid with GO Terms, MF, CC, BP as roots
   */
  initalizeForm() {
    const self = this;

    self.annotonPresentation = self.getAnnotonPresentation(this.annoton);

  }

  addGPNode(annoton) {
    const self = this;

    let id = 'gp-' + annoton.nodes.length;

    self.config.addGPAnnotonData(annoton, id);
  }

  initalizeFormData() {
    const self = this;

    this.annoton = this.config.createAnnotonModelFakeData();
    self.initalizeForm()

  }


  clearForm() {
    const self = this;


    self.annoton = self.config.createAnnotonModel(
      self.annoton.annotonType,
      self.annoton.annotonModelType
    )
    self.initalizeForm();
  }


}
FormGridService.$inject = ['saeConstants', 'config', '$timeout', 'lookup'];