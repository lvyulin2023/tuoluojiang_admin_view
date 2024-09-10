const helper = {
  // 手机号码正则验证
  phoneReg: /^1[3|5|6|7|8|9][0-9]{9}$/,
  // 座机号码正则验证
  landlineReg: /^([0-9]{3,4}-)?[0-9]{7,8}$/,
  // 邮箱正则验证
  mailboxReg: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
  //验证税号 15或者17或者18或者20位字母、数字组成
  identReg: /^[A-Z0-9]{15}$|^[A-Z0-9]{17}$|^[A-Z0-9]{18}$|^[A-Z0-9]{20}$/,
  // 验证上传文件格式
  uploadTypes: [
    'jpeg',
    'gif',
    'bmp',
    'png',
    'jpg',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'xlsm',
    'ppt',
    'pptx',
    'txt',
    'pdf',
    'md',
    'zip',
    'word',
    'xmind',
    'sketch',
    'xd',
    'ps',
    'ai',
    'mp3',
    'mp4',
    'svg',
    'tif',
    'eps'
  ],
  uploadCustomerTypes: ['xlsx'],
  // 验证图片格式
  checkImageType: ['jpeg', 'gif', 'bmp', 'png', 'jpg'],
  // 默认文件大小
  fileSize: 10
}
export default helper

/**
 * 生成六位字母唯一值
 * @param {Number} len
 * @returns {string}
 */
export const generateUniqueString = (len = 6) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  const charactersLength = characters.length
  for (let i = 0; i < len; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
