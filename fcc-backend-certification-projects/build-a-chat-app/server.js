import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

// Serve the page and its script; every other path falls back to the page.
const STATIC_FILES = {
  '/script.js': { file: './public/script.js', type: 'application/javascript' },
};

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const { file, type } = STATIC_FILES[pathname] || { file: './public/index.html', type: 'text/html' };

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error loading ${file}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

function broadcast(payload) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  });
}

wss.on('connection', (socket, req) => {
  const username = new URL(req.url, 'http://localhost').searchParams.get('username');

  broadcast({ type: 'system', text: `${username} joined` });

  socket.on('message', (data) => {
    try {
      const { username, text } = JSON.parse(data.toString());
      broadcast({ type: 'chat', username, text });
    } catch (err) {
      console.error('Invalid message:', err.message);
    }
  });

  socket.on('close', () => {
    broadcast({ type: 'system', text: `${username} left` });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
