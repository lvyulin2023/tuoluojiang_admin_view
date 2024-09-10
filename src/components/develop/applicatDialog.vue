<!-- @FileDescription: 低代码-应用管理弹窗 -->
<template>
  <div class="oa-dialog">
    <el-dialog top="13%" :visible.sync="show" :width="`500px`" :show-close="false" :close-on-click-modal="false">
      <div slot="title" class="header">
        <span class="title">应用管理</span>
        <span class="el-icon-close" @click="handleClose"></span>
      </div>

      <div class="content mt20" ref="scrollTarget" :class="fromItem.length > 7 ? 'box-shadow' : ''">
        <div>
          <draggable
            v-model="fromItem"
            chosen-class="chosen"
            force-fallback="true"
            group="people"
            animation="1000"
            @start="onStart"
            @end="onEnd"
          >
            <transition-group>
              <div v-for="(item, index) in fromItem" :key="index">
                <div class="flex-between mb14">
                  <i class="icon iconfont icontuodong item-drag"></i>
                  <el-input v-model="item.name" clearables show-word-limit placeholder="请输入应用名称" />
                  <i class="el-icon-remove item-remove" @click="handleDelete(item, index)"></i>
                </div>
              </div>
            </transition-group>
          </draggable>
        </div>
      </div>

      <div slot="footer">
        <el-button class="add-type" size="small" type="text" @click="handleAddType()">
          <i class="el-icon-plus"></i> 添加应用</el-button
        >
        <div class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="submit">确定</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { savecrudCateApi, delcrudCateApi } from '@/api/develop'
export default {
  name: 'CrmebOaEntApplicatDialog',
  components: {
    draggable
  },
  props: {
    list: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      show: false,
      fromItem: []
    }
  },

  methods: {
    handleClose() {
      this.show = false
    },
    openBox(list) {
      if (list.length == 0) {
        const item = {
          name: '',
          id: 0,
          sort: 0
        }
        this.fromItem.push(item)
      } else {
        this.fromItem = list
      }
      this.show = true
    },
    // 新增应用
    handleAddType() {
      const item = {
        name: '',
        id: 0,
        sort: 0
      }
      this.fromItem.push(item)
      this.$nextTick(() => {
        const scrollTarget = this.$refs.scrollTarget
        let height = scrollTarget.scrollHeight
        // 滚动到底部
        scrollTarget.scrollTo({ top: height, behavior: 'smooth' })
      })
    },

    submit() {
      this.fromItem.forEach((item, index) => {
        item.sort = this.fromItem.length - index
      })
      const data = {
        cate: this.fromItem
      }
      savecrudCateApi(data)
        .then((res) => {
          this.handleClose()
          this.$emit('getList')
        })
        .catch((err) => {
          this.$message.error(err.message)
        })
    },
    onStart() {},
    onEnd() {},
    // 删除动态表单
    handleDelete(item, index) {
      if (item.name == '') {
        this.fromItem.splice(index, 1)
        return false
      }
      this.$modalSure('您确定要删除此实体分类吗').then(() => {
        if (item.id > 0) {
          delcrudCateApi(item.id).then((res) => {
            this.fromItem.splice(index, 1)
            this.$emit('getList')
          })
        } else {
          this.fromItem.splice(index, 1)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.oa-dialog {
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .title {
      font-size: 15px;
      font-family: PingFangSC-Medium, PingFang SC;
      font-weight: 600;
      color: #303133;
    }
    .el-icon-close {
      color: #c0c4cc;
      font-weight: 500;
      font-size: 14px;
    }
  }
  .content {
    max-height: calc(100vh - 520px);
    overflow-y: scroll;
  }
  .content::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
  .content:first-child {
    padding: 0 20px;
  }

  .vertical {
    display: flex;
    flex-direction: column;
  }
  .add-type {
    display: flex;
    justify-content: flex-start;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  /deep/.el-dialog {
    border-radius: 6px;
  }
  /deep/ .el-dialog__body {
    margin-bottom: 0;
    padding: 0;
  }
  /deep/ .el-button--medium {
    padding: 10px 15px;
  }
}
.item-drag {
  cursor: move;
  font-size: 13px;
  margin-right: 4px;
  color: #909399;
}
.el-icon-remove {
  margin-left: 5px;
  color: red;
  cursor: pointer;
  font-size: 18px;
}
.icontuodong {
  color: #cacdd2;
  font-size: 14px;
}
.box-shadow {
  box-shadow: inset 0 -4px 4px -2px rgba(0, 0, 0, 0.1);
}
</style>
