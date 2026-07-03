import axios from 'axios';

// Centralized API client configuration
export const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
  }
  // Use environment variable if available
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '').replace('/api', '');
  }
  // Fallback to localhost
  return 'http://localhost:5000';
};

export const getAPIURL = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api/v1';
    }
  }
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    // If env already has /api/v1, return as-is
    if (process.env.NEXT_PUBLIC_API_URL.includes('/api/v1')) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    // Otherwise append /api/v1
    return `${getBaseURL()}/api/v1`;
  }
  return 'http://localhost:5000/api/v1';
};

const apiClient = axios.create({
  baseURL: getAPIURL(),
  timeout: 10000,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token from localStorage to requests
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('luxygalleria_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (err) {
          console.error('Failed to parse user data from localStorage:', err);
          // Clear corrupted data
          localStorage.removeItem('luxygalleria_user');
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only log unexpected errors (not 401/403 on public/guest routes)
    if (status !== 401 && status !== 403) {
      console.error('API Error:', status, error.response?.data || error.message);
    }
    
    if (status === 401) {
      if (typeof window !== 'undefined') {
        // Don't redirect if user isn't logged in at all (no stored user)
        const storedUser = localStorage.getItem('luxygalleria_user');
        if (storedUser) {
          // Token expired - clear storage and redirect to login
          localStorage.removeItem('luxygalleria_user');
          if (window.location.pathname !== '/sign-in') {
            window.location.href = '/sign-in?redirect=' + encodeURIComponent(window.location.pathname);
          }
        }
        // If no stored user, it's a guest trying a protected route - just reject silently
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
