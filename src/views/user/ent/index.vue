<template>
  <div class="divBox">
    <el-card :body-style="{ padding: '0px 20px 20px 20px' }" class="normal-page">
      <div>
        <el-row>
          <el-col class="mt20" v-bind="gridl">
            <menu-tree ref="menuTree" :is-show-user-count="false" :tree-data="treeData" @frameId="getFrameId" />
            <div v-if="treeData.length == 0">
              <default-page :index="14" :min-height="400"></default-page>
            </div>
          </el-col>
          <el-col v-bind="gridr">
            <div class="table-container ml20">
              <div>
                <div class="header-16">
                  <div class="title-16">企业通讯录</div>
                </div>
                <div class="seach-box">
                  <div class="inTotal">共 {{ total }} 条</div>

                  <el-input
                    v-model="where.search"
                    clearable
                    placeholder="请输入姓名/手机号码"
                    prefix-icon="el-icon-search"
                    size="small"
                    style="width: 210px"
                    @change="getUserAddBookeList(1)"
                    @keyup.native.stop.prevent.enter="getUserAddBookeList(1)"
                  >
                  </el-input>
                </div>
                <div>
                  <el-table
                    :data="tableData"
                    :header-cell-style="{ background: '#f7fbff' }"
                    :height="tableHeight"
                    style="width: 100%"
                  >
                    <el-table-column label="姓名" prop="name" width="110" />
                    <el-table-column label="职位" min-width="150" prop="job.name" />
                    <el-table-column label="部门" min-width="150" prop="frame.name">
                      <template slot-scope="scope">
                        <div v-for="(item, index) in scope.row.frames" :key="index">
                          <span class="icon-h"
                            >{{ item.name }}
                            <span v-show="item.is_mastart === 1 && scope.row.frames.length > 1" title="主部门"
                              >(主)</span
                            >
                          </span>
                        </div>
                      </template>
                    </el-table-column>
                    <el-table-column label="联系方式" min-width="150" prop="phone" />
                    <el-table-column label="邮箱" min-width="150" prop="info.email" />
                  </el-table>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <div class="page-fixed">
          <el-pagination
            :current-page="where.page"
            :page-size="where.limit"
            :page-sizes="[15, 20, 30]"
            :total="total"
            layout="total, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="pageChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { userAddBookTree, userAddBookeList } from '@/api/user'
import menuTree from './components/menuTree'
import defaultPage from '@/components/common/defaultPage'
export default {
  name: 'Index',
  components: {
    menuTree,
    defaultPage
  },
  data() {
    return {
      isShowEdit: '',
      treeData: [],
      where: {
        page: 1,
        limit: 15,
        search: '',
        frame_id: '',
        field: ''
      },
      gridl: {
        xl: 3,
        lg: 4,
        md: 5,
        sm: 6,
        xs: 24
      },
      gridr: {
        xl: 21,
        lg: 20,
        md: 19,
        sm: 18,
        xs: 24
      },
      multipleSelection: [],
      total: 0,
      tableData: []
    }
  },
  mounted() {
    this.getUserAddBookTree()
  },
  methods: {
    async getUserAddBookTree() {
      const result = await userAddBookTree()
      this.treeData = result.data
      this.getUserAddBookeList()
    },
    async getUserAddBookeList(num) {
      this.where.page = num || this.where.page
      const result = await userAddBookeList(this.where)
      this.tableData = result.data.list
      this.total = result.data.count
    },
    pageChange(page) {
      this.where.page = page
      this.getUserAddBookeList()
    },
    handleSizeChange(val) {
      this.where.limit = val
      this.getUserAddBookeList()
    },
    confirmData(data) {
      this.where = Object.assign(this.where, data)
      this.getUserAddBookeList(1)
    },
    handleSearch() {
      this.getUserAddBookeList(1)
    },
    handleReset() {
      this.where.page = 1
      this.where.search = ''
      this.getUserAddBookeList(1)
    },
    getFrameId(data) {
      this.where.frame_id = data
      this.where.page = 1
      this.getUserAddBookeList()
    },
    // table 选中
    handleSelectionChange(val) {
      this.multipleSelection = val
    }
  }
}
</script>

<style lang="scss" scoped>
.iconzhuyaobumen {
  color: #ff9900;
}
.seach-box {
  margin-top: 8px;
  display: flex;
  align-items: center;
  .inTotal {
    margin-right: 15px;
  }
}
/deep/ .el-input__inner {
  display: flex;
  justify-content: start;
  align-items: end;
  line-height: 32px;
}

.table-box {
  .tips-wrapper {
    padding-left: 16px;
    border: 1px solid #ffe58f;
    background: #fffbe6;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }
  .btn-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 18px;
  }
}
.table-container {
  padding-top: 20px;
  /deep/ .el-form-item {
    margin-bottom: 0;
  }
}
.icon-h {
  position: relative;
  & > span {
    color: #1890ff;
  }
}
.icon {
  position: absolute;
  top: 0;
  right: -15px;
  display: inline-block;
  width: 13px;
  height: 13px;
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 13px;
  color: #fff;
  border-radius: 50%;
  background-color: #ff9900;
}
/deep/ .seach-box .el-input__clear {
  position: absolute;
  height: 100%;
  right: 0;
  top: -4px;
}
/deep/ .el-input__suffix {
  position: absolute;
  top: 5px;
}
</style>
