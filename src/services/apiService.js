// src/services/apiService.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async login(credentials) {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getProfile() {
    const response = await fetch(`${this.baseURL}/api/users/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData) {
    const response = await fetch(`${this.baseURL}/api/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  // Schedule endpoints (updated to match API)
  async saveSchedule(scheduleData) {
    const response = await fetch(`${this.baseURL}/api/scheduling/user`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
    return this.handleResponse(response);
  }

  async getSchedule() {
    const response = await fetch(`${this.baseURL}/api/scheduling/user`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Group endpoints
  async getGroups() {
    const response = await fetch(`${this.baseURL}/api/groups`, {
      // No auth needed - public endpoint
    });
    return this.handleResponse(response);
  }

  async getGroup(groupId) {
    const response = await fetch(`${this.baseURL}/api/groups/${groupId}`);
    return this.handleResponse(response);
  }

  async createGroup(groupData) {
    const response = await fetch(`${this.baseURL}/api/groups`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(groupData)
    });
    return this.handleResponse(response);
  }

  async joinGroup(groupId) {
    const response = await fetch(`${this.baseURL}/api/groups/${groupId}/join`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async leaveGroup(groupId) {
    const response = await fetch(`${this.baseURL}/api/groups/${groupId}/leave`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Algorithm integration endpoints (updated to match API)
  async findOptimalTime(groupId) {
    const response = await fetch(`${this.baseURL}/api/scheduling/find-optimal-time`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ groupId })
    });
    return this.handleResponse(response);
  }

  // AI/Material endpoints (updated to match API)
  async uploadMaterial(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/scheduling/upload-material`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        // Don't set Content-Type for FormData
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  async generateQuiz(materialId) {
    const response = await fetch(`${this.baseURL}/api/scheduling/generate-quiz`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ materialId })
    });
    return this.handleResponse(response);
  }

  // Backwards compatibility method for old code
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { data: await response.json() };
  }
}

export default new ApiService();