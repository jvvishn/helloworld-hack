// BEGIN FILE: aiService.js
const axios = require('axios');

// The URL for Amy's AI backend, which you will set in your .env file
const AI_API_URL = process.env.AI_API_URL;

class AIService {
  // This function calls Amy's API to find the optimal meeting time.
  async findOptimalTime(data) {
    try {
      if (!AI_API_URL) throw new Error('AI_API_URL environment variable is not set.');
      const response = await axios.post(`${AI_API_URL}/find-time`, data);
      return response.data;
    } catch (error) {
      console.error('Error calling AI service for optimal time:', error.message);
      throw new Error('Failed to find optimal time from AI service.');
    }
  }

  // This function calls Amy's API to generate study materials.
  async generateStudyMaterials(data) {
    try {
      if (!AI_API_URL) throw new Error('AI_API_URL environment variable is not set.');
      const response = await axios.post(`${AI_API_URL}/generate-materials`, data);
      return response.data;
    } catch (error) {
      console.error('Error calling AI service for material generation:', error.message);
      throw new Error('Failed to generate study materials from AI service.');
    }
  }
}

module.exports = new AIService();
// END FILE: aiService.js