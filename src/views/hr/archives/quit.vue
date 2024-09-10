<!-- 人事-员工档案-离职员工 -->
<template>
  <div>
    <index ref="index" component-name="resignedEmployee"></index>
  </div>
</template>

<script>
import index from './index'
export default {
  name: 'Quit',
  data() {
    return {}
  },
  components: {
    index
  },
  mounted() {
    this.$refs.index.setTabTypes(2)
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-form-item__content {
  flex: 1;
}
/deep/ .input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.header {
  display: flex;
  .header-tab {
    margin-left: 700px;
  }
}

.btn-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 22px;
  border-radius: 3px;
  font-size: 13px;

  &.blue {
    background: rgba(24, 144, 255, 0.05);
    border: 1px solid #1890ff;
    color: #1890ff;
  }

  &.yellow {
    background: rgba(255, 153, 0, 0.05);
    border: 1px solid #ff9900;
    color: #ff9900;
  }

  &.green {
    background: rgba(0, 192, 80, 0.05);
    border: 1px solid #00c050;
    color: #00c050;
  }

  &.gray {
    background: rgba(153, 153, 153, 0.05);
    border: 1px solid #999999;
    color: #999999;
  }
}

.table-txt {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 13px;

  i {
    width: 4px;
    height: 4px;
    margin-right: 5px;
    border-radius: 50%;
  }
}
.page-header {
  margin: 10px 0 15px 0;
}
.tips {
  margin-top: 20px;
  font-size: 11px;
  color: #666;
}
/deep/ .el-page-header__title {
  font-size: 13px;
}
/deep/ .el-page-header__content {
  font-size: 17px;
  font-weight: 500;
}
</style>
