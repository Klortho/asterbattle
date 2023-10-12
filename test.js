import fetch from 'node-fetch'
import Server from './server/server.js'

const { server } = Server()

setTimeout(
  () => {
    fetch('http://localhost:8088/assets/foo.mp3')
      .then(res => {
        console.log(`fetched`);
      });
  },
  1000
);
