<template>
  <div class="box">
    <div class="textarea" style="white-space: pre-wrap">
      {{ htmlMD }}
    </div>
  </div>
</template>

<script>
export default {
  name: '',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      htmlMD: ''
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
  min-height: calc(100vh - 60px);
  padding-top: 30px;
}
.textarea {
  min-height: calc(100vh - 95px);
  padding: 20px;
  background: #fff;
  line-height: 48px;
}
</style>
