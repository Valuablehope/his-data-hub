export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchApi = (url, options = {}) => {
  const headers = {
    ...options.headers,
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true'
  };
  return fetch(url, { ...options, headers });
};
