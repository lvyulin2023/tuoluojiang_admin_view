<!-- @FileDescription: 公共-缺省页 -->
<template>
  <div class="default-page">
    <div
      v-if="index > -1"
      class="content"
      :style="{ minHeight: height ? height : minHeight + 'px', '--imgWidth': imgWidth }"
    >
      <div class="content-list">
        <img :src="contentList[index].url" alt="" class="img" />
        <p>{{ contentList[index].text }}~</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DefaultPage',
  props: {
    index: {
      type: Number,
      default: -1
    },
    minHeight: {
      type: Number,
      default: 520
    },
    height: {
      type: String,
      default: ''
    },
    imgWidth: {
      type: String,
      default: '200px'
    }
  },
  computed: {
    lang: function () {
      return this.$store.getters.lang
    }
  },
  watch: {
    lang() {
      this.setOptions()
    }
  },
  data() {
    return {
      contentList: [
        { url: require('@/assets/images/none-assess.png'), text: this.$t('public.message00') },
        { url: require('@/assets/images/none-statistics.png'), text: this.$t('public.message01') },
        { url: require('@/assets/images/none-001.png'), text: this.$t('public.message02') },
        { url: require('@/assets/images/none-002.png'), text: this.$t('public.message03') },
        { url: require('@/assets/images/none-003.png'), text: this.$t('public.message04') },
        { url: require('@/assets/images/none-004.png'), text: this.$t('public.message05') },
        { url: require('@/assets/images/none-005.png'), text: this.$t('public.message06') },
        { url: require('@/assets/images/none-006.png'), text: this.$t('public.message07') },
        { url: require('@/assets/images/none-007.png'), text: this.$t('public.message08') },
        { url: require('@/assets/images/none-007.png'), text: this.$t('public.message09') },
        { url: require('@/assets/images/none-statistics.png'), text: this.$t('public.message10') },
        { url: require('@/assets/images/none-statistics.png'), text: this.$t('public.message11') },
        { url: require('@/assets/images/none-003.png'), text: this.$t('public.message12') },
        { url: require('@/assets/images/none-003.png'), text: this.$t('public.message13') },
        { url: require('@/assets/images/none-assess.png'), text: this.$t('public.message14') },
        { url: require('@/assets/images/none-003.png'), text: this.$t('public.message15') },
        { url: require('@/assets/images/newdef1.png'), text: '暂无表单数据' },
        { url: require('@/assets/images/none-008.png'), text: '暂无评论' },
        { url: require('@/assets/images/newdef2.png'), text: '暂无列表数据' },
        { url: require('@/assets/images/view.png'), text: '暂无视图' }
      ]
    }
  },
  methods: {
    setOptions() {
      this.contentList = [
        { url: require('@/assets/images/none-assess.png'), text: this.$t('public.message00') },
        { url: require('@/assets/images/none-statistics.png'), text: this.$t('public.message01') },
        { url: require('@/assets/images/none-001.png'), text: this.$t('public.message02') },
        { url: require('@/assets/images/none-002.png'), text: this.$t('public.message03') },
        { url: require('@/assets/images/none-003.png'), text: this.$t('public.message04') },
        { url: require('@/assets/images/none-004.png'), text: this.$t('public.message05') },
        { url: require('@/assets/images/none-005.png'), text: this.$t('public.message06') },
        { url: require('@/assets/images/none-006.png'), text: this.$t('public.message07') },
        { url: require('@/assets/images/none-007.png'), text: this.$t('public.message08') },
        { url: require('@/assets/images/none-007.png'), text: this.$t('public.message09') },
        { url: require('@/assets/images/none-statistics.png'), text: this.$t('public.message10') },
        { url: require('@/assets/images/none-statistics.png'), text: this.$t('public.message11') },
        { url: require('@/assets/images/none-003.png'), text: this.$t('public.message12') }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.default-page {
  display: flex;
  align-content: center;
  justify-content: center;
  .content {
    height: auto;
    min-height: 400px;
    width: 100%;
    text-align: center;
    position: relative;
    .content-list {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .img {
      width: var(--imgWidth);
      // height: 118px;
    }
    p {
      margin: 0;
      padding: 6px 0 0 0;
      font-size: 13px;
      color: #999999;
    }
  }
}
</style>
