const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours when checking out
attendanceSchema.methods.calculateTotalHours = function() {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    this.totalHours = Math.round(diffHours * 100) / 100;
  }
  return this.totalHours;
};

// Determine if it's a half-day based on total hours (>4 and <5 hours)
attendanceSchema.methods.checkHalfDay = function() {
  if (this.totalHours > 4 && this.totalHours < 5) {
    this.status = 'half-day';
  }
  return this.status;
};

// Determine status based on check-in time
// Check-in must be on or before 9:00 AM to be "present", otherwise "late"
attendanceSchema.methods.determineStatus = function() {
  if (!this.checkInTime) {
    return 'absent';
  }

  const officeStartTime = process.env.OFFICE_START_TIME || '09:00';

  const [hours, minutes] = officeStartTime.split(':').map(Number);
  const officeStart = new Date(this.checkInTime);
  officeStart.setHours(hours, minutes, 0, 0);

  // If check-in is after 9:00 AM, mark as late
  if (this.checkInTime > officeStart) {
    return 'late';
  }

  return 'present';
};

// Check if check-out time is valid (any time after check-in)
attendanceSchema.methods.isValidCheckOutTime = function(checkOutTime) {
  // Employee can checkout anytime after checking in
  // Ensure checkInTime exists and checkOutTime is after it
  if (!this.checkInTime) {
    return false;
  }
  return new Date(checkOutTime) >= new Date(this.checkInTime);
};

// Static method to get today's date (start of day)
attendanceSchema.statics.getToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

module.exports = mongoose.model('Attendance', attendanceSchema);

