const User = require('../models/User');
const Group = require('../models/Group');
const aiService = require('../services/aiService');
const fs = require('fs');

class SchedulingController {
  async getUserSchedule(req, res) {
    try {
      const user = await User.findById(req.user.uid);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ success: true, schedule: user.profile.schedule || {} });
    } catch (error) {
      console.error('Error fetching user schedule:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async updateUserSchedule(req, res) {
    try {
      const user = await User.findById(req.user.uid);
      if (!user) return res.status(404).json({ message: 'User not found' });
      await user.updateProfile({ schedule: req.body.schedule });
      res.json({ success: true, schedule: user.profile.schedule });
    } catch (error) {
      console.error('Error updating user schedule:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Find optimal time for a group
  async findOptimalTime(req, res) {
    try {
      const { groupId } = req.body;
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Group not found' });

      // Fetch all members' schedules and enhanced data from Firestore
      const memberSchedules = {};
      const dayPreferences = {};
      const userLocations = {};

      for (const memberId of group.members) {
        const user = await User.findById(memberId);
        if (user) {
          memberSchedules[user.uid] = user.profile.schedule || {};
          dayPreferences[user.uid] = user.profile.dayPreferences || [];
          userLocations[user.uid] = user.profile.classLocations || [];
        }
      }

      // Prepare and send the complete data to Amy's AI service
      const requestData = {
          users: group.members,
          schedules: memberSchedules,
          day_preferences: dayPreferences,
          user_locations: userLocations,
          meeting_duration_minutes: 60,
          search_range: {
              start: "2025-09-22T09:00:00",
              end: "2025-09-22T18:00:00"
          }
      };
      
      const optimalTimes = await aiService.findOptimalTime(requestData);

      res.json({ success: true, optimalTimes });
    } catch (error) {
      console.error('Error finding optimal time:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // New function to handle file upload
  async uploadMaterial(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }

      // Send the file to Amy's AI service
      const response = await aiService.uploadMaterial(req.file);
      
      // Respond to the frontend with the material ID from Amy's service
      res.json({
        success: true,
        message: 'File uploaded successfully',
        materialId: response.id // Get the ID from Amy's response
      });
    } catch (error) {
      console.error('Error uploading material:', error.message);
      res.status(500).json({ message: error.message });
    }
  }

  // New function to generate a quiz
  async generateQuiz(req, res) {
    try {
      const { materialId } = req.body;
      
      // Send the material ID to Amy's AI service to generate the quiz
      const quizData = await aiService.generateQuiz(materialId);

      // Respond to the frontend with the generated quiz
      res.json({
        success: true,
        quiz: quizData.data // Amy's service returns the quiz in 'data'
      });
    } catch (error) {
      console.error('Error generating quiz:', error.message);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SchedulingController();
