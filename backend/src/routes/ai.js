// backend/src/routes/ai.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Read the AI Server URL from your .env file
const AI_API_URL = process.env.AI_API_URL;

router.post('/generate-quiz', async (req, res, next) => {
  try {
    // Build the full URL using the variable
    const pythonApiUrl = `${AI_API_URL}/api/ai/generate-quiz`;

    const response = await axios.post(pythonApiUrl, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling AI service:', error.message);
    next(error);
  }
});

module.exports = router;