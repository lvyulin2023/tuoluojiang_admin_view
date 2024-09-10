<template>
  <div class="v-height-flag">
    <el-card class="pl10">
      <div class="v-height-flag">
        <!-- 顶部提示 -->
        <div class="alert">
          <div>部分员工档案信息还未完善，请 <span class="look">点击查看</span></div>
        </div>
        <!-- 搜索条件 -->
        <formBox></formBox>
        <!-- 表格 -->
        <Table></Table>
      </div>
    </el-card>
  </div>
</template>

<script>
import formBox from './formBox.vue';
import Table from './table.vue';
export default {
  components: {
    formBox,
    Table,
  },
  data() {
    return {};
  },
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.alert {
  height: 42px;
  background: #edf5ff;
  border: 1px solid #97c3ff;
  border-radius: 6px;
  line-height: 42px;
  font-size: 13px;
  font-weight: 400;
  color: #606266;
  padding-left: 20px;
  margin-bottom: 30px;
}
.look {
  color: #1890ff;
  font-style: italic;
  cursor: pointer;
}
</style>
