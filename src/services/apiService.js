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
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return this.handleResponse(response);
  }

  async register(userData) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async getProfile() {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async updateProfile(userData) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse(response);
  }

  // Schedule endpoints
  async saveSchedule(scheduleData) {
    const response = await fetch(`${this.baseURL}/users/schedule`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });
    return this.handleResponse(response);
  }

  async getSchedule() {
    const response = await fetch(`${this.baseURL}/users/schedule`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Group endpoints
  async createGroup(groupData) {
    const response = await fetch(`${this.baseURL}/groups`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(groupData)
    });
    return this.handleResponse(response);
  }

  async getGroups() {
    const response = await fetch(`${this.baseURL}/groups`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async joinGroup(groupId) {
    const response = await fetch(`${this.baseURL}/groups/${groupId}/join`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async leaveGroup(groupId) {
    const response = await fetch(`${this.baseURL}/groups/${groupId}/leave`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  // Algorithm integration endpoints
  async findMatches(preferences = {}) {
    const response = await fetch(`${this.baseURL}/matching/find`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    return this.handleResponse(response);
  }

  async getOptimalTimes(groupId, duration = 60) {
    const response = await fetch(`${this.baseURL}/matching/optimal-times`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ groupId, duration })
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();