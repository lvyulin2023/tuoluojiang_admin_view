<template>
  <div class="box-container">
    <el-drawer
      :visible.sync="drawer"
      direction="rtl"
      :before-close="handleClose"
      size="1024px"
      :append-to-body="true"
      :modal="true"
      :wrapper-closable="true"
    >
      <slot slot="title">
        <div class="tabsEdit">
          <div class="tabs">
            <el-tabs v-model="tabsName" class="cr-header-tabs" @tab-click="handleClick">
              <el-tab-pane label="未读消息" name="1" />
              <el-tab-pane label="全部" name="2" />
            </el-tabs>
          </div>
        </div>
      </slot>

      <unread ref="unread" v-if="tabsName == 1"></unread>
      <read ref="read" v-if="tabsName == 2"></read>
    </el-drawer>
  </div>
</template>

<script>

export default {
  name: 'noticeList',
  components: {
    unread: () => import('@/views/user/news/unread'),
    read: () => import('@/views/user/news/read')
  },
  data() {
    return {
      drawer: false,
      tabsName: '1'
    }
  },
  created() {
    this.$bus.$on('message-close-pop', () => {
      this.handleClose()
    })
  },

  methods: {
    openBox() {
      this.drawer = true
      this.tabsName = '1'
      setTimeout(() => {
        this.$refs.unread.getTableData()
      }, 300)
    },
    handleClose() {
      this.drawer = false
    },
    handleClick() {
      if (this.tabsName == 1) {
        setTimeout(() => {
          this.$refs.unread.getTableData()
        }, 300)
      } else {
        setTimeout(() => {
          this.$refs.read.getTableData()
        }, 300)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-drawer__body {
  padding-bottom: 0;
  overflow-y: auto;
}
/deep/ .el-card {
  border: none;
  .el-card__body {
    padding: 0;
  }
}
/deep/ .el-drawer__header {
  padding: 0;
  border-bottom: 1px solid #EEEEEE;
  padding-left: 30px;
}
/deep/ .el-tabs__item {
  height: 56px;
  line-height: 56px;
  font-weight: 500;
  z-index: 9999;
}
/deep/ .el-drawer__close-btn {
  width: 50px;
}

.tabsEdit {
  display: flex;
  justify-content: space-between;
  .invitationUrl {
    margin-top: 2px;
    margin-right: 20px;
  }
}
</style>
