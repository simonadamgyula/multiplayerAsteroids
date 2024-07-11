import WebSocket from 'ws';
import uuid from 'uuid';
const { v4: uuidv4 } = uuid;
import { Player } from './player.js';
import { Game } from './game.js';

const wss = new WebSocket.Server({ port: 7071 });

/**
 * Map of connected clients
 * @type {Map<WebSocket, Player>}
 */
const clients = new Map();
/**
 * Game instance
 * @type {Game}
 */
var game = null;

function broadcast(message) {
  [...clients.keys()].forEach((client) => {
    client.send(JSON.stringify(message));
  });
}

wss.on('connection', (ws) => {
  const id = uuidv4();
  const color = Math.floor(Math.random() * 360);
  const ship = new Player(id, color);

  if (clients.size === 0) {
    game = new Game(clients);
    game.start();
  }

  clients.set(ws, ship);

  ws.on('message', (messageAsString) => {
    const request = JSON.parse(messageAsString);
    const message = {};

    switch (request.action) {
      case 'move':
        const ship = clients.get(ws);
        ship.update(request.directions);

        message.sender = ship.id;
        message.action = 'move';
        message.color = ship.color;
        message.position = ship.position;
        message.rotation = ship.rotation;

        broadcast(message);
        break;
    }

    broadcast(message);
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(clients.size)
    if (clients.size === 0) {
      game.dispose();
      game = null;
    }
    broadcast({ sender: id, action: 'disconnect' });
  });
});

wss.on("close", () => {
  clients.delete(ws);
});

console.log("wss up");