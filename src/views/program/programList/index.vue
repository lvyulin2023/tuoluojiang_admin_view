﻿<!-- 项目-我的项目-项目列表页面 -->
<template>
  <div class="divBox bill-type">
    <el-card class="normal-page">
      <oaFromBox
        :isViewSearch="false"
        :search="search"
        :title="$route.meta.title"
        :total="total"
        :treeData="treeData"
        :treeDefault="treeDefault"
        btnText="新建项目"
        @addDataFn="addProgram"
        @confirmData="confirmData"
        @treeChange="treeChange"
      ></oaFromBox>

      <div class="mt10" v-loading="loading">
        <el-table
          :data="tableData"
          :header-cell-style="{ background: '#f7fbff' }"
          :height="tableHeight"
          default-expand-all
          row-key="id"
          style="width: 100%"
        >
          <el-table-column label="项目编号" prop="ident" width="120" />
          <el-table-column prop="name" label="项目名称" width="450">
            <template slot-scope="scope">
              <div class="flex">
                <i class="iconfont iconxiangmuguanli"></i>
                <div v-if="scope.row.name.length < 18" @click="goTask(scope.row)" class="point line1">
                  {{ scope.row.name || '- -' }}
                </div>
                <el-popover v-else placement="top" width="250" trigger="hover">
                  <div>{{ scope.row.name || '- -' }}</div>
                  <div slot="reference" style="max-width: 200px" @click="goTask(scope.row)" class="line1 point">
                    {{ scope.row.name || '- -' }}
                  </div>
                </el-popover>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="status" min-width="120">
            <template slot-scope="scope">
              <el-tag effect="plain" v-if="scope.row.status == 1" type="warning">已暂停</el-tag>
              <el-tag effect="plain" v-else-if="scope.row.status == 2" type="info">已关闭</el-tag>
              <el-tag effect="plain" v-else-if="scope.row.end_date && nowTime() > scope.row.end_date" type="danger"
                >已延期</el-tag
              >
              <el-tag effect="plain" v-else-if="scope.row.start_date && nowTime() < scope.row.start_date" type="success"
                >待开始</el-tag
              >
              <el-tag effect="plain" v-else>进行中</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="负责人" prop="admins" min-width="140">
            <template slot-scope="scope">
              <img :src="scope.row.admins[0].avatar" alt="" class="img" />
              <!--              <el-avatar size="small" :src="scope.row.admins[0].avatar" />-->
              <span>{{ scope.row.admins[0].name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="计划开始" prop="start_date" min-width="140">
            <template slot-scope="scope">
              <span>{{ scope.row.start_date || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="计划结束" prop="end_date" min-width="140">
            <template slot-scope="scope">
              <span>{{ scope.row.end_date || '--' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="未完成/总任务数" prop="task_statistics" min-width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.task_statistics"
                >{{ scope.row.task_statistics.incomplete }}/{{ scope.row.task_statistics.total }}</span
              >
              <span v-else>--</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="paginationClass page-fixed">
        <el-pagination
          :current-page="tableFrom.page"
          :page-size="tableFrom.limit"
          :page-sizes="[15, 20, 30]"
          :total="total"
          layout="total, sizes,prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
      </div>
    </el-card>

    <!-- 新建项目 -->
    <el-drawer
      :before-close="handleClose"
      :visible.sync="taskDrawer"
      :wrapper-closable="false"
      size="1120px"
      title="新建项目"
    >
      <add-program
        v-if="taskDrawer"
        ref="addProgram"
        :customer="customerList"
        :type="`edit`"
        @getTableData="getTableData"
        @handleClose="handleClose"
      />
    </el-drawer>
  </div>
</template>

<script>
import { getProgramListApi, deleteProgramApi } from '@/api/program'
import { customerSelectApi, selectContractListApi } from '@/api/enterprise'
import { roterPre } from '@/settings'

export default {
  name: 'programList',
  components: {
    oaFromBox: () => import('@/components/common/oaFromBox'),
    addProgram: () => import('./components/addProgram'),
    taskDrawer: () => import('../programTask/index'),
    dynamicsDrawer: () => import('./dynamics')
  },
  data() {
    return {
      loading: false,
      tableData: [],
      tableFrom: {
        page: 1,
        limit: 15,
        types: 0,
        status: '',
        admins: [],
        scope_frame: 'all',
        scope_normal: 0,
        eid: [],
        cid: []
      },
      total: 0,
      customerList: [],
      contractList: [],
      taskDrawer: false,
      taskTitle: '',
      programId: 0,
      treeData: [
        {
          options: [
            {
              value: 0,
              label: '全部项目'
            },
            {
              value: 1,
              label: '我负责的'
            },
            {
              value: 2,
              label: '我参与的'
            },
            {
              value: 3,
              label: '我创建的'
            }
          ]
        }
      ],
      search: [
        {
          field_name: '项目名称',
          field_name_en: 'name',
          form_value: 'input'
        },
        {
          field_name: '状态',
          field_name_en: 'status',
          form_value: 'select',
          data_dict: [
            {
              value: 5,
              name: '已延期'
            },
            {
              value: 4,
              name: '进行中'
            },
            {
              value: 3,
              name: '待开始'
            },
            {
              value: 1,
              name: '已暂停'
            },
            {
              value: 2,
              name: '已关闭'
            }
          ]
        },
        {
          field_name: '关联客户',
          field_name_en: 'eid',
          form_value: 'checkbox',
          props: {
            collapseTags: true
          },
          data_dict: []
        },
        {
          field_name: '关联合同',
          field_name_en: 'cid',
          form_value: 'checkbox',
          props: {
            disabled: true,
            collapseTags: true,
            value: []
          },
          data_dict: []
        },
        {
          form_value: 'manage'
        }
      ],
      treeDefault: 0
    }
  },
  watch: {
    // 'tableFrom.eid'(val) {
    //   if (this.search.length > 0) {
    //     for (let i = 0; i < this.search.length; i++) {
    //       if (this.search[i].field_name_en == 'cid') {
    //         this.search[i].props.disabled = !val.length
    //         this.search[i].data_dict = []
    //         break
    //       }
    //     }
    //   }
    //   if (val.length) {
    //     this.getContractList(val)
    //   }
    // }
  },
  created() {
    this.getCustomer()
  },
  mounted() {
    this.getTableData()
  },
  methods: {
    handleClose() {
      this.taskDrawer = false
    },
    nowTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0') // 月份从0开始计数，所以加1，然后用padStart保证两位数
      const day = now.getDate().toString().padStart(2, '0') // 日期使用padStart保证两位数
      let nowData = `${year}-${month}-${day}`
      return nowData
    },

    // 获取表格数据
    async getTableData(tableFrom, type) {
      this.loading = true
      let data = tableFrom ? tableFrom : this.tableFrom
      const res = await getProgramListApi(data)
      this.tableData = res.data.list
      this.total = res.data.count
      this.loading = false
      if (type === 1) {
        this.programId = res.data.list[0].id
        this.taskTitle = res.data.list[0].name
        this.taskDrawer = false
      }
    },
    addProgram() {
      this.taskDrawer = true
    },
    addTask() {
      this.$refs.taskDrawerRef.addProgram()
    },
    batchOperation() {
      this.$refs.taskDrawerRef.batchOperation()
    },
    // 获取客户数据
    async getCustomer() {
      const result = await customerSelectApi()
      this.customerList = result.data
      for (let i = 0; i < this.search.length; i++) {
        if (this.search[i].field_name_en == 'eid') {
          this.search[i].data_dict = result.data
          break
        }
      }
    },
    getContractList(eid) {
      if (eid) {
        this.getContract(eid)
      }
    },
    // 获取合同数据
    async getContract(eid) {
      const result = await selectContractListApi({ data: eid })
      this.contractList = result.data
      for (let j = 0; j < result.data.length; j++) {
        result.data[j].value = result.data[j].id
        result.data[j].name = result.data[j].title
      }
      for (let i = 0; i < this.search.length; i++) {
        if (this.search[i].field_name_en == 'cid') {
          this.search[i].data_dict = result.data
          break
        }
      }
    },
    pageChange(page) {
      this.tableFrom.page = page
      this.getTableData()
    },
    handleSizeChange(val) {
      this.tableFrom.limit = val
      this.getTableData()
    },
    // 编辑项目
    handleEdit(row, type) {
      this.$refs.addProgram.openBox(row.id, type)
    },
    // 项目动态
    goDynamics(row) {
      this.programId = row.id
      this.$refs.dynamicsDrawer.drawer = true
      // this.$router.push(`${roterPre}/program/programList/dynamics?id=${row.id}`)
    },
    // 项目任务
    goTask(row) {
      this.$router.push(`${roterPre}/program/programList/taskDetails?id=${row.id}`)
    },
    // 删除项目
    handleDelete(row) {
      this.$modalSure('删除项目，同时会删除项目中的工作项！你确定要删除该项目吗').then(() => {
        deleteProgramApi(row.id).then((res) => {
          this.getTableData()
          this.$refs.addProgram.handleClose()
        })
      })
    },
    async setPayStatus(row, status) {
      var data = {
        id: row.id,
        name: row.name,
        status
      }
      await enterprisePayTypeStatusApi(data)
      this.getTableData()
    },
    confirmData(data) {
      if (data == 'reset') {
        this.tableFrom = {
          page: 1,
          limit: 15,
          types: [],
          name: '',
          status: '',
          eid: [],
          cid: []
        }
      } else {
        this.tableFrom = data
      }

      this.getTableData(this.tableFrom)
    },
    treeChange(data) {
      this.tableFrom.types = data.value
      this.getTableData(this.tableFrom)
    }
  }
}
</script>

<style lang="scss" scoped>
.bill-type {
  .header {
    display: flex;
    justify-content: space-between;
    span {
      font-size: 18px;
      line-height: 32px;
      color: #303133;
    }
  }
  .text-right {
    text-align: right;
  }
  .el-radio {
    margin-right: 15px;
  }
  .title {
    font-size: 15px;
    font-weight: 600;
    margin-left: 10px;
    position: relative;
    &:after {
      content: '';
      height: 100%;
      width: 3px;
      background-color: #1890ff;
      position: absolute;
      left: -10px;
      top: 0;
    }
  }
}
.img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
  vertical-align: top;
  margin-right: 4px;
}
/deep/.el-table .cell {
  line-height: 26px;
}
.point {
  cursor: pointer;
  &:hover {
    color: #1890ff;
  }
}
.iconxiangmuguanli {
  color: #ff9900;
  margin-right: 4px;
}
.more {
  margin-left: 10px;
}
.btn-box {
  display: flex;
  justify-content: space-between;
  span {
    font-size: 18px;
    line-height: 32px;
    color: #303133;
  }
  .fz30 {
    font-size: 30px;
    margin-left: 14px;
    margin-right: 8px;
    color: #909399;
    font-weight: 400;
  }
}
/deep/.el-drawer__header {
  padding: 10px 24px 10px 20px;
  font-size: 14px;
}
.flex-between {
  height: 32px;
}
</style>
