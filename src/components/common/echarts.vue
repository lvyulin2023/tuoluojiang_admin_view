<!-- @FileDescription: 公共-echarts组件 -->
<template>
  <div>
    <div :id="echarts" :style="styles" />
  </div>
</template>

<script>
import echarts from 'echarts'
export default {
  name: 'Index',
  props: {
    styles: {
      type: Object,
      default: null
    },
    type: {
      type: String,
      default: ''
    },

    optionData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      myChart: null,
      stopClickLogin: false
    }
  },
  computed: {
    echarts() {
      return 'echarts' + Math.ceil(Math.random() * 100)
    }
  },
  watch: {
    optionData: {
      handler(newVal, oldVal) {
        this.handleSetVisitChart()
      },
      deep: true // 对象内部属性的监听，关键。
    }
  },
  mounted: function () {
    const vm = this
    vm.$nextTick(() => {
      vm.handleSetVisitChart()
      window.addEventListener('resize', this.wsFunc)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.wsFunc)
    if (!this.myChart) {
      return
    }
    this.myChart.dispose()
    this.myChart = null
  },
  methods: {
    wsFunc() {
      this.myChart.resize()
    },

    handleSetVisitChart() {
      this.myChart = echarts.init(document.getElementById(this.echarts))
      let option = null
      option = this.optionData
      this.myChart.setOption(option, true)

      this.myChart.on('click', (param) => {
        let that = this
        if (that.stopClickLogin) {
          return false
        }
        that.stopClickLogin = true

        setTimeout(() => {
          that.stopClickLogin = false
        }, 1000)

        that.$emit('pieChange', param.data)
      })
      if (this.type !== 'fd') {
        this.myChart.off('legendselectchanged')
        this.myChart.on('legendselectchanged', (e) => {
          let that = this
          let index = null

          that.myChart.dispatchAction({
            type: 'legendSelect',
            name: e.name
          })
          index = option.series[0].data.findIndex((item) => item.name === e.name)
          e.id = option.series[0].data[index].id

          that.$emit('pieChange', e)
        })
      }
    }
  }
}
</script>

<style scoped></style>
