<template>
  <el-form-item label="图表数据实体">
    <el-select
      v-model="myOption.dataEntity"
      filterable
      placeholder="选择实体"
      @change="changeEntity"
      :disabled="!designer.selectedId"
      filter
    >
      <el-option :label="op.table_name" :value="op.id" v-for="(op, inx) in unSystemEntityList" :key="inx" />
    </el-select>
  </el-form-item>
</template>
<script>
import { databaseListApi } from '@/api/develop'
export default {
  name: 'dataEntity-editor',
  props: {
    designer: Object,
    selectedWidget: Object,
    optionModel: Object
  },
  data() {
    return {
      myOption: JSON.parse(JSON.stringify({ ...this.optionModel })),
      unSystemEntityList: []
    }
  },
  computed: {
    // ...mapState({
    //   unSystemEntityList: (state) => state.common.unSystemEntityList
    // })
  },
  watch: {
    optionModel: {
      handler() {
        this.initchartStyle()
      },
      deep: true
    }
  },
  mounted() {
    this.initchartStyle()
    this.getdatabaseList()
  },
  methods: {
    getdatabaseList() {
      databaseListApi().then((res) => {
        this.unSystemEntityList = res.data.list
        let allEntityName = {}
        res.data.list.forEach((el) => {
          allEntityName[el.id] = el.table_name_en
        })
        localStorage.setItem('allEntityName', JSON.stringify(allEntityName))
      })
    },
    initchartStyle() {
      this.myOption = { ...this.optionModel }
    },
    changeEntity(e) {
      // this.myOption.setDimensional = {
      //   dimension: [],
      //   metrics: [],
      //   targetValue: 1,
      //   showFields: [],
      //   dimensionRow: [],
      //   dimensionCol: []
      // }
      // this.myOption.setChartFilter = {
      //   equation: '',
      //   list: []
      // }
      this.myOption.dataEntity = e
      // this.$emit('optionModelChange', this.myOption)
      this.$nextTick((e) => {
        // this.$emit('update:optionModel', this.myOption)
        this.$emit('clearSearch', this.myOption)
      })
    }
  }
}
</script>
<style lang="scss" scoped></style>
