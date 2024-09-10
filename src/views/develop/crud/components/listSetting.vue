<template>
  <div>
    <formBox
      v-if="keyName"
      :total="total"
      :info="info"
      :type="`view`"
      :keyName="keyName"
      :id="id"
      @getInfo="getInfo"
      @getList="getList"
      @confirmData="confirmData"
      @addData="addData"
      @handleDelete="handleDelete"
    ></formBox>

    <!-- 表格数据 -->
    <div class="table-box mt10" v-loading="loading" v-if="info.showField && info.showField.length > 0">
      <el-table
        :data="tableData"
        style="width: 100%"
        :height="height"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" min-width="55" show-overflow-tooltip> </el-table-column>
        <el-table-column
          v-for="(item, index) in info.showField"
          :prop="item.field_name_en"
          :label="item.field_name"
          :key="index"
          :width="
            [
              'input_percentage',
              'tag',
              'image',
              'textarea',
              'checkbox',
              'date_picker',
              'date_time_picker',
              'cascader',
              'cascader_address'
            ].includes(item.form_value)
              ? 200
              : ''
          "
        >
          <template slot-scope="scope">
            <div v-if="item.form_value === 'image'" class="img-box">
              <img
                v-for="(val, index) in scope.row[item.field_name_en]"
                :key="index"
                :src="val.url"
                alt=""
                class="img"
                @click="lookViewer(val.url, val.name)"
              />
              <span v-if="!scope.row[item.field_name_en] || scope.row[item.field_name_en].length == 0">--</span>
            </div>
            <div v-else-if="item.form_value === 'input_percentage'">
              <el-progress
                :percentage="scope.row[item.field_name_en] ? scope.row[item.field_name_en] : 0"
              ></el-progress>
            </div>
            <div v-else-if="item.form_value === 'tag' || item.form_value === 'checkbox'">
              <el-popover
                v-if="scope.row[item.field_name_en] && scope.row[item.field_name_en].length > 2"
                placement="top-start"
                trigger="hover"
              >
                <template>
                  <div class="flex_box">
                    <div class="tips" v-for="(val, index) in scope.row[item.field_name_en]" :key="index">
                      <el-tag size="small">
                        {{ val }}
                      </el-tag>
                    </div>
                  </div>
                </template>
                <div slot="reference">
                  <div class="flex_box">
                    <div class="tips" v-for="(val, index) in scope.row[item.field_name_en]" :key="index">
                      <el-tag size="small" v-if="index < 2">
                        {{ val }}
                      </el-tag>
                    </div>
                    <el-tag
                      v-if="scope.row[item.field_name_en] && scope.row[item.field_name_en].length > 2"
                      size="small"
                      >...</el-tag
                    >
                  </div>
                </div>
              </el-popover>
              <template v-else>
                <div class="flex_box">
                  <div class="tips" v-for="(val, index) in scope.row[item.field_name_en]" :key="index">
                    <el-tag size="small" v-if="index < 2">
                      {{ val }}
                    </el-tag>
                  </div>
                  <el-tag v-if="scope.row[item.field_name_en] && scope.row[item.field_name_en].length > 2" size="small"
                    >...</el-tag
                  >
                </div>
              </template>
              <span v-if="!scope.row[item.field_name_en] || scope.row[item.field_name_en].length == 0">--</span>
            </div>
            <div v-else-if="item.form_value === 'switch'">
              <el-switch
                disabled
                v-model="scope.row[item.field_name_en]"
                :active-value="1"
                :inactive-value="0"
                active-text="开启"
                inactive-text="关闭"
              >
              </el-switch>
            </div>
            <div v-else-if="item.form_value === 'textarea'">
              <el-popover placement="top-start" width="350" trigger="hover" :content="scope.row[item.field_name_en]">
                <div
                  class="over-text"
                  slot="reference"
                  v-if="scope.row[item.field_name_en] && scope.row[item.field_name_en].length > 11"
                >
                  {{ scope.row[item.field_name_en] }}
                </div>
              </el-popover>
              <span v-if="scope.row[item.field_name_en] && scope.row[item.field_name_en].length <= 11">
                {{ scope.row[item.field_name_en] }}
              </span>
              <span v-if="!scope.row[item.field_name_en]">--</span>
            </div>
            <div v-else>
              <span
                v-if="item.field_name_en == info.crudInfo.main_field_name"
                class="color-doc pointer"
                @click="checkRow(scope.row)"
              >
                {{ getValue(scope.row[item.field_name_en]) }}</span
              >
              <span v-else> {{ getValue(scope.row[item.field_name_en]) }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="操作" fixed="right" width="170">
          <template slot-scope="scope">
            <el-button type="text" @click="checkRow(scope.row)">查看</el-button>
            <el-button type="text" @click="editRow(scope.row)">编辑</el-button>
            <el-button type="text" @click="deleteRow(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="page-fixed">
             
        <el-pagination
          :page-size="where.limit"
          :current-page="where.page"
          :page-sizes="[15, 20, 30]"
          layout="total,sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="pageChange"
        />
           
      </div>
    </div>
    <div v-else>
      <default-page :index="18" />
    </div>

    <image-viewer ref="imageViewer" :src-list="srcList"></image-viewer>
    <!-- 新增 -->
    <add-drawer v-if="addDrawerShow" ref="addDrawer" :keyName="keyName" @getList="getList"></add-drawer>
    <!-- 查看 -->
    <check-drawer
      v-if="checkDrawerShow"
      ref="checkDrawer"
      :keyName="keyName"
      :info="info"
      :crud_id="id"
      @getList="getList"
      @getInfo="getInfo"
    ></check-drawer>
  </div>
</template>
<script>
import Commnt from '@/components/develop/commonData'
import formBox from '@/views/develop/module/components/formBox'
import checkDrawer from '@/views/develop/module/components/checkDrawer'
import addDrawer from '@/views/develop/module/components/addDrawer'
import imageViewer from '@/components/common/imageViewer'
import defaultPage from '@/components/common/defaultPage'
import {
  crudModuleListApi,
  crudModuleInfoApi,
  crudModuleDelApi,
  crudModuleFindApi,
  crudModuleBatchDelApi
} from '@/api/develop'
export default {
  props: {
    infoData: {
      type: Object,
      default: () => {}
    }
  },
  components: { formBox, addDrawer, checkDrawer, imageViewer, defaultPage },
  data() {
    return {
      loading: false,
      addDrawerShow: false,
      checkDrawerShow: false,
      keyName: '',
      info: {},
      total: 0,
      id: 0, // 实体id
      srcList: [],
      tableData: [],
      where: {
        page: 1,
        limit: 15
      },
      height: window.innerHeight - 360 + 'px',
      multipleSelection: [],
      searchTypeOptions: Commnt.searchTypeOptions
    }
  },

  mounted() {
    if (this.infoData) {
      this.keyName = this.infoData.table_name_en
      this.id = this.infoData.id

      this.getInfo()
    }
  },
  destroyed() {
    this.$store.commit('updateConditionDialog', false)
  },

  methods: {
    getList(name) {
      this.loading = true

      crudModuleListApi(this.keyName || name, this.where)
        .then((res) => {
          this.loading = false
          this.total = res.data.count
          this.tableData = res.data.list
        })
        .catch((err) => {
          this.loading = false
        })
    },

    // 数组转成字符串
    getValue(val) {
      let str = ''
      if (val == '') {
        str = '--'
      } else if (Array.isArray(val)) {
        str = val.toString()
      } else {
        str = val
      }
      return str || '--'
    },

    handleDelete() {
      if (this.multipleSelection.length <= 0) {
        this.$message.error('至少选择一项内容')
      } else {
        this.$modalSure('您确认要删除吗').then(() => {
          const ids = []
          this.multipleSelection.map((value) => {
            ids.push(value.id)
          })
          this.batchMessageDelete({ ids: ids })
        })
      }
    },

    // 批量删除
    batchMessageDelete(data) {
      crudModuleBatchDelApi(this.keyName, data).then((res) => {
        let totalPage = Math.ceil((this.total - data.ids.length) / this.where.limit)
        let currentPage = this.where.page > totalPage ? totalPage : this.where.page
        this.where.page = currentPage < 1 ? 1 : currentPage
        this.getList()
      })
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 新增
    addData() {
      this.addDrawerShow = true
      this.$nextTick(() => {
        this.$refs.addDrawer.openBox()
      })
    },

    async editRow(item) {
      this.addDrawerShow = true
      const data = await crudModuleFindApi(this.keyName, item.id)
      this.$nextTick(() => {
        this.$refs.addDrawer.openBox(item.id, data.data)
      })
    },

    async checkRow(item) {
      this.checkDrawerShow = true
      const data = await crudModuleFindApi(this.keyName, item.id)
      let name = item[this.info.crudInfo.main_field_name] || ''
      setTimeout(() => {
        this.$nextTick(() => {
          this.$refs.checkDrawer.openBox(item, data.data, this.info, name)
        })
      }, 300)
    },

    toPinyin(str) {
      let pinyinArr = pinyin(str, { style: pinyin.STYLE_FIRST_LETTER })
      let pinyinStr = ''
      pinyinArr.forEach((item) => {
        pinyinStr += item.toUpperCase()
      })
      return pinyinStr
    },

    async deleteRow(item) {
      await this.$modalSure('您确认要删除吗')
      await crudModuleDelApi(this.keyName, item.id)
      let totalPage = Math.ceil((this.total - 1) / this.where.limit)
      let currentPage = this.where.page > totalPage ? totalPage : this.where.page
      this.where.page = currentPage < 1 ? 1 : currentPage
      await this.getList()
    },

    getInfo() {
      crudModuleInfoApi(this.keyName, this.id).then((res) => {
        this.info = res.data
      })
    },

    // 查看与下载附件
    lookViewer(url, name = '') {
      this.srcList.push(url)
      this.$refs.imageViewer.openImageViewer(url)
    },

    confirmData(data, name) {
      this.where = { page: 1, limit: 15, ...data }
      this.getList()
    },
    handleSizeChange(val) {
      this.where.limit = val
      this.getList()
    },
    pageChange(val) {
      this.where.page = val
      this.getList()
    }
  }
}
</script>
<style scoped lang="scss">
.img {
  cursor: pointer;
  display: block;
  width: 50px;
  height: 50px;
  margin-right: 4px;
  margin-bottom: 4px;
}
.flex_box {
  width: 100%;
  padding: 0 10px;
  display: flex;

  .tips {
    span {
      margin-right: 4px;
    }
  }
}
.img-box {
  display: flex;
  flex-wrap: wrap;
}
</style>
