<script>
/**新建实体表单数配置*/
const formDataInit = {
  table_name: '',
  table_name_en: '',
  crud_id: '',
  cate_ids: '',
  info: ''
}
// 新建实体表单验证
const formRules = {
  table_name: [
    {
      required: true,
      message: '请输入显示名称',
      trigger: 'blur'
    },
    {
      validator: function (rule, value, callback) {
        if (/^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z_]{0,15}$/.test(value) == false) {
          callback(new Error('以中文，英文字母开头，中间可输入下划线，最多可输入16个字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  table_name_en: [
    {
      required: true,
      message: '请输入实体名称',
      trigger: 'blur'
    },
    {
      validator: function (rule, value, callback) {
        if (/^[a-z][A-Za-z_]*$/.test(value) == false) {
          callback(new Error('英文小写字母开头，不可包含中文，数字，空格，中间可输下划线'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}
const formConfig = [
  {
    type: 'input',
    label: '显示名称：',
    placeholder: '以中文，英文字母开头，中间可输入下划线，最多可输入16个字',
    key: 'table_name'
  },
  {
    type: 'inputEn',
    label: '实体名称：',
    placeholder: '英文小写字母开头，不可包含中文，数字，空格，中间可输下划线',
    key: 'table_name_en',
    refresh: 'table_name'
  },
  {
    type: 'cascader',
    label: '所属主实体：',
    placeholder: '请搜索选择主实体',
    key: 'crud_id',
    props: { checkStrictly: true, label: 'table_name', value: 'id', emitPath: false },
    options: [],
    tips: '选择所属主实体，属于明细表仅支持字段设计'
  },
  {
    type: 'multipleSelect',
    label: '关联应用：',
    placeholder: '请搜索选择应用（可多选）',
    key: 'cate_ids',
    options: []
  },
  {
    type: 'textarea',
    label: '实体说明：',
    placeholder: '请输入实体说明',
    key: 'info'
  }
]

/**新建字段表单配置 */
const fieldDataInit = {
  crud_id: 0,
  value: '',
  field_name: '',
  field_name_en: '',
  is_default_value_not_null: 1, // 允许空值
  is_table_show_row: 1, // 列表默认显示
  create_modify: 1, // 新增时修改
  update_modify: 1, // 更新时修改
  comment: '',
  data_dict_id: '',
  association_crud_id: '', // 关联表id
  association_field_names: [],
  association_field_names_list: null
}
const fieldRules = {
  field_name: [
    {
      required: true,
      message: '请输入显示名称',
      trigger: 'blur'
    },
    {
      validator: function (rule, value, callback) {
        if (/^[\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z_]{0,15}$/.test(value) == false) {
          callback(new Error('以中文，英文字母开头，中间可输入下划线，最多可输入16个字'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  field_name_en: [
    {
      required: true,
      message: '请输入字段名称',
      trigger: 'blur'
    },
    {
      validator: function (rule, value, callback) {
        if (/^[a-z][A-Za-z_]*$/.test(value) == false) {
          callback(new Error('英文小写字母开头，不可包含中文，空格，中间可输入下划线'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  data_dict_id: [
    {
      required: true,
      message: '请选择关联字典',
      trigger: 'change'
    }
  ]
}
const options = [
  {
    label: 1,
    value: '是'
  },
  {
    label: 0,
    value: '否'
  }
]
const optionsAdd = [
  {
    label: 1,
    value: '允许编辑'
  },
  {
    label: 0,
    value: '不允许编辑'
  }
]
const optionsEdit = [
  {
    label: 1,
    value: '允许编辑'
  },
  {
    label: 0,
    value: '不允许编辑'
  }
]
const optionsNull = [
  {
    label: 0,
    value: '是'
  },
  {
    label: 1,
    value: '否'
  }
]

const inputMax = [
  {
    type: 'number',
    label: '内容最小长度:',
    key: 'minlength'
  },
  {
    type: 'number',
    label: '内容最大长度:',
    key: 'maxlength',
    tips: '内容最大长度不超过1000字',
    max: 1000
  }
]

const numberMax = [
  {
    type: 'number',
    label: '内容最小值:',
    key: 'min',
    min: -999999999
  },

  {
    type: 'number',
    label: '内容最大值:',
    key: 'max',
    max: 999999999
  }
]

const dictMax = [
  {
    type: 'select',
    label: '关联字典:',
    placeholder: '请搜索选择数据字典',
    key: 'data_dict_id',
    sign: 'dict',
    options: []
  }
]

// 字段段表单每个字段对应的中间动态内容
const keyValue = {
  input: [
    ...inputMax,
    {
      type: 'switch',
      label: '字段唯一:',
      key: 'is_uniqid',
      activeValue: 1,
      inactiveValue: 0,
      activeText: '开启',
      inactiveText: '关闭'
    }
  ],
  textarea: [
    ...inputMax,
    {
      type: 'number',
      label: '输入框行数:',
      placeholder: '',
      key: 'rows'
    }
  ],
  rich_text: [],
  input_number: [
    ...numberMax,
    {
      type: 'switch',
      label: '字段唯一:',
      key: 'is_uniqid',
      activeValue: 1,
      inactiveValue: 0,
      activeText: '开启',
      inactiveText: '关闭'
    }
  ],
  input_float: [
    {
      type: 'number',
      label: '小数位数:',
      placeholder: '',
      key: 'precision',
      max: 6,
      min: 0
    },
    ...numberMax,
    {
      type: 'switch',
      label: '字段唯一:',
      key: 'is_uniqid',
      activeValue: 1,
      inactiveValue: 0,
      activeText: '开启',
      inactiveText: '关闭'
    }
  ],
  input_percentage: numberMax,
  input_price: [
    {
      type: 'number',
      label: '小数位数:',
      placeholder: '',
      key: 'precision',
      max: 6,
      min: 0
    },
    ...numberMax,
    {
      type: 'switch',
      label: '字段唯一:',
      key: 'is_uniqid',
      activeValue: 1,
      inactiveValue: 0,
      activeText: '开启',
      inactiveText: '关闭'
    }
  ],
  radio: [...dictMax],
  cascader_radio: dictMax,
  cascader_address: [
    {
      type: 'radio',
      label: '地区选择数据:',
      key: 'is_city_show',
      options: [
        {
          label: 'city',
          value: '省份,城市'
        },
        {
          label: 'region',
          value: '省份，城市，地区'
        }
      ]
    }
  ],
  checkbox: [...dictMax],
  tag: dictMax,
  cascader: dictMax,
  image: [
    {
      type: 'number',
      label: '图片张数上限:',
      key: 'max'
    },
    {
      type: 'number',
      label: '单张大小上限:',
      key: 'size',
      tips: '单位：MB'
    }
  ],
  file: [
    {
      type: 'number',
      label: '文件个数上限:',
      key: 'max'
    },
    {
      type: 'number',
      label: '单个大小上限:',
      key: 'size',
      tips: '单位：MB'
    }
  ],
  input_select: [
    {
      type: 'input_select',
      label: '引用实体:',
      key: 'association_field_names'
    }
  ],
  switch: [],
  date_picker: [],
  date_time_picker: []
}

// 流程条件设置字段
const conditionConfig = {
  input: [
    {
      value: 'in',
      label: '包含'
    },
    {
      value: 'not_in',
      label: '不包含'
    },
    {
      value: 'eq',
      label: '等于'
    },
    {
      value: 'regex',
      label: '正则'
    },
    {
      value: 'not_eq',
      label: '不等于'
    },
    {
      value: 'is_empty',
      label: '为空'
    },
    {
      value: 'not_empty',
      label: '不为空'
    }
  ],
  switch: [
    // 布尔
    {
      value: 'eq',
      label: '等于'
    },

    {
      value: 'is_empty',
      label: '为空'
    },
    {
      value: 'not_empty',
      label: '不为空'
    }
  ],
  number: [
    // 整数、精度小数、百分比、金额
    {
      value: 'eq',
      label: '等于'
    },
    {
      value: 'gt',
      label: '大于'
    },
    {
      value: 'lt',
      label: '小于'
    },
    {
      value: 'regex',
      label: '正则'
    },
    {
      value: 'gt_eq',
      label: '大于等于'
    },
    {
      value: 'lt_eq',
      label: '小于等于'
    },
    {
      value: 'between',
      label: '区间'
    }
  ],
  select: [
    // 单选、多选、级联、地区、复选按钮

    {
      value: 'in',
      label: '包含'
    },
    {
      value: 'not_in',
      label: '不包含'
    },
    {
      value: 'is_empty',
      label: '为空'
    },
    {
      value: 'not_empty',
      label: '不为空'
    }
  ],
  date: [
    {
      value: 'eq',
      label: '等于'
    },
    {
      value: 'gt',
      label: '大于'
    },
    {
      value: 'lt',
      label: '小于'
    },
    {
      value: 'between',
      label: '区间'
    },
    {
      value: 'n_day',
      label: 'N天前'
    },
    {
      value: 'last_day',
      label: '最近N天'
    },
    {
      value: 'next_day',
      label: '未来N天'
    },
    {
      value: 'today',
      label: '今天'
    },
    {
      value: 'week',
      label: '本周'
    },
    {
      value: 'month',
      label: '本月'
    },
    {
      value: 'quarter',
      label: '本季度'
    }
  ],
  input_select: [
    {
      value: 'in',
      label: '包含'
    },
    {
      value: 'not_in',
      label: '不包含'
    },
    {
      value: 'is_empty',
      label: '为空'
    },
    {
      value: 'not_empty',
      label: '不为空'
    }
  ]
}

const fieldConfig = [
  {
    type: 'input',
    label: '显示名称:',
    placeholder: '以中文，英文字母开头，中间可输入下划线，最多可输入16个字',
    key: 'field_name'
  },
  {
    type: 'inputEn',
    label: '字段名称:',
    placeholder: '英文小写字母开头，不可包含中文，空格，中间可输入下划线',
    key: 'field_name_en',
    refresh: 'field_name'
  },
  {
    type: 'radio',
    label: '是否必填:',
    key: 'is_default_value_not_null',
    options: optionsNull
  },

  {
    type: 'radio',
    label: '新增时:',
    key: 'create_modify',
    options: optionsAdd
  },
  {
    type: 'radio',
    label: '编辑时:',
    key: 'update_modify',
    options: optionsEdit
  }
]

/**页面筛选类型*/

const searchTypeOptions = [
  {
    value: '0',
    label: '我查看的'
  },
  {
    value: '1',
    label: '我负责的'
  },
  {
    value: '2',
    label: '我创建的'
  }
]
export default {
  formDataInit,
  formRules,
  formConfig,
  fieldDataInit,
  fieldRules,
  fieldConfig,
  keyValue,
  conditionConfig,
  searchTypeOptions
}
</script>
