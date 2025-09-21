// src/services/groupMatchingService.js
import apiService from './apiService';

class GroupMatchingService {
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

  // Find optimal study times for a group (Algorithm Team Integration)
  async findStudyMatches(groupMembers, meetingDuration = 60, searchRange = 7) {
    try {
      const searchEndDate = new Date();
      searchEndDate.setDate(searchEndDate.getDate() + searchRange);

      const response = await fetch(`${this.baseURL}/api/find_time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          users: groupMembers.map(member => ({
            user_id: member.userId || member.id,
            schedule: member.schedule || []
          })),
          meeting_duration_minutes: meetingDuration,
          search_range: {
            start: new Date().toISOString(),
            end: searchEndDate.toISOString()
          }
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to find study matches:', error);
      throw error;
    }
  }

  // Find compatible students based on schedule and preferences
  async findCompatibleStudents(userId, preferences = {}) {
    try {
      const queryParams = new URLSearchParams({
        course_preferences: preferences.courses?.join(',') || '',
        study_preferences: preferences.studyStyle || '',
        location_preference: preferences.location || '',
        max_results: preferences.maxResults || 10
      });

      const response = await fetch(`${this.baseURL}/api/users/${userId}/compatible?${queryParams}`, {
        headers: this.getAuthHeaders()
      });
      
      const result = await this.handleResponse(response);
      
      // Transform the response to include compatibility scores and reasons
      return result.map(student => ({
        ...student,
        compatibilityScore: student.compatibility_score || 0,
        commonCourses: student.common_courses || [],
        commonTimes: student.available_times || [],
        studyPreferences: student.study_preferences || {}
      }));
    } catch (error) {
      console.error('Failed to find compatible students:', error);
      throw error;
    }
  }

  // Suggest optimal study times for a specific group
  async suggestStudyTimes(groupId, duration = 60, preferences = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/groups/${groupId}/suggest-times`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          duration_minutes: duration,
          time_preferences: preferences.timePreferences || {},
          recurring: preferences.recurring || false,
          location_preference: preferences.location || ''
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to suggest study times:', error);
      throw error;
    }
  }

  // Create a new study group with compatibility matching
  async createStudyGroup(groupData) {
    try {
      const response = await fetch(`${this.baseURL}/api/groups`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          name: groupData.name,
          description: groupData.description,
          course: groupData.course,
          max_members: groupData.maxMembers || 6,
          study_preferences: groupData.studyPreferences || {},
          auto_match: groupData.autoMatch || false
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to create study group:', error);
      throw error;
    }
  }

  // Join a study group with compatibility check
  async joinStudyGroup(groupId, userPreferences = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          user_preferences: userPreferences
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to join study group:', error);
      throw error;
    }
  }

  // Get recommendations for study groups to join
  async getGroupRecommendations(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams({
        course: filters.course || '',
        study_style: filters.studyStyle || '',
        location: filters.location || '',
        max_distance: filters.maxDistance || '',
        min_compatibility: filters.minCompatibility || 0.5
      });

      const response = await fetch(`${this.baseURL}/api/users/${userId}/group-recommendations?${queryParams}`, {
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get group recommendations:', error);
      throw error;
    }
  }

  // Schedule a study session for a group
  async scheduleStudySession(groupId, sessionData) {
    try {
      const response = await fetch(`${this.baseURL}/api/groups/${groupId}/sessions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          title: sessionData.title,
          start_time: sessionData.startTime,
          end_time: sessionData.endTime,
          location: sessionData.location,
          description: sessionData.description,
          meeting_link: sessionData.meetingLink || '',
          session_type: sessionData.sessionType || 'study'
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to schedule study session:', error);
      throw error;
    }
  }

  // Get all groups for a user
  async getUserGroups(userId) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${userId}/groups`, {
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get user groups:', error);
      throw error;
    }
  }

  // Get upcoming sessions for a user
  async getUpcomingSessions(userId, limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${userId}/sessions/upcoming?limit=${limit}`, {
        headers: this.getAuthHeaders()
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get upcoming sessions:', error);
      throw error;
    }
  }

  // Update user study preferences for better matching
  async updateStudyPreferences(userId, preferences) {
    try {
      const response = await fetch(`${this.baseURL}/api/users/${userId}/preferences`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to update study preferences:', error);
      throw error;
    }
  }

  // Rate a study session (for improving future matching)
  async rateStudySession(sessionId, rating, feedback = '') {
    try {
      const response = await fetch(`${this.baseURL}/api/sessions/${sessionId}/rating`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          rating: rating,
          feedback: feedback
        })
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to rate study session:', error);
      throw error;
    }
  }

  // Emergency fallback methods for offline/development use
  generateMockCompatibleStudents(userId, count = 5) {
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-user-${i}`,
      name: `Student ${i + 1}`,
      compatibilityScore: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
      commonCourses: ['CS 101', 'MATH 205'].slice(0, Math.floor(Math.random() * 2) + 1),
      commonTimes: [
        { day: 'monday', startTime: '14:00', endTime: '16:00' },
        { day: 'wednesday', startTime: '10:00', endTime: '12:00' }
      ],
      studyPreferences: {
        location: ['library', 'online'][Math.floor(Math.random() * 2)],
        studyStyle: ['group', 'collaborative'][Math.floor(Math.random() * 2)]
      }
    }));
  }

  generateMockOptimalTimes(groupMembers, duration = 60) {
    return [
      {
        start: '2024-01-15T14:00:00Z',
        end: '2024-01-15T15:00:00Z',
        score: 0.9,
        participants: groupMembers.map(m => m.userId || m.id)
      },
      {
        start: '2024-01-17T10:00:00Z',
        end: '2024-01-17T11:00:00Z',
        score: 0.8,
        participants: groupMembers.map(m => m.userId || m.id)
      }
    ];
  }
}

export default new GroupMatchingService();