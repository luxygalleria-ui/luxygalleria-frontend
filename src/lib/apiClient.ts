import axios from 'axios';

// Centralized API client configuration.
// NEXT_PUBLIC_API_URL always wins when it is set, on localhost too (it used to be ignored on localhost, so a local
// checkout silently talked to whatever ran on :5000). The local default applies only when it is unset or blank.
// The variable may be given with or without /api or /api/v1 and trailing slashes; the result never doubles /api/v1.
const LOCAL_DEFAULT_ORIGIN = 'http://localhost:5000';

/** API origin (and any mount path), without /api/v1 and without a trailing slash. */
export const getBaseURL = () => {
  // Literal reference: Next.js inlines NEXT_PUBLIC_* at build time
  const configured = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').trim();
  if (!configured) return LOCAL_DEFAULT_ORIGIN;
  return configured.replace(/\/+$/, '').replace(/\/api(?:\/v1)?$/i, '').replace(/\/+$/, '');
};

/** Base for every API call: <origin>/api/v1 */
export const getAPIURL = () => `${getBaseURL()}/api/v1`;

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
          // Shown inline on the sign-in page, so the redirect is never silent
          sessionStorage.setItem('luxygalleria_auth_notice', `Authentication failed (401): ${error.response?.data?.message || 'Invalid credentials or session expired.'}`);
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
