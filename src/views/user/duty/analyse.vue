<template>
  <div class="divBox">
    <el-card class="employees-card-bottom">
      <!-- 头部 -->
      <div class="flex-row flex-col">
        <div>
          <el-tabs v-model="activeVal" class="tabs" @tab-click="activeClick">
            <el-tab-pane label="我的工作分析" name="1" />
            <el-tab-pane label="下级工作分析" name="2" />
          </el-tabs>
        </div>
        <div v-if="activeVal == 2" class="flex pt10"></div>
      </div>
      <div class="splitLine mb20"></div>
      <!-- 我的工作分析 -->
      <div v-if="activeVal == 1" class="main">
        <div v-if="mineContent" class="detail-box">
          <div class="title">工作分析</div>
          <div class="content" v-html="mineContent" />
        </div>
        <div v-else>
          <default-page v-height :index="15" :min-height="580" />
        </div>
      </div>

      <!-- 下级工作分析表 -->
      <div v-if="activeVal == 2" class="table-box">
        <div class="inTotal">
          共 {{ totalSubmit }} 条
          <el-form :inline="true" class="from-s" @submit.native.prevent>
            <el-form-item class="select-bar">
              <el-input
                v-model="where.name"
                clearable
                placeholder="请输入姓名搜索"
                prefix-icon="el-icon-search"
                size="small"
                @change="getList(1)"
                @keyup.native.stop.prevent.enter="getList(1)"
              ></el-input>
            </el-form-item>
            <el-form-item class="select-bar">
              <el-select
                v-model="where.job_id"
                clearable
                filterable
                placeholder="请选择职位"
                size="small"
                @change="getList(1)"
                @keyup.native.stop.prevent.enter="getList(1)"
              >
                <el-option v-for="(item, index) in options" :key="index" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <el-table :data="tableData" :height="tableHeight" style="width: 100%">
          <el-table-column type="index" width="50" label="序号"> </el-table-column>
          <el-table-column label="人员姓名" prop="name"> </el-table-column>
          <el-table-column label="职位" prop="job.name"> </el-table-column>
          <el-table-column label="部门" prop="frame.name"> </el-table-column>
          <el-table-column label="更新时间" prop="updated_at"> </el-table-column>
          <el-table-column fixed="right" label="操作" width="130">
            <template slot-scope="scope">
              <el-button v-hasPermi="['user:duty:analyse:check']" size="small" type="text" @click="onCheck(scope.row)"
                >查看</el-button
              >
              <el-button
                v-if="scope.row.operate"
                v-hasPermi="['user:duty:analyse:edit']"
                size="small"
                type="text"
                @click="onEdit(scope.row)"
                >编辑</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <div class="page-fixed">
          <el-pagination
            :current-page="where.page"
            :page-size="where.limit"
            :page-sizes="[15, 20, 30]"
            :total="totalSubmit"
            layout="total,sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 查看 -->
    <el-drawer :before-close="handleClose" :visible.sync="checkDrawer" direction="rtl" size="60%" title="工作分析表">
      <div v-if="detailData" class="check-box">
        <div class="content mt14" v-html="detailData" />
      </div>
      <div v-else>
        <default-page v-height :index="14" :min-height="580" />
      </div>
    </el-drawer>
    <!-- 编辑 -->
    <el-drawer
      :before-close="handleClose"
      :visible.sync="editDrawer"
      :wrapperClosable="false"
      direction="rtl"
      size="60%"
      title="编辑工作分析表"
    >
      <div class="check-box">
        <div class="user-name">
          <span>人员姓名：</span>
          <span class="text">{{ userName }}</span>
        </div>
        <div class="boder">
          <component
            :is="loadEdit"
            ref="ueditorFrom"
            :border="true"
            :content="content"
            :height="height"
            @input="ueditorEdit"
          />
        </div>
      </div>
      <div class="button from-foot-btn fix btn-shadow">
        <el-button size="small" @click="editDrawer = false">{{ $t('public.cancel') }}</el-button>
        <el-button :loading="loading" size="small" type="primary" @click="handleConfirm">保存</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import ueditorFrom from '@/components/form-common/oa-wangeditor'
import defaultPage from '@/components/common/defaultPage'
import { jobSelectApi } from '@/api/config.js'
import { jobAnalysis, mineAnalysis, jobDetails, putAnalysis } from '@/api/user'
export default {
  name: 'CrmebOaEntDutyAnalyse',
  components: {
    defaultPage,
    ueditorFrom
  },
  data() {
    return {
      activeVal: '1',
      loading: false,
      userName: '',
      uid: '',
      where: {
        name: '',
        page: 1,
        limit: 15,
        job_id: ''
      },
      height: 'calc(100vh - 200px)',
      loadEdit: null,
      detailData: '',
      content: '',
      totalSubmit: 0,
      checkDrawer: false,
      editDrawer: false,
      tableData: [],
      mineContent: '',
      options: []
    }
  },

  mounted() {
    this.getMineAnalysis()
    this.getJobSelect()
  },
  methods: {
    activeClick() {
      if (this.activeVal == '1') {
        this.getMineAnalysis()
      } else {
        this.getList()
      }
    },

    // 获取列表
    async getList(val) {
      if (val == 1) {
        this.where.page = 1
      }
      const result = await jobAnalysis(this.where)
      this.tableData = result.data.list
      this.totalSubmit = result.data.count
    },
    // 获取职位下拉数据
    async getJobSelect() {
      const result = await jobSelectApi()
      this.options = result.data
    },

    // 获取我的工作分析
    async getMineAnalysis() {
      const result = await mineAnalysis()
      this.mineContent = result.data.data
    },

    handleSizeChange(val) {
      this.where.page = 1
      this.where.limit = val
      this.getList()
    },
    handleCurrentChange(page) {
      this.where.page = page
      this.getList()
    },

    // 查看下级工作分析
    onCheck(data) {
      this.getCheck(data.id)
      this.checkDrawer = true
    },

    // 列表工作分析内容
    getCheck(uid) {
      jobDetails(uid)
        .then((res) => {
          this.detailData = res.data.data
          this.loadEdit = ueditorFrom
        })
        .catch((err) => {
          this.detailData = ''
          this.loadEdit = ueditorFrom
        })
    },

    // 编辑下级工作分析
    onEdit(data) {
      this.userName = data.name
      this.uid = data.id
      this.editDrawer = true
      this.getCheck(data.id)
      setTimeout(() => {
        this.$refs.ueditorFrom.tabButton = true
        this.content = this.detailData
      }, 300)
    },

    // 保存编辑内容
    async handleConfirm() {
      this.loading = true
      let data = {
        data: this.content
      }
      const result = await putAnalysis(this.uid, data)
      if (result.status == 200) {
        this.editDrawer = false
        await this.getList()
      }
      this.loading = false
    },

    ueditorEdit(e) {
      this.content = e
    },

    handleClose() {
      this.editDrawer = false
      this.checkDrawer = false
    }
  }
}
</script>

<style lang="scss" scoped>
.inTotal {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .from-s {
    margin-left: 15px;
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
/deep/ .el-form-item {
  padding-bottom: 0;
}
.user-name {
  margin-top: 30px;
  margin-bottom: 20px;
}
.user-name > span {
  font-size: 13px;
  color: #909399;
}
.user-name .text {
  display: inline-block;
  font-size: 13px;
  color: #303133;
}

.main {
  width: 800px;
  margin: 0 auto;
}
.detail-box {
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  color: #666666;
  padding: 25px 34px 5px 34px;
  min-height: 580px;
  .title {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 20px;
  }
  .content {
    margin-top: 30px;
    /deep/ p {
      text-indent: 2em;
      font-size: 14px;
      line-height: 1.5;
    }
    /deep/ td {
      border: 1px solid;
    }
  }
}
.check-box {
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  color: #666666;
  padding: 0px 20px 0 24px;

  .content {
    /deep/ p {
      text-indent: 2em;
      font-size: 14px;
      line-height: 1.5;
    }
    /deep/ td {
      border: 1px solid;
    }
  }
}

/deep/ .el-form-item {
  padding-bottom: 0;
}

/deep/ .el-tabs__nav-wrap::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 0;
}
/deep/.el-select {
  width: 100%;
}
</style>
