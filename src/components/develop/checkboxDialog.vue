<!-- @FileDescription: 低代码-配置列表表头-tab-筛选条件-一对一的弹窗组件-->
<template>
  <div>
    <div class="flex">
      <el-dialog
        :visible.sync="dialogShow"
        width="760px"
        :before-close="handleClose"
        :modal="true"
        :show-close="false"
        :append-to-body="true"
        :close-on-click-modal="false"
      >
        <div slot="title" class="header">
          <span class="title">{{ title }}</span>
          <span class="el-icon-close pointer" @click="handleClose"></span>
        </div>
        <div class="flex-between mb14" v-if="showCrud">
          <div style="width: 90px">引用实体：</div>
          <el-select
            v-model="id"
            :disabled="edit"
            placeholder="请选择"
            size="small"
            style="width: 100%"
            filterable
            @change="getlistData"
          >
            <el-option v-for="item in options" :key="item.id" :label="item.table_name" :value="item.id">
              <span>{{ item.table_name }}({{ item.table_name_en }})</span>
            </el-option>
          </el-select>
        </div>

        <div class="container">
          <el-col :span="24" class="search-p">
            <div class="tree-box" v-if="this.type !== 'module' && this.type !== 'view'">
              <div class="title-num">{{ name }}（{{ list ? list.length : 0 }}）</div>
              <div class="mt14 box" v-if="list && list.length > 0">
                <div
                  v-for="(item, index) in list"
                  :key="index"
                  class="item mb10 over-text"
                  @click="handleClick(item, 'id')"
                >
                  <span
                    class="iconfont"
                    :class="ids.includes(item.id) ? 'icontongyong-gouxuanxuanzhongtubiao' : ' iconweigouxuan'"
                  ></span>
                  {{ item.field_name }}
                  <span v-if="showCrud">({{ item.field_name_en }})</span>
                </div>
              </div>
              <div v-else>
                <default-page :index="14" :min-height="220" />
              </div>
            </div>
            <!-- 条件设置弹窗 -->
            <div class="molude-box" v-else>
              <div class="title-num">{{ name }}（{{ totalNumber }}）</div>
              <div class="num mt14 mb10">系统字段</div>
              <div class="flex-wrap">
                <div
                  v-for="(item, index) in min == 5 ? crudInfo.systemListField : crudInfo.systemField"
                  :key="index"
                  class="item mb10 over-text"
                  @click="handleClick(item, 'field_name_en')"
                >
                  <span
                    class="iconfont"
                    :class="
                      ids.includes(item.field_name_en) ? 'icontongyong-gouxuanxuanzhongtubiao' : ' iconweigouxuan'
                    "
                  ></span>
                  {{ item.field_name }}<span v-if="type !== 'module'">({{ item.field_name_en }})</span>
                </div>
              </div>

              <div class="num mt14 mb10">自定义字段</div>
              <div class="flex-wrap">
                <div
                  v-for="(item, index) in min == 5 ? crudInfo.customListField : crudInfo.customField"
                  :key="index"
                  class="item mb10 over-text"
                  @click="handleClick(item, 'field_name_en')"
                >
                  <span
                    class="iconfont"
                    :class="
                      ids.includes(item.field_name_en) ? 'icontongyong-gouxuanxuanzhongtubiao' : ' iconweigouxuan'
                    "
                  ></span>
                  {{ item.field_name }} <span v-if="type !== 'module'">({{ item.field_name_en }})</span>
                </div>
              </div>
            </div>
          </el-col>
          <div class="select-box">
            <div class="title flex-between">
              <span class="title-num"
                >已展示字段（<span class="doc">{{ selectList ? selectList.length : 0 }}</span
                ><span v-if="max > 0">/{{ max }}</span
                >）</span
              >
              <span class="empty" @click="restFn">清空</span>
            </div>

            <div v-if="selectList" class="list-box">
              <draggable
                v-model="selectList"
                chosen-class="chosen"
                force-fallback="true"
                group="people"
                animation="1000"
              >
                <div v-for="(item, index) in selectList" :key="index" class="select-item">
                  <div class="left over-text">
                    <i class="icon iconfont icontuodong item-drag"></i>
                    <span>
                      {{ item.field_name
                      }}<span v-if="item.field_name_en && type !== 'module'"> ({{ item.field_name_en }})</span></span
                    >
                  </div>
                  <div class="right-box">
                    <span
                      v-if="showCrud && item.field_name_en !== 'id'"
                      class="el-icon-close"
                      @click="handleDelete(item, type == 'module' || type == 'view' ? 'field_name_en' : 'id')"
                    />
                  </div>
                </div>
              </draggable>
            </div>
          </div>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button size="small" @click="handleClose(1)">{{ $t('public.cancel') }}</el-button>
          <el-button size="small" type="primary" @click="handleConfirm">{{ $t('public.ok') }}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import defaultPage from '@/components/common/defaultPage'
import draggable from 'vuedraggable'
import { databaseListApi, dataFieldListApi } from '@/api/develop'
export default {
  name: 'Department',
  components: {
    draggable,
    defaultPage
  },
  props: {
    type: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: '所有字段'
    },
    showName: {
      type: String,
      default: '已选字段'
    },

    showCrud: {
      type: Boolean,
      default: false
    },
    ShowEn: {
      type: String,
      default: ''
    },
    max: {
      type: Number,
      default: 0
    },
    min: {
      type: Number,
      default: 0
    },

    title: {
      type: String,
      default: '引用实体设置'
    }
  },
  data() {
    return {
      edit: false,
      dialogShow: false,
      options: [], // 实体数据
      value: '',
      id: 0, // 实体id
      ids: [],
      selectList: [], // 选中的字段
      list: [], // 所有字段
      crudInfo: {}
    }
  },
  mounted() {
    if (this.type === 'field' && this.showCrud) {
      this.getList()
    }
  },
  computed: {
    totalNumber() {
      if (this.crudInfo.customListField && this.crudInfo.systemListField) {
        return this.crudInfo.systemListField.length + this.crudInfo.customListField.length
      } else {
        return 0
      }
    }
  },
  methods: {
    openBox(data, ids) {
      this.selectList = []
      this.ids = []
      if (this.type == 'field') {
        if (data && data.type == 'edit') {
          this.edit = true
        } else {
          this.edit = false
        }
        if (data && data.id) {
          this.id = data.id
          this.getlistData()
        }
        if (data && data.list && data.list.length > 0) {
          this.list = data.list
        }
        if (data && data.ids && data.ids.length > 0) {
          this.ids = data.ids.map(Number)
          this.selectList = data.selectList
        }
      } else if ((this.type == 'module' || this.type == 'view') && data) {
        if (ids) {
          this.selectList = ids
        }

        this.crudInfo = data
        if (this.selectList.length > 0) {
          this.selectList.map((item) => {
            this.ids.push(item.field_name_en)
          })
        }
      }
      if (this.showCrud && this.ids.length == 0 && !this.edit) {
        this.list.map((item) => {
          if (item.is_default == 1 && item.field_name_en == 'id') {
            this.ids.push(item.id)
            this.selectList.push(item)
          }
        })
      }
      this.dialogShow = true
    },
    // 选中数据
    handleClick(val, id) {
      if (this.showCrud && !this.edit && val.field_name_en == 'id') {
        return false
      }
      if (this.ids.includes(val[id])) {
        this.ids = this.ids.filter(function (item) {
          return item != val[id]
        })
        this.selectList = this.selectList.filter(function (item) {
          return item[id] != val[id]
        })
      } else {
        if (this.max > 0 && this.selectList.length >= this.max) {
          return this.$message.error(`最多只能选择${this.max}个字段`)
        }
        this.ids.push(val[id])
        this.selectList.push(val)
      }
    },

    // 删除数据
    handleDelete(val, str) {
      this.ids = this.ids.filter(function (item) {
        return item !== val[str]
      })
      this.selectList = this.selectList.filter(function (item) {
        return item[str] !== val[str]
      })
    },

    // 获取实体数据
    async getList() {
      const where = {
        cate_id: ''
      }
      const data = await databaseListApi(where)
      this.options = data.data.list
      if (!this.edit) {
        this.id = this.options[0].id
      }
      this.getlistData()
    },

    // 获取字段数据
    async getlistData() {
      const data = await dataFieldListApi(this.id)
      this.list = data.data

      if (this.showCrud && !this.edit) {
        this.ids = []
        this.selectList = []
        this.list.map((item) => {
          if (item.is_default == 1 && item.field_name_en == 'id') {
            this.ids.push(item.id)
            this.selectList.push(item)
          }
        })
      }
    },

    handleClose(val) {
      this.dialogShow = false
      this.edit = false
      this.ids = []
      this.selectList = []
    },
    // 清空
    restFn() {
      this.selectList = []
      this.ids = []
    },
    // 确认
    handleConfirm() {
      let ids = []
      this.selectList.map((item) => {
        if (this.type !== 'module' && this.type !== 'view') {
          ids.push(item.id)
        } else {
          ids.push(item.field_name_en)
        }
      })
      let data = {
        selectList: this.selectList,
        ids,
        id: this.id
      }
      if ((this.type === 'module' || this.type === 'view') && this.max > 0 && this.selectList.length > this.max) {
        return this.$message.error(`最多只能选择${this.max}个字段`)
      }
      if (this.min > 0 && this.selectList.length < this.min) {
        this.$message.error(`至少选择${this.min}个字段`)
        return false
      }

      this.$emit('getData', data)
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-size: 15px;
    font-family: PingFangSC-Medium, PingFang SC;
    font-weight: 600;
    color: #303133;
  }
  .el-icon-close {
    color: #c0c4cc;
    font-weight: 500;
    font-size: 14px;
  }
}

.search-p {
  padding: 20px 20px 0 20px;
  >>> .el-input-group__append {
    top: 0;
    background-color: transparent;
    border-left: none;
    text-align: center;
  }
}
.p20 {
  padding: 20px;
}
::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px #ddd;
  display: none;
}

::-webkit-scrollbar {
  width: 3px !important; /*对垂直流动条有效*/
}
/deep/.el-dialog__body {
  height: max-content;
}

.container {
  border: 1px solid #ececec;
  display: flex;
  min-height: 300px;

  .title {
    display: flex;
    justify-content: space-between;
    font-family: PingFang SC, PingFang SC;
    font-size: 14px;
    font-weight: 400;
    // margin-bottom: 35px;

    .num {
      font-family: PingFang SC, PingFang SC;
      font-weight: 500;
      font-size: 13px;
      color: #1e2128 !important;
    }
  }
  .select-box {
    width: 340px;
    padding: 20px 20px 0 20px;
    overflow-y: auto;
    height: initial;
    border-left: 1px solid #eeeeee;

    .list-box {
      .select-item {
        display: flex;
        justify-content: space-between;
        margin-top: 18px;
        cursor: pointer;
        .left {
          display: flex;
          font-size: 12px;
          font-family: PingFang SC, PingFang SC;
          font-weight: 400;
          color: #303133;
        }
      }
    }
  }
}

.item {
  width: 50%;
  cursor: pointer;
}
.icontongyong-gouxuanxuanzhongtubiao {
  color: #1890ff;
  font-size: 17px;
}
.iconweigouxuan {
  color: #cccccc;
}
.dialog-footer {
  padding-top: 68px;
}
.item-drag {
  font-size: 13px;
  margin-right: 4px;
  color: #909399;
}
.tree-box {
  height: 100%;
  width: 100%;
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
  overflow-y: auto;
  .box {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
}

.molude-box {
  width: 100%;
  overflow-y: auto;
  height: 100%;
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */

  .flex-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
}
/deep/ .el-dialog__footer {
  padding-top: 30px;
}
.title-num {
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 14px;
  color: #1e2128;
}
.empty {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
}
</style>
