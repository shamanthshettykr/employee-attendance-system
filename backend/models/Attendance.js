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

// Determine status based on check-in time
attendanceSchema.methods.determineStatus = function() {
  if (!this.checkInTime) {
    return 'absent';
  }
  
  const officeStartTime = process.env.OFFICE_START_TIME || '09:00';
  const lateThreshold = parseInt(process.env.LATE_THRESHOLD_MINUTES) || 15;
  
  const [hours, minutes] = officeStartTime.split(':').map(Number);
  const officeStart = new Date(this.checkInTime);
  officeStart.setHours(hours, minutes, 0, 0);
  
  const lateTime = new Date(officeStart.getTime() + lateThreshold * 60 * 1000);
  
  if (this.checkInTime > lateTime) {
    return 'late';
  }
  
  return 'present';
};

// Static method to get today's date (start of day)
attendanceSchema.statics.getToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

module.exports = mongoose.model('Attendance', attendanceSchema);

