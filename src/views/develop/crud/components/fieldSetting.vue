<template>
  <div>
    <div class="flex-between">
      <div class="title-16">字段列表</div>
      <el-popover placement="bottom" width="230" trigger="click">
        <el-input
          v-model="search"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="请输入关键字"
          clearable
          style="width: 100%"
          class="input"
        ></el-input>

        <el-scrollbar style="height: 500px" wrap-class="scrollbar-wrapper">
          <div class="line" v-for="(item, index) in searchList" :key="index">
            <div class="field-text" v-for="(i, index) in item.options" :key="index" @click="handleClick(i)">
              {{ i.label }} / {{ i.value }}
            </div>
          </div>
        </el-scrollbar>

        <el-button size="small" type="primary" slot="reference">新建字段<i class="el-icon-arrow-down"></i></el-button>
      </el-popover>
    </div>
    <!-- 筛选 -->
    <div class="flex mb10 h32">
      <div class="inTotal">共 {{ tableData.length }} 项</div>
      <div class="ml14">
        <el-input
          v-model="where.name"
          prefix-icon="el-icon-search"
          size="small"
          placeholder="请输入关键字"
          clearable
          style="width: 250px"
          @change="getList"
          @keyup.native.stop.prevent.enter="getList"
          class="input"
        ></el-input>
      </div>
    </div>
    <!-- 表格 -->
    <div class="table-box" v-loading="loading">
      <el-table row-key="id" :data="tableData" style="width: 100%">
        <el-table-column prop="field_name_en" label="字段名称" :min-width="150">
          <template slot-scope="scope">
            <span class="mr10"> {{ scope.row.field_name_en }}</span>
            <el-tooltip class="item" effect="dark" content="主键字段" placement="top-start">
              <el-tag class="ml4" size="mini" v-if="scope.row.field_name_en == 'id'">主</el-tag>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="系统字段" placement="top-start">
              <el-tag class="ml4" size="mini" type="warning" v-if="scope.row.is_default == 1">系</el-tag>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="主从字段" placement="top-start">
              <el-tag class="ml4" size="mini" type="info" v-if="scope.row.is_re_table > 0">从</el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="field_name" label="显示名称" />
        <el-table-column prop="form_value" label="字段类型" />
        <el-table-column prop="is_default_value_not_null" label="是否必填">
          <template slot-scope="scope">
            {{ scope.row.is_default_value_not_null > 0 ? '--' : '是' }}
          </template>
        </el-table-column>
        <el-table-column prop="data_dict_name" label="关联字典">
          <template slot-scope="scope">
            {{ scope.row.data_dict_name || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="association_crud_table_name" label="引用实体">
          <template slot-scope="scope">
            {{ getValue(scope.row.association_crud_table_name) }}
          </template>
        </el-table-column>

        <el-table-column prop="is_main" label="主字段展示">
          <template slot-scope="scope">
            <el-switch
              :width="60"
              @change="handleMain(scope.row)"
              :disabled="scope.row.form_value !== 'input' || scope.row.is_main == 1"
              v-model="scope.row.is_main"
              :active-value="1"
              :inactive-value="0"
              active-text="开启"
              inactive-text="关闭"
            >
            </el-switch>
          </template>
        </el-table-column>

        <!-- <el-table-column prop="table_name_en" label="系统字段">
          <template slot-scope="scope">
            {{ scope.row.is_default == 1 ? '是' : '--' }}
          </template>
        </el-table-column> -->
        <el-table-column prop="address" label="操作" fixed="right" width="170">
          <template slot-scope="scope">
            <el-button v-if="scope.row.is_default !== 1" type="text" @click="editFn(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.is_default !== 1" type="text" @click="deleteFn(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新建字段弹窗 -->
    <oa-dialog
      ref="oaDialog"
      :fromData="fromData"
      :formConfig="formConfig"
      :formRules="formRules"
      :formDataInit="formDataInit"
      @submit="submit"
    ></oa-dialog>
  </div>
</template>
<script>
import Commnt from '@/components/develop/commonData'
import oaDialog from '@/components/form-common/dialog-form'
import { getDictListApi } from '@/api/form'

import {
  dataFieldTypeApi,
  dataFieldListApi,
  dataFieldSaveApi,
  dataFieldDeleteApi,
  dataFieldInfoApi,
  dataFieldUpdateApi,
  dataFieldMainApi
} from '@/api/develop'

export default {
  name: '',
  components: { oaDialog },
  props: {
    infoData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      search: '',
      loading: false,
      total: 0,
      where: {
        name: ''
      },
      info: this.infoData,
      fromData: {
        width: '600px',
        title: '新建字段',
        btnText: '确定',
        labelWidth: '100px',
        type: ''
      },
      type: 'add',
      rowData: {},
      rowId: 0,
      formConfig: [],
      formRules: Commnt.fieldRules,
      formDataInit: Commnt.fieldDataInit,
      typesList: [], // 字段数据
      tableData: [], // 表格数据
      dictList: [], // 字典数据
      valueItem: [
        'crud_id',
        'value',
        'field_name',
        'field_name_en',
        'is_uniqid',
        'is_default_value_not_null', // 允许空值
        'is_table_show_row', // 列表默认显示
        'create_modify', // 新增时修改
        'update_modify', // 更新时修改
        'comment',
        'data_dict_id',
        'association_crud_id',
        'association_field_names',
        'association_field_names_list'
      ]
    }
  },

  mounted() {
    this.getTypeList()
    this.getList()
  },
  computed: {
    searchList: function () {
      let list = [
        {
          options: []
        }
      ]
      if (this.search !== '') {
        this.typesList.map((item) => {
          item.options.map((key) => {
            if (key.label.includes(this.search)) {
              list[0].options.push(key)
            }
          })
        })
      } else {
        list = this.typesList
      }
      return list
    }
  },
  methods: {
    // 获取字典列表
    async getDictList() {
      let data = {
        page: 1,
        limit: '',
        form_value: this.rowData.value
      }
      const result = await getDictListApi(data)
      if (result.data.list.length > 0) {
        this.dictList = result.data.list.filter((item) => {
          return item.status == 1
        })
      } else {
        this.dictList = []
      }
    },
    // 数组转成字符串
    getValue(val) {
      let str = ''
      if (val == '') {
        str = '--'
      } else if (Array.isArray(val)) {
        str = val.toString()
      } else {
        str = val
      }
      return str || '--'
    },

    // 获取全部字段类型
    async getTypeList() {
      const data = await dataFieldTypeApi()
      this.typesList = data.data
    },

    // 获取字段列表
    async getList() {
      this.loading = true
      const data = await dataFieldListApi(this.info.id, this.where)
      this.tableData = data.data
      this.loading = false
    },

    // 获取字段详情
    editFn(row) {
      this.rowId = row.id
      this.type = 'edit'
      if (['radio', 'cascader_radio', 'checkbox', 'cascader', 'tag'].includes(row.form_value)) {
        this.getDictList()
      }
      // 编辑回显数据
      dataFieldInfoApi(row.id).then((res) => {
        let obj = res.data.options
        for (let key in res.data) {
          if (this.valueItem.includes(key)) {
            this.formDataInit[key] = res.data[key]
          }
        }
        this.formDataInit.value = res.data.form_value
        this.formDataInit = { ...this.formDataInit, ...obj }
        this.fromData.title = `编辑字段`
        this.fromData.type = 'edit'
        let dynamicList = Commnt.keyValue[res.data.form_value]
        if (dynamicList) {
          dynamicList.forEach((item) => {
            if (item.sign == 'dict') {
              item.options = this.dictList
            }
          })
        } else {
          dynamicList = []
        }
        this.formConfig = []
        // 深拷贝是为了不修改原数组
        let config = JSON.parse(JSON.stringify(Commnt.fieldConfig))
        config.splice(2, 0, ...dynamicList)
        this.formConfig = config
        this.$refs.oaDialog.openBox()
      })
    },

    // 删除字段
    deleteFn(row) {
      this.$modalSure('您确定要删除此字段数据吗').then(() => {
        dataFieldDeleteApi(row.id).then((res) => {
          this.getList()
        })
      })
    },

    // 开启主展示字段
    handleMain(row) {
      if (row.is_main == 1) {
        dataFieldMainApi(row.id).then((res) => {
          this.getList()
        })
      }
    },

    // 新建字段弹窗
    handleClick(val) {
      this.type = 'add'
      this.rowData = val

      if (val.value == 'tag') {
        this.formRules.data_dict_id[0].required = false
      } else {
        this.formRules.data_dict_id[0].required = true
      }

      if (['radio', 'cascader_radio', 'checkbox', 'cascader', 'tag'].includes(val.value)) {
        this.getDictList()
      }

      this.formDataInit = {
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
      this.fromData.title = `新建字段-${val.label}`
      this.fromData.type = ''
      let dynamicList = Commnt.keyValue[val.value]

      setTimeout(() => {
        if (dynamicList) {
          dynamicList.forEach((item) => {
            if (item.sign == 'dict') {
              item.options = this.dictList
              item.tips = '标签类型仅支持二级数据'
            }
          })
        } else {
          dynamicList = []
        }
      }, 300)
      this.formConfig = []
      // 深拷贝是为了不修改原数组
      let config = JSON.parse(JSON.stringify(Commnt.fieldConfig))
      config.splice(2, 0, ...dynamicList)
      this.formConfig = config

      if (['image', 'file'].includes(val.value)) {
        this.formDataInit.max = 1
        this.formDataInit.size = 5
      }
      this.$refs.oaDialog.openBox()
    },

    // 新建/编辑字段弹窗回调
    submit(data) {
      data.value = this.rowData.value
      data.crud_id = this.infoData.id
      let oldData = {}
      let newData = {}
      for (let key in data) {
        if (this.valueItem.includes(key)) {
          oldData[key] = data[key]
        } else {
          newData[key] = data[key]
        }
      }
      const submitData = oldData
      submitData.options = newData

      if (this.type == 'edit') {
        dataFieldUpdateApi(this.rowId, submitData)
          .then((res) => {
            if (res.status == 200) {
              this.$refs.oaDialog.handleClose()
              this.getList()
            }
          })
          .catch((err) => {
            this.$message.error(err.message)
          })
      } else {
        dataFieldSaveApi(submitData)
          .then((res) => {
            if (res.status == 200) {
              this.$refs.oaDialog.handleClose()
              this.getList()
            }
          })
          .catch((err) => {
            this.$message.error(err.message)
          })
      }
    },
    pageChange(page) {
      this.where.page = page
      this.getList()
    },

    handleSizeChange(val) {
      this.where.limit = val
      this.getList()
    }
  }
}
</script>
<style scoped lang="scss">
.title {
  font-size: 16px;
  font-weight: 500;
}
.flex {
  margin: 10px 0;
  display: flex;
  align-items: center;
}
.h32 {
  height: 32px;
}
.line {
  border-bottom: 1px solid #e8ebf2;
  margin: 10px 0;
  padding-bottom: 10px;
}
.field-text {
  cursor: pointer;
  height: 32px;
  line-height: 32px;
  font-size: 13px;
  font-family: PingFangSC-Regular, PingFang SC;
}
.field-text:hover {
  background: #f7fbff;
  color: #1890ff;
}

/deep/ .el-scrollbar__wrap {
  overflow-x: hidden;
}
</style>
