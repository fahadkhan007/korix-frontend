import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:8000';
const SOCKET_URL = 'https://korix-backend.onrender.com';

// autoConnect: false — we connect manually when the ChatPanel mounts
// auth is a function so it reads the latest token from localStorage at connect time
// (If it were an object, it would capture the value once on import — possibly empty)
const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem('access_token') ?? '';
    cb({ token });
  },
});

export default socket;
