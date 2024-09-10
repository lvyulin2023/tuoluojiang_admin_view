<!-- @FileDescription: 上传文件后渲染组件  -->
<template>
  <div class="width100">
    <div class="width100">
      <div class="fileItem" v-for="(fileItem, index) in fileList" :key="index" @click="lookViewer(fileItem)">
        <div class="file-item-left">
          <i class="iconfont" v-if="toSrcIcon(fileItem.name) !== 'img'" :class="toSrcIcon(fileItem.name)"></i>
          <img v-else :src="fileItem.file_url || fileItem.url" alt="" class="img" />
        </div>
        <div class="file-item-right">
          <div class="file-name over-text">{{ fileItem.name }}</div>
          <div class="file-size">{{ toSizeFile(fileItem.size) }}</div>
        </div>
        <i v-if="showClose" class="file-close el-icon-error" @click.stop="fileDelete(index)"></i>
      </div>
      <div v-if="fileList.length == 0">--</div>
    </div>

    <image-viewer ref="imageViewer" :src-list="srcList"></image-viewer>
  </div>
</template>

<script>
import { fileLinkDownLoad, formatBytes, getFileType, isTypeImage } from '@/libs/public'
import imageViewer from '@/components/common/imageViewer'

export default {
  name: 'UploadList',
  props: {
    fileList: {
      type: Array,
      default: () => []
    },
    showClose: {
      type: Boolean,
      default: false
    }
  },
  components: {
    imageViewer
  },
  data() {
    return {
      srcList: []
    }
  },
  watch: {
    fileList: {
      handler(nVal) {
        this.srcList = []
        if (nVal.length > 0) {
          nVal.forEach((value) => {
            if (isTypeImage(value.name)) {
              this.srcList.push(value.file_url)
            }
          })
        }
      },
      immediate: true
    }
  },
  methods: {
    toSrcIcon(name) {
      return getFileType(name)
    },
    toSizeFile(size) {
      return formatBytes(size)
    },
    fileDelete(index) {
      this.fileList.splice(index, 1)
    },
    // 查看与下载附件
    lookViewer(item) {
      let url = ''
      if (item.file_url) {
        url = item.file_url
      }
      if (item.url) {
        url = item.url
      }
      if (item.src) {
        url = item.src
      }
      const name = item.name
      if (isTypeImage(url)) {
        this.$refs.imageViewer.openImageViewer(url)
      } else {
        fileLinkDownLoad(url, name)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.fileItem {
  cursor: pointer;
  width: 100%;
  background-color: #f6f7f9;
  display: flex;
  height: auto;
  line-height: 1;
  align-items: center;
  padding: 6px;
  position: relative;
  margin-bottom: 8px;
  &:last-of-type {
    margin-bottom: 0;
  }
  .file-close {
    font-size: 18px;
    position: absolute;
    top: 10px;
    right: 10px;
    color: #c0c4cc;
    cursor: pointer;
  }
  .file-item-left {
    width: 36px;
    cursor: pointer;
    .iconfont {
      font-size: 36px;
    }
    .img {
      display: inline-block;
      width: 36px;
      height: 36px;
    }
  }
  .file-item-right {
    width: 210px;
    height: 36px;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    padding: 0 20px 0 6px;
    .file-name {
      font-size: 13px;
      line-height: 1.5;
    }
    .file-size {
      font-size: 12px;
      line-height: 1.5;
    }
  }
}
</style>
