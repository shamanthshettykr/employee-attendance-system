const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Attendance = require('../models/Attendance');

const users = [
  {
    name: 'Admin Manager',
    email: 'manager@company.com',
    password: 'password123',
    role: 'manager',
    employeeId: 'MGR001',
    department: 'HR'
  },
  {
    name: 'John Smith',
    email: 'john@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP001',
    department: 'Engineering'
  },
  {
    name: 'Jane Doe',
    email: 'jane@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP002',
    department: 'Marketing'
  },
  {
    name: 'Bob Wilson',
    email: 'bob@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP003',
    department: 'Sales'
  },
  {
    name: 'Alice Johnson',
    email: 'alice@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP004',
    department: 'Engineering'
  },
  {
    name: 'Charlie Brown',
    email: 'charlie@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP005',
    department: 'Finance'
  }
];

const generateAttendance = (userId, daysBack = 30, employeeIndex = 0) => {
  const attendance = [];
  const today = new Date();

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Skip weekends EXCEPT for today (to demo purposes)
    const isToday = i === 0;
    if (!isToday && (date.getDay() === 0 || date.getDay() === 6)) continue;

    // For today: ensure we have a mix of present, late, and absent
    // Employee 0,1 = present, Employee 2,3 = late, Employee 4 = absent
    if (isToday) {
      if (employeeIndex === 4) continue; // Skip - absent for today

      const isLate = employeeIndex >= 2; // Employees 2,3 are late

      let checkInHour, checkInMin;
      if (isLate) {
        // Late check-in between 9:15 AM and 10:00 AM
        checkInHour = 9;
        checkInMin = 15 + Math.floor(Math.random() * 45);
      } else {
        // On-time check-in between 8:30 AM and 9:00 AM
        checkInHour = 8;
        checkInMin = 30 + Math.floor(Math.random() * 30);
      }

      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMin, 0, 0);

      attendance.push({
        userId,
        date,
        checkInTime,
        checkOutTime: null, // Not checked out yet today
        status: isLate ? 'late' : 'present',
        totalHours: 0
      });
      continue;
    }

    // Random attendance with 85% present rate for past days
    const isPresent = Math.random() > 0.15;

    if (isPresent) {
      // 80% chance of on-time check-in (before 9:00 AM), 20% late
      const isOnTime = Math.random() > 0.2;

      let checkInHour, checkInMin;
      if (isOnTime) {
        // Check-in between 8:00 AM and 9:00 AM (on or before 9:00)
        checkInHour = 8;
        checkInMin = Math.floor(Math.random() * 60); // 8:00 - 8:59
      } else {
        // Late check-in between 9:01 AM and 10:00 AM
        checkInHour = 9;
        checkInMin = 1 + Math.floor(Math.random() * 59); // 9:01 - 9:59
      }

      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMin, 0, 0);

      // Check-out between 6:00 PM and 8:00 PM (on or after 6:00 PM)
      const checkOutHour = 18 + Math.floor(Math.random() * 2); // 18:00 - 19:59
      const checkOutMin = Math.floor(Math.random() * 60);
      const checkOutTime = new Date(date);
      checkOutTime.setHours(checkOutHour, checkOutMin, 0, 0);

      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      // Late if check-in is after 9:00 AM
      const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMin > 0);

      attendance.push({
        userId,
        date,
        checkInTime,
        checkOutTime,
        status: isLate ? 'late' : 'present',
        totalHours: Math.round(totalHours * 100) / 100
      });
    }
  }

  return attendance;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords and create users
    const salt = await bcrypt.genSalt(10);
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, salt)
      }))
    );

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`Created ${createdUsers.length} users`);

    // Generate attendance for each employee
    const allAttendance = [];
    let employeeIndex = 0;
    for (const user of createdUsers) {
      if (user.role === 'employee') {
        const userAttendance = generateAttendance(user._id, 30, employeeIndex);
        allAttendance.push(...userAttendance);
        employeeIndex++;
      }
    }

    await Attendance.insertMany(allAttendance);
    console.log(`Created ${allAttendance.length} attendance records`);

    console.log('\n=== Seed Data Summary ===');
    console.log('Manager: manager@company.com / password123');
    console.log('Employee: john@company.com / password123');
    console.log('Employee: jane@company.com / password123');
    console.log('Employee: bob@company.com / password123');
    console.log('Employee: alice@company.com / password123');
    console.log('Employee: charlie@company.com / password123');
    console.log('========================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

