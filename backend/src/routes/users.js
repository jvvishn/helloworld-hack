const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation for profile updates
const validateProfileUpdate = [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('profile').optional().isObject().withMessage('Profile must be an object'),
];

// Check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, checkValidation, userController.updateProfile);

module.exports = router;
