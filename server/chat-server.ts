import http from 'http';
import { Server } from 'socket.io';

import { ChatMessage } from '@/types';

require('dotenv').config();

const PORT = parseInt(process.env.CHAT_PORT ?? '3002');

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: process.env.PUBLIC_URL,
    methods: ['GET', 'POST'],
  },
});

const broadcastMessage = (message: ChatMessage) => {
  io.emit('chat message', message);
};

const state: {
  users: Record<string, string>;
} = { users: {} };

const getUsers = () => {
  return { ...state.users };
};

const setUsers = (users: Record<string, string>) => {
  state.users = users;
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

server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
