class AIStudyService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  }

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Upload and process lecture materials (connects to Amy's AI processing)
  async uploadLectureMaterial(file, materialType = 'lecture', subject = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('materialType', materialType);
      formData.append('subject', subject);

      const response = await fetch(`${this.baseURL}/ai/upload-material`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type for FormData - browser sets it automatically
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Generate study guide via Amy's AI backend
  async generateStudyGuide(materialId, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/generate-study-guide`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          materialId,
          length: options.length || 'medium',
          focusAreas: options.focusAreas || [],
          includeExamples: options.includeExamples !== false
        })
      });

      if (!response.ok) {
        throw new Error('Study guide generation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Study guide generation error:', error);
      throw error;
    }
  }

  // Generate quiz via Amy's AI backend
  async generateQuiz(materialId, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/generate-quiz`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          materialId,
          questionCount: options.questionCount || 10,
          difficulty: options.difficulty || 'medium',
          questionTypes: options.questionTypes || ['multiple-choice', 'short-answer']
        })
      });

      if (!response.ok) {
        throw new Error('Quiz generation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }

  // Generate flashcards via Amy's AI backend
  async generateFlashcards(materialId, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/ai/generate-flashcards`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          materialId,
          cardCount: options.cardCount || 20,
          difficulty: options.difficulty || 'medium'
        })
      });

      if (!response.ok) {
        throw new Error('Flashcards generation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Flashcards generation error:', error);
      throw error;
    }
  }

  // Get user's uploaded materials
  async getUserMaterials() {
    try {
      const response = await fetch(`${this.baseURL}/ai/materials`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch materials');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  // Get generated study materials
  async getStudyMaterials(materialId) {
    try {
      const response = await fetch(`${this.baseURL}/ai/study-materials/${materialId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch study materials');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching study materials:', error);
      throw error;
    }
  }
}

export default new AIStudyService();