<!-- 物资维修弹窗 -->
<template>
  <div>
    <el-dialog
      :title="fromData.title"
      :visible.sync="dialogVisible"
      :width="fromData.width"
      :wrapper-closable="false"
      :before-close="handleClose"
    >
      <div class="body">
        <div class="mt14">
          <el-form ref="form" :model="form" :rules="rules" label-width="90px" v-if="fromData.data">
            <el-row>
              <el-col :span="12">
                <el-form-item label="物资名称：">{{ fromData.data.name }}</el-form-item>
              </el-col>
              <el-col :span="12" v-if="fromData.type !== 4">
                <el-form-item label="物资编号：">{{ fromData.data.number }}</el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="物资分类：">{{ fromData.data.cate.cate_name }}</el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="物资型号：">{{ fromData.data.units }}</el-form-item>
              </el-col>
            </el-row>
            <template v-if="fromData.type === 3">
              <el-form-item style="margin-bottom: 10px" label="维修原因：">{{ markDefault.mark }}</el-form-item>
              <el-form-item label="维修处置：" prop="other">
                <el-radio-group v-model="form.other">
                  <el-radio :label="0">入库 <span>(入库之后该物资进入仓库，状态为未使用，可重新领用)</span></el-radio>
                  <el-radio :label="4">报废 <span>(报废之后该物资状态为已报废，不可进行领用)</span></el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="花费(元)：" prop="price">
                <el-input-number
                  v-model="form.price"
                  :precision="2"
                  controls-position="right"
                  size="small"
                  :min="0"
                ></el-input-number>
              </el-form-item>
            </template>
            <template v-if="fromData.type === 4">
              <el-form-item class="mt14" label="入库数量：" prop="number">
                <el-input-number
                  v-model="form.number"
                  :controls="false"
                  :min="0"
                  :precision="0"
                  size="small"
                  placeholder="请输入入库数量"
                ></el-input-number>
              </el-form-item>
              <el-form-item label="单价(元)：" prop="prices">
                <el-input-number
                  v-model="form.prices"
                  :controls="false"
                  :min="0"
                  :precision="2"
                  size="small"
                  placeholder="请输入单价"
                ></el-input-number>
              </el-form-item>
            </template>
            <el-form-item class="mt14" :label="fromData.label + '：'" prop="mark">
              <el-input
                v-model="form.mark"
                type="textarea"
                :placeholder="fromData.placeholder"
                maxlength="100"
                :rows="3"
                resize="none"
                show-word-limit
                clearable
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="handleClose">{{ $t('public.cancel') }}</el-button>
        <el-button size="small" :loading="loading" type="primary" @click="handleAdd">{{ $t('public.ok') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { storageRecordRepairApi, storageRecordSaveApi } from '@/api/administration'

export default {
  name: 'MaterialDialog',
  components: {},
  props: {
    fromData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    const checkMark = (rule, value, callback) => {
      if (!value && this._props.fromData.type < 3) {
        return callback(new Error(this._props.fromData.placeholder))
      } else {
        callback()
      }
    }
    const checkPrices = (rule, value, callback) => {
      if (!value) {
        return callback('请输入单价')
      } else {
        callback()
      }
    }
    return {
      dialogVisible: false,
      openStatus: false,
      form: {
        mark: '',
        other: 0,
        price: 0,
        number: undefined,
        prices: undefined
      },
      rules: {
        mark: [{ required: this.fromData.type < 3, validator: checkMark, trigger: 'blur' }],
        other: [{ required: true, message: '请选择处理类型', trigger: 'change' }],
        price: [{ required: true, message: '请输入维修金额', trigger: 'blur' }],
        number: [{ required: true, message: '请输入入库数量', trigger: 'blur' }],
        prices: [{ required: true, validator: checkPrices, trigger: 'blur' }]
      },
      markDefault: {},
      loading: false
    }
  },
  watch: {
    fromData: {
      handler(nVal) {
        if (nVal.type === 3) {
          this.getMarkers(nVal.data.id)
          this.rules.mark[0].required = false
        } else if (nVal.type < 3) {
          this.rules.mark[0].required = true
        }
      },
      deep: true
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
      this.reset()
      this.$refs.form.resetFields()
    },
    handleOpen() {
      this.dialogVisible = true
    },
    reset() {
      this.form = {
        mark: '',
        other: 0,
        price: 0,
        number: undefined,
        prices: undefined
      }
    },
    handleAdd() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          let data = {
            mark: this.form.mark,
            storage: this.fromData.data.id,
            types: this.fromData.type === 2 ? 3 : 4
          }
          if (this.fromData.type === 3) {
            // 维修处理
            data.types = 5
            data.other = this.form.other
            data.price = this.form.price
          }
          if (this.fromData.type === 4) {
            // 消耗物资入库
            data.types = 0
            data.other = this.form.number
            data.price = this.form.prices
          }
          this.storageRecord(data)
        }
      })
    },
    async getMarkers(id) {
      const result = await storageRecordRepairApi(id)
      this.markDefault = result.data ? result.data : {}
    },
    storageRecord(data) {
      this.loading = true
      storageRecordSaveApi(data)
        .then((res) => {
          if (res.status == 200) {
            this.handleClose()

            this.$emit('isOk')
            this.reset()
          }

          this.loading = false
          // let str = ''
          // if (this.fromData.type === 1) {
          //   str = '编号为' + this.fromData.data.number + '物资提交报废成功'
          // } else if (this.fromData.type === 2) {
          //   str = '编号为' + this.fromData.data.number + '物资提交维修成功'
          // } else if (this.fromData.type === 3) {
          //   str = '编号为' + this.fromData.data.number + '物资维修处理成功'
          // } else {
          //   str = '操作成功'
          // }
          // this.$message.success(str)
        })
        .catch((error) => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
/deep/ .el-input-number--medium {
  width: 100%;
  .el-input__inner {
    text-align: left;
  }
}
.el-row {
  /deep/ .el-form-item {
    margin-bottom: 0;
  }
}

/deep/ .el-radio {
  display: block;
  margin-bottom: 14px;
  &:last-of-type {
    margin-bottom: 0;
  }
  .el-radio__label {
    span {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.85);
    }
  }
}
/deep/ .el-input-number {
  width: 100%;
  .el-input__inner {
    text-align: left;
  }
}
.dialog-footer {
  margin: 0 -20px;
  // border-top: 1px solid #d8d8d8;
  padding: 0px 20px 0 20px;
}
/deep/.el-dialog__header {
  height: 46px;
  display: flex;
  align-items: center;
  .el-dialog__headerbtn {
    position: absolute;
    top: 16px;
  }
}
/deep/ .el-dialog__body {
  padding-top: 0;
}
</style>
