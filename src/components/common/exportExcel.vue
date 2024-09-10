<!-- @FileDescription: 公共-xlsx导出组件 -->
<template>
  <span />
</template>
<script>
// 引入组件
import XLSX from 'xlsx'
export default {
  name: 'ExportExcel',
  props: {
    template: {
      type: Boolean,
      default: false
    },
    saveName: {
      type: String,
      default: '导出.xlsx'
    },
    exportData: {
      type: Object,
      default() {
        return {
          data: [],
          cols: [{ wpx: 70 }, { wpx: 70 }, { wpx: 70 }, { wpx: 70 }],
          rows: []
        }
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    exportExcel() {
      if (this.exportData.data.length <= 0) {
        this.$message.error('内容为空')
      } else {
        var sheet = XLSX.utils.aoa_to_sheet(this.exportData.data)
        if (this.template) {
          sheet['!merges'] = [
            // 设置A1-C1的单元格合并
            { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
            { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
            { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } },
            { s: { r: 3, c: 2 }, e: { r: 3, c: 2 } },
            { s: { r: 2, c: 5 }, e: { r: 2, c: 6 } },
            { s: { r: 2, c: 7 }, e: { r: 2, c: 8 } },
            { s: { r: 2, c: 9 }, e: { r: 2, c: 10 } }
          ]
          sheet['!rows'] = [{ hpt: 30 }]
        } else {
          sheet['!rows'] = this.exportData.rows
        }
        sheet['!cols'] = this.exportData.cols
        this.openDownloadDialog(this.sheet2blob(sheet), this.saveName)
      }
    },
    openDownloadDialog(url, saveName) {
      if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url) // 创建blob地址
      }
      var aLink = document.createElement('a')
      aLink.href = url
      aLink.download = saveName || '' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
      var event
      if (window.MouseEvent) event = new MouseEvent('click')
      else {
        event = document.createEvent('MouseEvents')
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      }
      aLink.dispatchEvent(event)
    },
    sheet2blob(sheet, sheetName) {
      sheetName = sheetName || 'sheet1'
      var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
      }
      workbook.Sheets[sheetName] = sheet
      // 生成excel的配置项
      var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
      }
      var wbout = XLSX.write(workbook, wopts)
      var blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
      // 字符串转ArrayBuffer
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
        return buf
      }
      return blob
    }
  }
}
</script>

<style lang="scss" scoped>
.import-excel {
  margin-left: 10px;
  display: inline-block;
}
</style>
