<template>
  <div class="divBox">
    <!-- 我审批的 -->
    <el-card class="employees-card-bottom">
      <div class="submission-header">
        <el-form :inline="true" class="from-s">
          <div class="flex-row flex-col">
            <div>
              <div class="submission-tab">
                <el-tabs v-model="examineActive" @tab-click="handleExamine">
                  <el-tab-pane
                    v-for="(item, index) in examineTabData"
                    :key="item.id"
                    :label="item.name"
                    :name="item.id"
                    lazy
                  ></el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </div>
        </el-form>
      </div>

      <div class="splitLine"></div>
      <examine ref="examine" @get-content-value="getContentValue" :examineActive="examineActive"></examine>
    </el-card>
    <edit-examine ref="editExamine" @isOk="getTableData()"></edit-examine>
  </div>
</template>

<script>
import { approveConfigSearchApi } from '@/api/business'
import 'animate.css'
export default {
  name: 'Index',
  components: {
    examine: () => import('./components/examine'),
    editExamine: () => import('./components/editExamine')
  },
  data() {
    return {
      pickerOptions: this.$pickerOptionsTimeEle,
      showForm: false,
      showText: '展开',
      activeName: '2',
      examineActive: '1',
      examineName: '待审批',
      submitName: '提交类型',
      search: '',
      timeVal: '',
      where: {
        name: '',
        time: ''
      },
      fileSortData: [
        { name: '全部', id: '' },
        { name: '待审核', id: 0 },
        { name: '已通过', id: 1 },
        { name: '已拒绝', id: 2 },
        { name: '已撤销', id: -1 }
      ],
      form: {
        status: '',
        type: ''
      },
      typeData: [],
      buildData: [],
      examineTabData: [
        { name: '待审批', id: '1' },
        { name: '全部', id: '5' },
        { name: '已处理', id: '2' },
        { name: '抄送我的', id: '3' },
        { name: '已撤销', id: '4' }
      ]
    }
  },
  created() {
    this.getConfigSearch(1)
  },
  mounted() {
    this.getTableInfo('verify_status', 1)
  },
  methods: {
    // 重置
    restFn() {
      this.timeVal = ''
      this.form.status = ''
      this.search = ''
      this.form.type = ''
      setTimeout(() => {
        this.$refs.examine.restFn()
      }, 300)
    },
    // 点击展开收起
    openFn() {
      if (this.showForm === false) {
        this.showText = '收起'
        this.showForm = true
      } else if (this.showForm === true) {
        this.showText = '展开'
        this.showForm = false
      }
    },
    handleBuild(command) {
      const row = this.buildData[command]
      this.$refs.editExamine.isEdit = false
      this.$refs.editExamine.openBox(row)
    },
    handleCommand(command) {
      this.examineName = this.fileSortData[command].name
      const status = this.fileSortData[command].id
      this.getTableInfo('status', status)
    },
    handleStatus() {
      this.getTableInfo('status', this.form.status)
    },
    // 选择类型
    handleType() {
      this.getTableInfo('approve_id', this.form.type)
    },
    // 选择时间区域
    reset() {
      this.search = ''
      this.timeVal = ''
      this.form.type = ''
      this.form.status = ''
      this.getTableInfo()
    },
    onchangeTime(e) {
      let time = ''
      if (e == null) {
        time = ''
      } else {
        this.timeVal = e
        time = this.timeVal[0] + '-' + this.timeVal[1]
      }
      this.getTableInfo('time', time)
    },
    handleSearch() {
      this.getTableInfo('name', this.search)
    },
    async getConfigSearch(id) {
      const result = await approveConfigSearchApi(id)
      this.typeData = result.data ? result.data : []
      this.typeData.unshift({ name: '全部', id: '' })
    },
    getTableData() {
      this.$refs.submission.getTableData()
    },
    handleExamine(e) {
      this.getTableInfo('verify_status', e.name)
    },
    getTableInfo(type, val) {
      setTimeout(() => {
        this.$refs.examine.where[type] = val
        this.$refs.examine.where.page = 1
        this.$refs.examine.getTableData()
      }, 200)
    },
    getContentValue(row, callback) {
      let str = ''
      if (row.content.type === 'input' || row.content.type === 'inputNumber') {
        str = row.content.title + ' : ' + row.value
      } else if (row.content.type === 'radio' || row.content.type === 'select') {
        str = row.content.title + ' : ' + this.getRadioValue(row.value, row.content.options)
      } else if (row.content.type === 'timeFrom') {
        str =
          '开始时间 : ' +
          row.value.dateStart +
          ' 结束时间 : ' +
          row.value.dateEnd +
          ' ' +
          row.content.props.titleIpt +
          ' : ' +
          row.value.duration
      }
      callback(str)
    },
    getRadioValue(value, option) {
      let str = ''
      for (let i = 0; i < option.length; i++) {
        if (value == option[i].value) {
          str = option[i].label
          break
        }
      }
      return str
    }
  }
}
</script>

<style lang="scss" scoped>
.pb10 {
  padding-bottom: 10px;
}
.splitLine {
  margin-bottom: 20px;
}
.header {
  /deep/ .el-tabs--card > .el-tabs__header {
    border-bottom: none;
    margin-bottom: 0;
  }
  /deep/ .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
    border-bottom-color: transparent;
    background-color: #fff;
  }
}
.open {
  width: 62px;
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;

  text-align: center;
  font-size: 13px;
  line-height: 32px;
  color: #303133;

  cursor: pointer;
}
.iconzhankai1 {
  font-size: 13px;
  color: #909399;
}
.right-text {
  display: inline-block;
  transform: rotate(180deg);
}
/deep/ .el-date-editor--daterange.el-input__inner {
  width: 100%;
}
.submission-header {
  /deep/ .el-row {
    .icon-name {
      display: inline-block;
    }
    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      text-align: right;
    }
  }
}
.submission-tab {
  /deep/ .el-tabs__header {
    margin-bottom: 0;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 0;
  }
}
/deep/ .el-dropdown-menu__item {
  text-align: center;
}
.head-box {
  display: inline-block;
  .input {
    width: 260px;
    margin: 0 0 0 10px;
  }
  /deep/ .el-input-group__append {
    top: 0;
    .el-button {
      background-color: #1890ff;
      color: #ffffff;
      border-radius: 0 3px 3px 0;
      border: none;
    }
  }
}
/deep/ .el-dropdown-menu__item {
  width: 150px;
  text-align: left;
}
/deep/.el-form-item__content {
  flex: 1;
}
/deep/ .el-form-item {
  margin-bottom: 20px;
}
</style>
<style lang="scss">
.build-dropdown {
  max-height: 300px;
  overflow: auto;
  overflow-x: hidden;
}
.build-dropdown::-webkit-scrollbar {
  /*width: 0;宽度为0隐藏*/
  width: 8px;
  height: 4px;
}
.build-dropdown::-webkit-scrollbar-thumb {
  border-radius: 5px;
  height: 8px;
  background: rgba(0, 0, 0, 0.2); //滚动条颜色
}
.build-dropdown::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background: #eee; //滚动条背景色
}
.form-top-line {
  height: 1px;
  border-bottom: 1px solid #f0f2f5;
  width: 0%;
  transition: width 0.2s ease;
}
.form-top-line._show {
  width: 100%;
}
</style>
