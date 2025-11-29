const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getEmployeeStats,
  getManagerStats
} = require('../controllers/dashboardController');

// Employee dashboard
router.get('/employee', protect, getEmployeeStats);

// Manager dashboard
router.get('/manager', protect, authorize('manager'), getManagerStats);

module.exports = router;

