import d3 from './lib/d3-multi.js'
import { Peer } from './peer.js'
import { KeyboardPlayer } from './player.js'
const { WebSocket } = window


const svg = d3.select('svg');
const resizer = () => {
  const {innerWidth: width, innerHeight: height} = window;
};

fetch('./opts.json')
  .then(res => res.json())
  .then(opts => {
    const { host, port } = opts

    return new Promise((resolve, reject) => {
      const connection = new WebSocket(`ws://${host}:${port}`)

      connection.addEventListener('open', evt => {
        console.log('Connected to the server')
        const server = Peer('s', connection)
        server.send('newClient')

        const helloListener = msg => {
          if (msg.type === 'helloClient') {
            server.myId = msg.clientId
            server.status = 'ready'
            console.log(`connection ready, we are client ${msg.clientId}`)
            server.removeMessageListener(helloListener)
            return resolve(server)
          }
        }
        server.addMessageListener(helloListener)
      })
    })
  })
  .then(server => {
    /*const svg = d3.select(svg);
    const mainHeader = svg.append('text', {
      x: 100, y: 100,
      'font-size': '38pt'
    })*/



    let nextPlayerId = 0
    const players = []

    const { kbSelect } = elem
    kbSelect.checked = false
    kbSelect.addEventListener('change', evt => {
      if (kbSelect.checked) {
        const pid = `${server.myId}-p${nextPlayerId++}`
        const p = new KeyboardPlayer(pid, server)
        players.push(p)
      } else {
        const pi = players.findIndex(
          p => p instanceof KeyboardPlayer
        )
        if (pi !== -1) {
          players[pi].delete()
          players.splice(pi, 1)
        }
      }
    })

    const gamepads = []

    const logGamepad = gpEntry => {
      const gp = gpEntry.gamepad
      console.log(
      `Gamepad #${gp.index}: ${gp.id}, ` +
      `${gp.buttons.length} buttons, ` +
      `${gp.axes.length} axes.`
      )
    }
    const logGamepads = () => {
      gamepads.forEach(gp => {
        if (gp) logGamepad(gp)
      })
    }

    window.addEventListener('gamepadconnected', evt => {
      const { gamepad } = evt
      const checkbox = input({ type: 'checkbox' })
      checkbox.addEventListener('change', evt => {
      })
      const cntrlSelect =
        div(
          { class: 'cntrlSelect' },
          checkbox,
          `gamepad #${gamepad.index}`
        )
      addKids(elem.selectCntrls, cntrlSelect)

      gamepads[gamepad.index] = {
        i: gamepad.index,
        gamepad,
        cntrlSelect
      }
      logGamepads()
    })

    window.addEventListener('gamepaddisconnected', evt => {
      const { gamepad } = evt
      const gpEntry = gamepads[gamepad.index]
      gpEntry.cntrlSelect.remove()
      delete gamepads[gamepad.index]
      logGamepads(gamepad)
    })
  })
