import path from 'node:path'
import url from 'node:url'
import { WebSocketServer } from 'ws'
import StaticServer from './static-server.js'
import Peer from '../client/peer.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const packageDir = path.resolve(__dirname, '..')

const defaults = {
  host: 'localhost',
  port: 8088
}

export const Server = _opts => {
  const opts = { ...defaults, ..._opts }
  const { host, port } = opts

  const clientDir = path.join(packageDir, 'client')
  const staticServer = StaticServer(clientDir, [
    {
      match: req => req.method === 'GET' && req.url === '/opts.json',
      handler: (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify(opts))
        res.end()
      }
    }
  ])
  const wss = new WebSocketServer({ server: staticServer })

  let nextClientId = 0
  const clients = new Set()
  const broadcast = (type, data = {}) => {  // eslint-disable-line
    [...clients].forEach(client => {
      client.send(type, data)
    })
  }

  const players = new Set()

  wss.on('connection', connection => {
    const clientId = 'c' + nextClientId++
    console.log(`established connection, new client ${clientId}`)
    const client = Peer(clientId, connection, {
      players: new Set()
    })
    client.addEventListener('close', () => {
      clients.delete(client)
    })
    client.addMessageListener(msg => {
      if (msg.type === 'newClient') {
        client.status = 'ready'
        client.send('helloClient', { clientId })
      }
    })
  })

  staticServer.listen(port, host, () => {
    console.log(`Server started on ${host}:${port}`)
  })

  const server = {
    opts,
    clientDir,
    staticServer,
    wss,
    clients,
    players
  }
  return server
}

export default Server
