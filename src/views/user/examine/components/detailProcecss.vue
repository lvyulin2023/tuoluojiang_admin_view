<template>
  <!-- 审批进程 -->
  <div class="stepsBox">
    <div class="acea-row mb25">
      <div class="shu mr10"></div>
      <span class="title">审批进程</span>
    </div>
    <el-steps direction="vertical" :active="indexCheck">
      <el-step v-for="(item, index) in examineList" :key="index">
        <div slot="title" class="caption" @click="itemIsShow(item)">
          {{ item.title }}
          <el-tag
            v-if="item.types == 1 && item.settype != 5 && item.examine_mode > 0 && item.users.length > 1"
            effect="plain"
            size="mini"
          >
            {{ getExamineText(item.examine_mode) }}
          </el-tag>
          <i :class="!hiddenKey.includes(item.uniqued) ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
        </div>
        <div slot="icon" class="liuchen">
          <i :class="item.types == 1 ? 'el-icon-s-check' : 'el-icon-s-promotion'"></i>
        </div>
        <div slot="description">
          <div v-show="!hiddenKey.includes(item.uniqued)">
            <div v-for="(items, indexs) in item.users" :key="indexs" class="manList row-between-wrapper">
              <el-row class="center">
                <el-col :span="24" class="manList-avatar">
                  <div class="manList-icon">
                    <img
                      class="mb10"
                      v-if="judge(items)"
                      :src="items.card ? items.card.avatar : items.info.card.avatar"
                    />

                    <img class="mb10" v-else src="../../../../assets/images/portrait.png" />

                    <span v-if="items.status === 1 && item.types !== 2" class="acea-icon acea-success">
                      <i class="el-icon-check jingshi"></i>
                    </span>

                    <span class="acea-icon acea-warning" v-if="items.status === 2 && item.types !== 2">
                      <span class="jingshi">！</span>
                    </span>
                  </div>
                  <div class="name">
                    <span
                      >{{ items.card ? items.card.name : items.info.card.name }}
                      <span v-if="items.status > 0" class="time">
                        {{ items.updated_at }}
                      </span></span
                    >

                    <span class="status-text" :style="{ color: items.status == 1 && item.types == 1 ? '#19BE6B' : '' }">
                      {{ getDetailText(item.types, items.status) }}</span
                    >
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </el-step>
    </el-steps>
  </div>
</template>

<script>
export default {
  name: 'DetailProcess',
  props: {
    examineData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      openStatus: false,
      onlyPerson: false,
      selectPerson: false,
      title: '选择成员',
      checkedList: [],
      examineList: [],
      activeDepartment: {},
      index: -1,
      isAppoint: false,
      appointList: [],
      indexCheck: undefined,
      hiddenKey: []
    }
  },
  watch: {
    examineData: {
      handler(nVal) {
        this.examineList = nVal.users
        this.getChecked(nVal)
      },
      immediate: true
    },
    lang() {
      this.setOptions()
    }
  },
  methods: {
    getChecked(list) {
      if (list.users && list.users.length > 0) {
        this.indexCheck = list.users.findIndex((v) => v.uniqued === list.node_id)
      }
    },
    getExamineText(id) {
      let str = ''
      if (id == 1) {
        str = '或签'
      } else if (id == 2) {
        str = '会签'
      } else if (id == 3) {
        str = '依次审批'
      }
      return str
    },

    // 判断头像是否能显示
    judge(row) {
      if (row.card) {
        return row.card.avatar.includes('https')
      }
    },
    // 选择部门关闭
    departmentClose() {
      this.openStatus = false
    },
    deleteUsersItem(row, index) {
      row.splice(index, 1)
    },
    getDetailText(type, status) {
      let str = ''
      if (type == 1 && status == 1) {
        str = '已通过 '
      } else if (type == 1 && status == 2) {
        str = '已拒绝 '
      } else if (type == 2 && status > 0) {
        str = '已抄送 '
      }
      return str
    },
    itemIsShow(row) {
      var keys = this.hiddenKey.indexOf(row.uniqued)
      if (keys > -1) {
        this.hiddenKey.splice(keys, 1)
      } else {
        this.hiddenKey.push(row.uniqued)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}
.el-icon-arrow-right {
  line-height: 44px;
  font-size: 18px;
  color: rgba(0, 0, 0, 0.5);
}

.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.caption {
  cursor: pointer;
  font-family: PingFang SC, PingFang SC;
  font-weight: 500;
  font-size: 13px;
  color: #303133;
  i {
    font-size: 14px;
    color: #c0c4cc;
  }
}

.shu {
  width: 3px;
  height: 16px;
  background: #1890ff;
  display: inline-block;
}
.manList {
  flex-direction: column;
  margin-bottom: 12px;
  &:last-of-type {
    margin-bottom: 0;
  }
  .manList-avatar {
    display: flex;
    align-items: center;
    .manList-icon {
      position: relative;
    }
  }
  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    overflow: hidden;
    display: block;
  }
  span {
    width: 100%;
    font-family: PingFang SC, PingFang SC;
    font-weight: 500;
    font-size: 14px;
    color: #303133;
    overflow: hidden;
    padding-left: 6px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .time {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 11px;
    color: #909399;
    padding-left: 0;
  }
  .acea-icon {
    position: absolute;
    right: -4px;
    top: 0;
    width: 18px;
    height: 18px;
    border-radius: 50% !important;
    display: flex;
    justify-content: center;
  }
  .acea-success {
    background: #1890ff;

    .el-icon-check {
      font-size: 10px;
      margin-right: 4px;
    }
  }
  .jingshi {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 3px;
    color: #fff;
  }
  .acea-warning {
    background: #f56c6c;
  }

  .acea-arrow-right {
    position: absolute;
    right: -12px;
  }
  .time {
    text-align: right;
    font-size: 13px;
    color: #666666;
  }
}

.stepsBox {
  margin-top: 30px;
  /deep/.el-step__head.is-finish > .el-step__icon {
    background-color: #1890ff;
    color: #fff;
    border-color: #1890ff;
  }
  /deep/.el-step__head.is-finish > .el-step__line {
    background-color: #1890ff;
    color: #fff;
    border-color: #1890ff;
    width: 0.5px;
    left: 12px;
  }
  /deep/.el-step__head.is-process > .el-step__icon {
    background-color: #1890ff;
    color: #fff;
    border-color: #1890ff;
  }
  /deep/.el-step__description {
    margin-top: 17px;
    margin-bottom: 30px;
    padding-right: 0;
  }
  /deep/.el-step__title {
    color: #000;
    font-size: 14px;
    font-weight: 600;
  }
  .tit1 {
    font-style: normal;
    font-size: 13px;
    color: #999999;
    font-weight: normal;
  }
  /deep/.el-step__icon {
    background: #ccc;
  }
  .liuchen {
    i {
      color: #fff;
    }
  }
}

.upload {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #eeeeee;
  font-size: 16px;
  margin-left: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  i {
    font-size: 22px;
  }
}
.name {
  display: flex;
  flex-direction: column;

  .status-text {
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 11px;
  }
}
</style>
