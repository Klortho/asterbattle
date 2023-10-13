import fetch from 'node-fetch'
import WebSocket from 'ws'
import Server from './server/server.js'
import Peer from './client/peer.js'

const assert = (bool, msg = null) => {
  const _msg = 'Assertion error' + (msg ? ', ' + msg : '')
  if (!bool) {
    throw Error(_msg)
  }
}
Object.assign(assert, {
  same: (act, exp, msg = null) => {
    const _msg = 'expected sameness' + (msg ? ', ' + msg : '')
    return assert(act === exp, _msg)
  }
})

const tests = {
  staticServer: () => {
    const server = Server()
    const { host, port } = server.opts
    return fetch(`http://${host}:${port}/dummy.txt`)
      .then(res => res.text())
      .then(txt => {
        assert.same(txt.trim(), 'hello, dumy!')
        server.staticServer.close()
      })
  },
  webSocket: () => new Promise((resolve, reject) => {
    const _server = Server()
    const { host, port } = _server.opts
    const connection = new WebSocket(`ws://${host}:${port}`)
    const cleanup = () => {
      connection.close()
      _server.staticServer.close()
    }
    const server = Peer('server', connection)
    server.addEventListener('open', evt => {
      server.send('newClient')
    })
    server.addMessageListener(msg => {
      if (msg.type === 'helloClient') {
        cleanup()
        resolve(true)
      }
    })
    setTimeout(
      () => {
        cleanup()
        reject(Error('Failed to get helloClient message from server'))
      },
      500
    )
  })
}

tests.webSocket()
  .then(() => {
    console.log('ok')
  })
  .catch(err => {
    console.error('Test(s) failed: ', err)
  })
