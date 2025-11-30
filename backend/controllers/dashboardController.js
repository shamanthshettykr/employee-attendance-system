const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get start of day
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get employee dashboard stats
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeStats = async (req, res) => {
  try {
    const today = getStartOfDay();
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    // This month's attendance
    const monthlyAttendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Last 7 days attendance
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAttendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: sevenDaysAgo, $lte: today }
    }).sort({ date: -1 });

    const stats = {
      today: {
        status: todayAttendance ? 
          (todayAttendance.checkOutTime ? 'checked-out' : 'checked-in') : 
          'not-checked-in',
        checkInTime: todayAttendance?.checkInTime || null,
        checkOutTime: todayAttendance?.checkOutTime || null,
        totalHours: todayAttendance?.totalHours || 0
      },
      monthly: {
        present: monthlyAttendance.filter(a => a.status === 'present').length,
        absent: monthlyAttendance.filter(a => a.status === 'absent').length,
        late: monthlyAttendance.filter(a => a.status === 'late').length,
        halfDay: monthlyAttendance.filter(a => a.status === 'half-day').length,
        totalHours: monthlyAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
      },
      recentAttendance
    };

    res.status(200).json({
      success: true,
      data: stats
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

// @desc    Get manager dashboard stats
// @route   GET /api/dashboard/manager
// @access  Private (Manager)
exports.getManagerStats = async (req, res) => {
  try {
    const today = getStartOfDay();
    const currentDate = new Date();

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const employees = await User.find({ role: 'employee' });
    const employeeIds = employees.map(e => e._id);

    // Today's attendance
    const todayAttendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: today
    }).populate('userId', 'name email employeeId department');

    const presentToday = todayAttendance.length;
    const absentToday = totalEmployees - presentToday;
    const lateToday = todayAttendance.filter(a => a.status === 'late').length;
    const halfDayToday = todayAttendance.filter(a => a.status === 'half-day').length;

    // Get absent employees today
    const presentIds = todayAttendance.map(a => a.userId._id.toString());
    const absentEmployees = employees.filter(e => !presentIds.includes(e._id.toString()));

    // Weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    
    const weeklyAttendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: { $gte: sevenDaysAgo, $lte: today }
    });

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = getStartOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayAttendance = weeklyAttendance.filter(a => {
        const aDate = new Date(a.date);
        return aDate >= dayStart && aDate <= dayEnd;
      });

      weeklyTrend.push({
        date: dayStart.toISOString().split('T')[0],
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        present: dayAttendance.filter(a => a.status === 'present').length,
        absent: totalEmployees - dayAttendance.length,
        late: dayAttendance.filter(a => a.status === 'late').length,
        halfDay: dayAttendance.filter(a => a.status === 'half-day').length
      });
    }

    // Department-wise attendance today
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const departmentStats = [];
    
    for (const dept of departments) {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptPresent = todayAttendance.filter(a => a.userId.department === dept).length;
      departmentStats.push({
        department: dept,
        total: deptEmployees.length,
        present: deptPresent,
        absent: deptEmployees.length - deptPresent
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        todayStats: {
          present: presentToday,
          absent: absentToday,
          late: lateToday,
          halfDay: halfDayToday
        },
        absentEmployees: absentEmployees.map(e => ({
          id: e._id,
          name: e.name,
          employeeId: e.employeeId,
          department: e.department
        })),
        lateArrivals: todayAttendance.filter(a => a.status === 'late'),
        halfDayEmployees: todayAttendance.filter(a => a.status === 'half-day'),
        weeklyTrend,
        departmentStats
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
