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
  },
  // New demo employees with varied statuses
  {
    name: 'Sarah Davis',
    email: 'sarah@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP006',
    department: 'Engineering'
  },
  {
    name: 'Mike Thompson',
    email: 'mike@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP007',
    department: 'Marketing'
  },
  {
    name: 'Emily Chen',
    email: 'emily@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP008',
    department: 'Sales'
  },
  {
    name: 'David Kumar',
    email: 'david@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP009',
    department: 'Finance'
  },
  {
    name: 'Lisa Wang',
    email: 'lisa@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP010',
    department: 'HR'
  },
  {
    name: 'Ryan Patel',
    email: 'ryan@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP011',
    department: 'Operations'
  },
  {
    name: 'Jessica Lee',
    email: 'jessica@company.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP012',
    department: 'Engineering'
  }
];

const generateAttendance = (userId, daysBack = 30, employeeIndex = 0) => {
  const attendance = [];
  const today = new Date();

  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    // Skip weekends EXCEPT for today (for demo purposes)
    const isToday = i === 0;
    if (!isToday && (date.getDay() === 0 || date.getDay() === 6)) continue;

    // For today: ensure we have a mix of present, late, absent, and half-day
    // Employee 0,1 = present, Employee 2,3 = late, Employee 4,9 = absent, Employee 5,6 = half-day (already checked out)
    if (isToday) {
      // Employees 4 and 9 are absent today
      if (employeeIndex === 4 || employeeIndex === 9) continue;

      // Employees 5 and 6 are half-day (already checked out with 4-5 hours)
      if (employeeIndex === 5 || employeeIndex === 6) {
        const checkInTime = new Date(date);
        checkInTime.setHours(8, 30 + Math.floor(Math.random() * 30), 0, 0);

        // Check-out after 4-5 hours (half-day)
        const checkOutTime = new Date(checkInTime);
        const halfDayHours = 4 + Math.random() * 0.9; // 4.0 to 4.9 hours
        checkOutTime.setTime(checkInTime.getTime() + halfDayHours * 60 * 60 * 1000);

        attendance.push({
          userId,
          date,
          checkInTime,
          checkOutTime,
          status: 'half-day',
          totalHours: Math.round(halfDayHours * 100) / 100
        });
        continue;
      }

      // Employees 2,3,7 are late
      const isLate = employeeIndex === 2 || employeeIndex === 3 || employeeIndex === 7;

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

    // Random attendance with varied statuses for past days
    const rand = Math.random();

    // 10% absent, 10% half-day, 15% late, 65% present
    if (rand < 0.10) {
      // Absent - don't add record
      continue;
    }

    let checkInHour, checkInMin, status;

    if (rand < 0.20) {
      // Half-day (10%)
      checkInHour = 8;
      checkInMin = 30 + Math.floor(Math.random() * 30);

      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMin, 0, 0);

      // Check-out after 4-5 hours (half-day)
      const checkOutTime = new Date(checkInTime);
      const halfDayHours = 4 + Math.random() * 0.9; // 4.0 to 4.9 hours
      checkOutTime.setTime(checkInTime.getTime() + halfDayHours * 60 * 60 * 1000);

      attendance.push({
        userId,
        date,
        checkInTime,
        checkOutTime,
        status: 'half-day',
        totalHours: Math.round(halfDayHours * 100) / 100
      });
      continue;
    } else if (rand < 0.35) {
      // Late (15%)
      checkInHour = 9;
      checkInMin = 1 + Math.floor(Math.random() * 59);
      status = 'late';
    } else {
      // Present (65%)
      checkInHour = 8;
      checkInMin = Math.floor(Math.random() * 60);
      status = 'present';
    }

    const checkInTime = new Date(date);
    checkInTime.setHours(checkInHour, checkInMin, 0, 0);

    // Check-out between 6:00 PM and 8:00 PM
    const checkOutHour = 18 + Math.floor(Math.random() * 2);
    const checkOutMin = Math.floor(Math.random() * 60);
    const checkOutTime = new Date(date);
    checkOutTime.setHours(checkOutHour, checkOutMin, 0, 0);

    const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);

    attendance.push({
      userId,
      date,
      checkInTime,
      checkOutTime,
      status,
      totalHours: Math.round(totalHours * 100) / 100
    });
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
    console.log('\n--- Employees (Today\'s Status) ---');
    console.log('john@company.com   - Present (EMP001)');
    console.log('jane@company.com   - Present (EMP002)');
    console.log('bob@company.com    - Late (EMP003)');
    console.log('alice@company.com  - Late (EMP004)');
    console.log('charlie@company.com - Absent (EMP005)');
    console.log('sarah@company.com  - Half-Day (EMP006)');
    console.log('mike@company.com   - Half-Day (EMP007)');
    console.log('emily@company.com  - Late (EMP008)');
    console.log('david@company.com  - Present (EMP009)');
    console.log('lisa@company.com   - Absent (EMP010)');
    console.log('ryan@company.com   - Present (EMP011)');
    console.log('jessica@company.com - Present (EMP012)');
    console.log('\nAll passwords: password123');
    console.log('==============================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

