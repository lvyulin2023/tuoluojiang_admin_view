<template>
  <div class="divBox">
    <el-card class="employees-card-bottom">
      <div class="main">
        <div class="title">公司介绍</div>
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
      let type = 'company_profile'
      const result = await getEmployeeTrainApi(type)
      this.content = result.data.content
    }
  }
}
</script>
<style scoped lang="scss">
.title {
  margin-top: 20px;
  text-align: center;
  font-size: 30px;
  font-family: PingFang SC-Medium, PingFang SC;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 40px;
}

.main {
  max-width: 800px;
  margin: 0 auto;
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
</style>
