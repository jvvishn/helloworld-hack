// BEGIN FILE: schedulingController.js
const User = require('../models/User');
const Group = require('../models/Group');
const aiService = require('../services/aiService');

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
      
      // 1. Get the group and its members
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Group not found' });

      // 2. Fetch all members' schedules from Firestore
      const memberSchedules = {};
      for (const memberId of group.members) {
        const user = await User.findById(memberId);
        if (user && user.profile.schedule) {
          memberSchedules[memberId] = user.profile.schedule;
        }
      }

      // 3. Send the schedules to Amy's AI service
      const optimalTimes = await aiService.findOptimalTime({
        users: group.members,
        schedules: memberSchedules
      });

      res.json({ success: true, optimalTimes });

    } catch (error) {
      console.error('Error finding optimal time:', error);
      res.status(500).json({ message: error.message });
    }
  }

  // Generate study materials using the Gemini API
  async generateStudyMaterials(req, res) {
    try {
      const { lectureNotes, format } = req.body;

      // Send lecture notes to Amy's AI service
      const generatedMaterials = await aiService.generateStudyMaterials({
        lectureNotes,
        format
      });

      res.json({ success: true, materials: generatedMaterials });

    } catch (error) {
      console.error('Error generating study materials:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new SchedulingController();
// END FILE: schedulingController.js