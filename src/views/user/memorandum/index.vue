<!--记事本-->
<template>
  <div class="divBox">
    <div class="flex">
      <!--左侧菜单-->
      <div class="left-box">
        <menuTree ref="menuTree" @createNote="addCreate" @frameId="getFrameId" @onRecently="onRecently" />
      </div>
      <!--中间文件列表-->
      <div class="middle-box">
        <div class="search">
          <el-input
            v-model="goodData.title"
            :placeholder="$t('calendar.placeholder01')"
            class="search-input"
            clearable
            size="small"
            suffix-icon="el-icon-search"
            @change="changeSearch"
          />
        </div>

        <div class="main">
          <!-- <el-scrollbar style="height: 100%"> -->
          <!--文件夹中文件列表-->
          <div v-if="!recently">
            <ul v-if="memorandum.length > 0" class="content-ul px-14">
              <li
                v-for="(item, index) in memorandum"
                :key="index"
                :class="index == itemIndex ? 'active' : ''"
                @click="clickItem(index, item.id)"
              >
                <div class="title">
                  <span><i class="iconfont iconjishiben-01"></i> {{ item.title }}</span>
                  <el-popover :ref="`pop-${item.id}`" :offset="10" placement="bottom-end" trigger="click">
                    <div class="right-item-list">
                      <div class="right-item cursor-pointer mb-5" @click="moveTo(item)">移动到</div>
                      <div class="right-item cursor-pointer" @click="delMemorandum">删除</div>
                    </div>
                    <div slot="reference" class="iconfont icongengduo right-icon" />
                  </el-popover>
                </div>
                <span class="comment">{{ getStringHtml(item.content) }}</span>
                <span class="foottime">创建于 {{ item.created_at }}</span>
              </li>
            </ul>
            <!--无数据-->
            <div v-if="!memorandum.length && !loadingPage" class="default-page px-10">
              <div class="content">
                <div class="content-list">
                  <img :src="require('@/assets/images/none-007.png')" alt="" />
                  <p class="text-center">{{ $t('public.message09') }}~</p>
                  <el-button class="mt20" size="small" type="primary" @click="addMemorandum"> 新建记事本 </el-button>
                </div>
              </div>
            </div>
          </div>
          <!--最近记录-->
          <div v-if="recently" class="">
            <div v-for="(j, i) in memorandum" :key="i">
              <ul class="content-ul px-10">
                <div class="recentlyMonth">
                  {{ j.month }}
                </div>
                <li
                  v-for="(item, index) in j.data"
                  :key="index"
                  :class="item.id === itemIndex ? 'active' : ''"
                  @click="clickItem(index, item.id, i, item.pid)"
                >
                  <div class="title">
                    <span><i class="iconfont iconjishiben-01"></i> {{ item.title }}</span>
                    <el-popover :ref="`pop-${item.id}`" :offset="10" placement="bottom-end" trigger="click">
                      <div class="right-item-list">
                        <div class="right-item cursor-pointer mb-5" @click="moveTo(item)">移动到</div>
                        <div class="right-item cursor-pointer" @click="delMemorandum">删除</div>
                      </div>
                      <div slot="reference" class="iconfont icongengduo right-icon" />
                    </el-popover>
                  </div>

                  <div class="comment">{{ getStringHtml(item.content) }}</div>
                  <div class="foottime">
                    编辑于
                    {{ $moment(item.updated_at).format('MM-DD HH:mm:ss') }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <!-- </el-scrollbar> -->
        </div>
      </div>
      <!--右侧内容-->
      <div class="right-box">
        <el-card v-loading="loadingPage">
          <div v-show="memorandum.length == 0" class="noneDefault">
            <img alt="" class="img" src="../../../assets/images/nodedef1.png" />
            <div>暂无笔记~</div>
          </div>

          <div v-if="memorandum.length > 0" class="content">
            <div class="header flex">
              <div class="edit-title">
                <el-input
                  v-model="title"
                  :placeholder="$t('calendar.placeholder02')"
                  class="edit-input"
                  size="small"
                  @change="editTitle"
                />
              </div>
              <div class="savebutton">
                <el-button :loading="saveLoading" class="btn" size="small" title="保存(Ctrl+S)" type="" @click="edit"
                  >保存</el-button
                >
              </div>
            </div>
            <div class="edit-content">
              <ueditorFrom
                ref="ueditorFrom"
                :type="`notepad`"
                :editorBorder="false"
                :content="content"
                :height="`calc(100vh - 126px)`"
                @input="ueditorEdit"
              />
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <!-- 移动文件夹弹窗-->
    <move-dialog ref="moveDialog" :move-data="moveData" @handlerMove="handlerMove"></move-dialog>
  </div>
</template>

<script>
import { memorialListApi, memorialSaveApi, memorialEditApi, memorialDeleteApi, memorialGroupApi } from '@/api/user'
import fSpan from '@/views/business/components/formSetting/components/form-create-designer/src/config/rule/span'
export default {
  name: 'Notepad',
  components: {
    fSpan,
    menuTree: () => import('./components/menuTree'),
    ueditorFrom: () => import('@/components/form-common/oa-wangeditor'),
    moveDialog: () => import('./components/moveDialog')
  },
  props: {
    style1: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      treeData: [],
      loadingPage: false,
      recently: false,
      recentlyList: [],
      goodData: {
        file_name: '',
        cate_id: '',
        page: 1,
        limit: 20,
        title: ''
      },
      total: 0,
      id: null, // 文件id
      pid: null, // 文件夹id
      itemIndex: null,
      content: '',
      title: '',
      memorandum: [],
      saveLoading: false,
      tabButton: false,
      moveData: {},
      timer: null
    }
  },
  mounted() {
    this.createdEvent()
  },
  beforeDestroy() {
    this.handleRemove()
  },
  watch: {
    content: {
      handler(val, oldVal) {
        this.autoSave()
      },
      deep: true //true 深度监听
    }
  },
  methods: {
    autoSave(val, oldVal) {
      if (this.timer) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.edit('auto')
      }, 30000)
    },
    handleRemove() {
      document.removeEventListener('keydown', this.handleEvent) // 在页面销毁的时候记得解除
    },
    createdEvent() {
      document.addEventListener('keydown', this.handleEvent)
    },
    handleEvent(event) {
      if (event.ctrlKey || event.metaKey) {
        if (event.code === 'KeyS') {
          event.preventDefault()
          // 在这里写保存需要执行的逻辑
          this.edit()
        }
      }
    },
    getFrameId(e) {
      this.recently = false
      this.memorandum = []
      this.goodData.cate_id = e
      this.goodData.page = 1
      this.tableList()
    },
    clickItem(index, id, i, pid) {
      if (this.recently) {
        this.itemIndex = id
        this.pid = pid
      } else {
        this.itemIndex = index
      }
      this.id = id
      if (this.memorandum.length > 0) {
        setTimeout(() => {
          // 最近访问
          if (this.recently) {
            this.content = this.memorandum[i].data[index].content

            this.title = this.memorandum[i].data[index].title
          } else {
            this.content = this.memorandum[index].content
            this.title = this.memorandum[index].title
          }
        }, 300)
      }
    },

    // 最近使用
    async onRecently() {
      this.loadingPage = true
      const res = await memorialGroupApi({ title: this.goodData.title })
      this.recently = true
      this.loadingPage = false
      this.memorandum = res.data.list
      if (this.memorandum.length > 0) {
        this.clickItem(0, this.memorandum[0].data[0].id, 0, this.memorandum[0].data[0].pid)
      }
    },
    tableList() {
      const data = {
        page: this.goodData.page,
        limit: this.goodData.limit,
        pid: this.goodData.cate_id === 0 ? '' : this.goodData.cate_id,
        title: this.goodData.title
      }
      this.loadingPage = true
      memorialListApi(data).then((res) => {
        this.loadingPage = false
        this.memorandum = res.data.list
        if (this.memorandum.length > 0) {
          this.clickItem(0, this.memorandum[0].id)
        } else {
          this.content = ''
          this.title = ''
          this.itemIndex = null
        }
      })
    },
    loadMore() {
      if (this.goodData.page <= this.total) {
        this.goodData.page++
        this.tableList()
      }
    },
    changeSearch() {
      this.recently ? this.onRecently() : this.tableList()
    },
    addMemorandum() {
      var data = {
        title: this.$t('calendar.placeholder03'),
        content: this.$t('calendar.placeholder04'),
        pid: this.goodData.cate_id || 0
      }
      this.addCreate(data)
    },
    // 创建内容
    addCreate(data, Flag = false) {
      if (Flag) {
        this.saveLoading = true
      }
      memorialSaveApi(data)
        .then((res) => {
          if (Flag) {
            this.saveLoading = false
          }
          this.tableList()
          this.$refs.menuTree.menuList()
        })
        .catch((err) => {
          if (Flag) {
            this.saveLoading = false
          }
          this.$message.error(err.message)
        })
    },
    // 修改
    edit(val) {
      if (this.title == '') {
        this.$message.error(this.$t('calendar.placeholder05'))
      } else if (this.content == '') {
        this.$message.error(this.$t('calendar.placeholder06'))
      } else {
        if (this.itemIndex != null) {
          var data = {
            title: this.title,
            content: this.content
          }
          // 编辑
          if (this.memorandum.length > 0) {
            if (this.recently) {
              data.pid = this.pid
              this.id = this.itemIndex
            } else {
              data.pid = this.memorandum[this.itemIndex].pid
            }

            this.memorialEdit(this.id, data, val)
          } else {
            data.pid = this.goodData.cate_id === '' ? 0 : this.goodData.cate_id
            this.addCreate(data, true)
          }
        }
      }
    },
    // 编辑
    memorialEdit(id, data, val) {
      this.saveLoading = true
      memorialEditApi(id, data)
        .then((res) => {
          if (res.status == '200' && val !== 'auto') {
            this.$message.success('修改成功')
          }
          this.saveLoading = false
          if (this.recently) {
            this.onRecently()
          } else {
            this.tableList()
          }
        })
        .catch((err) => {
          this.saveLoading = false
        })
    },
    editTitle(e) {
      if (this.itemIndex === null) return false
      if (this.title === '') {
        this.title = this.memorandum[this.itemIndex].title
      } else {
        this.memorandum[this.itemIndex].title = e
      }
    },
    getStringHtml(text) {
      var reg = /<[^<>]+>/g
      text = text.replace(reg, '')
      text = text.replace(/&nbsp;/gi, '')
      return text
    },
    ueditorEdit(e) {
      if (this.itemIndex === null) return false
      if (this.memorandum.length > 0 && !this.recently) {
        if (e) {
          this.memorandum[this.itemIndex].content = e
          this.content = e
        }
      } else {
        this.content = e
      }
    },
    // 删除
    delMemorandum() {
      if (this.itemIndex === null) return false
      this.$modalSure(this.$t('calendar.placeholder07')).then(() => {
        memorialDeleteApi(this.id).then((res) => {
          if (!this.recently) {
            this.$refs.menuTree.menuList()
            this.tableList()
          } else {
            this.onRecently()
          }
        })
      })
    },
    moveTo(item) {
      this.moveData.data = item
      this.$refs.moveDialog.handleOpen()
    },
    handlerMove() {
      this.tableList()
      this.$refs.menuTree.menuList()
    }
  }
}
</script>

<style lang="scss" scoped>
.divBox {
  background-color: #f9fafb;
}

.left-box {
  width: 210px;
  height: calc(100% - 40px);
}
.iconjishiben-01 {
  font-size: 16px;
  color: #1890ff;
}
.main {
  height: calc(100vh - 90px);
  overflow-y: auto;
}
.middle-box {
  width: 280px;
  border-right: 1px solid #dcdfe6;
  background-color: #fff;
  .search {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 0 20px 0;
    /deep/.el-input--small .el-input__inner {
      cursor: pointer;
    }
    .addBox {
      margin-top: 20px;
      height: 41px;
      background-color: #1890ff14;
      line-height: 41px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      .el-icon-circle-plus {
        margin-left: 21px;
        margin-right: 5px;
        font-size: 20px;
        color: #1890ff;
      }
    }
    .search-input {
      width: calc(100% - 24px - 10px);
    }

    .add-document {
      font-size: 20px;
      cursor: pointer;
      color: #999999;
      margin-left: 10px;
      margin-top: 3px;
    }
  }
  .content-ul {
    list-style: none;
    margin: 0;

    li {
      margin: 0;
      padding: 12px;
      border-top: 1px solid #dcdfe6;
      max-height: 124px;
      .title {
        display: flex;
        margin: 0 0 10px 0;
        padding: 0;
        span {
          font-family: PingFang SC, PingFang SC;
          font-weight: 500;
          font-size: 14px;
          color: #303133;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 200px;
        }
        span:nth-of-type(2) {
          width: 30px;
          text-align: right;
        }
        /deep/ .el-popover__reference-wrapper {
          display: none;
        }
      }

      .comment {
        color: #606266;
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        white-space: break-spaces;
        max-height: 58px;
      }
      .foottime {
        color: #909399;
        font-size: 12px;
        margin-top: 10px;
      }
    }
    li:first-of-type {
      border-top: 0;
      margin-top: 10px;
    }
    li.active {
      background-color: #f1f9ff;
      border-radius: 4px;
      border-top: 1px solid #f2f6fc;
      /deep/ .el-popover__reference-wrapper {
        display: block;
      }
    }
    li.active + li {
      border-top: 0;
    }
    li.hover {
      background-color: #f2f6fc;
      border-radius: 4px;
      /deep/ .el-popover__reference-wrapper {
        display: block;
      }
    }
    .recentlyMonth {
      font-size: 12px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #909399;
      margin-bottom: 10px;
    }
  }

  .default-page {
    display: flex;
    align-content: center;
    justify-content: center;
    .content {
      min-height: 420px;
      width: 100%;
      text-align: center;
      position: relative;
      .content-list {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        img {
          width: 90%;
        }
      }
      p {
        margin: 0;
        padding: 0;
        font-size: 13px;
        color: #999999;
      }
    }
  }
  .right-icon {
    font-size: 14px;
    cursor: pointer;
  }
}
.right-box {
  background-color: #fff;
  width: calc(100% - 450px);
  /deep/.el-card__body {
    padding: 0 !important;
    border: none !important;
  }
  /deep/.el-card {
    border: none !important;
  }
  .content {
    font-size: 12px;
    color: #303133;
    font-weight: normal;
    .header {
      .edit-title {
        width: calc(100% - 78px);
        .edit-input {
          padding: 16px 0;
          /deep/ input {
            font-family: PingFang SC, PingFang SC;
            font-weight: 500;
            font-size: 18px;
            color: #303133;
            border: none;
            padding-left: 20px;
          }
        }
      }
      .savebutton {
        align-items: center;
        display: flex;
      }
    }

    /deep/ .edit-content {
      .wang-editor {
        width: 100%;
        height: 100%;
        .w-e-toolbar {
          padding-left: 20px;
        }
        .w-e-text-container {
          margin: 0px;
          .w-e-text {
            padding: 0 30px 100px 30px;
            padding-top: 10px;
            p {
              line-height: 2;
            }
          }
          .placeholder {
            left: 30px;
            top: 20px;
          }
        }
      }
    }
  }
  .noneDefault {
    width: 100%;
    height: 800px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 13px;
    color: #999999;
    div {
      margin-bottom: 140px;
    }
    .img {
      width: 94px;
      height: 94px;
    }
  }
}
</style>
