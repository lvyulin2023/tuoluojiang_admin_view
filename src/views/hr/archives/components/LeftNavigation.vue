<template>
  <div class="assess-left v-height-flag">
    <!-- 个人头像 -->
    <div class="head-portrait">
      <div v-if="user !== '个人简历'" class="avatar">
        <img v-if="imageUrl" :src="imageUrl" class="img" @click="beforeUpload" />
        <img v-else alt="" class="img" src="@/assets/images/portrait.png" @click="beforeUpload" />
      </div>
      <div v-if="user == '个人简历'" class="avatar">
        <el-upload
          :headers="myHeaders"
          :http-request="uploadServerLog"
          :show-file-list="false"
          action="##"
          class="upload-demo"
        >
          <img v-if="imageUrl" :src="imageUrl" class="img" />

          <img v-else alt="" class="img" src="@/assets/images/portrait.png" />
        </el-upload>
      </div>

      <div class="updata-text">
        <span class="certificates">{{ userInfo ? userInfo.name : '证件照' }}</span>

        <span class="certificates-text"> {{ userInfo ? userInfo.position : '建议：734*1034 大小不超过2M' }}</span>
        <span v-if="userInfo">
          <span v-if="userInfo.type == '在职'" class="unread bg1">{{ userInfo.type }}</span>
          <span v-if="userInfo.type == '未入职'" class="unread bg2" type="info">{{ userInfo.type }}</span>
          <span v-if="userInfo.type == '离职'" class="unread bg3" effect="plain" type="info">{{ userInfo.type }}</span>
        </span>
      </div>
    </div>
    <div class="line" />
    <div class="catalogue">简历目录</div>
    <div>
      <ul class="assess-left-ul">
        <li
          v-for="(item, index) in departmentData"
          :key="index"
          :class="['li-style', index === tabIndex && 'li-active']"
          @click="clickDepart(index, item.id)"
        >
          <a :navTo="`#${index}`" rel="external nofollow"
            >{{ item.name }} <i :class="[user === '个人简历' ? item.icon : '']"></i
          ></a>
        </li>
      </ul>
    </div>
    <el-dialog
      :append-to-body="true"
      :before-close="handleClose"
      :visible.sync="dialogVisible"
      title="选择图片"
      width="850px"
    >
      <upload-picture ref="uploadPicture" :check-button="true" @getImage="getImage"></upload-picture>
    </el-dialog>
  </div>
</template>

<script>
import { putCardApi } from '@/api/enterprise'
import { getToken } from '@/utils/auth'

import { uploader } from '@/utils/uploadCloud'
export default {
  name: '',
  props: {
    componentStatus: {
      type: Object,
      default: () => {}
    },
    tabtypes: {
      type: [String, Number, Boolean],
      default: 1
    },
    imageUrl: {
      type: String,
      default: ''
    },
    userInfo: {
      type: Object,
      default: () => {}
    },
    user: {
      type: String,
      default: () => ''
    }
  },

  data() {
    return {
      tabIndex: 0,
      imgSrc: '',
      uploadSize: 5,
      dialogVisible: false,
      myHeaders: {
        authorization: 'Bearer ' + getToken()
      },
      uploadData: {},
      newDepartment: [
        {
          name: '职工信息',
          id: 0
        },
        {
          name: '个人信息',
          id: 1
        },
        {
          name: '学历信息',
          id: 1
        },
        {
          name: '紧急联系人',
          id: 1
        },

        {
          name: '工作经历',
          id: 3,
          type: 8
        },
        {
          name: '教育经历',
          id: 3,
          type: 9
        }
      ],
      department: [
        {
          name: '基本信息',
          id: 0
        },
        {
          name: '职工信息',
          id: 1
        },
        {
          name: '个人信息',
          id: 2
        },
        {
          name: '学历信息',
          id: 3
        },
        {
          name: '个人材料',
          id: 4,
          icon: 'el-icon-warning'
        },
        {
          name: '银行卡信息',
          id: 4,
          icon: 'el-icon-warning'
        },
        {
          name: '社保信息',
          id: 5,
          icon: 'el-icon-warning'
        },
        {
          name: '紧急联系人',
          id: 6
        },

        {
          name: '工作经历',
          id: 8
        },
        {
          name: '教育经历',
          id: 9
        },
        {
          name: '系统信息',
          id: 10
        }
      ]
    }
  },

  methods: {
    clickDepart(index, id) {
      this.tabIndex = index
      this.$emit('pageJump', id, index)
    },
    // 关闭弹窗
    handleClose() {
      this.dialogVisible = false
      this.$refs.uploadPicture.getFileList('')
      this.$refs.uploadPicture.selectItem = []
      this.$refs.uploadPicture.checkPicList = []
    },
    //  开启弹窗
    beforeUpload() {
      this.dialogVisible = true
    },

    // 上传文件方法
    uploadServerLog(params) {
      const file = params.file
      let options = {
        way: 1,
        relation_type: '',
        relation_id: '',
        eid: ''
      }
      uploader(file, 1, 2, options)
        .then((res) => {
          // 获取上传文件渲染页面
          if (res.name) {
            this.$emit('getImageUrl', res.url)
          }
        })
        .catch((err) => {})
    },

    // 获取弹窗
    async getImage(data) {
      this.$emit('getImageUrl', data.att_dir)
      let photo = data.att_dir
      if (this.componentStatus.type == 'edit') {
        let data = {
          edit_type: 'photo',
          photo: photo
        }
        await putCardApi(this.userInfo.id, data)
      }
      this.handleClose()
    }
  },

  computed: {
    departmentData() {
      switch (this.componentStatus.type) {
        case 'edit': {
          if (this.tabtypes === 0) {
            return this.newDepartment.filter((item) => ![8, 9].includes(item.type))
          } else {
            return this.department.filter((item) => ![8, 9].includes(item.id))
          }
        }
        case 'add': {
          if (this.tabtypes === 0) {
            return this.newDepartment
          }
          if (this.user == '个人简历') {
            return this.department.filter((item) => item.name !== '基本信息' && item.name !== '系统信息')
          }
        }
        default: {
          return this.department
        }
      }
    }
  },

  components: {
    uploadPicture: () => import('@/components/uploadPicture/index')
  }
}
</script>

<style lang="scss" scoped>
a {
  color: #333333 !important;
  position: relative;
  font-size: 13px;
}
.line {
  width: 100%;
  height: 4px;
  border-bottom: 1px solid #ebeef5;
  margin-top: 16px;
}
.catalogue {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  margin: 20px 0 20px 15px;
}
.el-icon-warning {
  position: absolute;
  top: 3px;
  margin-left: 2px;
  color: #1890ff;
  opacity: 0.5;
  font-size: 10px;
}
.archives {
  display: flex;
}
.unread {
  position: relative;
  font-size: 13px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #1890ff;
}
.bg2 {
  color: #c0c4cc;
}
.bg3 {
  color: #c0c4cc;
}
.bg1::before,
.bg2::before,
.bg3::before {
  content: ' ';
  position: absolute;
  left: -8px;
  top: 5px;
  width: 4px;
  height: 4px;
  display: inline-block;
  border-radius: 50%;
}
.bg1::before {
  background: #1890ff;
}
.bg2::before {
  background: #c0c4cc;
}
.bg3::before {
  background: #c0c4cc;
}

.assess-left {
  height: 100%;
  padding-top: 20px;
  border-right: 1px solid #eeeeee;

  .head-portrait {
    .avatar {
      width: 100%;
      margin-top: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      .img {
        width: 110px;
        height: 140px;
        padding: 4px;
        border: 1px solid #c0c4cc;
      }
      .avatar-uploader-icon {
        border: 1px dashed #d9d9d9;
        font-size: 14px;
        color: #8c939d;
        text-align: center;
        cursor: pointer;
      }
    }

    .updata-text {
      margin-top: 30px;
      font-size: 10px;
      color: #666;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .certificates {
        display: inline-block;
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #606266;
      }

      .certificates-text {
        display: inline-block;
        font-size: 13px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        margin: 5px 20px;
        color: #c0c4cc;
        text-align: center;
      }
    }
  }
  /deep/ .el-card__header {
    border-bottom: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0;
    padding-bottom: 10px;
    button {
      justify-content: flex-end;
    }
  }
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  overflow: auto;
  .assess-left-ul {
    //height: calc(100vh - 320px);
    //overflow: scroll;
    overflow-x: hidden;
    list-style: none;
    margin: 0;
    padding: 0 0 80px;
    position: relative;
    .li-style {
      width: 100%;
      font-size: 13px;
      padding: 15px 0;
      text-align: center;
      color: #000000;
      cursor: pointer;
      box-sizing: content-box;
      .assess-left-more {
        color: #333333;
        text-align: right;
        position: absolute;
        transform: rotate(90deg);
      }
    }

    .li-active {
      background-color: rgba(24, 144, 255, 0.08);
      border-right: 6px solid #1890ff;
      a {
        color: #1890ff !important;
      }
      .assess-left-more {
        color: #1890ff;
      }
    }
  }
  .assess-left-ul::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}
.assess-left::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #f5f5f5;
}
.assess-left::-webkit-scrollbar-track {
  /*滚动条里面轨道*/
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  background: #f0f2f5;
}

/deep/ .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
/deep/ .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
}
/deep/ .el-upload--picture-card {
  width: 90px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  line-height: 110px;
  position: relative;
  overflow: hidden;
}
</style>
