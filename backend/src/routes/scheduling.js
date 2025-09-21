const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const schedulingController = require('../controllers/schedulingController');
const { body, validationResult } = require('express-validator');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Validation
const validateScheduleUpdate = [
  body('schedule').isObject().withMessage('Schedule must be an object'),
];

const validateFindOptimalTime = [
  body('groupId').notEmpty().withMessage('Group ID is required'),
];

const validateGenerateQuiz = [
  body('materialId').notEmpty().withMessage('Material ID is required'),
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

// New endpoint for file uploads
router.post('/upload-material', authenticateToken, upload.single('file'), schedulingController.uploadMaterial);

// New endpoint for quiz generation
router.post('/generate-quiz', authenticateToken, validateGenerateQuiz, checkValidation, schedulingController.generateQuiz);

module.exports = router;