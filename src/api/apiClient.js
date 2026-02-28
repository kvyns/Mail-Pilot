import axios from 'axios';
import { API_CONFIG } from './config';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token format (JWT should have 3 parts separated by dots)
      const isValidJWT = token.split('.').length === 3;
      
      if (!isValidJWT) {
        console.warn('Invalid token format detected. Clearing token...');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedAccount');
        
        // Only redirect if not already on login/register pages
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Invalid authentication token. Please login again.'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;
      
      console.error('Error response:', { status, data });
      
      // Parse AWS SES email verification errors
      let errorMessage = data.message || data.error || 'An error occurred';
      
      if (errorMessage.includes('MessageRejected') && errorMessage.includes('not verified')) {
        const emailMatch = errorMessage.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const email = emailMatch ? emailMatch[1] : '';
        errorMessage = `Email verification required: The email address ${email ? `"${email}" ` : ''}needs to be verified in AWS SES before you can register. Please contact the administrator or verify your email in the AWS SES console.`;
      }
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid, clear and redirect to login
          console.error('Unauthorized:', errorMessage);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('selectedAccount');
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - authenticated but no permission, do NOT clear token
          console.error('Forbidden:', errorMessage);
          break;
        case 404:
          console.error('Not found:', errorMessage);
          break;
        case 500:
          console.error('Server error:', errorMessage);
          break;
        default:
          console.error('API error:', errorMessage);
      }
      
      return Promise.reject({
        message: errorMessage,
        ...data
      });
    }
    
    if (error.request) {
      console.error('No response received:', error.request);
      return Promise.reject({
        message: 'No response from server. Please check your connection.'
      });
    }
    
    return Promise.reject({
      message: error.message || 'An unexpected error occurred'
    });
  }
);

export default apiClient;
