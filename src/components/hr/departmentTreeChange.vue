<!-- @FileDescription: 人事-审批设置-选择人员和部门组件 -->
<template>
  <div class="departBox">
    <!-- 选择人员 -->
    <select-member
      v-if="member"
      :onlyOne="departType == 'oneself' ? true : false"
      :value="memberList || []"
      @getSelectList="getSelectList"
      style="width: 100%"
    >
    </select-member>

    <!-- 选择部门 -->
    <select-department
      v-if="!member"
      :onlyOne="departType == 'oneself' ? true : false"
      :value="activeMastart || []"
      @changeMastart="changeMastart"
      style="width: 100%"
    >
    </select-department>
  </div>
</template>

<script>
export default {
  name: 'Index',
  components: {
    selectDepartment: () => import('@/components/form-common/select-department'),
    selectMember: () => import('@/components/form-common/select-member')
  },
  props: {
    /* eslint-disable */
    value: [Array, Object],
    departType: {
      default: () => '',
      type: String
    },
    member: Boolean,
    range: {
      default: () => [],
      type: Array
    },
    disabled: Boolean,
    formCreateInject: Object
  },
  data() {
    return {
      oaDepartmentShow: false,
      memberShow: false,
      memberList: [],
      activeMastart: this.value || []
    }
  },
  watch: {
    value(n) {
      this.activeMastart = n || []
    },
    range(n) {
      this.rangePerson = n
    },
    departType(n) {
      this.departTypes = n
    }
  },
  methods: {
    cardTag(type, index) {
      if (type === 1) {
        this.activeMastart.splice(index, 1)
      }
    },

    changeMastart(data) {
      let array = []
      data.forEach((value) => {
        array.push({
          id: value.id,
          name: value.name,
          is_mastart: value.is_mastart || 0
        })
      })
      this.$emit('input', array)
      setTimeout(() => {
        this.formCreateInject.api.validateField(this.formCreateInject.rule.field)
      }, 300)
    },
    // 选择成员回调
    getSelectList(data) {
      let array = []
      data.forEach((value) => {
        array.push({
          id: value.value,
          name: value.name,
          avatar: value.avatar
        })
      })
      this.memberList = data
      this.$emit('input', array)
      setTimeout(() => {
        this.formCreateInject.api.validateField(this.formCreateInject.rule.field)
      }, 300)
    }
  }
}
</script>

<style scoped lang="scss">
.flex-box span {
  margin-right: 6px;
}
.departBox {
  /deep/.user-item {
    padding: 0;
  }
  /deep/.select-item {
    margin-top: 0;
  }
  /deep/.left {
    align-items: center;
  }
}

.el-icon-arrow-down {
  line-height: 34px;
}
</style>
