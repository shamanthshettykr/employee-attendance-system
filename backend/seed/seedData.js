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

const generateAttendance = (userId, daysBack = 30) => {
  const attendance = [];
  const today = new Date();
  
  for (let i = 0; i < daysBack; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // Random attendance with 85% present rate
    const isPresent = Math.random() > 0.15;
    
    if (isPresent) {
      // Random check-in between 8:30 and 9:30
      const checkInHour = 8 + Math.floor(Math.random() * 2);
      const checkInMin = Math.floor(Math.random() * 60);
      const checkInTime = new Date(date);
      checkInTime.setHours(checkInHour, checkInMin, 0, 0);
      
      // Random check-out between 17:00 and 19:00
      const checkOutHour = 17 + Math.floor(Math.random() * 3);
      const checkOutMin = Math.floor(Math.random() * 60);
      const checkOutTime = new Date(date);
      checkOutTime.setHours(checkOutHour, checkOutMin, 0, 0);
      
      const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
      const isLate = checkInHour >= 9 && checkInMin > 15;
      
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
    for (const user of createdUsers) {
      if (user.role === 'employee') {
        const userAttendance = generateAttendance(user._id, 30);
        allAttendance.push(...userAttendance);
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

