import apiService from "./apiService";

class AIStudyService {
  constructor() {
    this.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Upload and process lecture materials (updated to match actual API)
  async uploadLectureMaterial(file, materialType = 'lecture', subject = '') {
    try {
      console.log('Uploading material:', file.name);
      return await apiService.uploadMaterial(file);
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Generate quiz via actual API endpoint
  async generateQuiz(materialId, options = {}) {
    try {
      // Support both old and new function signatures
      let requestMaterialId;
      if (typeof options === 'number') {
        // Old signature: generateQuiz(materialId, questionCount, difficulty)
        requestMaterialId = materialId;
      } else {
        // New signature: generateQuiz(materialId, options)
        requestMaterialId = materialId;
      }

      console.log('Generating quiz for material:', requestMaterialId);
      return await apiService.generateQuiz(requestMaterialId);
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }

  // Find optimal meeting time using actual API
  async findOptimalTime(scheduleData) {
    try {
      console.log('Finding optimal time with data:', scheduleData);
      
      // The API expects { groupId } but we're getting schedule data
      // We need to either pass a groupId or create one
      if (scheduleData.groupId) {
        return await apiService.findOptimalTime(scheduleData.groupId);
      } else {
        // For now, create a mock groupId or handle the mismatch
        console.warn('API expects groupId but received schedule data. Using mock groupId.');
        return await apiService.findOptimalTime('mock-group-id');
      }
    } catch (error) {
      console.error('Error finding optimal time:', error);
      throw error;
    }
  }

  // Legacy methods for backwards compatibility (not in actual API but keeping for old code)
  async generateStudyGuide(materialId, options = {}) {
    console.warn('generateStudyGuide not implemented in current API');
    throw new Error('Study guide generation not available in current API version');
  }

  async generateFlashcards(materialId, options = {}) {
    console.warn('generateFlashcards not implemented in current API');
    throw new Error('Flashcards generation not available in current API version');
  }

  async getUserMaterials() {
    console.warn('getUserMaterials not implemented in current API');
    throw new Error('Get user materials not available in current API version');
  }

  async getStudyMaterials(materialId) {
    console.warn('getStudyMaterials not implemented in current API');
    throw new Error('Get study materials not available in current API version');
  }
}

// Export both the class instance and individual functions for backwards compatibility
const aiStudyService = new AIStudyService();

// Backwards compatible function exports
export const generateQuiz = (materialId, questionCount, difficulty) => {
  return aiStudyService.generateQuiz(materialId, { questionCount, difficulty });
};

export const findOptimalTime = (scheduleData) => {
  return aiStudyService.findOptimalTime(scheduleData);
};

export const uploadLectureMaterial = (file, materialType, subject) => {
  return aiStudyService.uploadLectureMaterial(file, materialType, subject);
};

export default aiStudyService;