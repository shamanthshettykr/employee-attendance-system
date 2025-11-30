const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role, department } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate employee ID
    const employeeId = await User.generateEmployeeId();

    // Create user - all users are auto-approved
    user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      employeeId,
      department
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // All approved users can login directly

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get pending approvals
// @route   GET /api/auth/pending-approvals
// @access  Private (Manager only)
exports.getPendingApprovals = async (req, res) => {
  try {
    // Get users that need approval OR need password setup
    const pendingUsers = await User.find({
      role: 'employee',
      $or: [
        { isNewRegistration: true, isApproved: false },
        { passwordSetupRequired: true }
      ]
    })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create employee account (Manager creates employee)
// @route   POST /api/auth/create-employee
// @access  Private (Manager only)
exports.createEmployee = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate employee ID
    const employeeId = await User.generateEmployeeId();

    // Create user without password - employee will set it during registration
    const user = await User.create({
      name,
      email,
      role: 'employee',
      employeeId,
      department,
      isApproved: false, // Will be approved when employee sets password
      isNewRegistration: false,
      passwordSetupRequired: true // Employee must register to set password
    });

    res.status(201).json({
      success: true,
      message: `Employee account created for ${user.name}. They must register to set their password.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
        passwordSetupRequired: true
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve user
// @route   PUT /api/auth/approve/:userId
// @access  Private (Manager only)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved && !user.passwordSetupRequired) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    // Generate a default password if user needs password setup
    let generatedPassword = null;
    if (user.passwordSetupRequired || !user.password) {
      // Generate a password based on employee ID (e.g., EMP001 -> password: EMP001@2025)
      generatedPassword = `${user.employeeId}@2025`;
      user.password = generatedPassword;
      user.passwordSetupRequired = false;
    }

    user.isApproved = true;
    user.isNewRegistration = false; // Mark as no longer a new registration
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save();

    // Return the generated password so manager can share it with employee
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      employeeId: user.employeeId,
      department: user.department,
      isApproved: user.isApproved
    };

    res.status(200).json({
      success: true,
      message: `${user.name} has been approved successfully${generatedPassword ? '. Password has been auto-generated.' : ''}`,
      data: responseData,
      generatedPassword: generatedPassword // Include password for manager to share
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject user (delete)
// @route   DELETE /api/auth/reject/:userId
// @access  Private (Manager only)
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved user'
      });
    }

    await User.findByIdAndDelete(req.params.userId);

    res.status(200).json({
      success: true,
      message: `${user.name}'s registration has been rejected`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department
    }
  });
};

