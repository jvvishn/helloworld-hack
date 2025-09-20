import API from '../utils/api';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await API.post('/auth/register', userData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Registration failed'
      );
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await API.post('/auth/login', credentials);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed'
      );
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await API.get('/auth/me');
      return response.data.user;
    } catch (error) {
      throw new Error('Failed to get user data');
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get stored user data
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();