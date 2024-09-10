<!-- @FileDescription: 文件预览页面-文档类型 -->
<template>
  <div class="file-box">
    <div class="header flex-between">
      <div>{{ file.name }}.{{ file.file_ext }}</div>
      <el-button v-show="editBtn" :loading="loading" size="small" type="primary" @click="save">保存</el-button>
    </div>

    <div class="main">
      <component :is="type" ref="fileEdit" :fid="fid" :file="file" :url="file.file_url" @closeLoading="closeLoading" />
    </div>
  </div>
</template>
<script>
import { getFileInfoApi } from '@/api/cloud'
export default {
  name: '',
  url: {
    type: String,
    default: ''
  },
  components: {
    docx: () => import('./previewDocx'),
    md: () => import('./previewMd'),
    mp3: () => import('./previewMp3'),
    mp4: () => import('./previewMp4'),
    pdf: () => import('./previewPdf'),
    txt: () => import('./previewTxt'),
    office: () => import('./previewOffice'),
    docxEdit: () => import('./editDocx'),
    xlsxEdit: () => import('./editXlsx')
  },
  data() {
    return {
      type: '',
      file: {},
      id: 0,
      fid: 0,
      loading: false,
      editBtn: false
    }
  },
  created() {
    this.id = this.$route.query.id
    this.fid = this.$route.query.fid
    this.getFileInfo()
  },
  methods: {
    getFileInfo() {
      getFileInfoApi(this.fid, this.id).then((res) => {
        this.file = res.data
        this.type = res.data.file_ext
        res.data.name && (document.title = res.data.name)
        if (res.data.auth && res.data.auth.update == 1 && ['docx', 'xlsx'].includes(res.data.file_ext)) {
          this.editBtn = true
          if (res.data.file_ext == 'docx') {
            this.type = 'docxEdit'
          } else {
            this.type = 'xlsxEdit'
          }
        } else if (['doc', 'pptx', 'ppt', 'xlsx', 'docx'].includes(res.data.file_ext)) {
          this.type = 'office'
        }
      })
    },

    closeLoading() {
      this.loading = false
    },
    // 保存
    save() {
      this.loading = true
      if (this.type == 'docxEdit') {
        this.$refs.fileEdit.wordOption()
      } else {
        this.$refs.fileEdit.exportData(1)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.file-box {
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none; /* firefox */
  -ms-overflow-style: none; /* IE 10+ */
  .header {
    z-index: 99;
    position: fixed;
    top: 0;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    background: #fff;
    padding: 0 20px;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 18px;
    color: #303133;
    border-bottom: 1px solid #dcdfe6ff;
  }
  .main {
    width: 100%;
    margin-top: 60px;
  }
}
</style>
