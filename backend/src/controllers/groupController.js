const Group = require('../models/Group');

class GroupController {
  async getAllGroups(req, res) {
    try {
      const snapshot = await Group.findAll();
      res.json({ success: true, groups: snapshot });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getGroupById(req, res) {
    try {
      const group = await Group.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found' });
      res.json({ success: true, group });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createGroup(req, res) {
    try {
      const group = new Group({
        name: req.body.name,
        subject: req.body.subject,
        maxMembers: req.body.maxMembers || 4,
        createdBy: req.user.uid,
        members: [req.user.uid],
      });
      await group.save();
      res.status(201).json({ success: true, group });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async joinGroup(req, res) {
    try {
      const group = await Group.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found' });
      await group.addMember(req.user.uid);
      res.json({ success: true, group });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async leaveGroup(req, res) {
    try {
      const group = await Group.findById(req.params.id);
      if (!group) return res.status(404).json({ message: 'Group not found' });
      await group.removeMember(req.user.uid);
      res.json({ success: true, message: 'Left group', group });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new GroupController();
