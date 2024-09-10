<!-- @FileDescription: 公共-全局-筛选组件 -->
<template>
  <div>
    <div v-if="showHeader" class="header-16">
      <div class="title-16" @click="backFn">
        <span v-if="isBack" class="el-icon-arrow-left pointer"></span> {{ title }}
        <el-popover placement="right" popper-class="monitor-yt-popover" trigger="hover">
          <div class="prompt-bag">{{ alert }}</div>
          <i v-if="alert" slot="reference" class="el-icon-question"></i>
        </el-popover>
        <slot name="title"></slot>
      </div>
      <div class="flex lh-center">
        <slot name="rightBtn"></slot>
        <el-button
          v-if="isAddBtn && btnType !== 'default'"
          :icon="btnIcon ? 'el-icon-plus' : ''"
          :loading="loading"
          :type="btnText == '导出' ? '' : 'primary'"
          class="h32"
          size="small"
          @click="addDataFn()"
          >{{ btnText }}</el-button
        >
        <el-button v-if="btnType === 'default'" class="h32" size="small" @click="addDataFn()">{{ btnText }}</el-button>
        <div v-if="dropdownList.length > 0">
          <el-dropdown>
            <span class="iconfont icongengduo2 pointer ml10"></span>
            <el-dropdown-menu style="text-align: left">
              <el-dropdown-item v-for="item in dropdownList" :key="item.value" @click.native="dropdownSearch(item)">
                <span v-if="item.label !== '设置标签'">{{ item.label }}</span>
                <select-label
                  v-else
                  ref="selectLabel"
                  :ids="ids"
                  :props="{ children: 'children', label: 'name' }"
                  @handleLabelConf="handleLabelConf($event, item)"
                  :slotType="`customer`"
                >
                </select-label>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <!-- 搜索 -->
    <div class="search flex lh-center">
      <div class="flex lh-center">
        <el-select
          v-if="treeData.length"
          v-model="treeValue"
          class="grey-bga mr10"
          placeholder="请选择"
          popper-class="tree-select"
          size="small"
          style="width: 120px"
          @change="treeChange"
        >
          <el-option-group v-for="group in treeData" :key="group.label || group.id" :label="group.label">
            <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-option-group>
        </el-select>
        <div v-if="isTotal" class="total-16">共 {{ total }} 条</div>
        <formList
          v-if="seniorSearch.length > 0"
          ref="formList"
          :isTimeArray="false"
          :list="seniorSearch"
          :timeValue="timeVal"
          :type="type"
          @handleEmit="handleEmit"
          @resetSearch="resetSearch"
        ></formList>
      </div>
      <div class="right">
        <el-popover
          v-model="$store.state.business.conditionDialog"
          placement="bottom-start"
          popper-class="condition-popover"
          trigger="manual"
          width="750"
        >
          <!-- 高级筛选 -->
          <div class="condition-box">
            <div class="flex-between">
              <div class="title">筛选条件</div>
              <div class="el-icon-close pointer" @click="$store.state.business.conditionDialog = false"></div>
            </div>
            <condition-dialog
              v-if="$store.state.business.conditionDialog"
              :eventStr="`event`"
              :formArray="viewSearch"
              :max="9"
              :noRule="false"
              @saveCondition="saveCondition"
            ></condition-dialog>
          </div>
          <div v-if="isViewSearch" slot="reference" class="pointer text-16 el-dropdown-link" @click="onShow">
            筛选 <span class="iconfont icona-bianzu8"></span>
            <span v-if="additional_search.length > 0" class="yuan">{{
              additional_search ? additional_search.length : 0
            }}</span>
          </div>
        </el-popover>

        <!-- 时间排序 -->
        <el-popover ref="popover" placement="bottom" popper-class="time-popover" trigger="click" width="140">
          <div class="field-box">
            <div
              v-for="(item, index) in timeSearch"
              :key="index"
              :class="activeIndex == item.value ? 'field-bga' : ''"
              class="field-text"
              @click="handleClick(item, index)"
            >
              <span v-if="activeIndex == item.value" class="el-icon-check"></span>
              <span class="over-text">{{ item.name }}</span>
            </div>
          </div>
          <div class="field-box">
            <div
              v-for="(item, index) in sortList"
              :key="index"
              :class="sortIndex == item.value ? 'field-bga' : ''"
              class="field-text"
              @click="sortFn(item, index)"
            >
              <span v-if="sortIndex == item.value" class="el-icon-check"></span> {{ item.name }}
            </div>
          </div>

          <div v-if="sortSearch" slot="reference" class="text-16 paixuBox pointern">
            <span class="iconfont iconpaixu4"></span>
          </div>
        </el-popover>
      </div>
    </div>
  </div>
</template>
<script>
import formList from '@/views/develop/module/components/formList'
import conditionDialog from '@/components/develop/conditionDialog'
import selectLabel from '@/components/form-common/select-label'
export default {
  name: '',
  components: { formList, conditionDialog, selectLabel },
  props: {
    type: {
      type: String,
      default: ''
    },
    isBack: {
      // 返回图标
      type: Boolean,
      default: false
    },
    treeData: {
      type: Array,
      default: () => []
    },
    treeDefault: {
      type: [String, Number],
      default: ''
    },
    dropdownList: {
      type: Array, // 操作列表
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    },
    search: {
      type: Array, // 展开的筛选条件
      default: () => []
    },
    ids: {
      type: Array, // 父组件表格多选id集合
      default: () => []
    },
    viewSearch: {
      type: Array, // 高级筛选
      default: () => []
    },
    timeVal: {
      type: Array, // 默认时间区间
      default: () => []
    },
    isViewSearch: {
      type: Boolean,
      default: true
    },
    // 排序搜索
    sortSearch: {
      type: Boolean,
      default: true
    },
    isAddBtn: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    btnText: {
      type: String,
      default: '新增'
    },
    btnIcon: {
      type: Boolean,
      default: true
    },
    btnType: {
      type: String,
      default: ''
    },
    alert: {
      type: String,
      default: ''
    },
    isTotal: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      where: {
        sort_field: 'created_at',
        sort_value: ''
      },
      loading: false,
      seniorSearch: this.search,
      additional_search: [],
      filterData: [],
      sortList: [
        {
          name: '升序',
          value: 'asc'
        },
        {
          name: '降序',
          value: 'desc'
        },
        {
          name: '默认排序',
          value: ''
        }
      ],
      timeSearch: [
        {
          name: '创建时间',
          value: 'created_at'
        },
        {
          name: '修改时间',
          value: 'updated_at'
        }
      ],
      activeIndex: 'created_at',
      sortIndex: '',
      treeValue: ''
    }
  },
  watch: {
    search(val) {
      this.seniorSearch = val
    },
    treeDefault: {
      handler(val) {
        this.treeValue = val
      },
      immediate: true
    }
  },
  computed: {
    showHeader() {
      return this.title !== '' || this.isAddBtn || this.dropdownList.length > 0
    }
  },
  methods: {
    handleEmit(data) {
      this.where = { ...data }
      this.$emit('confirmData', this.where)
    },
    onShow() {
      this.$store.state.business.conditionDialog = true
    },

    backFn() {
      if (this.isBack) {
        this.$emit('backFn')
      }
    },
    resetSearch() {
      this.treeValue = ''
      this.where = {}
      this.additional_search = []
      let data = {
        list: [],
        type: '',
        additional_search_boolean: '0'
      }
      this.$store.commit('uadatefieldOptions', data)
      this.$emit('confirmData', 'reset')
    },
    addDataFn() {
      this.$emit('addDataFn')
    },
    dropdownSearch(item) {
      this.$emit('dropdownFn', item)
    },
    handleLabelConf(val, item) {
      this.$emit('dropdownFn', item, val)
    },
    handleClick(item, index) {
      this.where.sort_field = item.value

      this.activeIndex = item.value
      this.$emit('confirmData', this.where)
    },
    sortFn(item, index) {
      this.where.sort_value = item.value
      this.sortIndex = item.value
      this.$emit('confirmData', this.where)
    },
    // 高级筛选样式
    saveCondition(data) {
      this.additional_search = this.$store.state.business.fieldOptions.list
      let obj = {}
      if (this.additional_search == 0) {
        this.$store.state.business.fieldOptions.resetList.map((item) => {
          if (item.type === 'date_picker') {
            obj[item.field] = ''
          } else {
            obj[item.field] = ''
          }
        })
      } else {
        this.additional_search.map((item) => {
          if (item.type === 'date_picker') {
            obj[item.field] = item.option[0] + '-' + item.option[1]
          } else {
            obj[item.field] = item.option
          }
        })
      }

      this.$emit('confirmData', { ...this.where, ...obj })
    },
    treeChange(value) {
      this.$emit('treeChange', { value })
    }
  }
}
</script>
<style lang="scss" scoped>
.grey-bga {
  /deep/ .el-input__inner {
    border: none;
    background: #f7f7f7;
  }
}
.search {
  margin-top: 11px;
  display: flex;
  justify-content: space-between;
}
.title-16 {
  height: 32px;
}
.total-16 {
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  font-size: 13px;
  color: #909399;
  min-width: 50px;
  white-space: nowrap;
}
.right {
  display: flex;
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
    // margin-top: 4px;
  }
  .el-dropdown-link {
    height: 32px;
    padding: 0 10px;
    line-height: 32px;
    min-width: 64px;
  }
}
.el-icon-question {
  cursor: pointer;
  color: #1890ff;
  font-size: 15px;
}
.el-dropdown-link:hover {
  background: #f7f7f7;
}
.field-box {
  margin-top: 8px;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 8px;
}
.paixuBox {
  width: 25px;
  height: 32px;
  line-height: 32px;
  display: flex;
  justify-content: center;
  // align-items: center;
}
.paixuBox:hover {
  background: #f7f7f7;
}
.field-text {
  cursor: pointer;
  height: 32px;
  // background-color: pink;
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
.ml29 {
  margin-left: 29px;
}
.ml3 {
  margin-left: 3px;
}
.field-bga {
  color: #1890ff;
  background: rgba(24, 144, 255, 0.07);
}
.el-icon-check {
  position: absolute;
  left: 14px;
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
  padding-top: 5px;
  max-height: 350px !important;
  overflow-y: auto !important;
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
.icongengduo2 {
  font-size: 32px !important;
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
</style>
