<template>
  <div class="composite-selector">
   <span>{{name}}：</span>
    <el-switch
      v-model="internalValue"
      :active-text="activeText"
      :inactive-text="inactiveText">
    </el-switch>
  </div>
</template>


<script>
export default {
  name: 'switchStatus',
  props: {
    value: {
      default: true,
      type: Boolean
    },
    activeText: {
      default: undefined,
      type: String
    },
    inactiveText: {
      default: undefined,
      type: String
    },
    name: {
      default: undefined,
      type: String
    }
  },
  data() {
    return {
      internalValue: this.value
    };
  },
  methods: {
  },
};
</script>

<style scoped lang="scss">
.el-select .el-input {
  width: 130px;
}
.el-input-group__prepend .el-select {
  width: 100px;
}
.composite-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
