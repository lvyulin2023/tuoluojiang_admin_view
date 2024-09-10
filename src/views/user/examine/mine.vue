<template>
  <div class="divBox">
    <!-- 我提交的 -->
    <el-card class="employees-card-bottom">
      <submission ref="submission" @get-content-value="getContentValue" />
    </el-card>

    <edit-examine v-if="isShow" ref="editExamine" @isOk="getTableData()" :typeNum="typeNum"></edit-examine>
  </div>
</template>

<script>
import { approveConfigSearchApi } from '@/api/business'
export default {
  name: 'Index',
  components: {
    submission: () => import('./components/mySubmission'),
    editExamine: () => import('./components/editExamine')
  },
  data() {
    return {
      isShow: false,
      pickerOptions: this.$pickerOptionsTimeEle,
      activeName: '1',
      examineActive: '1',
      examineName: '待审批',
      submitName: '提交类型',
      search: '',
      timeVal: '',
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
      ],
      typeNum: 1
    }
  },
  mounted() {
    this.getTableInfo('verify_status', 1)
  },
  methods: {
    // 重置
    restFn() {
      this.form.status = ''
      this.search = ''
      this.form.type = ''
      this.timeVal = ''
      this.getTableInfo('time', this.timeVal)
      this.getTableInfo('name', this.search)
      this.getTableInfo('status', this.form.status)
      this.getTableInfo('approve_id', this.form.type)
    },
    handleBuild(command) {
      this.isShow = true
      setTimeout(() => {
        const row = this.buildData[command]
        this.$refs.editExamine.isEdit = false
        this.$refs.editExamine.openBox(row)
      }, 300)
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
      const data = result.data ? result.data : []
      if (id === 0) {
        this.buildData = data
      }
      // 1、下级审批；3、我提交过的所有类型；
      if (id === 3 || id === 1) {
        this.typeData = data
        this.typeData.unshift({ name: '全部', id: '' })
      }
    },
    getTableData() {
      this.$refs.submission.getTableData()
    },
    handleExamine(e) {
      this.getTableInfo('verify_status', e.name)
    },
    getTableInfo(type, val) {
      setTimeout(() => {
        this.$refs.submission.where.page = 1
        this.$refs.submission.where[type] = val
        this.$refs.submission.getTableData()
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
      if (option) {
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
}
</script>

<style lang="scss" scoped>
.pb10 {
  padding-bottom: 10px;
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
/deep/ .el-date-editor--daterange.el-input__inner {
  width: 100%;
}
.submission-header {
  // margin: 0 -20px 0 -20px;
  border-bottom: 1px solid #eeeeee;
  /deep/ .el-row {
    margin: 0 20px;
    display: flex;
    align-items: center;
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
  width: 400px !important;
  /deep/ .el-tabs {
    width: 400px;
    background-color: pink;
  }
  /deep/ .el-tabs__header {
    margin-bottom: 0;
    width: 400px !important;
    background-color: pink;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 0;
  }
  /deep/ .el-tabs__item {
    margin-bottom: 10px;
  }
}
/deep/.from-s .flex-row .el-form-item {
  margin-left: 0;
  margin-right: 10px;
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
</style>
