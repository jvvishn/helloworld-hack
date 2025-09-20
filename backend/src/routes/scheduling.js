// BEGIN FILE: scheduling.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const schedulingController = require('../controllers/schedulingController');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation
const validateScheduleUpdate = [
  body('schedule').isObject().withMessage('Schedule must be an object'),
];

const validateFindOptimalTime = [
  body('groupId').notEmpty().withMessage('Group ID is required'),
];

const validateGenerateMaterials = [
  body('lectureNotes').notEmpty().withMessage('Lecture notes text is required'),
  body('format').isIn(['quiz', 'flashcards', 'summary']).withMessage('Invalid format'),
];

// Check validation
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Routes
router.get('/user', authenticateToken, schedulingController.getUserSchedule);
router.put('/user', authenticateToken, validateScheduleUpdate, checkValidation, schedulingController.updateUserSchedule);
router.post('/find-optimal-time', authenticateToken, validateFindOptimalTime, checkValidation, schedulingController.findOptimalTime);
router.post('/generate-materials', authenticateToken, validateGenerateMaterials, checkValidation, schedulingController.generateStudyMaterials);

module.exports = router;
// END FILE: scheduling.js