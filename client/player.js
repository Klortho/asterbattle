class Player {
  constructor (id, server) {
    this.id = id
    this.server = server
    server.send('newPlayer', {playerId: id})
  }
}

const keyCodes = new Map([
  [ 65, 'turn-left' ],   // a
  [ 68, 'turn-right' ],  // d
  [ 87, 'thrust' ],      // w
  [ 32, 'fire' ],        // space
])
export class KeyboardPlayer extends Player {
  constructor(id, server) {
    super(id, server)
    document.addEventListener('keydown', evt => {
      console.log('keydown: ', evt)
      const {keyCode} = evt;
      if (keyCodes.has(keyCode)) {
        server.send(keyCodes.get(keyCode), {on: true})
      }
    })
    document.addEventListener('keyup', evt => {
      console.log('keyup: ', evt)
      const {keyCode} = evt;
      if (keyCodes.has(keyCode)) {
        server.send(keyCodes.get(keyCode), {on: false})
      }
    })
  }
}

/*
export class GamepadPlayer extends Player {
}
*/
