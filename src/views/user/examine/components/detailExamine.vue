<template>
  <div>
    <!-- 审批详情 -->
    <el-drawer
      size="628px"
      :visible.sync="drawer"
      :direction="direction"
      :append-to-body="true"
      :before-close="handleClose"
    >
      <div slot="title">
        <div v-if="examineData.card" class="headerBox acea-row row-middle row-between">
          <div class="acea-row row-middle">
            <div class="portrait mr10">
              <img v-if="judge(examineData)" :src="examineData.card.avatar" alt="" />
              <img v-else src="../../../../assets/images/portrait.png" alt="" />
            </div>
            <div class="nameBox">
              <span class="st1"
                >{{ examineData.card.name }}的{{ examineData.approve ? examineData.approve.name : '请假' }}</span
              >
              <span class="st2" :class="examineData.status === 0 ? 'default-color' : 'st-color'">
                {{ $func.getExamineStatus(examineData.status) }}
              </span>
            </div>
          </div>

          <div v-if="examineData.status == 0">
            <el-button v-if="examineData.verify_status === 0" type="danger" size="small" @click="onAgree(0)"
              >拒绝</el-button
            >
            <el-button v-if="examineData.verify_status === 0" type="primary" size="small" @click="onAgree(1)"
              >同意</el-button
            >
          </div>
          <el-button
            v-if="examineData.status == 0 && examineData.verify_status !== 0"
            type="primary"
            size="small"
            @click="urgentProcessing()"
            >催办</el-button
          >
        </div>
      </div>
      <div class="ex-content">
        <el-scrollbar style="height: 100%">
          <div class="ex-content-con" :class="isShow ? 'pb-120' : ''">
            <div class="acea-row mb20">
              <div class="shu mr10"></div>
              <div class="title">提交审批</div>
            </div>
            <el-form label-width="100px" class="">
              <el-form-item v-for="(item, index) in form.rule" :key="index">
                <div class="label">
                  <span class="rule-label">{{ item.label }}:</span>
                  <div v-if="Array.isArray(item.value)" style="width: 90%">
                    <upload-list :file-list="item.value"></upload-list>
                  </div>
                  <span v-else class="rule-value">{{ item.value || '--' }}</span>
                </div>
              </el-form-item>
            </el-form>
            <detail-procecss v-if="examineData.examine != 0" :examine-data="examineData"></detail-procecss>
            <message-from
              class="flex-bottom"
              v-if="examineData.examine != 0"
              :examine-data="examineData"
              @upDate="upDate"
              ref="leaveAMessage"
            ></message-from>
            <div class="from-foot-btn fix" v-if="examineData.examine != 0">
              <div class="flex" v-if="isShow">
                <img class="avatar" :src="avatar" alt="" />
                <div class="replyCon">
                  <el-input
                    ref="replyInput"
                    v-model="textarea"
                    placeholder="添加留言"
                    resize="none"
                    type="textarea"
                    class="replyText"
                  />
                  <div class="bnt">
                    <el-button size="small" @click="cancel">{{ $t('public.cancel') }}</el-button>
                    <el-button size="small" type="primary" @click="submitReply">提交</el-button>
                  </div>
                </div>
              </div>
              <template v-else>
                <div class="flex" @click="evaluate">
                  <img class="avatar" :src="avatar" alt="" />
                  <div class="replyCon-no">添加评论</div>
                </div>
              </template>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import func from '@/utils/preload'
import { approveApplyEditApi, approveVerifyStatusApi, approveApplyUrgeApi, approveReplyApi } from '@/api/business'
import uploadList from '@/components/form-common/oa-uploadList'
export default {
  name: 'DetailExamine',
  components: {
    detailProcecss: () => import('./detailProcecss'),
    messageFrom: () => import('./messageFrom'),
    uploadList,
    city: () => import('@/components/hr/city')
  },
  data() {
    return {
      drawer: false,
      direction: 'rtl',
      fapi: null,
      rules: [],
      avatar: this.$store.state.user.userInfo.avatar,
      form: {
        rule: [],
        formData: {},
        loaded: false,
        options: {
          submitBtn: false,
          form: {
            labelWidth: '130px'
          },
          preview: true
        }
      },
      isRequest: true,
      examineData: {},
      textarea: '',
      isShow: false
    }
  },
  beforeCreate() {
    this.$vue.prototype.$func = func
  },
  methods: {
    async submitReply() {
      if (this.textarea == '') {
        return this.$message.error('请输入留言')
      }
      await approveReplyApi({
        apply_id: this.examineData.id,
        content: this.textarea
      })
      await this.upDate(this.examineData.id)
      this.textarea = ''
      this.isShow = false
    },
    evaluate() {
      this.textarea = ''
      this.isShow = true
      setTimeout(() => {
        this.$refs.replyInput.focus()
      }, 300)
    },
    cancel() {
      this.isShow = false
    },
    handleClose() {
      this.close()
    },
    close() {
      this.drawer = false
      this.isShow = false
    },

    findNamesByIds(tree, id) {
      let ids = id.map((str) => parseInt(str))
      let result = []
      function traverse(node) {
        if (ids.includes(node.value)) {
          result.push(node.text)
        }
        if (node.children) {
          for (const child of node.children) {
            traverse(child)
          }
        }
      }
      for (const node of tree) {
        traverse(node)
      }

      let str = result.join(' - ')
      return str
    },

    judge(row) {
      return row.card.avatar.includes('https')
    },
    getLabel(options, name) {
      let text = ''
      options.map((item) => {
        if (item.value == name) {
          text = item.label
        }
      })
      return text
    },
    // 催办
    async urgentProcessing() {
      await approveApplyUrgeApi(this.examineData.id)
    },
    async onAgree(n) {
      await approveVerifyStatusApi(this.examineData.id, n)
      this.drawer = false
      this.$emit('getList')
    },
    openBox(command) {
      const data = { types: 1 }
      this.form.loaded = false
      let id = command.apply_id ? command.apply_id : command.id
      this.approveApply(id, data)
    },
    upDate(id) {
      const data = { types: 1 }
      this.form.loaded = false
      this.approveApply(id, data)
    },
    // 获取表单配置
    approveApply(id, data) {
      approveApplyEditApi(id, data).then((res) => {
        this.drawer = true
        this.examineData = res.data
        let rule = []
        const formData = {}

        rule = res.data.content
        this.form.rule = rule
        this.form.formData = formData
        this.form.loaded = true
      })
    }
  }
}
</script>

<style scoped lang="scss">
.number {
  font-size: 13px;
  color: #000000;
  font-style: normal;
  font-weight: 400;
  margin-left: 4px;
}
/deep/ .el-drawer__header {
  height: 80px;
}
.headerBox {
  .portrait {
    width: 48px;
    height: 48px;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .nameBox {
    span {
      display: block;
    }
    .st1 {
      font-size: 15px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
    }
    .st2 {
      font-size: 13px;
      margin-top: 6px;
    }
    .st-color {
      color: rgb(25, 190, 107);
    }
  }
}
.infoBox {
  display: inline-block;
  font-size: 13px;
  .titles {
    color: #999999;
  }
  .box {
    width: 50%;
  }
  .content {
    color: #000000;
  }
}
.iconBox {
  width: 46px;
  height: 46px;
  background: #1890ff;
  border-radius: 6px;
  color: #fff;
  font-size: 26px;
  line-height: 46px;
  text-align: center;
}

.iBox {
  background: #cccccc;
  i {
    color: #fff;
  }
}

.titleBox {
  color: #000000;
  font-size: 16px;
  line-height: 46px;
  font-weight: 600;
}
/deep/ .el-drawer__body {
  padding-bottom: 0;
}
.ex-content {
  padding: 20px 0 0 20px;
  height: 100%;
  .ex-content-con.pb-120 {
    padding-bottom: 120px;
  }
  .ex-content-con {
    padding-right: 30px;
    padding-bottom: 50px;
  }
  /deep/.select-item {
    margin-top: 0 !important;
  }
  /deep/ .el-divider--horizontal {
    margin-top: 0;
    margin-bottom: 30px;
  }
  /deep/.el-form-item__label {
    font-size: 13px;
    color: #999999;
    font-weight: normal;
  }
  /deep/.el-form-item {
    margin-bottom: 0;
  }
  /deep/.el-form-item__content {
    font-size: 13px;
    color: #000000;
  }
  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden;
  }
  .shu {
    width: 3px;
    height: 16px;
    background: #1890ff;
    display: inline-block;
  }
  .title {
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }
}
.label {
  display: flex;
  align-items: center;

  .rule-label {
    display: inline-block;
    width: 100px;
    text-align: right;
    color: #606266;
    white-space: nowrap;
    padding: 0 12px 0 0;
  }
  .rule-value {
    line-height: 24px;
    width: 90%;
  }
}
/deep/.el-form-item__content {
  margin-left: 0 !important;
}
.flex {
  display: flex;
  width: 100%;
  margin: 4px 20px 0px 0;

  .avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    margin-right: 10px;
    object-fit: cover;
  }
}

.replyCon-no {
  cursor: pointer;
  flex: 1;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px 10px;
  height: 40px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.25);
}
// 动画高度 从40px 到 120px
@keyframes show {
  0% {
    height: 40px;
  }
  100% {
    height: 120px;
  }
}
// 动画高度 从120px 到 40px
@keyframes hide {
  0% {
    height: 120px;
  }
  100% {
    height: 40px;
  }
}

.replyCon {
  flex: 1;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px 0;
  height: 120px;
  font-size: 13px;

  animation: show 0.3s ease-in-out forwards;
  .bnt {
    text-align: right;
    margin: 10px 10px 0 0;
  }
  .replyText {
    /deep/.el-textarea__inner {
      border: 0;
      padding: 0 10px;
    }
  }
  /deep/.el-textarea__inner {
    height: 55px;
  }
}
.from-foot-btn {
  height: max-content;
}
</style>
