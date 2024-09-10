<template>
  <div class="divBox">
    <el-card :body-style="{ padding: '20px 20px 0 20px' }" class="normal-page">
      <oaFromBox
        :search="searchData"
        :title="$route.meta.title"
        :total="total"
        :isViewSearch="false"
        :sortSearch="false"
        :isAddBtn="false"
        class="mb20"
        @confirmData="confirmData"
      >
        <el-button slot="rightBtn" type="primary" size="small" class="h32" @click="getMessageSync">同步数据</el-button>
      </oaFromBox>
      <!-- <div class="from-s">
        <div class="flex-col">
          <el-button
            type="primary"
            class="mb14"
            :loading="loadBtn"
            size="small"
            v-hasPermi="['enterprise:news:add']"
            @click="getMessageSync()"
            >同步数据</el-button
          >
          <form-box ref="formBox" @confirmData="confirmData" />
        </div>
      </div>
      <div class="splitLine mb20"></div> -->

      <div class="table-box">
        <!-- <div class="inTotal">共有 {{ total }} 条</div> -->
        <el-table ref="table" :data="tableData">
          <el-table-column prop="title" label="消息标题" min-width="100" show-overflow-tooltip />
          <el-table-column prop="content" label="消息内容" min-width="240" show-overflow-tooltip />
          <el-table-column prop="cate_name" label="消息类型" min-width="100" show-overflow-tooltip />
          <el-table-column prop="verify" label="消息通知" min-width="100">
            <template slot-scope="scope">
              <el-switch
                v-if="scope.row.message_template[0]"
                v-model="scope.row.message_template[0].status"
                active-text="开启"
                inactive-text="关闭"
                @change="messageStatus(scope.row, 0)"
                :active-value="1"
                :inactive-value="0"
              />
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column prop="verify" label="短信通知" min-width="100">
            <template slot-scope="scope">
              <el-switch
                v-if="scope.row.message_template[1]"
                v-model="scope.row.message_template[1].status"
                active-text="开启"
                inactive-text="关闭"
                @change="messageStatus(scope.row, 1)"
                :active-value="1"
                :inactive-value="0"
              />
              <div v-else>--</div>
            </template>
          </el-table-column>
          <el-table-column prop="verify" label="可取消订阅" min-width="100">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.user_sub"
                active-text="开启"
                inactive-text="关闭"
                @change="messageSubscribe(scope.row)"
                :active-value="1"
                :inactive-value="0"
              />
            </template>
          </el-table-column>
          <el-table-column :label="$t('toptable.operation')" width="120" fixed="right">
            <template slot-scope="scope">
              <el-button
                v-hasPermi="['enterprise:news:edit']"
                v-if="scope.row.template_time === 1"
                type="text"
                @click="handleTime(scope.row)"
                >设置时间</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :page-size="where.limit"
          :current-page="where.page"
          :page-sizes="[10, 15, 20]"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>

    <message-times ref="messageTimes" :message-data="messageData" @isOk="getTableData" />
  </div>
</template>

<script>
import { messageListApi, messageStatusApi, messageSubscribeApi, messageSyncApi, messageCateApi } from '@/api/setting'
export default {
  name: 'Apply',
  components: {
    oaFromBox: () => import('@/components/common/oaFromBox'),
    formBox: () => import('./components/formBox'),
    messageTimes: () => import('./components/messageTimes')
  },
  data() {
    return {
      tableData: [],
      messageData: {},
      where: {
        page: 1,
        limit: 15,
        cate_id: '',
        title: ''
      },
      total: 0,
      loadBtn: false,
      loading: false,
      type: [0, 1],
      searchData: [
        {
          field_name: '标题/内容',
          field_name_en: 'title',
          form_value: 'input'
        },
        {
          field_name: '消息类型',
          field_name_en: 'cate_id',
          form_value: 'cascader_radio',
          data_dict: []
        }
      ]
    }
  },
  created() {
    this.where.limit = Math.floor((window.innerHeight - 320) / 56)
  },
  mounted() {
    this.getMessageCate()
    this.getTableData()
  },
  methods: {
    // 获取列表
    getTableData() {
      messageListApi(this.where).then((res) => {
        this.tableData = res.data.list
        this.total = res.data.count
        if (this.tableData && this.tableData.length > 0) {
          this.tableData.forEach((value) => {
            value.message_template.sort((a, b) => {
              return a.type - b.type
            }) //升序
          })
        }
      })
    },
    handleSizeChange(val) {
      this.where.limit = val
      this.getTableData()
    },
    pageChange(page) {
      this.where.page = page
      this.getTableData()
    },
    confirmData(data) {
      if (data == 'reset') {
        this.where.title = ''
        this.where.cate_id = ''
      } else {
        if (data.cate_id && Array.isArray(data.cate_id)) {
          data.cate_id = data.cate_id[data.cate_id.length - 1]
        }
        this.where = { ...this.where, ...data }
      }
      this.where.page = 1
      this.getTableData()
    },
    getMessageSync() {
      this.loadBtn = true
      messageSyncApi()
        .then((res) => {
          this.loadBtn = false
          this.where.page = 1
          this.getTableData()
        })
        .catch((error) => {
          this.loadBtn = false
        })
    },
    handleTime(row) {
      let type = ''
      if (
        row.template_type == 'clock_remind' ||
        row.template_type == 'clock_remind_after_work' ||
        row.template_type == 'remind_work_card_short'
      ) {
        type = 1
      }
      this.messageData = {
        width: '560px',
        title: '设置提醒时间',
        type,
        data: row
      }
      this.$refs.messageTimes.handleOpen()
    },
    //修改状态
    messageStatus(row, type) {
      messageStatusApi(row.id, type, { status: row.message_template[type].status })
        .then((res) => {
          this.getTableData()
        })
        .catch((error) => {
          row.message_template[type].status = !row.message_template[type].status
        })
    }, //修改状态
    messageSubscribe(row) {
      messageSubscribeApi(row.id, { status: row.user_sub })
        .then((res) => {
          this.getTableData()
        })
        .catch((error) => {
          row.row.user_sub = !row.user_sub
        })
    },
    getMessageCate() {
      messageCateApi().then((res) => {
        for (let i = 0; i < res.data.length; i++) {
          res.data[i].name = res.data[i].label
        }
        this.searchData[1].data_dict = res.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-table__row {
  height: 56px;
}
</style>
