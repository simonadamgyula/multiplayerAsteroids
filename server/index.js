import WebSocket from 'ws';
import uuid from 'uuid';
const { v4: uuidv4 } = uuid;
import { Player } from './player.js';

const wss = new WebSocket.Server({ port: 7071 });
const clients = new Map();

wss.on('connection', (ws) => {
  const id = uuidv4();
  const color = Math.floor(Math.random() * 360);
  const ship = new Player(id, color);

  clients.set(ws, ship);

  ws.on('message', (messageAsString) => {
    const request = JSON.parse(messageAsString);
    const message = {};
    var ship = clients.get(ws);
    ship.update(request.directions);

    message.sender = ship.id;
    message.color = ship.color;
    message.position = ship.position;
    message.rotation = ship.rotation;

    [...clients.keys()].forEach((client) => {
      client.send(JSON.stringify(message));
    });
  });
});

wss.on("close", () => {
  clients.delete(ws);
});

console.log("wss up");