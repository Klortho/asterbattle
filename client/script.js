import d3 from './lib/d3-multi.js'
import { Peer } from './peer.js'
import { KeyboardPlayer } from './player.js'
const { WebSocket } = window


const textNode = (text, attrs) => {
  const _attrs = {
    'font-size': '38pt',
    'font-family': 'Geostar Fill',
    fill: 'white',
    'dominant-baseline': 'middle',
    'text-anchor': 'middle',
    ...attrs
  }
  return d3.create('text').attrs(_attrs)
    .text(text);
}

const zoomIn = (parent, x=0, y=0) => {
  const posG = parent.append('g').attrs({
    transform: `translate(${x} ${y})`
  })
  const scaleG = posG.append('g').attrs({
    transform: `scale(0)`
  })
  scaleG.transition()
    .attr('transform', 'scale(1)')
    .duration(3000)
  return {
    posG, scaleG,
    append(type) {
      return scaleG.append(type)
    }
  }
}
const screen = (() => {
  const svg = d3.select('svg')

  const background = svg.append('rect').attrs({
    x: 0, y: 0, fill: 'black', stroke: 'none',
  })
  const headerZoom = zoomIn(svg)
  const header = headerZoom.node()
    .appendChild(textNode('ASTERBATTLE').node());

  const cntrlsG = svg.append('g')
  const cntrlLines = [];
  const addCntrlLine = text => {
    const y = 40 * cntrlLines.length
    const cntrlLine = zoomIn(cntrlsG, 0, y);
    //cntrlLine.append(textNode(text))
    cntrlLines.push(cntrlLine)
  }
  addCntrlLine('keyboard')


  const _screen = {
    width: null, height: null,
    background,
    headerZoom,
    header,
    cntrlsG,
    cntrlLines,
    resize() {
      const width = this.width = window.innerWidth
      const height = this.height = window.innerHeight
      svg.attrs({width, height})
      background.attrs({width, height})
      headerZoom.posG.attrs({
        transform: `translate(${width / 2} ${height / 10})`
      })
      cntrlsG.attrs({
        transform: `translate(${width / 2} ${3 * height / 10})`
      })
    },
  }
  return _screen
})();

screen.resize()
window.onresize = () => screen.resize();



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
/*
  .then(server => {
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
*/
