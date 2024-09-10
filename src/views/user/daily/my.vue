<template>
  <!-- 我的汇报页面 -->
  <div class="divBox">
    <el-card class="employees-card-bottom">
      <!-- 填写日报 -->
      <div>
        <oaFromBox
          title="我的汇报"
          :isAddBtn="false"
          :search="search"
          :total="totalPage"
          :isViewSearch="false"
          @confirmData="confirmData"
        >
          <template class="box" slot="rightBtn">
            <el-dropdown size="small" type="primary" @command="handleDaily">
              <el-button type="primary" size="small" v-hasPermi="['user:daily:my:add']">{{ '填写汇报' }}</el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="(item, index) in dailyData" :key="item.id" :command="item.id">
                  {{ item.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <el-popover placement="bottom" trigger="click">
              <div class="popoverWidth">
                <calendar :calendar="calendar" @switchTime="switchTime" :tabType="tableFrom.type"> </calendar>
              </div>
              <span class="btn" slot="reference" type="text">
                <span class="iconfont icongengduo2"></span>
              </span>
            </el-popover>
          </template>
        </oaFromBox>
        <div class="mt-10" v-loading="loading">
          <el-table :data="tableData" ref="elTable" :height="tableHeight">
            <el-table-column prop="name" :label="$t('toptable.name')" width="90" />
            <el-table-column prop="frame_name" :label="$t('toptable.department')" min-width="100" />
            <el-table-column prop="finish" :label="$t('toptable.worktoday')" min-width="250">
              <template slot-scope="scope">
                <div class="textover3" v-for="(item, index) in scope.row.finish" :key="index">{{ item }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="plan" :label="$t('toptable.tomorrowplan')" min-width="250">
              <template slot-scope="scope">
                <div v-if="scope.row.types != 3">
                  <div class="textover3" v-for="(item, index) in scope.row.plan" :key="index">{{ item }}</div>
                </div>
                <span v-else>--</span>
              </template>
            </el-table-column>

            <el-table-column :label="$t('user.work.dailytype')" width="120">
              <template slot-scope="scope">
                {{ getDailyTypes(scope.row.types) }}
              </template>
            </el-table-column>

            <el-table-column prop="created_at" :label="$t('user.work.creationtime')" width="160" />

            <el-table-column
              :label="$t('public.operation')"
              :show-overflow-tooltip="true"
              fixed="right"
              :width="tableFrom.type == 0 ? 160 : 60"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  v-hasPermi="['user:daily:my:check']"
                  @click="onEdit(scope.row.daily_id, true, scope.row)"
                >
                  {{ $t('public.check') }}
                </el-button>

                <el-button
                  v-if="tableFrom.type == 0 && new Date(scope.row.end_time).getTime() > new Date().getTime()"
                  type="text"
                  @click="onCheck(scope.row.daily_id, false, scope.row)"
                >
                  {{ $t('public.edit') }}
                </el-button>

                <el-button
                  v-if="tableFrom.type == 0 && new Date(scope.row.end_time).getTime() > new Date().getTime()"
                  type="text"
                  @click="onDelete(scope.row.daily_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="page-fixed">
            <el-pagination
              :page-size="tableFrom.limit"
              :current-page="tableFrom.page"
              :page-sizes="[15, 20, 30]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="totalPage"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </el-card>
    <addBox
      ref="addBox"
      :edit-data="editData"
      :daily-id="dailyIndex"
      :edit-id="editId"
      @tableList="tableList"
      :needList="needList"
      :finishList="finishList"
      @updateValue="updateValue"
      @getDailyTodoInfo="getDailyTodoInfo"
    />
  </div>
</template>
<script>
import { getEnterpriseDaily, getEnterpriseUsersApi } from '@/api/enterprise'
import { deleteDailyApi, submitStatisticsApi, noSubmitListApi, scheduleListApi } from '@/api/user'
import addBox from './components/addBox'
import calendar from './components/calendar'

export default {
  name: 'IndexVue',
  components: {
    addBox,
    calendar,
    oaFromBox: () => import('@/components/common/oaFromBox')
  },
  data() {
    return {
      loading: false,
      currentTime: '',
      submitType: '1',
      value: new Date(),
      active: false,
      submitFrom: {
        page: 1,
        limit: 15
      },
      totalSubmit: 0,

      fromList: [
        { text: this.$t('toptable.all'), val: '' },
        { text: this.$t('toptable.thisweek'), val: 'week' },
        { text: this.$t('toptable.thismonth'), val: 'month' },
        { text: this.$t('toptable.lastmonth'), val: 'last month' }
      ],
      dailyData: [
        { name: this.$t('user.work.writedaily'), id: 1 },
        { name: this.$t('user.work.writedailyweek'), id: 2 },
        { name: this.$t('user.work.writedailymonth'), id: 3 },
        { name: '填写汇报', id: 4 }
      ],
      options: [
        { name: this.$t('user.work.dailyday'), id: 0 },
        { name: this.$t('user.work.weekday'), id: 1 },
        { name: this.$t('user.work.monthday'), id: 2 },
        { name: '汇报', id: 3 }
      ],

      weekInfo: '',
      dailyName: '',
      dailyIndex: 1,
      totalPage: 0,
      timeVal: [this.$moment().subtract(1, 'months').format('YYYY/MM/DD'), this.$moment().format('YYYY/MM/DD')],
      year: '',
      tableFrom: {
        page: 1,
        limit: 15,
        type: 0,
        types: 0,
        time: this.$moment().subtract(1, 'months').format('YYYY/MM/DD') + '-' + this.$moment().format('YYYY/MM/DD'),
        user_id: '',
        scope_frame: 'self'
      },
      table: [],
      total: '',
      submit: '',
      no_submit: '',
      calendar: [],
      disabled: false,
      pickerOptions: this.$pickerOptionsTimeEle,
      tableData: [],
      departmentalData: [],
      editId: 0,
      editData: {},
      nowDateStar: null, // 今天时间0点时间戳
      nowDateEnd: null, // 今天时间23:59:59 时间戳
      needList: [],
      finishList: '',
      time: this.$moment(new Date()).format('yyyy-MM-DD'),
      windowHeight: 0,
      search: [
        {
          field_name: '汇报类型',
          field_name_en: 'types',
          form_value: 'select',
          data_dict: [
            { name: this.$t('user.work.dailyday'), id: 0 },
            { name: this.$t('user.work.weekday'), id: 1 },
            { name: this.$t('user.work.monthday'), id: 2 },
            { name: '汇报', id: 3 }
          ],
          value: 0
        },
        {
          field_name: '开始时间',
          field_name_end: '结束时间',
          field_name_en: 'time',
          form_value: 'date_picker',
          data_dict: [this.$moment().subtract(1, 'months').format('YYYY/MM/DD'), this.$moment().format('YYYY/MM/DD')]
        }
      ]
    }
  },
  computed: {
    lang: function () {
      return this.$store.getters.lang
    }
  },
  watch: {
    lang() {
      this.setOptions()
    }
  },
  activated() {
    this.$refs.elTable.doLayout()
  },
  created() {
    this.windowHeight = window.innerHeight - 330
    this.getList()
    this.nowDateStar = parseInt(this.$moment(new Date()).startOf('day').format('x'))
    this.nowDateEnd = parseInt(this.$moment(new Date()).endOf('day').format('x'))
    this.dailyName = this.dailyData[this.dailyIndex - 1].name
    this.getUsersOption()
  },
  mounted() {
    this.getDate()
    this.getDailyTodoInfo()
  },
  methods: {
    updateValue(newVal) {
      this.finishList = newVal
    },
    confirmData(data) {
      if (data && data == 'reset') {
        this.tableFrom = {
          page: 1,
          limit: 15,
          type: 0,
          types: 0,
          time: this.$moment().subtract(1, 'months').format('YYYY/MM/DD') + '-' + this.$moment().format('YYYY/MM/DD'),
          user_id: '',
          scope_frame: 'self'
        }
        this.timeVal = [this.$moment().subtract(1, 'months').format('YYYY/MM/DD'), this.$moment().format('YYYY/MM/DD')]
        this.search[1].data_dict = this.timeVal
      } else {
        this.tableFrom = { ...this.tableFrom, ...data }
      }
      this.getList()
    },
    // 获取待办列表
    getDailyTodoInfo() {
      let start_time = this.$moment(this.time).format('YYYY-MM-DD') + ' 00:00:00'
      let end_time = this.$moment(this.time).format('YYYY-MM-DD') + ' 23:59:59'
      const data = {
        start_time: start_time,
        end_time: end_time,
        cid: [1, 2, 3, 4, 5, 6],
        period: 1
      }
      scheduleListApi(data).then((res) => {
        res.data.forEach((item) => {
          item['checked'] = false
        })
        this.needList = res.data.filter((item) => [0, 1, -1].includes(item.finish))
        let data = res.data
          .filter((item) => item.finish === 3)
          .map((item) => item.title)
          .join('\n')
        this.finishList = data
      })
    },
    // 获取日期
    getDate() {
      this.currentTime = this.$moment().subtract('day').format('YYYY-MM-DD') // 当天日期
      this.thePreviousDay = this.$moment().subtract(1, 'day').format('YYYY-MM-DD') // 前一天日期
      this.thePreviousDay = this.$moment(this.thePreviousDay).format('YYYY年MM月DD日') // 格式化日期
    },
    // 获取未提交的日历
    async submitStatisticsApi() {
      let data = {
        time: this.calendarTime,
        types: this.tableFrom.types,
        frame_id: this.tableFrom.frame_id,
        type: this.tableFrom.type == 0 ? '1' : '0'
      }
      const result = await submitStatisticsApi(data)
      this.calendar = result.data
    },
    onchangeTime() {
      this.tableFrom.page = 1
      if (this.timeVal) {
        this.tableFrom.time = this.timeVal[0] ? this.timeVal.join('-') : ''
      } else {
        this.tableFrom.time = ''
      }
      this.selectTypes()
    },

    // 切换日历月份触发的回调
    switchTime(data) {
      this.calendarTime =
        this.$moment(data.startTime).format('YYYY/MM/DD') + '-' + this.$moment(data.endTime).format('YYYY/MM/DD')
      this.submitStatisticsApi()
    },
    async getUsersOption() {
      const result = await getEnterpriseUsersApi()
      this.usersOption = result.data ? result.data : []
    },

    setOptions() {
      this.fromList = [
        { text: this.$t('toptable.all'), val: '' },
        { text: this.$t('toptable.thisweek'), val: 'week' },
        { text: this.$t('toptable.thismonth'), val: 'month' },
        { text: this.$t('toptable.lastmonth'), val: 'lastmonth' }
      ]
    },

    async getList() {
      this.loading = true
      const result = await getEnterpriseDaily(this.tableFrom)
      const data = result.data

      if (data.list.length) {
        data.list.forEach((el) => {
          el.isEdit = true
        })
      }
      this.totalPage = data.count
      this.tableData = data.list
      this.loading = false
    },

    tableList() {
      this.getList()
    },
    onEdit(id, type, data) {
      this.editId = id
      this.editData = data
      this.$refs.addBox.getInfo(id, type, data)
    },
    onCheck(id, type, data) {
      this.editId = id
      this.dailyIndex = data.types
      this.$refs.addBox.getInfo(id, type, data)
    },

    // 删除当日当周当月日报
    onDelete(id) {
      this.$modalSure('确认删除当前汇报').then(() => {
        deleteDailyApi(id).then((res) => {
          this.tableFrom.page = 1
          this.getList()
        })
      })
    },
    // 添加日报
    addDaily(val) {
      this.editId = 0
      this.editData = {}
      this.$refs.addBox.drawer = true
      this.$refs.addBox.editType = false
      this.$refs.addBox.approveApplyList()
      this.$refs.addBox.disabled
      this.disabled = this.$refs.addBox.disabled
    },
    handleClick() {
      this.tableFrom.page = 1
      this.tableFrom.user_id = ''

      this.getList()
    },

    // 获取未提交的汇报表格数据
    async noSubmitList() {
      let data = {
        time: this.leftTime,
        types: this.tableFrom.types,
        frame_id: this.tableFrom.frame_id,
        page: this.submitFrom.page,
        limit: this.submitFrom.limit
      }
      const result = await noSubmitListApi(data)
      this.totalSubmit = result.data.count
      this.table = result.data.list
    },

    // 搜索
    selectTypes() {
      if (this.tableFrom.types == 0) {
      }
      this.tableFrom.page = 1
      this.getList()
    },

    // 清空
    reset() {
      this.leftTime =
        this.$moment().subtract(1, 'day').format('YYYY/MM/DD') +
        '-' +
        this.$moment().subtract(1, 'day').format('YYYY/MM/DD')
      this.thePreviousDay = this.$moment().subtract(1, 'day').format('YYYY年MM月DD日')

      this.tableFrom.types = 0
      this.tableFrom.time =
        this.$moment().subtract(1, 'months').format('YYYY/MM/DD') + '-' + this.$moment().format('YYYY/MM/DD')
      this.tableFrom.user_id = ''
      this.tableFrom.frame_id = ''
      this.tableFrom.page = 1
      this.timeVal = [this.$moment().subtract(1, 'months').format('YYYY/MM/DD'), this.$moment().format('YYYY/MM/DD')]
      setTimeout(() => {
        this.$refs.week.removeStyle()
        this.$refs.week.value = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
      }, 300)

      this.getList()
    },

    getDailyTypes(type) {
      var str = ''
      this.options.map((value) => {
        if (value.id === type) {
          str = value.name
        }
      })
      return str
    },

    handleSizeChange(val) {
      this.tableFrom.page = 1
      this.tableFrom.limit = val
      this.getList()
    },
    handleCurrentChange(page) {
      this.tableFrom.page = page
      this.getList()
    },

    handleDaily(command) {
      this.dailyIndex = command
      this.dailyName = this.dailyData[command - 1].name
      this.addDaily('fillInTheReport')
    }
  }
}
</script>
<style scoped lang="scss">
.iconrili3 {
  font-size: 14px;
}
/deep/ .el-table th {
  background-color: #f7fbff;
}
.flex-btn {
  display: flex;
  align-items: center;
}

.box {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.tabs /deep/ .el-tabs__item {
  font-size: 13px;
}
.tabs {
  margin-bottom: 20px;
}

.popoverWidth {
  width: 316px;
  height: 350px;
}
.tips {
  display: flex;
  align-items: center;
  font-size: 13px;
  margin-left: 15px;
  font-family: PingFang SC-常规体, PingFang SC;
  font-weight: normal;
  color: #606266;
  .icontishi2 {
    color: #1890ff;
    margin-right: 4px;
  }
}

.color1 {
  color: #1890ff !important;
}
.color2 {
  color: #ed4014 !important;
}

.btn {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  padding: 0;
  line-height: 30px;
  .fz14 {
    font-size: 14px;
  }
}
.textover3 {
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 10;
  overflow: hidden;
  line-height: 1.5;
}

/deep/ .el-dropdown-menu__item {
  text-align: left;
  i {
    color: #00c050;
  }
}
/deep/ .el-dropdown__caret-button {
  height: 32px;
}

/deep/ .el-tabs__header {
  margin-bottom: 0;
}
/deep/ .el-tabs__nav-wrap::after {
  display: none;
}

.active-add {
  background-color: #f2f8fe;
}
.divBox .el-pagination {
  margin-top: 0;
}
</style>
