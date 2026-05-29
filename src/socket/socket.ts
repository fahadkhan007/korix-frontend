import { io } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:5000';
// const SOCKET_URL = 'https://korix-backend.onrender.com';
const API_URL    = 'https://korix-backend.onrender.com/api';

// auth is a FUNCTION so Socket.IO calls it fresh on every connect/reconnect attempt.
// This is critical — it means we always send the latest access_token, not a stale one
// captured at import time.
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  auth: async (cb) => {
    let token = localStorage.getItem('access_token') ?? '';

    // If we have a refresh token, proactively try to get a fresh access token.
    // The access token expires every 15 min; the socket server will reject a stale one
    // with "unauthorized", causing a permanent disconnect.
    // We attempt a silent refresh here so the handshake always uses a valid token.
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newAccess  = res.data.accessToken;
        const newRefresh = res.data.refreshToken;
        localStorage.setItem('access_token', newAccess);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
        token = newAccess;
      } catch {
        // Refresh failed — use whatever token we have; server will reject if truly dead
      }
    }

    cb({ token });
  },
});

// Log auth/connection errors so they're visible in DevTools console
socket.on('connect_error', (err) => {
  console.error('[socket] connect_error:', err.message);
});

export default socket;
