// Temporary mock service for testing
class MockAuthService {
  async register(userData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = {
      uid: 'mock-user-id',
      name: userData.name,
      email: userData.email,
    };
    
    const token = 'mock-jwt-token';
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      user,
      token,
    };
  }

  async login(credentials) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful login
    if (credentials.email === 'demo@studygroup.com' && credentials.password === 'password123') {
      const user = {
        uid: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@studygroup.com',
      };
      
      const token = 'mock-jwt-token';
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        user,
        token,
      };
    }
    
    throw new Error('Invalid credentials');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getCurrentUser() {
    const user = this.getStoredUser();
    if (!user) throw new Error('No user found');
    return user;
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }
}

export default new MockAuthService();