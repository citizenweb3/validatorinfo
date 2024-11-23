import next from 'next';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { ChatMessage } from '@/types';

require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.PUBLIC_URL;
const port = parseInt(process.env.SERVER_PORT || '3000');
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const state: {
  users: Record<string, string>;
} = { users: {} };

const getUsers = () => {
  return { ...state.users };
};

const setUsers = (users: Record<string, string>) => {
  state.users = users;
};

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  const broadcastMessage = (message: ChatMessage) => {
    io.emit('chat message', message);
  };

  io.on('connection', (socket) => {
    socket.on('chat message', (message) => {
      broadcastMessage(message);
    });

    socket.on('enter', (username: string) => {
      const users = getUsers();
      users[socket.id] = username;
      setUsers(users);
      io.emit('actual-users', Object.values(getUsers()));
    });

    socket.on('live', (username: string) => {
      const users = getUsers();
      delete users[socket.id];
      setUsers(users);
      io.emit('actual-users', Object.values(getUsers()));
    });

    socket.on('disconnect', () => {
      const users = getUsers();
      delete users[socket.id];
      setUsers(users);
      io.emit('actual-users', Object.values(getUsers()));
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on ${hostname}:${port}`);
    });
});
