const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, getPendingApprovals, approveUser, rejectUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// Public Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected Routes
router.get('/me', protect, getMe);

// Manager Only Routes - Approval System
router.get('/pending-approvals', protect, authorize('manager'), getPendingApprovals);
router.put('/approve/:userId', protect, authorize('manager'), approveUser);
router.delete('/reject/:userId', protect, authorize('manager'), rejectUser);

module.exports = router;

