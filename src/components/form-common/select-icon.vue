<!-- @FileDescription: 选择图标组件 例：菜单管理选择图标 -->
<template>
  <div class="iconBox">
    <div class="iconBox">
      <el-input
        ref="search"
        v-model="iconVal"
        placeholder="输入关键词搜索,注意全是英文"
        clearable
        style="width: 300px"
        @input="upIcon(iconVal)"
      />
      <div class="icons-container">
        <div class="grid">
          <div v-for="(item, index) of list" :key="index" @click="handleClipboard(item.icon)">
            <el-tooltip placement="top">
              <div slot="content">{{ item.icon }}</div>
              <div class="icon-item">
                <i :class="[iconfont, item.icon]"></i>
                <span>{{ item.name }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import iconfontIcons from '../../libs/element-icons'

export default {
  name: 'Index',
  data() {
    return {
      elementIcons: iconfontIcons,
      iconVal: '',
      modals2: false,
      list: [],
      iconfont: 'iconfont'
    }
  },

  mounted() {
    this.list = this.elementIcons
  },
  methods: {
    generateElementIconCode(symbol) {
      return `<i class="iconfont icon${symbol}" />`
    },
    handleClipboard(n) {
      this.iconChange(n)
    },
    // 搜索
    upIcon(n) {
      const arrs = []
      for (var i = 0; i < this.elementIcons.length; i++) {
        if (this.elementIcons[i].name.indexOf(n) !== -1) {
          arrs.push(this.elementIcons[i])
          this.list = arrs
        }
      }
    },
    iconChange(n) {
      /* eslint-disable */
      form_create_helper.set(this.$route.query.field, n)
      form_create_helper.close('icon')
    }
  }
}
</script>

<style lang="scss" scoped>
.iconBox {
  width: 100%;
  height: 100%;
}
.icons-container {
  width: 100%;
  margin: 10px 20px 0;
  overflow: hidden;

  .grid {
    width: 100%;
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .icon-item {
    margin: 10px 20px;
    text-align: center;
    width: 100px;
    float: left;
    font-size: 20px;
    color: #24292e;
    cursor: pointer;
    .iconfont {
      font-size: 30px;
    }
  }

  span {
    display: block;
    font-size: 14px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
../../../libs/element-icons
