<template>
  <div class="divBox" @click="isSortShow = false">
    <!-- 云盘主页面 -->
    <div class="v-height-flag" style="height: 100%">
      <el-card body-style="padding:0;" class="card-box">
        <el-row :gutter="20" v-if="switchIndex != 7">
          <!-- 左侧企业空间 -->
          <el-col v-bind="gridl">
            <cloudfile-left ref="cloudfileLeft" @confirmData="confirmData" />
          </el-col>
          <el-col v-bind="gridr" v-loading="uploadLoading" element-loading-text="文件正在上传中">
            <!-- 右侧顶部按钮 switchIndex默认值:1   -->
            <div id="cloudfile-right" class="cloudfile-right">
              <formBox
                :breadcrumbArray="breadcrumbArray"
                :pid="pid"
                :spaceId="spaceId"
                :switchIndex="switchIndex"
                :total="total"
                @formBoxClick="formBoxClick"
                @handleCommand="handleCommand"
                @isUploading="isUploading"
                @isUploaded="isUploaded"
                @handleSort="handleSort"
              ></formBox>

              <el-row class="mt10">
                <!-- 最近的文件 - 默认是空间文件 -->
                <lately-file
                  v-if="switchIndex == 1"
                  ref="latelyFile"
                  :file-style="fileStyle"
                  :pageLimit="pageLimit"
                  :space-id="spaceId"
                  :spaceType="spaceType"
                  :wps_type="wps_type"
                  @handlerMyFile="handlerMyFile"
                  @shareItemFile="shareFile"
                  @openItemFile="openfile"
                  @totalFn="totalFn"
                />
                <!-- 空间的文件 -->
                <space-file
                  v-if="switchIndex == 6"
                  ref="spaceFile"
                  :file-style="fileStyle"
                  :pageLimit="pageLimit"
                  :space-id="spaceId"
                  :spaceType="spaceType"
                  :switch="switchIndex"
                  :wps_type="wps_type"
                  @handlerMyFile="handlerMyFile"
                  @openItemFile="openfile"
                  @shareItemFile="shareFile"
                  @totalFn="totalFn"
                />
              </el-row>
            </div>
          </el-col>
        </el-row>
        <!-- 回收站的文件 -->
        <recovery-file
          v-if="switchIndex == 7"
          ref="recoveryFile"
          :ent-button="entButton"
          :file-style="fileStyle"
          :space-id="spaceId"
          :wps_type="wps_type"
          @backFn="backFn"
        />
      </el-card>
    </div>
    <!-- 新建文件弹窗 -->
    <newFileDialog ref="newFileDialog" :config="configMyFile" @handleIsOK="handleIsOK" />
    <!-- 移动文件弹窗 -->
    <move-dialog ref="moveDialog" :move-data="moveData" @handlerMove="handlerMove" />
    <!-- 打开文件 -->
    <fileDialog ref="viewFile"></fileDialog>
    <!-- 文件模板弹窗 -->
    <file-temp ref="fileTemp" :from-data="fileTemp" @handleTemplate="handleTemplate" />
  </div>
</template>

<script>
import { roterPre } from '@/settings'
import { fileLinkDownLoad } from '@/libs/public'
import {
  folderAllDeleteApi,
  folderAllDestroyApi,
  folderAllDestroyFileApi,
  folderSpaceEntAllDeleteApi,
  folderSpaceEntAllDestroyApi,
  folderSpaceEntAllRecoverApi
} from '@/api/cloud'
export default {
  name: 'CloudFile',
  components: {
    cloudfileLeft: () => import('./components/layout/cloudfileLeft'), // 左侧导航
    formBox: () => import('./components/layout/formBox'), // 顶部操作
    latelyFile: () => import('./components/layout/latelyFile'), // 最近的文件
    recoveryFile: () => import('./components/layout/recoveryFile'), // 回收站的文件
    spaceFile: () => import('./components/layout/spaceFile'), // 企业空间文件
    newFileDialog: () => import('./components/newFileDialog'), // 新建文件弹窗
    moveDialog: () => import('./components/moveDialog'), // 移动文件弹窗
    fileTemp: () => import('./components/fileTemp'), // 文件模板弹窗
    fileDialog: () => import('@/components/openFile/previewDialog ') // 图片、MP3，MP4弹窗
  },
  data() {
    return {
      fileStyle: {
        style: 1,
        sort: 1,
        type: 1,
        keyword: '',
        sortBy: 6
      },
      total: 0,
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
      type: '1',
      spaceType: '', // 判断是否是最近打开
      breadcrumbArray: [], // 面包屑文字
      switchIndex: 1,
      configMyFile: {},
      pid: 0,
      spaceId: 0,
      entButton: false,
      uploadLoading: false,
      ids: [],
      moveData: {
        id: [],
        type: 2
      },
      fileData: {},
      fileTemp: {
        type: 1,
        title: this.$t('file.selecttemplate'),
        width: '820px'
      },
      isSortShow: false,
      pageLimit: 0,
      wps_type: JSON.parse(localStorage.getItem('webConfig')).wps_type || '0'
    }
  },

  watch: {
    lang() {
      this.setOptions()
    },
    'fileStyle.style'(val) {
      const windowHeight = document.documentElement.clientHeight - 284
      //大图模式，根据页面高度计算每页数据条数，这里可以根据实际需求进行适当的调整
      if (val == 2) {
        const winWidth = document.getElementById('cloudfile-right').offsetWidth
        const col = Math.floor(winWidth / 130)
        const row = Math.floor(windowHeight / 154)
        this.pageLimit = col * row
      } else {
        let height = document.documentElement.clientHeight - 290
        this.pageLimit = Math.floor(height / 52)
      }
      setTimeout(() => {
        this.getFileList()
      }, 200)
    }
  },

  mounted() {
    this.$nextTick(() => {
      let height = document.documentElement.clientHeight - 290
      this.pageLimit = Math.floor(height / 52) // 假设每行高度为 50px
    })
  },
  methods: {
    isUploading() {
      this.uploadLoading = true
    },
    isUploaded() {
      this.uploadLoading = false
    },
    handleClick(e) {
      // this.$refs.shareFile.shareIndex = e.name
      // this.$refs.shareFile.getTreeData()
    },
    // 点击item项
    openfile(item) {
      let fid = item.pid || this.spaceId
      const fileType = item.file_ext
      const types = ['jpeg', 'gif', 'bmp', 'png', 'jpg', 'svg', 'mp3', 'mp4']
      const downloadType = ['xmind', 'zip', 'xls']
      const isImage = types.includes(fileType)
      // 打开word类型文件
      if (!isImage && !downloadType.includes(fileType)) {
        let url = `${roterPre}/openFile?id=${item.id}&&fid=${item.pid || this.spaceId}`
        window.open(url, '_blank')
      } else if (downloadType.includes(fileType)) {
        fileLinkDownLoad(item.file_url, item.file_name)
      } else {
        // 打开图片,音频，视频类型文件
        this.$refs.viewFile.openFile(fid, item.id)
      }
    },
    // 分享文件
    shareFile(item) {
      let origin = window.location.origin
      const fileType = item.file_ext
      const types = ['jpeg', 'gif', 'bmp', 'png', 'jpg', 'mp3', 'mp4']
      const isImage = types.includes(fileType)
      // 打开word类型文件
      let url = ''
      if (!isImage) {
        url = `${origin}/admin/openFile?id=${item.id}&&fid=${item.pid || this.spaceId}`
      } else {
        // 打开图片,音频，视频类型文件
        url = item.file_url
      }

      let realName = JSON.parse(localStorage.getItem('userInfo'))
      const oInput = document.createElement('input')
      let value = '【' + realName.name + '】分享给您【' + item.name + '】' + '请点击链接打开!' + url

      oInput.value = value
      document.body.appendChild(oInput)
      oInput.select()
      document.execCommand('Copy')
      oInput.style.display = 'none'
      document.body.removeChild(oInput)
      this.$message.success('复制分享链接成功，请前去粘贴使用')
    },
    formBoxClick(type, val, index) {
      if (type === 'allMove') {
        // 移动至
        this.allMove()
      } else if (type === 'allDelete') {
        // 删除
        this.allDelete(val)
      } else if (type === 'handleClick') {
        // 共享相关操作
        this.handleClick(val)
      } else if (type === 'handleScreen') {
        // 我的文件相关操作
        this.handleScreen(val)
      } else if (type === 'handleScreen') {
        // 我的文件相关操作
        this.handleScreen(val)
      } else if (type === 'getBreadcrumb') {
        // 点击面包屑
        this.getBreadcrumb(val, index)
      } else if (type === 'styleChage') {
        // 文件样式变化
        this.styleChage(val, index)
      } else if (type === 'handleType') {
        // 文件类型筛选
        this.handleType(val)
      } else if (type === 'handleSuccess') {
        // 上传文件成功
        this.handleSuccess(val)
      } else if (type === 'recoveryBtn') {
        // 打开回收站
        this.recoveryBtn()
      }
    },
    styleChage(val, type) {
      this.fileStyle = val
      this.fileStyle.keyword = val.keyword
      if (!type) {
        this.getFileList(val.keyword)
      }
    },
    totalFn(val) {
      this.total = val
    },
    // 列表搜索
    getFileList(val) {
      if (this.switchIndex === 1) {
        this.$refs.latelyFile.getTreeData(1, val) // 最近访问
      } else if (this.switchIndex === 6) {
        this.$refs.spaceFile.getTreeData(1) // 企业空间文件
        this.$refs.spaceFile.menuIds = []
      } else if (this.switchIndex === 7) {
        this.$refs.recoveryFile.getTreeData() // 回收站
        this.$refs.recoveryFile.menuIds = []
      }
      this.ids = []
    },

    backFn() {
      this.switchIndex = 1
    },
    confirmData(data, item) {
      this.fileStyle.keyword = ''
      if (item === 'recently') {
        // 最近访问
        this.switchIndex = 1
        this.spaceType = item
        this.breadcrumbArray = []
        setTimeout(() => {
          this.$refs.latelyFile.getTreeData(item)
        }, 300)
        return false
      } else if (item == 'recovery') {
        // 回收站
        this.switchIndex = 7
        this.spaceType = item
        this.breadcrumbArray = []
        setTimeout(() => {
          this.$refs.recoveryFile.getTreeData(item)
        }, 300)
        return false
      } else {
        // 空间文件
        this.switchIndex = data.selectIndex
        this.spaceType = ''
        this.breadcrumbArray = []
        this.breadcrumbArray.push(item)
      }
      if (data.type === 2) {
        // this.getFileList()
      } else {
        this.type = '1'
        this.spaceId = data.id
        if (data.selectIndex == 6) {
          this.pid = 0
          this.entButton = true
          setTimeout(() => {
            this.$refs.spaceFile.where.pid = ''
            this.$refs.spaceFile.breadcrumbArray = [{ name: this.$t('file.allfiles'), pid: '' }]
            this.$refs.spaceFile.checked = false
            this.$refs.spaceFile.menuIds = []
            this.$refs.spaceFile.where.page = 1
            if (this.spaceId) {
              this.$refs.spaceFile.getTreeData(item)
            } else {
              this.$refs.spaceFile.fileData = []
            }
          }, 200)
        } else {
          this.entButton = false
        }
      }
    },

    // 点击面包屑
    getBreadcrumb(id, index) {
      setTimeout(() => {
        this.$refs.spaceFile.getBreadcrumb(id, index)
      }, 200)
      this.$nextTick(() => {
        this.breadcrumbArray.splice(index + 1, this.breadcrumbArray.length - index)
        this.$refs.spaceFile.breadcrumbArray = JSON.parse(JSON.stringify(this.breadcrumbArray))
      })
    },
    // 排序
    handleCommand(command) {
      this.fileStyle.sort = command
      this.getFileList()
    },
    // 排序
    handleSort(index, id) {
      this.fileStyle.sortBy = id
      this.getFileList()
    },

    // 类型
    handleType(command) {
      this.fileStyle.type = command
      this.getFileList()
    },
    handleScreen(command) {
      if (command == 5) {
        this.configMyFile = {
          title: this.$t('file.newfolder'),
          pid: this.pid,
          command: command,
          switch: this.switchIndex,
          spaceId: this.spaceId,
          type: ''
        }
        this.$refs.newFileDialog.handleOpen()
      } else if (command == 7) {
        this.handleTemp()
      } else {
        var title = ''
        var type = ''
        if (command == 1) {
          title = this.$t('file.newdocument')
          type = 'word'
        } else if (command == 2) {
          title = this.$t('file.newtable')
          type = 'excel'
        } else {
          title = this.$t('file.newslide')
          type = 'ppt'
        }
        this.configMyFile = {
          title: title,
          pid: this.pid,
          command: command,
          switch: this.switchIndex,
          spaceId: this.spaceId,
          type: type
        }
        this.$refs.newFileDialog.handleOpen()
      }
    },
    // 新建企业空间
    addEntSpace() {
      this.$refs.cloudfileLeft.addName()
    },
    handleTemp() {
      if (this.entButton) {
        // 企业空间
        this.fileTemp.type = 2

        this.fileTemp.fid = this.spaceId
      } else {
        this.fileTemp.type = 1
      }
      this.fileTemp.id = this.pid
      this.$refs.fileTemp.handleOpen()
    },
    handlerMyFile(data, item) {
      if (item) {
        this.breadcrumbArray.push(item)
      }
      if (data.type === 2) {
        this.$refs.cloudfileLeft.getFolderTotal()
      } else {
        this.pid = data.id
        this.ids = data.ids
      }
    },
    handleIsOK() {
      if (this.switchIndex === 6) {
        this.$refs.spaceFile.getTreeData(1)
      } else {
        this.$refs.myFile.getTreeData(1)
      }
    },
    // 上传成功
    handleSuccess(response) {
      if (response.status === 200) {
        this.$message.success(response.message)
        if (this.switchIndex === 6) {
          this.$refs.spaceFile.getTreeData()
        } else {
          this.$refs.myFile.getTreeData()
        }
      } else {
        this.$message.error(response.message)
      }
    },

    recoveryBtn() {
      this.switchIndex = 7
    },
    // returnSpace() {
    //   this.switchIndex = 6
    //   this.entButton = false
    //   setTimeout(() => {
    //     this.$refs.spac eFile.where.page = 1
    //     this.$refs.spaceFile.getTreeData()
    //     this.$refs.spaceFile.menuIds = []
    //   }, 200)
    // },
    handleTemplate() {
      this.getFileList()
    },
    allDelete(type) {
      if (this.ids.length <= 0) {
        this.$message.error(this.$t('file.placeholder05'))
      } else {
        const uids = this.ids
        if (uids.length > 0 && uids[0] === 0) {
          uids.splice(0, 1)
        }
        if (type === 1) {
          this.getFolderAllDelete({ id: uids })
        } else if (type === 2) {
          if (this.entButton) {
            // 企业空间
            this.$modalSure('彻底删除后,内容无法恢复,你确定要删除该内容吗').then(() => {
              this.getFolderEntAllDestroy(this.spaceId, { id: uids })
            })
          } else {
            this.$modalSure('彻底删除后,内容无法恢复,你确定要删除该内容吗').then(() => {
              this.getFolderAllDestroy({ id: uids })
            })
          }
        } else if (type === 3) {
          this.$modalSure('你确定要删除该内容吗').then(() => {
            this.getFolderEntAllDelete(this.spaceId, { id: uids })
          })
        }
      }
    },
    allDestroy() {
      if (this.ids.length <= 0) {
        this.$message.error(this.$t('file.placeholder06'))
      } else {
        const uids = this.ids
        if (uids.length > 0 && uids[0] === 0) {
          uids.splice(0, 1)
        }
        if (this.entButton) {
          // 企业空间
          this.getFolderEntAll(this.spaceId, { id: uids })
        } else {
          this.getFolderAllFile({ id: uids })
        }
      }
    },
    allMove() {
      if (this.ids.length <= 0) {
        this.$message.error(this.$t('file.placeholder07'))
      } else {
        const uids = this.ids
        if (uids.length > 0 && uids[0] === 0) {
          uids.splice(0, 1)
        }
        if (this.switchIndex == 6) {
          this.moveData.id = uids
          this.moveData.type = 4
          this.moveData.fid = this.spaceId
          this.$refs.moveDialog.handleOpen()
        } else {
          this.moveData.id = uids
          this.moveData.type = 2
          this.$refs.moveDialog.handleOpen()
        }
      }
    },

    // 移动回调
    handlerMove(data) {
      if (data.type === 2 || data.type === 4) {
        this.getFileList()
      }
    },
    // 批量删除文件（我的文件）
    getFolderAllDelete(data) {
      folderAllDeleteApi(data).then((res) => {
        this.getFileList()
      })
    },
    // 批量彻底删除文件（我的文件）
    async getFolderAllDestroy(data) {
      await folderAllDestroyApi(data)
      await this.getFileList()
    },
    // 批量恢复文件（我的文件）
    async getFolderAllFile(data) {
      await folderAllDestroyFileApi(data)
      await this.getFileList()
    },
    // 批量删除文件（企业空间）
    async getFolderEntAllDelete(id, data) {
      await folderSpaceEntAllDeleteApi(id, data)
      await this.getFileList()
    },
    // 批量彻底删除文件（企业空间）
    async getFolderEntAllDestroy(id, data) {
      await folderSpaceEntAllDestroyApi(id, data)
      await this.getFileList()
    },
    // 批量恢复删除文件（企业空间）
    async getFolderEntAll(id, data) {
      await folderSpaceEntAllRecoverApi(id, data)
      await this.getFileList()
    }
  }
}
</script>

<style lang="scss" scoped>
.card-box {
  height: calc(100vh - 80px);
}
.upload {
  display: inline-block;
}
.upload-list {
  /deep/ .el-upload {
    width: calc(100% + 34px);
    text-align: left;
    margin: 0 -17px;
    padding: 0 17px;
  }
}
.mt22 {
  margin-top: 22px;
}
.iconshaixuan {
  margin-left: 4px;
  font-size: 13px;
  color: #999999;
}
.iconpaixu {
  margin-left: 4px;
  font-size: 13px;
  color: #999999;
}
.cloudfile-right {
  padding: 0 20px;

  .header-16 {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .breadcrumb-item {
      cursor: pointer;
      font-family: PingFang SC, PingFang SC;
      font-weight: 400;
      font-size: 15px;
      color: #909399;
      margin-top: 26px;
    }
  }
  .el-dropdown-link {
    height: 32px;
    padding: 0 10px;
    display: flex;
    align-items: center;
  }
  .el-dropdown-link:hover {
    background-color: rgba(247, 247, 247, 1);
  }
  .text {
    width: 25px;
    color: #909399;
    height: 32px;
    display: flex;
    justify-content: center;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 13px;
    border-radius: 4px;
  }

  .header {
    .header-right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      // text-align: right;
      flex-wrap: wrap;

      /deep/ .el-dropdown-selfdefine {
        display: flex;
        align-items: center;
        i {
          padding-left: 6px;
        }
      }
      .icon-name {
        font-size: 13px;
        span {
          padding-right: 3px;
        }
        i {
          font-size: 13px;
        }
      }
    }
  }
  .sort-dropdown {
    .sort-content {
      position: absolute;
      left: -20px;
      top: 30px;
      z-index: 222;
      ul {
        width: 120px;
        list-style: none;
        margin-bottom: 0;
      }
      /deep/ .el-dropdown-menu {
        position: static;
        margin: 0;
      }
      .sort-ul {
        margin-top: -3px !important;
        border-radius: 0 0 4px 4px !important;
        li {
          padding-right: 40px !important;
        }
      }
    }
  }
}
/deep/.el-pagination {
  padding-bottom: 0;
}
</style>
