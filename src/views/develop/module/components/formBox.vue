<template>
  <div class="searchBox">
    <div class="flex-between mt20">
      <div class="title-16">{{ info.crudInfo ? info.crudInfo.table_name : '设计' }}列表</div>
      <div class="flex">
        <el-button type="primary" icon="el-icon-plus" size="small" @click="addData">新增</el-button>
        <div>
          <el-dropdown>
            <span class="iconfont icongengduo2 fz30 pointer"></span>
            <el-dropdown-menu style="text-align: left">
              <el-dropdown-item v-for="item in dropdownList" :key="item.value" @click.native="dropdownSearch(item)">
                {{ item.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="flex-box mt20">
      <div class="left">
        <div>
          <!-- 视图管理 -->
          <el-popover placement="bottom" ref="popoverType" width="140" trigger="click" popper-class="time-popover">
            <div class="field-box mb0">
              <div
                class="view-text"
                v-for="(item, index) in searchTypeOptions"
                :key="index"
                @click="typeClick(item, index)"
                :class="viewIndex == item.value ? 'field-color' : ''"
              >
                <span class="over-text">{{ item.label }}</span>
                <span class="tips">系统</span>
              </div>
              <div
                class="view-text"
                v-for="(item, indexT) in viewList"
                :key="indexT + 'a'"
                @click="viewClick(item)"
                :class="viewIndex == item.index ? 'field-color' : ''"
              >
                <span class="over-text">{{ item.senior_title }}</span>
                <span class="tips">{{ item.senior_type == 0 ? '个人' : '公共' }}</span>
              </div>
            </div>
            <div class="view-text" @click="openViewBox"><span class="iconfont iconshituguanli"></span>视图管理</div>

            <div class="view-box" slot="reference">
              <span class="over-text1">{{ viewText }}</span>
              <span class="el-icon-arrow-down"></span>
            </div>
          </el-popover>
        </div>
        <div class="inTotal">共 {{ total }} 项</div>
      </div>
      <!-- 动态筛选条件 -->
      <div class="center flex">
        <formList
          ref="formList"
          :is_develp="true"
          :list="info.seniorSearch"
          :type="where.show_search_type"
          @handleEmit="handleEmit"
          @resetSearch="resetSearch"
        ></formList>
      </div>

      <div class="right">
        <el-popover placement="bottom" trigger="click" width="117">
          <div>
            <div v-if="!['0', '1', '2'].includes(viewIndex)" @click="updateView" class="view-item">更新当前视图</div>
            <div class="view-item" :class="!['0', '1', '2'].includes(viewIndex) ? 'mt14' : ''" @click="addViewFn">
              存为新视图
            </div>
          </div>

          <div slot="reference" v-show="additional_search.length > 0" class="shitu">
            保存视图<span class="el-icon-arrow-down"></span>
          </div>
        </el-popover>

        <el-popover
          v-model="$store.state.business.conditionDialog"
          placement="bottom-start"
          width="750"
          trigger="manual"
        >
          <!-- 高级筛选 -->
          <div class="condition-box">
            <div class="flex-between">
              <div class="title">筛选条件</div>
              <div class="el-icon-close pointer" @click="$store.state.business.conditionDialog = false"></div>
            </div>
            <condition-dialog
              v-if="info.viewSearch && $store.state.business.conditionDialog"
              :eventStr="`event`"
              :max="9"
              :additionalBoolean="where.view_search_boolean"
              :formArray="info.viewSearch"
              @saveCondition="saveCondition"
            ></condition-dialog>
          </div>
          <div slot="reference" class="pointer mr10 text-16 el-dropdown-link" @click="onShow">
            筛选 <span class="iconfont icona-bianzu8"></span>
            <span class="yuan" v-if="additional_search.length > 0">{{
              additional_search ? additional_search.length : 0
            }}</span>
          </div>
        </el-popover>

        <!-- 时间排序 -->
        <el-popover placement="bottom" ref="popover" width="140" trigger="click" popper-class="time-popover">
          <div class="field-box">
            <div
              class="field-text"
              v-for="(item, indexl) in filterData"
              :key="indexl + 'b'"
              :class="activeIndex == item.value ? 'field-bga' : ''"
              @click="handleClick(item)"
            >
              <span v-if="activeIndex == item.value" class="el-icon-check"></span>
              <span class="over-text">{{ item.label }}</span>
            </div>
          </div>
          <div
            class="field-text"
            v-for="(item, indexJ) in sortList"
            :key="indexJ + 'c'"
            :class="sortIndex == item.value ? 'field-bga' : ''"
            @click="sortFn(item)"
          >
            <span v-if="sortIndex == item.value" class="el-icon-check"></span> {{ item.name }}
          </div>
          <div class="text-16 paixuBox pointer" slot="reference">
            <span class="iconfont iconpaixu4"></span>
          </div>
        </el-popover>
      </div>

      <!-- 条件筛选弹窗 -->
      <checkbox-dialog
        ref="checkboxDialog"
        :type="type"
        :max="max"
        :min="min"
        :title="title"
        :name="`所有字段`"
        :showName="`已展示字段`"
        @getData="getData"
      ></checkbox-dialog>
      <!-- 视图管理 -->
      <view-management
        ref="viewManagement"
        :keyName="keyName"
        :search_boolean="where.view_search_boolean"
        :senior_search="additional_search"
        :list="viewList"
        @getViewList="getViewList"
      ></view-management>
      <!-- 新建视图 -->
      <oa-dialog
        ref="oaDialog"
        :fromData="fromData"
        :formConfig="formConfig"
        :formRules="formRules"
        :formDataInit="formDataInit"
        @submit="submit"
      ></oa-dialog>
      <!-- 导出 -->
      <export-excel :template="false" :save-name="saveName" :export-data="exportData" ref="exportExcel" />
    </div>
  </div>
</template>
<script>
import formList from './formList'
import {
  crudModuleSaveApi,
  crudViewSaveApi,
  crudSeniorListApi,
  crudModuleListApi,
  crudSeniorSaveApi
} from '@/api/develop'
import oaDialog from '@/components/form-common/dialog-form'
import Commnt from '@/components/develop/commonData'
import exportExcel from '@/components/common/exportExcel'
import viewManagement from '@/components/develop/viewManagement'
import checkboxDialog from '@/components/develop/checkboxDialog'
import conditionDialog from '@/components/develop/conditionDialog'

export default {
  name: '',
  components: {
    formList,
    oaDialog,
    checkboxDialog,
    conditionDialog,
    viewManagement,
    exportExcel
  },
  props: {
    total: {
      type: Number,
      default: 0
    },
    id: {
      type: Number,
      default: 0
    },
    info: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    },
    keyName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isShow: false,
      viewShow: false,
      searchTypeOptions: Commnt.searchTypeOptions,
      title: '',
      max: 0,
      min: 0,
      sortIndex: '',
      viewText: '我查看的',
      viewIndex: '0',
      saveName: '',
      exportData: {
        data: [],
        cols: [{ wpx: 70 }, { wpx: 70 }, { wpx: 120 }, { wpx: 140 }, { wpx: 120 }]
      },
      fromData: {
        width: '500px',
        title: '新建视图',
        btnText: '确定',
        labelWidth: '100px',
        type: ''
      },
      formDataInit: {
        senior_title: '',
        senior_type: '0'
      },
      formConfig: [
        {
          type: 'input',
          label: '视图名称：',
          placeholder: '请输入视图名称(10个字以内)',
          key: 'senior_title'
        },
        {
          type: 'radio',
          label: '视图类型：',
          placeholder: '请选择视图类型',
          key: 'senior_type',
          options: [
            {
              value: '个人',
              label: '0'
            },
            {
              value: '公共',
              label: '1'
            }
          ]
        }
      ],
      formRules: {
        senior_title: [
          {
            required: true,
            message: '请输入视图名称',
            trigger: 'blur'
          },
          { min: 0, max: 10, message: '最多输入10个字', trigger: 'blur' }
        ],
        senior_type: [
          {
            required: true,
            message: '请选择视图类型',
            trigger: 'change'
          }
        ]
      },
      sortList: [
        {
          name: '升序',
          value: '1'
        },
        {
          name: '降序',
          value: '0'
        },
        {
          name: '默认排序',
          value: ''
        }
      ],
      dropdownList: [
        {
          label: '筛选条件设置',
          value: 2
        },
        {
          label: '表头显示设置',
          value: 3
        },
        {
          label: '批量删除',
          value: 1
        },
        {
          label: '导出',
          value: 4
        }
      ],
      where: {
        show_search_type: '0',
        view_search: [],
        order_by: {},
        scope_frame: 'all',
        view_search_boolean: ''
      },
      viewList: [],
      viewItem: {},
      activeIds: [],
      activeIndex: 0,
      searchType: 0,
      filterData: [],
      additional_search: [],
      additional_search_boolean: ''
    }
  },

  watch: {
    info: {
      handler(val) {
        if (val && val.orderByField) {
          this.saveName = '导出' + val.crudInfo.table_name + '.xlsx'
          this.filterData = val.orderByField.map((data) => {
            return {
              label: data.field_name,
              value: data.field_name_en,
              id: data.id || null,
              sortBy: 0,
              isChecked: false
            }
          })
        }
      },
      deep: true
    },
    // 给条件设置组装数据
    additional_search(val) {
      this.where.view_search = []
      val.map((item) => {
        let obj = {
          operator: item.value,
          form_field_uniqid: item.field,
          value: item.option,
          obj: item
        }
        if (!item.option && item.category === 2) {
          obj.value = []
          item.options.userList.map((i) => {
            obj.value.push(i.value)
          })
        } else if (!item.option && item.category === 1) {
          obj.value = []
          item.options.depList.map((i) => {
            obj.value.push(i.id)
          })
        }
        if (obj.operator === 'between') {
          if (item.type == 'date_time_picker' || item.type == 'date_picker') {
            let data = item.option[0] + '-' + item.option[1]
            obj.value = data
          } else {
            let data = {
              min: item.min,
              max: item.max
            }
            obj.value = data
          }
        }
        this.where.view_search.push(obj)
      })
      this.$emit('confirmData', this.where)
    },
    additional_search_boolean(val) {
      this.where.view_search_boolean = val
    }
  },

  mounted() {
    this.getViewList()
    this.confirmData()
  },

  methods: {
    addViewFn() {
      this.$refs.oaDialog.openBox()
      this.viewShow = false
    },
    // 新建视图
    submit(data) {
      data.sort = 0
      data.search_boolean = this.where.view_search_boolean
      data.senior_search = this.additional_search
      crudSeniorSaveApi(this.keyName, data).then((res) => {
        if (res.status == 200) {
          this.getViewList()
          this.$refs.oaDialog.handleClose()
        }
      })
    },
    // 获取实体管理数据
    getViewList(title) {
      let data = {
        title: title || ''
      }
      crudSeniorListApi(this.keyName, data).then((res) => {
        this.viewList = res.data
        this.viewList.forEach((item, index) => {
          item.index = index + 'view'
        })
      })
    },
    updateView() {
      let obj = {
        sort: 0,
        search_boolean: this.where.view_search_boolean,
        senior_search: this.additional_search,
        senior_title: this.viewItem.senior_title,
        senior_type: this.viewItem.senior_type,
        id: this.viewItem.id
      }
      crudSeniorSaveApi(this.keyName, obj).then((res) => {
        this.getViewList()
        this.viewShow = false
      })
    },

    openViewBox() {
      this.$refs.viewManagement.openBox()
    },
    viewClick(item) {
      this.viewIndex = item.index
      this.viewItem = item
      this.viewText = item.senior_title
      this.where.view_search_boolean = item.search_boolean
      this.additional_search = item.senior_search
      this.$refs.popoverType.doClose()
    },
    typeClick(item) {
      this.viewIndex = item.value
      this.viewText = item.label
      this.where.show_search_type = item.value
      this.confirmData()
      this.additional_search = []
      // let data = {
      //   list: [],
      //   type: '',
      //   additional_search_boolean: '0'
      // }
      // this.$store.commit('uadatefieldOptions', data)
      this.$refs.popoverType.doClose()
    },
    onShow() {
      let list = []
      if (this.where.view_search && this.where.view_search.length > 0) {
        this.where.view_search.map((item) => {
          list.push(item.obj)
        })
      } else {
        list = []
      }
      let data = {
        list,
        type: '',
        additional_search_boolean: this.where.view_search_boolean
      }
      if (this.where.view_search_boolean == '') {
        this.where.view_search_boolean = '0'
      }

      this.$store.commit('uadatefieldOptions', data)
      this.$store.commit('updateConditionDialog', true)
    },

    saveCondition() {
      this.additional_search = this.$store.state.business.fieldOptions.list
      this.where.view_search_boolean = this.$store.state.business.fieldOptions.additional_search_boolean
    },

    // 新增
    addData() {
      this.$emit('addData')
    },

    dropdownSearch(val) {
      if (val.value === 2) {
        this.max = 2
        this.min = 0
        this.title = '搜索显示设置'
        this.searchType = 2
        if (this.info.crudInfo.customField) {
          this.info.crudInfo.customField = this.info.crudInfo.customField.filter((item) => {
            return !['file', 'image'].includes(item.form_value)
          })
        }

        this.$refs.checkboxDialog.openBox(this.info.crudInfo, this.info.seniorSearch)
      } else if (val.value === 3) {
        this.max = 0
        this.min = 5
        this.title = '表头显示设置'
        this.searchType = 3
        this.info.crudInfo.customField = this.info.crudInfo.customField.filter((item) => {
          return !['file'].includes(item.form_value)
        })
        this.$refs.checkboxDialog.openBox(this.info.crudInfo, this.info.showField)
      } else if (val.value === 1) {
        this.$emit('handleDelete')
      } else if (val.value == 4) {
        // 导出
        if (this.total > 1000) {
          return this.$message.error('超出限制，最大支持导出1000条数据')
        }
        this.where.page = 0
        this.where.limit = 1000
        let list = []
        let aoaData = []
        let arr = []
        crudModuleListApi(this.keyName, this.where).then((res) => {
          list = res.data.list
          list.forEach((item) => {
            delete item['id']
          })
          this.info.showField.map((item) => {
            arr.push(item.field_name)
          })
          aoaData[0] = arr

          if (list.length > 0) {
            list.forEach((el) => {
              let elData = this.getVal(Object.values(el))
              aoaData.push(elData)
            })
          }

          this.exportData.data = aoaData
          this.$refs.exportExcel.exportExcel()
        })
      }
    },

    getVal(list) {
      let str = []
      list.map((val) => {
        if (val == '') {
          val = '--'
        } else if (Array.isArray(val)) {
          val = val.toString()
        } else {
          val = val || '--'
        }
        str.push(val)
      })
      return str
    },

    handleEmit(data) {
      this.where = { ...this.where, ...data }
      this.$emit('confirmData', this.where, this.keyName)
    },

    confirmData() {
      if (this.where.show_search_type != 0) {
        this.where.scope_frame = 'all'
      }
      this.$emit('confirmData', this.where)
    },

    // 点击排序
    handleClick(data) {
      this.activeIndex = data.value
      this.where.order_by = {}
      if (this.sortIndex == '') {
        this.where.order_by = {}
      } else {
        this.where.order_by[data.value] = this.sortIndex
      }
      this.$emit('confirmData', this.where)
    },
    sortFn(item) {
      this.sortIndex = item.value
      this.where.order_by = {}
      if (item.value == '') {
        this.where.order_by = {}
      } else {
        this.where.order_by[this.activeIndex] = item.value
      }
      this.$emit('confirmData', this.where)
    },

    getData(data) {
      let obj = {}
      if (this.searchType == 2) {
        obj.senior_search = data.ids
      } else if (this.searchType == 3) {
        obj.show_field = data.ids
      }
      if (this.type == 'view') {
        crudViewSaveApi(this.id, obj).then((res) => {
          this.$emit('getInfo')
          this.$emit('getList')
        })
      } else {
        crudModuleSaveApi(this.keyName, obj).then((res) => {
          this.$emit('getInfo')
          this.$emit('getList')
        })
      }
    },

    resetSearch() {
      this.where = {
        show_search_type: '0',
        view_search: [],
        order_by: {},
        scope_frame: 'all',
        view_search_boolean: '',
        keyword_default: ''
      }
      this.viewText = '我查看的'
      this.additional_search = []
      let data = {
        list: [],
        type: '',
        additional_search_boolean: '0'
      }
      this.$store.commit('uadatefieldOptions', data)
      if (this.info.seniorSearch.length == 0) {
        this.$emit('confirmData', this.where)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.title {
  font-size: 16px;
  font-weight: 500;
}

.fz30 {
  font-size: 30px;
  margin-left: 10px;
  color: #909399;
}
.ml14 {
  margin-left: 14px;
}
.inTotal {
  margin: 0 10px 0 10px;
}
.field-box {
  margin-top: 8px;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 8px;
}
.flex-box {
  width: 100%;
  display: flex;
  .left {
    display: flex;
    align-items: baseline;
    min-width: 170px;
  }
  .right {
    display: flex;

    .shitu {
      cursor: pointer;
      width: 85px;
      height: 32px;
      text-align: center;
      line-height: 32px;
      border-radius: 4px;
      border: 1px solid #1890ff;
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 13px;

      color: #1890ff;
    }

    .yuan {
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 12px;
      color: #909399;
    }
    .icona-bianzu8 {
      color: #999999;
      font-size: 13px;
    }
    .iconpaixu4 {
      color: #999999;
      font-size: 13px;
      margin-top: 4px;
    }
    .el-dropdown-link {
      height: 32px;
      padding: 0 10px;
      line-height: 32px;
    }
  }
  .el-dropdown-link:hover {
    background: #f3f3f3;
  }
  .paixuBox {
    width: 25px;
    height: 32px;
    line-height: 32px;
  }
  .paixuBox:hover {
    background: #f3f3f3;
  }
  .center {
    flex: 1;
  }
}
.grey-bga {
  /deep/ .el-input__inner {
    border: none;
    background: #f0f2f5;
  }
}

.paixuBox {
  width: 25px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.paixuBox:hover {
  background: #f7f7f7;
}
.field-text {
  cursor: pointer;
  height: 32px;
  width: 100%;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #303133;
  line-height: 32px;
  padding-right: 15px;
  padding-left: 29px;
  position: relative;
}
.field-text:hover {
  background-color: #f2f3f5;
}
.view-text {
  cursor: pointer;
  height: 32px;
  width: 100%;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #303133;
  line-height: 32px;
  padding-right: 16px;
  padding-left: 12px;
  position: relative;
  display: flex;
  align-items: center;
  .tips {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 12px;
    color: #909399;
  }
  .iconshituguanli {
    font-size: 12px;
    color: #909399;
    margin-right: 4px;
  }
}
.view-text:hover {
  background-color: #f2f3f5;
}
.mb0 {
  margin-bottom: 0;
}

.field-bga {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.07);
}
.field-color {
  color: #1890ff !important;
}
.el-icon-check {
  position: absolute;
  left: 10px;
  top: 11px;
}
.prompt-bag {
  background-color: #edf5ff;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #606266;
}

.condition-box {
  padding: 8px;
  max-height: 500px;
  overflow-y: auto;
  .flex-between {
    display: flex;
    // border-bottom: 1px solid hsl(223, 13%, 89%);
    padding-bottom: 15px;
  }
  .title {
    font-size: 14px;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 500;
    color: #333333;
  }
}
.condition-box::-webkit-scrollbar {
  height: 0;
  width: 0;
}
.over-text {
  display: inline-block;
  width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.view-item {
  cursor: pointer;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #303133;
}
</style>
<style>
.time-popover {
  padding: 0;
}
.monitor-yt-popover {
  background: #edf5ff;
  border: 1px solid #97c3ff;
  padding: 11px 15px 0px 15px;
}
.view-box {
  cursor: pointer;
  padding: 0 10px;
  width: 100px;
  height: 32px;
  background: #f7f7f7;
  border-radius: 4px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #1e2128;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.el-icon-arrow-down {
  /* margin-left: 6px; */
}
</style>
