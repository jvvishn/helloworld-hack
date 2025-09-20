const User = require('../models/User');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.uid);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await User.findById(req.user.uid);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await user.updateProfile(req.body.profile || {});
      if (req.body.name) user.name = req.body.name;
      await user.save();

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
