<template>
  <div>
    <el-drawer
      :append-to-body="true"
      :before-close="handleClose"
      :modal="true"
      :title="!!this.editId && this.editType ? newTitle : title"
      :visible.sync="drawer"
      :wrapper-closable="true"
      :wrapperClosable="editType ? true : false"
      direction="rtl"
      size="920px"
    >
      <div slot="title" class="invoice-title">
        <span>{{ !!this.editId && this.editType ? newTitle : title }}</span>
        <div class="time">{{ editData.created_at || '' }}</div>
      </div>

      <div
        ref="rollBottom"
        :class="isShow ? 'pb-120' : ''"
        :style="'height:' + rollHeight + 'px;'"
        class="form-box mt20"
      >
        <!-- 汇报人 -->
        <div class="report">
          <div class="title">汇报给</div>
          <select-member ref="selectMember" :value="examineData" style="width: 100%" @getSelectList="getSelectList">
            <template v-slot:custom>
              <div class="flex-user">
                <div v-if="!disabled" class="addPeople" @click="handlesuperiorOpen">
                  <span class="iconfont icontianjia"></span>添加
                </div>
                <div v-for="(item, index) in examineData" :key="index" class="user">
                  <img :src="item ? item.avatar : item.avatar" alt="" class="img" />
                  <span> {{ item.name || '--' }}</span>
                  <span v-if="!disabled" class="iconfont iconcha" @click="userDelete(item)"></span>
                </div>
              </div>
            </template>
          </select-member>
        </div>

        <!-- 日报内容 -->
        <el-form ref="ruleForm" :model="ruleForm" :rules="rules" class="demo-ruleForm" label-width="100px">
          <el-row :gutter="20">
            <el-col :span="report_show ? 24 : 12">
              <div :class="!disabled ? 'border' : ''" class="today-work">
                <el-form-item
                  v-if="needList.length && !disabled && !editId"
                  :label="title01"
                  class="item-bar today-bar-list"
                  prop="finish"
                >
                  <el-input
                    ref="finish"
                    v-model="ruleForm.finish"
                    :disabled="disabled"
                    :maxlength="2000"
                    autosize
                    resize="none"
                    show-word-limit
                    type="textarea"
                    @change="changeSize"
                    @input="changeSize"
                  />
                  <div v-if="needList.length && !disabled && !editId" class="todo">
                    <div class="title">
                      未完成待办
                      <span>（点击生成今日完成事项）</span>
                    </div>
                    <div class="todo-list">
                      <div v-for="(item, index) in needList" :key="index" class="item">
                        <i
                          v-if="item.finish === 0 || item.finish === 1 || item.finish === -1"
                          :class="item.checked ? 'checked el-icon-check' : 'square'"
                          class="dealt-icon"
                          @click="setScheduleRecord(item, 3, index)"
                        ></i>
                        <span>{{ item.title }}</span>
                      </div>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item v-else :label="title01" class="item-bar today-bar" prop="finish">
                  <el-input
                    ref="finish"
                    v-model="ruleForm.finish"
                    :disabled="disabled"
                    :maxlength="2000"
                    autosize
                    resize="none"
                    show-word-limit
                    type="textarea"
                    @change="changeSize"
                    @input="changeSize"
                  />
                </el-form-item>
              </div>
            </el-col>
            <el-col v-if="!report_show" :span="12">
              <div :class="!disabled ? 'border' : ''" class="item-bar-box">
                <el-form-item :label="title02" class="item-bar" prop="plan">
                  <el-input
                    ref="plan"
                    v-model="ruleForm.plan"
                    :disabled="disabled"
                    :maxlength="2000"
                    autosize
                    resize="none"
                    show-word-limit
                    type="textarea"
                    @change="changeSize"
                    @input="changeSize"
                  />
                </el-form-item>
              </div>
            </el-col>
          </el-row>
          <!-- 备注 -->
          <el-form-item v-if="!editType || ruleForm.mark" :label="$t('public.remarks')" class="m-b-30 m-t-20">
            <el-input
              v-model="ruleForm.mark"
              :disabled="disabled"
              :rows="4"
              resize="none"
              type="textarea"
              @change="updateValue"
            />
          </el-form-item>
          <el-form-item
            v-if="attachList.length || (!attachList.length && !editType)"
            :label="attachList.length || (!attachList.length && !editType) ? '附件' : ''"
            class="m-b-30"
          >
            <!-- 附件上传-->
            <upload-file
              :file-list="attachList"
              :fileWidth="`420px`"
              :params="fileParams"
              :show-close="!editId || !editType"
              class="upload-file"
              editType="editType"
              url="/system/attach/upload"
              @on-success="handleSuccess"
            ></upload-file>
          </el-form-item>
        </el-form>
        <div v-if="editId && editType" class="list">
          <div
            v-for="(item, index) in replyList"
            :key="index"
            :class="item.paent_user ? 'parent-replay' : ''"
            class="item acea-row row-between"
          >
            <el-avatar v-if="item.card.avatar" :size="38" :src="item.card.avatar" />
            <el-avatar v-else :size="38" icon="el-icon-user-solid" />
            <div :class="{ 'parent-replay-text': item.paent_user }" class="pictxt">
              <div class="name acea-row row-between-wrapper">
                <div v-if="item.paent_user">
                  {{ item.card.name }}<span class="created-at">{{ item.created_at }}</span>
                  <div class="acea-row reply">
                    <span class="keyword">{{ $t('public.reply') }}{{ item.paent_user.card.name }}:</span>
                    <span class="reply-text">{{ item.content }}</span>
                  </div>
                </div>
                <div v-else>
                  {{ item.card.name }}<span class="created-at">{{ item.created_at }}</span>
                </div>
              </div>
              <div class="text acea-row row-between-wrapper">
                <div v-if="!item.paent_user" class="textCon">{{ item.content }}</div>
                <div v-if="item.card.uid === uid" class="reply" @click="deleteReply(item.id, item.daily_id, index)">
                  {{ $t('public.delete') }}
                </div>
                <div v-else class="reply" @click="replyBnt(item)">{{ $t('public.reply') }}</div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div v-if="isShow" class="replyCon">
          <el-input v-model="reply.content" :placeholder="textPla" resize="none" type="textarea" class="replyText" />
          <div class="bnt">
            <el-button size="small" @click="cancel">{{ $t('public.cancel') }}</el-button>
            <el-button size="small" type="primary" @click="submitReply">提交</el-button>
          </div>
        </div> -->
      </div>
      <div class="from-foot-btn fix btn-shadow">
        <div v-if="isShow" class="flex">
          <img :src="avatar" alt="" class="avatar" />
          <div class="replyCon">
            <el-input
              ref="replyInput"
              v-model="reply.content"
              :placeholder="textPla"
              class="replyText"
              resize="none"
              type="textarea"
            />
            <div class="bnt">
              <el-button size="small" @click="cancel">{{ $t('public.cancel') }}</el-button>
              <el-button size="small" type="primary" @click="submitReply">提交</el-button>
            </div>
          </div>
        </div>
        <template v-else>
          <el-button v-if="!disabled" size="small" @click="closeBtn">{{ $t('public.cancel') }}</el-button>
          <div v-if="editId && disabled" class="flex" @click="evaluate">
            <img :src="avatar" alt="" class="avatar" />
            <div class="replyCon-no">添加评论</div>
          </div>
          <el-button v-else :loading="saveLoading" size="small" type="primary" @click="submitForm('ruleForm')">
            {{ $t('public.save') }}
          </el-button>
        </template>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { enterpriseDaily, getEnterpriseEdit, dailyReply, dailydel, getDailyEdit, getCompleted } from '@/api/enterprise'
import file from '@/utils/file'
import uploadFile from '@/components/user/uploads-file'
import { dailyReportMemberApi } from '@/api/business'
import { scheduleStatusApi } from '@/api/user'
import Vue from 'vue'
Vue.use(file)
export default {
  props: {
    editData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    editId: {
      type: [String, Number],
      default: ''
    },
    dailyId: {
      type: [String, Number],
      default: 1
    },
    needList: {
      type: Array,
      default: () => {
        return []
      }
    },
    finishList: {
      type: String,
      default: ''
    }
  },
  watch: {
    finishList: {
      handler(newVal, oldVal) {
        let data = []
        data = [this.ruleForm.finish, this.checkedList]
        this.ruleForm.finish = data
          .map((item, index) => {
            if (index === data.length - 1) {
              return item
            } else {
              return item + '\n'
            }
          })
          .join('')
        this.ruleForm.finish = this.ruleForm.finish.replace(/\n+/g, '\n')
        this.ruleForm.finish = this.ruleForm.finish.replace(/^\n/, '')
      }
    }
  },
  components: {
    uploadFile,
    selectMember: () => import('@/components/form-common/select-member')
  },
  data() {
    const checkFinish = (rule, value, callback) => {
      if (!value && this.dailyId === 1) {
        return callback(new Error(this.$t('user.work.title')))
      } else if (!value && this.dailyId === 2) {
        return callback(new Error('请填写本周工作'))
      } else if (!value && this.dailyId === 3) {
        return callback(new Error('请填写本月工作'))
      } else {
        callback()
      }
    }
    const checkPlan = (rule, value, callback) => {
      if (!value && this.dailyId === 1) {
        return callback(new Error(this.$t('user.work.tilte1')))
      } else if (!value && this.dailyId === 2) {
        return callback(new Error('请填写下周计划'))
      } else if (!value && this.dailyId === 3) {
        return callback(new Error('请填写下月计划'))
      } else {
        callback()
      }
    }
    return {
      drawer: false,
      examineData: [], // 参与人
      ruleForm: {
        finish: [],
        plan: [],
        mark: '',
        attach_ids: '',
        types: 0
      },
      rules: {
        finish: [{ required: true, validator: checkFinish, trigger: 'blur' }],
        plan: [{ required: true, validator: checkPlan, trigger: 'blur' }]
      },
      reply: {
        content: '',
        daily_id: '',
        pid: 0
      },
      uploadData: {},
      isShow: false,
      replyList: [],
      uid: this.$store.state.user.userInfo.uid,
      avatar: this.$store.state.user.userInfo.avatar,
      id: 0,
      ids: [],
      rollHeight: '',
      editType: false, // 是否可以编辑
      textPla: this.$t('user.work.title2'),
      types: -1,
      minHeight: 420,
      fileList: [],
      uploadSize: 2,
      loading: false,
      report_show: false,
      result: [],
      attachList: [],
      saveLoading: false,
      newTitle: '',
      checked: false,
      fileParams: {
        relation_type: 'daily',
        relation_id: 0,
        way: 3,
        eid: 0
      },
      checkedList: ''
    }
  },
  computed: {
    disabled() {
      const status = !!this.editId
      return status && this.editType
    },
    title() {
      let title = this.$t('user.work.writedaily')
      if (!!this.editId && !this.editType) {
        title = this.$t('user.work.editdaily')
      } else if (!this.editId) {
        if (this.dailyId === 1) {
          title = this.$t('user.work.writedaily')
        } else if (this.dailyId === 2) {
          title = this.$t('user.work.writedailyweek')
        } else if (this.dailyId === 3) {
          title = this.$t('user.work.writedailymonth')
        } else if (this.dailyId === 4) {
          title = '填写汇报'
        }
      }
      return title
    },
    title01() {
      let title = ''
      if (!this.editId) {
        if (this.dailyId === 1) {
          title = this.$t('user.work.todaywork')
        } else if (this.dailyId === 2) {
          title = this.$t('user.work.weekwork')
        } else if (this.dailyId === 3) {
          title = this.$t('user.work.monthwork')
        } else if (this.dailyId === 4) {
          title = '填写汇报'
          this.report_show = true
        }
      } else {
        if (this.types === 0) {
          title = this.$t('user.work.todaywork')
        } else if (this.types === 1) {
          title = this.$t('user.work.weekwork')
        } else if (this.types === 2) {
          title = this.$t('user.work.monthwork')
        } else if (this.dailyId === 3) {
          title = '填写汇报'
        }
      }
      return title
    },

    title02() {
      let title = ''

      if (!this.editId) {
        if (this.dailyId === 1) {
          title = '下个工作日计划'
        } else if (this.dailyId === 2) {
          title = this.$t('user.work.nextweekplan')
        } else if (this.dailyId === 3) {
          title = this.$t('user.work.nextmonthplan')
        } else if (this.dailyId === 4) {
          title = '填写汇报'
        }
      } else {
        if (this.types === 0) {
          title = '下个工作日计划'
        } else if (this.types === 1) {
          title = this.$t('user.work.nextweekplan')
        } else if (this.types === 2) {
          title = this.$t('user.work.nextmonthplan')
        } else if (this.dailyId === 3) {
          title = '填写汇报'
        }
      }
      return title
    }
  },
  mounted() {
    this.getCompletedFn()
    this.approveApplyList()
    this.rollHeight = `${document.documentElement.clientHeight}` - 66 - 50
    const that = this
    window.onresize = function () {
      that.rollHeight = `${document.documentElement.clientHeight}` - 66 - 50
    }
  },
  methods: {
    async scheduleStatus() {
      await scheduleStatusApi()
    },
    updateValue() {
      this.$emit('updateValue', this.ruleForm.finish)
    },
    // 点击完成待办
    setScheduleRecord(item, status, index) {
      this.checkedList = ''
      this.checkedList = item.title
      let info = {
        status,
        start: item.start_time,
        end: item.end_time
      }
      scheduleStatusApi(item.id, info)
      item.checked = true
      setTimeout(() => {
        this.$emit('getDailyTodoInfo')
      }, 500)
    },
    // 获取人员配置表单
    approveApplyList(id, data) {
      dailyReportMemberApi(id, data).then((res) => {
        if (!this.editId) {
          this.examineData = []
          res.data.map((item) => {
            let obj = {
              value: item.card.id,
              name: item.card.name,
              avatar: item.card.avatar
            }
            this.examineData.push(obj)
          })
        }
      })
    },
    async getCompletedFn() {
      let type = this.dailyId - 1
      const result = await getCompleted(type)
      this.ruleForm.finish = result.data.finish.map((item) => item + '\n').join('')
      this.ruleForm.plan = result.data.plan.map((item) => item + '\n').join('')
    },
    getInfo(editId, type, data) {
      if (data && data.types == 3) {
        this.report_show = true
      } else {
        this.report_show = false
      }
      this.editType = type
      getEnterpriseEdit(editId).then((res) => {
        const data = res.data
        this.newTitle = data.card.name + '的汇报'
        this.ids = []
        this.reply.daily_id = editId
        this.drawer = true
        this.ruleForm.finish = data.finish.map((item) => item + '\n').join('')
        this.ruleForm.plan = data.plan.map((item) => item + '\n').join('')
        this.ruleForm.mark = data.mark
        this.types = data.types
        this.replyList = data.replys
        this.attachList = data.attachs
        if (this.editId) {
          this.examineData = []
          data.members.map((item) => {
            let obj = {
              value: item.card.id,
              name: item.card.name,
              avatar: item.card.avatar
            }
            this.examineData.push(obj)
          })
        }
      })
    },
    async submitReply() {
      this.reply.pid = this.id
      await dailyReply(this.reply)
      await this.getInfo(this.editId, true, this.editData)
      this.isShow = false
    },
    changeSize() {
      let fH = this.$refs.finish.$el.clientHeight
      let pH = this.$refs.plan.$el.clientHeight
      if (fH > this.minHeight || pH > this.minHeight) {
        if (fH > pH) {
          this.$refs.plan.$el.firstChild.style.height = fH + 'px'
          this.$refs.finish.$el.firstChild.style.height = fH + 'px'
        }
        if (fH < pH) {
          this.$refs.finish.$el.firstChild.style.height = pH + 'px'
          this.$refs.plan.$el.firstChild.style.height = pH + 'px'
        }
      }
    },
    deleteReply(id, dailyId, index) {
      this.$modalSure(this.$t('user.work.title4')).then(() => {
        dailydel(id, dailyId).then((res) => {
          this.replyList.splice(index, 1)
        })
      })
    },
    replyBnt(item) {
      this.textPla = this.$t('public.reply') + ': ' + `${item.card.name}`
      this.reply.content = ''
      this.id = item.id
      this.isShow = true
      this.$nextTick(() => {
        this.$refs.rollBottom.scroll(0, this.rollHeight)
      })
    },
    evaluate() {
      this.reply.content = ''
      this.id = 0
      this.isShow = true
      this.textPla = this.$t('user.work.writecomment')
      this.$nextTick(() => {
        this.$refs.rollBottom.scroll(0, this.rollHeight)
      })
      setTimeout(() => {
        this.$refs.replyInput.focus()
      }, 300)
    },
    cancel() {
      this.isShow = false
      this.report_show = false
      this.textPla = this.$t('user.work.writedaily')
    },
    handleClose() {
      this.resetForm()
      this.drawer = false
      this.report_show = false
      this.$refs.ruleForm.clearValidate()
    },
    closeBtn() {
      this.resetForm()
      this.$refs.ruleForm.clearValidate()
      if (this.editId) {
        this.drawer = false
      }
      if (this.editId && this.disabled) {
        this.$emit('tableList')
      }
      this.report_show = false
      this.drawer = false
    },
    handleExamineDataUpdate(newData) {
      this.examineData = newData
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.editId <= 0) {
            this.ruleForm.types = this.dailyId - 1
          } else {
            this.ruleForm.types = this.types
          }

          const processInfo = this.examineData
          processInfo.forEach((value, index) => {
            if (value.length <= 0) {
              processInfo.splice(index, 1)
            }
          })
          let ids = []
          this.attachList.map((item) => {
            ids.push(item.id)
          })
          this.ruleForm.attach_ids = ids.join(',')
          let members = []
          if (processInfo.length == 0) {
            this.$message.error('请选择汇报人')
            return
          }
          if (processInfo.length > 0) {
            processInfo.forEach((item) => {
              members.push(item.value)
            })
          }
          let data = {
            finish: this.ruleForm.finish.split('\n').filter((item) => item.trim() !== ''),
            plan: this.ruleForm.plan.split('\n').filter((item) => item.trim() !== ''),
            members: members,
            types: this.ruleForm.types,
            mark: this.ruleForm.mark,
            attach_ids: this.ruleForm.attach_ids
          }
          if (this.report_show) {
            data.plan = []
          }
          this.saveLoading = true
          const head = this.editId ? getDailyEdit(data, this.editId) : enterpriseDaily(data)
          head
            .then((res) => {
              this.$emit('tableList')
              this.resetForm()
              this.drawer = false
              this.saveLoading = false
            })
            .catch((err) => {
              this.resetForm()
              this.drawer = false
              this.saveLoading = false
            })
        } else {
          return false
        }
      })
    },
    resetForm() {
      this.isShow = false
      this.textPla = this.$t('user.work.writedaily')
      this.ruleForm = {
        finish: '',
        plan: '',
        mark: '',
        attach_ids: []
      }
      this.attachList = []
      this.$refs.ruleForm.resetFields()
    },
    // 上传成功
    handleSuccess(response) {
      this.attachList.push(response)
    },
    // 添加参与人
    handlesuperiorOpen() {
      this.$refs.selectMember.handlePopoverShow()
    },
    // 删除参与人
    userDelete(val) {
      this.examineData = this.examineData.filter((item) => {
        return item.value != val.value
      })
    },

    // 获取部门回调
    getSelectList(data) {
      this.examineData = data
    }
  }
}
</script>
<style lang="scss" scoped>
::-webkit-scrollbar-thumb {
  -webkit-box-shadow: inset 0 0 6px #ccc;
}
::-webkit-scrollbar {
  width: 4px !important; /*对垂直流动条有效*/
}
.invoice-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.time {
  // position: absolute;
  // top: 22px;
  // right: 54px;
  font-size: 13px;
  color: #606266;
}
.line {
  width: 100%;
  height: 1px;
  margin-bottom: 22px;
  background: #f5f5f5;
  transform: translateX(25px);
}
/deep/ .el-avatar > img {
  width: 100%;
}
/deep/ .el-drawer__body {
  overflow: inherit !important;
  padding-bottom: 0;
}
/deep/ .el-form-item {
  margin-bottom: 0;
}
.item-bar-box {
  border-radius: 4px;
}
.item-bar {
  /deep/ .el-form-item__label {
    background: #eaf5ff;
    border-bottom: none;
    padding-left: 6px;
    border-radius: 4px 4px 0 0;
  }
  /deep/ .el-textarea__inner {
    padding-top: 14px;
    min-height: 420px !important;
    border: none;
    padding-bottom: 36px;
    border-radius: 0 0 4px 4px;
  }
}
.today-bar-list {
  /deep/ .el-textarea__inner {
    min-height: 245px !important;
    border: none;
  }
  /deep/.el-form-item__label {
    border: none;
  }
  /deep/ .el-form-item__error {
    // top: 121% !important;
  }
}
.today-bar {
  /deep/ .el-textarea__inner {
    min-height: 420px !important;
    border: none;
  }
  /deep/.el-form-item__label {
    border: none;
  }
}
.today-work {
  min-height: 458px;
  position: relative;
  border-radius: 4px;
  /deep/ .el-form-item__error {
    top: 100%;
  }
}
.border {
  border: 1px solid #dcdfe6;
}
.todo {
  // max-height: 224px;
  height: 175px;

  margin: 0 14px;
  .title {
    font-size: 12px;
    span {
      color: #909399;
      font-size: 12px;
    }
  }
}
.todo-list {
  max-height: 132px;
  overflow-y: auto;
  .item {
    position: relative;
    height: 32px;
    background: #f2f3f3;
    margin-bottom: 8px;
  }
  span {
    margin-left: 30px;
  }
  .dealt-icon {
    position: absolute;
    top: 9px;
    left: 8px;
    cursor: pointer;
  }
  .square {
    display: inline-block;
    background: #fff;
    width: 14px;
    height: 14px;
    border: 1px solid #999;
  }
  .el-icon-check {
    vertical-align: bottom;
    font-size: 13px;
    color: #fff;
  }
  .checked {
    background: #1890ff;
    display: inline-block;
    width: 14px;
    height: 14px;
  }
}
.flex {
  display: flex;
  width: 100%;
  margin: 4px 20px;

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
.form-box {
  padding: 0 20px 50px 20px;
  overflow-y: auto;
  .attach {
    color: #1890ff;
    text-align: left;
    cursor: pointer;
  }
  .list {
    margin-top: 30px;
    .parent-replay {
      margin-left: 52px;
      background: #f7f7f7;
      border-radius: 2px 2px 2px 2px;
      padding: 18px 20px 22px 20px;
      margin-bottom: 0 !important;
    }
    .item {
      margin-bottom: 14px;
      .pictxt.parent-replay-text {
        display: flex;
        justify-content: space-between;
      }
      .pictxt {
        width: calc(100% - 50px);
        .name {
          color: #303133;
          font-size: 13px;
          .created-at {
            font-size: 11px;
            color: #909399;
            margin-left: 6px;
          }
          .keyword {
            color: #909399;
            margin: 0 5px 0 0;
          }
          .reply {
            margin-top: 6px;
            color: #909399;
            .reply-text {
              color: #303133;
            }
          }
        }
        .text {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.85);
          margin-top: 5px;
          line-height: 18px;
          .textCon {
            width: 364px;
            font-size: 13px;
          }
          .reply {
            color: #1890ff;
            cursor: pointer;
            white-space: nowrap;
          }
        }
      }
    }
  }
  /deep/.el-form-item__label {
    float: right;
    text-align: left;
    width: 100% !important;
    font-weight: 400 !important;
  }
  /deep/.el-form-item__content {
    margin-left: 0 !important;
  }
  /deep/.el-textarea.is-disabled .el-textarea__inner {
    border: 0;
    background-color: #f7f7f7;
    color: #606266;
  }
}
/deep/ .el-form .el-textarea__inner {
  width: 100%;
}

.report {
  .title {
    margin-bottom: 14px;
    font-size: 14px;
  }
  .flex-user {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20px;
    .user {
      padding: 0 8px 0 4px;
      height: 32px;
      text-align: center;
      line-height: 32px;
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #303133;
      background: #f2f3f3;
      margin-right: 10px;
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 10px;
      border-radius: 4px;
      .img {
        display: block;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        margin-right: 5px;
        object-fit: cover;
      }
      .iconcha {
        cursor: pointer;
        position: absolute;
        right: -3px;
        top: -16px;
        font-size: 14px;
        color: #c0c4cc;
      }
    }
    .addPeople {
      cursor: pointer;
      height: 32px;
      background-color: rgba(24, 144, 255, 0.08);
      font-size: 14px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #1890ff;
      text-align: center;
      line-height: 32px;
      border-radius: 6px;
      margin-right: 14px;
      padding: 0 8px;
      .icontianjia {
        font-size: 12px;
        margin-right: 4px;
      }
    }
  }
}
.dividing-line {
  width: 100%;
  height: 1px;
  background-image: linear-gradient(to right, #dcdfe6 0%, #dcdfe6 50%, transparent 50%);
  background-size: 18px 0.5px; //第一个值（20px）越大线条越长间隙越大
  background-repeat: repeat-x;
  margin-bottom: 10px;
  margin-top: 30px;
}
.upload-file {
  display: inline-block;
}
.m-b-30 {
  margin-bottom: 30px;
}
.m-t-20 {
  margin-top: 20px;
}
.pb-120 {
  padding-bottom: 120px;
}
</style>
