import SettingMer from '@/libs/settingMer'
import noticeHandle from '@/libs/noticeHandle'
import ElementUI from 'element-ui'
import { roterPre } from '@/settings'
import { messageListApi } from '@/api/public'
import store from '@/store'
import { noticeMessageReadApi } from '@/api/user'
import { EventBus } from '@/libs/bus'
let limitConnect = 40 // 断线重连次数
let timeToken = ''
const audioUrl = require('../assets/audio/tip.mp3')
const audioTip = new Audio(audioUrl)
const notifications = {}
function notice(token) {
  const ws = new WebSocket(`${SettingMer.wsSocketUrl}/ws?type=ent&token=${token}`)
  timeToken = token
  let ping
  function send(type, data) {
    ws.send(JSON.stringify({ type, data }))
  }
  ws.onopen = function () {
    console.log('webSocket open')
    limitConnect = 40
    ping = setInterval(function () {
      send('ping')
    }, 10000)
  }

  ws.onmessage = function (res) {
    const data = JSON.parse(res.data)
    if (data.type === 'notice') {
      let message = data.data
      audioTip.play()
      const imgShow = message.image
      let content = `
        <a onclick="onNotice()" href="${roterPre}${message.url}">
          <div class='el-row display-align'>
            <div class='el-col el-col-24 left' ${imgShow == '' ? 'style="display:none"' : 'style="display:block"'}>
               <img src='${imgShow}' alt='' style="width:55px;height:55px" >
            </div>
            <div ${imgShow == '' ? 'class="el-col el-col-24 right width100"' : 'class="el-col el-col-24 right"'}>
              <p class='title over-text'>${message.title}</p>
              <p class='caption over-text2'>${message.message}</p>
            </div>
          </div>
        </a>`
      if (message.buttons.length > 0) {
        for (let i = 0; i < message.buttons.length; i++) {
          let value = message.buttons[i]
          content += `<div class='text-right'>
            <button type="button" class="el-button el-button--text el-button--small" onclick="onConfirm(${i})"><span>${value.title}</span></button>
          </div>`
        }
      }

      let notify = ElementUI.Notification({
        title: '消息',
        dangerouslyUseHTMLString: true,
        message: content,
        duration: 10000,
        offset: 60,
        iconClass: 'iconfont iconxiaoxi',
        customClass: 'message-socket'
      })
      notifications[message.uniqid] = notify
      getMessage()

      window.onConfirm = function (index) {
        const item = message.buttons[index]
        EventBus.$emit('messageSuccess', { item, detail: message })
        close()
      }

      window.onCancel = function () {
        noticeHandle(message, 0)
        close()
      }

      window.onNotice = function () {
        close()
      }

      function close() {
        notifications[message.uniqid].close()
        delete notifications[message.uniqid]
        batchMessageRead(1, { ids: [message.id] })
      }
    }
  }

  ws.onclose = function (e) {
    EventBus.$emit('close', e)

    reconnect()
    clearInterval(ping)
  }

  ws.onerror = function (event) {
    reconnect()
  }

  return function () {
    ws.close()
  }
}

// 重连
function reconnect() {
  // lockReconnect加锁，防止onclose、onerror两次重连
  if (limitConnect > 0) {
    if (!localStorage.getItem('lockReconnect')) {
      localStorage.setItem('lockReconnect', 1)
      limitConnect--
      console.log('第' + (40 - limitConnect + 1) + '次重连')
      // 进行重连
      setTimeout(function () {
        notice(timeToken)
        localStorage.removeItem('lockReconnect')
      }, 10000)
    }
  } else {
    console.log('webSocket连接已超时')
  }
}
// 批量标记未已读
function batchMessageRead(status, data) {
  noticeMessageReadApi(status, data)
    .then((res) => {
      getMessage()
    })
    .catch((error) => {
      // console.log(error.message);
    })
}
// 消息数量
function getMessage() {
  messageListApi({ page: 1, limit: 5 })
    .then((res) => {
      const num = res.data.messageNum ? res.data.messageNum : 0
      store.commit('user/SET_MESSAGE', num)
    })
    .catch((error) => {
      ElementUI.Message({
        message: error.message,
        type: 'error'
      })
    })
}

export default notice
