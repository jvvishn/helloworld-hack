const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const groupController = require('../controllers/groupController');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

// Validation
const validateGroupCreation = [
  body('name').isLength({ min: 2 }).withMessage('Group name must be at least 2 characters'),
  body('subject').isLength({ min: 2 }).withMessage('Subject must be at least 2 characters'),
  body('maxMembers').optional().isInt({ min: 2 }).withMessage('Max members must be >=2'),
];

const validateGroupId = [
  param('id').notEmpty().withMessage('Group ID is required'),
];

// Check validation
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Routes
// This route is now public and does not require an access token.
router.get('/', groupController.getAllGroups);
router.get('/:id', validateGroupId, checkValidation, groupController.getGroupById);
router.post('/', authenticateToken, validateGroupCreation, checkValidation, groupController.createGroup);
router.put('/:id/join', authenticateToken, validateGroupId, checkValidation, groupController.joinGroup);
router.put('/:id/leave', authenticateToken, validateGroupId, checkValidation, groupController.leaveGroup);

module.exports = router;
