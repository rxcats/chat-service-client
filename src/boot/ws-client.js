import { boot } from 'quasar/wrappers'
import SockJs from 'sockjs-client'
import { eventBus } from 'boot/eventbus'
import { wsPath } from 'app/app.config'

class WebSocketClient {
  constructor(url) {
    this._url = url
    this.connect()
    this._attributes = {}
  }

  connect() {
    this._attributes = {}

    this._sock = new SockJs(this._url)

    this._sock.onopen = function () {
      console.log('onOpen')
    }

    this._sock.onmessage = function (evt) {
      // console.log('onMessage', evt.data)
      const message = JSON.parse(evt.data)
      const type = `on${message.messageType}`
      eventBus.emit(type, { data: message.data, now: message.now })
    }

    this._sock.onclose = function () {
      console.log('onClose')
    }

    this._sock.onerror = function (e) {
      console.log('onError', e)
    }
  }

  isConnected() {
    return this._sock.readyState === SockJs.OPEN
  }

  send(msg) {
    this._sock.send(JSON.stringify(msg))
  }

  close() {
    this._attributes = {}
    this._sock.close()
  }

  reconnect() {
    this.close()
    this.connect()
  }

  setAttribute(key, value) {
    this._attributes[key] = value
  }

  removeAttribute(key) {
    delete this._attributes[key]
  }

  getAttribute(key) {
    return this._attributes[key]
  }

  containsAttribute(key) {
    return this._attributes[key] !== undefined
  }
}

const ws = new WebSocketClient(wsPath)

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.config.globalProperties.$ws = ws
})

export { ws }
