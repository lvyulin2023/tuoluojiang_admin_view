<template>
  <div class="box">
    <markdown-it-vue :content="htmlMD" />
  </div>
</template>

<script>
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
export default {
  name: '',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  components: {
    MarkdownItVue
  },
  data() {
    return {
      htmlMD: ''
    }
  },
  watch: {
    url(newVal) {
      this.fetchMarkdownAndConvertToHtml()
    }
  },

  mounted() {
    this.fetchMarkdownAndConvertToHtml()
  },
  methods: {
    async fetchMarkdownAndConvertToHtml() {
      const response = await fetch(this.url)
      this.htmlMD = await response.text()
    }
  }
}
</script>
<style scoped lang="scss">
.box {
  width: 1000px;
  margin: 0 auto;
  background: #fff;
  padding: 20px;
  margin-top: 90px;
}
</style>
