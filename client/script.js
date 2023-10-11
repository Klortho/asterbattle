const elem = Object.fromEntries(
  ['helloPage', 'playerNum', 'numPlayers', 'beginButton']
    .map(tag => [tag, document.getElementById(tag)])
)

const playerData = {}

// Create WebSocket connection.
const socket = new WebSocket("ws://localhost:8088")

// Connection opened
socket.addEventListener("open", (event) => {
  socket.send("Hello Server!")
})

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data)
})
const connection = new WebSocket('ws://localhost:8088')

// Connection opened
connection.addEventListener('open', (event) => {
  connection.send('Hello Server!')
})

// Listen for messages
connection.addEventListener('message', evt => {
  console.log('Message from server ', evt.data)
  const data = JSON.parse(evt.data)
  if (data.msg === 'waiting') {
    const {playerNum, numPlayers} = data
    elem.playerNum.textContent = playerData.playerNum = playerNum
    elem.numPlayers.textContent = numPlayers
    if (playerNum === 0) {
      elem.beginButton.style.display = 'block'
      if (numPlayers > 1) {
        console.log('glorp')
        //elem.beginButton.removeAttribute('disabled')
      }
    }
  }
})
