import axios from 'axios';

const API_URL = 'https://korix-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for receiving/sending HTTP-only refresh_token cookie
});

// Intercept requests to attach Access Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Intercept responses to handle 401s and refresh the token transparently
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If it's a 401 Unauthorized and we haven't already retried this exact request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to hit the refresh endpoint (this will automatically send the refresh_token cookie)
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

        // Save new token
        const newAccessToken = res.data.accessToken;
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token died / is missing: time to logout!
        localStorage.removeItem('access_token');
        localStorage.removeItem('korix_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
