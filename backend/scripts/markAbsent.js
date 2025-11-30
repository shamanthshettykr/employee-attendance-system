const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Attendance = require('../models/Attendance');

const markRyanPatelAbsent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find Ryan Patel
    const ryan = await User.findOne({ email: 'ryan@company.com' });
    
    if (!ryan) {
      console.log('Ryan Patel not found in database');
      process.exit(1);
    }

    console.log(`Found: ${ryan.name} (${ryan.employeeId})`);

    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if attendance record exists for today
    let attendance = await Attendance.findOne({
      userId: ryan._id,
      date: today
    });

    if (attendance) {
      // Delete existing attendance record to mark as absent
      await Attendance.deleteOne({ _id: attendance._id });
      console.log('Removed today\'s attendance record - Ryan Patel is now marked as absent');
    } else {
      console.log('No attendance record found for today - Ryan Patel is already absent');
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

markRyanPatelAbsent();

