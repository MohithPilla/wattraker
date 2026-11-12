const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('notes_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      let message = data.message;
      if (!message) {
        if (response.status === 500 || response.status === 502 || response.status === 503) {
          message = 'Backend server is unreachable on port 5000. Please run "npm run dev" from the project root.';
        } else if (response.status === 404) {
          message = `API endpoint not found: ${endpoint}`;
        } else {
          message = `Request failed with status ${response.status}`;
        }
      }
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      const error = new Error('Cannot connect to backend server. Please run "npm run dev" from the project root.');
      error.status = 503;
      throw error;
    }
    throw err;
  }
};
