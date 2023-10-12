/*
  Messages:
    type       source   dest      desc / data
  newClient    client  server     new connection established; expects
                                  helloClient back.
  helloClient  server  client     `clientId`
  newPlayer    client  server     `playerId` - client assigns this, concatenation
                                  of clientId and a locally unique number for the
                                  player.
  helloPlayer  server  broadcast  `playerId`
                                  `color`
  lostPlayer   server  broadcast  `playerId`
  begin        server  broadcast  complete description of the model
*/

export const Peer = (id, connection, ...data) => {
  const peer = {
    id, connection,
    ...data,
    status: 'open',

    send(type, data={}) {
      if (this.status !== 'closed') {
        const json = JSON.stringify({ type, ...data });
        console.log(`sending to ${id}: ${json}`);
        connection.send(json);
      }
    },

    eventListeners: {},
    addEventListener(type, handler) {
      const {eventListeners} = this;
      if (!(type in eventListeners)) {
        eventListeners[type] = [];
        connection.addEventListener(type, evt => {
          eventListeners[type].forEach(handler => handler(evt));
        });
      }
      eventListeners[type].push(handler);
    },
    removeEventListener(type, handler) {
      connection.removeEventListener(type, handler);
      const {eventListeners} = this;
      if (!(type in eventListeners)) return;
      const i = eventListeners[type].findIndex(h => h === handler);
      if (i === -1) return;
      eventListeners[type].splice(i, 1);
    },

    messageListeners: [],
    addMessageListener(handler) {
      this.messageListeners.push(handler);
    },
    removeMessageListener(handler) {
      const i = this.messageListeners.findIndex(h => h === handler);
      if (i !== -1) this.messageListeners.splice(i, 1);
    },
  };

  connection.addEventListener('message', evt => {
    console.log(`received from ${id}: ${evt.data}`);
    peer.messageListeners.forEach(ml => {
      return ml(JSON.parse(evt.data));
    });
  });
  peer.addEventListener('close', evt => {
    console.warn(`${id} lost connection`);
    peer.status = 'closed';
  });
  peer.addEventListener('error', evt => {
    console.warn(`${id} connection error: `, evt);
  });

  return peer;
};

export default Peer;
