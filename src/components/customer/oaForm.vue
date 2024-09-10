<!-- @FileDescription: 客户/合同新增的动态表单组件 -->
<template>
  <div>
    <el-form ref="form" :model="ruleForm" :rules="rule" label-width="auto">
      <div v-for="(item, itemIndex) in formInfo" :key="itemIndex" class="p20">
        <div v-if="item.status == 1" class="from-item-title">
          <span class="title"> {{ item.title }} </span>
        </div>

        <!-- 表单 -->
        <div class="form-box">
          <div v-for="(val, index) in item.data" :key="index" class="form-item">
            <el-form-item :prop="val.key">
              <span slot="label" class="label">{{ val.key_name }}：</span>

              <!-- 输入框 -->
              <el-input
                v-if="val.input_type === 'input' && val.type === 'text'"
                v-model="ruleForm[val.key]"
                :maxlength="val.max"
                :min="val.min"
                :placeholder="val.placeholder"
                clearable
                size="small"
              />
              <!-- 数字金额 -->

              <el-input-number
                v-if="val.type === 'number'"
                v-model="ruleForm[val.key]"
                :controls="false"
                :max="val.max"
                :min="val.min"
                :placeholder="val.placeholder"
                :precision="val.decimal_place"
                size="small"
                style="width: 100%"
              ></el-input-number>
              <!-- :min="val.min" -->
              <!-- 文本域 -->

              <el-input
                v-if="val.type === 'textarea'"
                v-model="ruleForm[val.key]"
                :autosize="autosize"
                :maxlength="val.max"
                :placeholder="val.placeholder"
                clearable
                show-word-limit
                size="small"
                type="textarea"
              />
              <!-- select 级联 -->

              <el-cascader
                v-if="val.input_type === 'select' && val.options_level > 1"
                v-model="ruleForm[val.key]"
                :options="val.options"
                :placeholder="val.placeholder"
                :props="{
                  checkStrictly: false,
                  label: 'label',
                  value: 'value',
                  multiple: val.type !== 'single' && val.type !== 'cascader'
                }"
                clearable
                collapse-tags
                filterable
                size="small"
                style="width: 100%"
              ></el-cascader>

              <!-- 下拉选择 -->
              <el-select
                v-if="val.input_type === 'select' && val.options_level == 1"
                v-model="ruleForm[val.key]"
                :multiple="val.type !== 'single'"
                :placeholder="val.placeholder"
                clearable
                filterable
                size="small"
                style="width: 100%"
              >
                <el-option v-for="el in val.options" :key="el.value" :label="el.label" :value="el.value"> </el-option>
              </el-select>

              <!-- 客户标签 -->

              <select-label
                v-if="val.key === 'customer_label'"
                :placeholder="val.placeholder"
                :props="{ children: 'children', label: 'name' }"
                :value="val.value || []"
                style="width: 100%"
                @handleLabelConf="handleLabelConf($event, val)"
              ></select-label>

              <!-- 单选按钮 -->
              <el-radio-group v-if="val.type === 'radio'" v-model="ruleForm[val.key]">
                <el-radio v-for="(el, index) in val.options" :key="index" :label="el.value">{{ el.label }}</el-radio>
              </el-radio-group>

              <!-- 多选按钮 -->

              <el-checkbox-group
                v-if="val.type === 'checked'"
                v-model="ruleForm[val.key]"
                :max="val.max"
                :min="val.min"
              >
                <el-checkbox v-for="(check, checkIndex) in val.options" :key="checkIndex" :label="check.value">{{
                  check.label
                }}</el-checkbox>
              </el-checkbox-group>

              <!-- 日期选择 -->
              <el-date-picker
                v-if="val.type === 'date'"
                v-model="ruleForm[val.key]"
                :format="'yyyy-MM-dd'"
                :placeholder="val.placeholder"
                :value-format="'yyyy-MM-dd'"
                clearable
                size="small"
                type="date"
              ></el-date-picker>
              <!-- 上传附件 -->

              <upload-file
                v-if="val.type === 'file'"
                v-model="attachList"
                :maxLength="val.max"
                :only-image="false"
                :value="attachList"
              ></upload-file>

              <!-- 上传图片 -->

              <upload-file
                v-if="val.type === 'images'"
                v-model="imageList"
                :maxLength="val.max"
                :only-image="true"
                :value="imageList"
              ></upload-file>

              <!-- 富文本 -->
              <ueditor-from
                v-if="val.type === 'oaWangeditor'"
                ref="ueditorFrom"
                :border="true"
                :content="ruleForm[val.key]"
                :height="`400px`"
                @input="ueditorEdit"
              >
              </ueditor-from>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
    <div class="button from-foot-btn fix btn-shadow">
      <el-button class="el-btn" size="small" @click="resetForm">取消</el-button>
      <el-button v-if="btnShow && types !== 3" :loading="addContractLoading" size="small" @click="addContract">{{
        type == 'contract' ? '保存并添加回款' : '保存并添加合同'
      }}</el-button>
      <el-button :loading="saveLoading" size="small" type="primary" @click="handleConfirm('ruleForm')">保存</el-button>
    </div>
  </div>
</template>

<script>
import { contractCategorySelectApi } from '@/api/enterprise'
export default {
  name: 'CrmebOaEntIndex',
  components: {
    uploadFile: () => import('@/components/form-common/oa-upload'),
    ueditorFrom: () => import('@/components/form-common/oa-wangeditor'),
    selectLabel: () => import('@/components/form-common/select-label')
  },
  props: {
    formInfo: {
      type: Array,
      default: () => {
        return []
      }
    },

    type: {
      type: String,
      default: ''
    },
    types: {
      type: Number,
      default: 1
    },
    btnShow: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      drawer: true,
      saveLoading: false,
      ruleForm: {},
      rule: {},
      autosize: {
        minRows: 6
      },

      imageList: [],
      labelAllList: [], // 客户标签
      addContractLoading: false,
      heightInputRole: 32,
      attachList: [],
      labelList: [] // 选中客户标签
    }
  },

  watch: {
    formInfo: {
      handler(nVal) {
        if (nVal.length == 0) return false
        nVal.map((item, index) => {
          item.data.map((val, index1) => {
            if (val.key == 'customer_label') {
              if (val.options.length > 0) return
            }

            if (val.key == 'contract_customer') {
              val.options_level = 1
            }
            if (val.key == 'contract_category') {
              if (val.options.length == 0) {
                this.getCategory(index, index1)
              }
            }

            if (val.type == 'file' && val.files && val.files.length > 0) {
              this.attachList = val.files
            }

            if (val.type == 'images' && val.files && val.files.length > 0) {
              this.imageList = val.files
            }

            if (val.required == 1) {
              this.rule[val.key] = [
                {
                  required: true,
                  message: '请输入' + val.key_name,
                  trigger: 'blur'
                }
              ]
            }
            this.$set(this.ruleForm, val.key, val.value)

            if (val.type == 'checked' && val.key !== 'customer_label') {
              if (val.value == '') {
                this.ruleForm[val.key] = []
              }
            }
          })
        })
      },

      immediate: true,
      deep: true
    },

    attachList: {
      handler(nVal) {
        if (nVal.length > 0) {
          const filekey = this.getKey('file')
          let ids = []
          nVal.map((item) => {
            ids.push(item.id)
          })
          this.ruleForm[filekey] = ids
        }
      }
    },
    imageList: {
      handler(nVal) {
        if (nVal.length > 0) {
          const imgkey = this.getKey('images')
          let ids = []
          nVal.map((item) => {
            ids.push(item.id)
          })
          this.ruleForm[imgkey] = ids
        }
      }
    }
  },

  methods: {
    // 获取合同分类数据
    async getCategory(index, index1) {
      const result = await contractCategorySelectApi()
      this.formInfo[index].data[index1].options = result.data
    },

    // 选中客户标签成功回调
    handleLabelConf(res, val) {
      this.labelList = res.list
      this.ruleForm[val.key] = res.ids
    },

    heightInput() {
      setTimeout(() => {
        const height = this.$refs.getHeight[0].clientHeight
        this.heightInputRole = height === 0 ? 36 : height
      }, 200)
    },

    // 删除客户标签
    cardTag(index) {
      this.labelList.splice(index, 1)
      let key = this.getKey('customer_label', 'key')
      let arr = []
      this.labelList.map((item) => {
        arr.push(item.id)
      })
      this.ruleForm[key] = arr

      this.heightInput()
    },

    // 富文本成功回调
    ueditorEdit(val) {
      let key = this.getKey('oaWangeditor')
      this.ruleForm[key] = val
    },

    getTypes(type) {
      let arr = ['oaWangeditor', 'textarea', 'file', 'images']
      return arr.includes(type)
    },

    // 重置表单
    resetForm() {
      this.$refs.form.resetFields()
      this.attachList = []
      this.labelList = []
      this.imageList = []
      this.saveLoading = false
      this.addContractLoading = false
      this.$emit('handleClose')
    },

    // 表单提交
    handleConfirm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.saveLoading = true
          this.$emit('submitOk', this.ruleForm)
        }
      })
    },

    // 遍历找key值
    getKey(row, key) {
      let formKey = ''
      this.formInfo.map((item) => {
        item.data.map((val) => {
          if (key) {
            if (val.key === row) {
              formKey = val.key
            }
          }
          if (val.type === row) {
            formKey = val.key
          }
        })
      })
      return formKey
    },
    addContract() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.addContractLoading = true
          this.$emit('addContinueOk', this.ruleForm)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.p20 {
  padding-top: 0;
}
.from-item-title {
  display: flex;
  justify-content: space-between;
  height: 14px;
  line-height: 14px;
  margin-bottom: 20px;
  align-items: center;
  border-left: 3px solid #1890ff;
  .title {
    font-size: 14px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.85);
  }

  span {
    padding-left: 10px;
    font-weight: 500;
    font-size: 13px;
  }
}
.form-box {
  display: flex;
  flex-wrap: wrap;

  justify-content: space-between;
  .label {
    font-size: 13px;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    color: #303133;
  }
  .oneline {
    width: 100%;
  }

  .form-item {
    width: 100%;
    // width: calc(100% - 20px);

    /deep/ .el-form-item__content {
      width: calc(100% - 90px);
    }

    /deep/ .el-input {
      width: 100%;
    }

    /deep/ .el-select {
      width: 100%;
    }

    /deep/ .el-form-item {
      margin-bottom: 20px;
    }

    /deep/ .el-textarea__inner {
      resize: none;
    }
  }
}
.upload-file {
  display: inline-block;
}
.line {
  border: 1px dashed #f2f6fc;
  margin-bottom: 30px;
}
.plan-footer-one {
  width: 100%;
  height: 32px;
  line-height: 32px;
  .placeholder {
    font-size: 13px;
    color: #ccc;
  }
  span {
    margin-right: 6px;
  }
}
/deep/.el-select .el-icon-circle-close {
  position: absolute;
  right: 2px;
  top: -2px;
}
</style>
