<template>
  <div class="divBox">
    <el-card class="employees-card-bottom">
      <div class="main">
        <div class="title">组织架构图</div>
        <div v-html="content"></div>
      </div>
    </el-card>
  </div>
</template>
<script>
import { getEmployeeTrainApi } from '@/api/config.js'
export default {
  name: '',
  data() {
    return {
      content: ''
    }
  },

  mounted() {
    this.getConent()
  },
  methods: {
    async getConent() {
      let type = 'organization_chart'
      const result = await getEmployeeTrainApi(type)
      this.content = result.data.content
    }
  }
}
</script>
<style scoped lang="scss">
.main {
  max-width: 800px;
  margin: 0 auto;
  .title {
    margin-top: 20px;
    text-align: center;
    font-size: 30px;
    font-family: PingFang SC-Medium, PingFang SC;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 16px;
  }
  /deep/ table {
    border: 1px solid #ccc;
  }

  /deep/ table th {
    border: 1px solid #ccc;
  }
  /deep/ table td {
    padding: 10px 5px;
    border: 1px solid #ccc;
  }

  /deep/ p img {
    max-width: 800px;
  }
}
/deep/ .wang-editor.w-e-toolbar {
  display: none !important;
}
</style>
