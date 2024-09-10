<template>
  <div class="dashboard-container">
    <VFormRender v-if="!loading" ref="preForm" :form-json="designer" :preview-state="true"> </VFormRender>
  </div>
</template>
<script>
import VFormRender from '@/components/form-render/index'
import { getDashboardDesign } from '@/api/chart'

export default {
  name: 'Dashboard',
  components: {
    VFormRender
  },
  data() {
    return {
      designer: {},
      chartId: '',
      loading: false
    }
  },
  watch: {},

  created() {
    const routeString = this.$route.path
    const routeArray = routeString.split('/').filter((item) => item !== '')
    this.chartId = routeArray[3]
    this.initFormConfig('chartData')
  },

  methods: {
    initFormConfig(key) {
      this.loading = true
      getDashboardDesign(this.chartId).then((res) => {
        let blankFormJson = JSON.parse(res.data[key])
        this.$set(this, 'designer', blankFormJson)
        this.loading = false
      })
    }
  }
}
</script>
<style scoped lang="scss">
.dashboard-container {
  margin-top: -10px;
  /deep/ .smartwidget .widget-header .widget-header__toolbar a {
    display: inline-block;
    text-decoration: none;
    text-align: center;
    height: 24px;
    line-height: 28px;
    padding: 0;
    margin: 0;
    color: #333;
    min-width: 35px;
    position: relative;
    font-family: Arial, Helvetica, sans-serif;
    border: none !important;
  }
}
</style>
