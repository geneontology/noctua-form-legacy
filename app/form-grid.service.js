import _ from 'lodash';

export default class FormGridService {
  constructor(saeConstants, $timeout, lookup) {
    this.saeConstants = saeConstants
    this.$timeout = $timeout;
    this.lookup = lookup;


    this.baseFormGroup = {
      'term': {
        'control': {
          'placeholder': '',
          'value': ''
        },
        'lookup': {
          'requestParams': this.lookup.requestParamsGP
        }
      },
      'evidence': {
        'control': {
          'placeholder': '',
          'value': ''
        },
        'lookup': {
          'requestParams': this.lookup.requestParamsEvidence
        }
      },
      'reference': {
        'control': {
          'placeholder': '',
          'value': ''
        }
      },
      'with': {
        'control': {
          'placeholder': '',
          'value': ''
        }
      }
    };

    this.gridApi = null;
    this.columnDefs = [{
      name: 'label',
      displayName: '',
      width: '25%',
      field: 'label',
      resizable: false,
      cellTemplate: './grid-templates/label-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
      cellTooltip: function (row, col) {
        return row.entity.tooltip ? row.entity.tooltip : row.entity.label;
      },
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'term',
      displayName: 'Term',
      width: 200,
      field: 'term',
      resizable: false,
      cellTemplate: './grid-templates/term-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'Evidence',
      field: 'Evidence.label',
      originalName: 'Evidence',
      displayName: 'Evidence',
      minWidth: 200,
      cellTemplate: './grid-templates/evidence-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'reference',
      displayName: 'Reference',
      width: 120,
      field: 'reference',
      resizable: false,
      cellTemplate: './grid-templates/reference-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }, {
      name: 'with',
      displayName: 'With',
      width: 120,
      field: 'with',
      resizable: false,
      cellTemplate: './grid-templates/with-cell-template.html',
      headerCellTemplate: './grid-templates/header-cell-template.html',
      enableCellEdit: false,
      enableCellSelection: false,
      enableCellEditOnFocus: false,
      enableSorting: false,
      allowCellFocus: false,
      enableHiding: false,
      enableColumnMenu: false
    }];

    this.gridOptions = {
      noTabInterference: false,
      rowHeight: 41,
      width: 100,
      minWidth: 100,
      enableCellSelection: false,
      // rowEditWaitInterval: -1,
      enableCellEdit: false,
      enableCellEditOnFocus: false,
      multiSelect: false,
      rowTemplate: './grid-templates/row-template.html',
      showTreeExpandNoChildren: false,
      showTreeRowHeader: true,
      // keyDownOverrides: [{keyCode: 27}]
      columnDefs: this.columnDefs,
      data: []
    };

  }

  registerApi() {
    const self = this;
    self.gridOptions.onRegisterApi = function (gridApi) {
      self.gridApi = gridApi;

      self.$timeout(function () {
        self.gridApi.core.handleWindowResize();
      }, 0);
    };
  }

  createAnnotonModel() {
    const self = this;

    let data = [{
        'id': 'gp',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsGP
          }
        },
        'meta': {
          'edge': {}
        }
      },
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'mf',
        'label': 'Molecular Function',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsMF
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.enabledBy,
            'target': self.geneProduct,
          }
        },
        $$treeLevel: 0
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'mf-1',
        'label': 'Has Input (Gene Product/Chemical)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsGP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'mf',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'mf-2',
        'label': 'Happens During (Temporal Phase)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.happensDuring,
            'targetId': 'mf',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'bp',
        'label': 'Biological Process',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'mf'
          }
        },
        $$treeLevel: 0
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'bp-1',
        'label': 'Part Of (BP)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'bp',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'bp-1-1',
        'label': 'Part Of (BP)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'bp-1'
          }
        },
        $$treeLevel: 2
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'cc',
        'label': 'Cellular Component',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsCC
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.occursIn,
            'targetId': 'mf'
          }
        },
        $$treeLevel: 0
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'cc-1',
        'label': 'Part Of (Cell Type)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'cc',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'cc-1-1',
        'label': 'Part Of (Anatomy)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'cc-1',
          }
        },
        $$treeLevel: 2
      })
    ];

    for (var row of data) {
      if (row.meta.edge && row.meta.edge.targetId) {
        row.meta.edge.target = _.find(data, {
          id: row.meta.edge.targetId
        });
      }
    }

    return data;


  }

  getNode(data) {
    let result = [];
    for (var row of data) {
      result = _.find(data, {
        id: row.id
      });
    }
    return result;
  }

  insertNode(id, key, value) {
    let node = null;
    for (var row of data) {
      result = _.find(data, {
        id: row.id
      });
    }

    if (node) {
      node[key].id = value;
    }
  }

  getNode(annotonModel, id) {
    let node = null;
    node = _.find(annotonModel, {
      id: id
    });

    return node;
  }

  insertTermNode(annotonModel, id, value) {
    let node = null;
    node = _.find(annotonModel, {
      id: id
    });

    if (node) {
      node.term.control.value = value;
    }
  }

  insertEvidenceNode(annotonModel, id, value) {
    let node = null;
    node = _.find(annotonModel, {
      id: id
    });

    if (node) {
      node.evidence.control.value = value.evidence;
      node.reference.control.value = value.reference;
      node.with.control.value = value.with;
    }
  }

  /**
   *  Populates the tree grid with GO Terms, MF, CC, BP as roots
   */
  initalizeForm() {
    const self = this;
    self.geneProduct = {
      'id': 'gp',
      'term': {
        'control': {
          'placeholder': '',
          'value': ''
        },
        'lookup': {
          'requestParams': this.lookup.requestParamsGP
        }
      }
    };
    let data = [
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'mf',
        'label': 'Molecular Function',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsMF
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.enabledBy,
            'target': self.geneProduct,
          }
        },
        $$treeLevel: 0
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'mf-1',
        'label': 'Has Input (Gene Product/Chemical)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsGP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'mf',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'mf-2',
        'label': 'Happens During (Temporal Phase)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.happensDuring,
            'targetId': 'mf',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'bp',
        'label': 'Biological Process',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'mf'
          }
        },
        $$treeLevel: 0
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'bp-1',
        'label': 'Part Of (BP)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'bp',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'bp-1-1',
        'label': 'Part Of (BP)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'bp-1'
          }
        },
        $$treeLevel: 2
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'cc',
        'label': 'Cellular Component',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsCC
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.occursIn,
            'targetId': 'mf'
          }
        },
        $$treeLevel: 0
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'cc-1',
        'label': 'Part Of (Cell Type)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'cc',
          }
        },
        $$treeLevel: 1
      }),
      Object.assign({}, JSON.parse(JSON.stringify(this.baseFormGroup)), {
        'id': 'cc-1-1',
        'label': 'Part Of (Anatomy)',
        'term': {
          'control': {
            'placeholder': '',
            'value': ''
          },
          'lookup': {
            'requestParams': this.lookup.requestParamsBP
          },
        },
        'meta': {
          'edge': {
            'name': self.saeConstants.edge.partOf,
            'targetId': 'cc-1',
          }
        },
        $$treeLevel: 2
      })
    ];

    for (var row of data) {
      if (row.meta.edge && row.meta.edge.targetId) {
        row.meta.edge.target = _.find(data, {
          id: row.meta.edge.targetId
        });
      }
    }

    self.gridOptions.data = data;


  }

  clearForm() {
    this.initalizeForm();
  }


  /**
   * Expands all nodes. Expanded state is the default on initialization 
   */
  expandAll() {
    const self = this;
    self.$timeout(function () {
      self.gridApi.treeBase.expandAllRows();
    });
  }

}
FormGridService.$inject = ['saeConstants', '$timeout', 'lookup'];