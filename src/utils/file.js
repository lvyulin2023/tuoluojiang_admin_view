import { downloadUrlApi } from '@/api/public';
const base = {};
base.install = function(Vue, options) {
  // 判断文件类型
  Vue.prototype.getFileType = function(type, fileUrl) {
    var icon = '';
    if (type == 1) {
      icon = 'iconwenjianjia color-file';
    } else {
      if(!fileUrl) return false
      var fileType = fileUrl.substr(fileUrl.lastIndexOf('.') + 1);
  
      let typeObj={
        mp3:'iconMP3geshi mp3',
        mp4:'iconMP4geshi mp4 ',
        svg:'iconSVGgeshi svg ',
        ppt:'iconPPTgeshi ppt',
        pptx:'iconPPTgeshi ppt',
        xls:'iconExcelgeshi xls',
        xlsx:'iconExcelgeshi xls',
        xlsm:'iconExcelgeshi xls',
        pdf:'iconPDFgeshi pdf',
        png:'iconPNGgeshi png',
        jpeg:'iconPDFgeshi pdf',
        jpg:'iconJPGgeshi jpg',
        PNG:'iconPDFgeshi png',
        xmind:'iconXmindgeshi pdf',
        doc:'iconwordgeshi doc',
        docx:'iconwordgeshi doc',
        ai:'iconAIgeshi ppt',
        sketch:'iconSketchgeshi tif',
        ps:'iconPSgeshi gif',
        gif:'iconGIFgeshi gif',
        tif:'iconTIFgeshi tif',
        zip:'iconZipgeshi zip',
        xd:'iconXDgeshi svg',
        md:'iconXmindgeshi tif',
        eps:'iconAIgeshi ppt',
      }
      if (typeObj[fileType]) {
        icon = typeObj[fileType]||'iconwendanggeshi word';
      }
    }
    return icon;
  };
  // 文件下载
  Vue.prototype.fileDownLoad = function(item) {
    console.log(item)
    downloadUrlApi({
      file_id: item.file_sn,
      type: 'folder'
    })
      .then((res) => {
       

        window.open(res.data.download_url, '_blank');
      })
      .catch((error) => {
        this.$message.error(error.message);
      });
  };
  // 文件下载
  Vue.prototype.fileLinkDownLoad = function(url, name) {
    var urlPath = url;
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = urlPath;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // 去除左右空格
  Vue.prototype.trim = function(s) {
    return s.replace(/(^\s*)|(\s*$)/g, '');
  };
  // 根据排序id获取名称
  Vue.prototype.fileSortName = function(id) {
    var icon = '';
    const isIcon = {
    1:'file_name',
    2:'created_at',
    3:'updated_at',
    4:'file_size',
    5:'deleted_at',
    6:'asc',
    }
    icon = isIcon[id]||'desc'
    return icon;
  };
  // 根据类型id获取名称
  Vue.prototype.fileTypeName = function(id) {
    var icon = '';
    const isIcon = {
      1:'',
      2:'word',
      3:'ppt',
      4:'image',
      5:'excel'
      }
    icon = isIcon[id]
    
    return icon;
  };
  // 判断图片类型 返回值：true/false
  Vue.prototype.fileIsImage = function(type) {
    return ['image/png','image/jpg','image/webp','image/jpeg','image/bmp'].includes(type)
  };
  // 获取文件后缀
  Vue.prototype.getFileNameTypes = function(url) {
    let str = '';
    if (url.lastIndexOf('.') > -1) {
      str = url.substr(url.lastIndexOf('.') + 1);
    }
    return str;
  };
};

export default base;
