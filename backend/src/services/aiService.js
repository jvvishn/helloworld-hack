const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// The URL for Amy's AI backend, which you will set in your .env file
const AI_API_URL = process.env.AI_API_URL;

class AIService {
  // This function calls Amy's API to upload a lecture material file.
  async uploadMaterial(file) {
    try {
      if (!AI_API_URL) throw new Error('AI_API_URL environment variable is not set.');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path), file.originalname);

      const response = await axios.post(`${AI_API_URL}/api/ai/upload-material`, formData, {
        headers: formData.getHeaders(),
      });
      
      // Clean up the temporary file after upload
      fs.unlinkSync(file.path);

      return response.data;
    } catch (error) {
      console.error('Error calling AI service for material upload:', error.message);
      // Clean up the temporary file if the upload fails
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error('Failed to upload material to AI service.');
    }
  }

  // This function calls Amy's API to generate a quiz based on a material ID.
  async generateQuiz(materialId, questionCount = 5, difficulty = 'medium') {
    try {
      if (!AI_API_URL) throw new Error('AI_API_URL environment variable is not set.');
      const response = await axios.post(`${AI_API_URL}/api/ai/generate-quiz`, { 
        materialId: materialId,
        questionCount: questionCount,
        difficulty: difficulty
      });
      return response.data;
    } catch (error) {
      console.error('Error calling AI service for quiz generation:', error.message);
      throw new Error('Failed to generate quiz from AI service.');
    }
  }

  // This function calls Amy's API to find the optimal meeting time.
  async findOptimalTime(data) {
    try {
      if (!AI_API_URL) throw new Error('AI_API_URL environment variable is not set.');
      const response = await axios.post(`${AI_API_URL}/find_time_enhanced`, data);
      return response.data;
    } catch (error) {
      console.error('Error calling AI service for optimal time:', error.message);
      throw new Error('Failed to find optimal time from AI service.');
    }
  }
}

module.exports = new AIService();