const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to get start of day
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Check in
// @route   POST /api/attendance/checkin
// @access  Private (Employee)
exports.checkIn = async (req, res) => {
  try {
    const today = getStartOfDay();
    
    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const checkInTime = new Date();
    
    if (!attendance) {
      attendance = new Attendance({
        userId: req.user.id,
        date: today,
        checkInTime
      });
    } else {
      attendance.checkInTime = checkInTime;
    }

    // Determine status based on check-in time
    attendance.status = attendance.determineStatus();
    
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
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

// @desc    Check out
// @route   POST /api/attendance/checkout
// @access  Private (Employee)
exports.checkOut = async (req, res) => {
  try {
    const today = getStartOfDay();
    
    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({
        success: false,
        message: 'You need to check in first'
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    const checkOutTime = new Date();

    // Validate check-out time (must be after check-in)
    const isValid = attendance.isValidCheckOutTime(checkOutTime);
    if (!isValid) {
      console.error('Checkout validation failed:', {
        checkInTime: attendance.checkInTime,
        checkOutTime: checkOutTime,
        isValid: isValid
      });
      return res.status(400).json({
        success: false,
        message: 'Check-out time must be after check-in time'
      });
    }

    attendance.checkOutTime = checkOutTime;
    attendance.calculateTotalHours();
    attendance.checkHalfDay(); // Check if it's a half-day (>4 and <5 hours)

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
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

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
// @access  Private (Employee)
exports.getMyHistory = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let dateFilter = { userId: req.user.id };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(dateFilter)
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
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

// @desc    Get my monthly summary
// @route   GET /api/attendance/my-summary
// @access  Private (Employee)
exports.getMySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
      totalDays: attendance.length
    };

    res.status(200).json({
      success: true,
      data: summary
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

// @desc    Get today's attendance status
// @route   GET /api/attendance/today
// @access  Private (Employee)
exports.getTodayStatus = async (req, res) => {
  try {
    const today = getStartOfDay();

    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });

    res.status(200).json({
      success: true,
      data: attendance || { status: 'not-checked-in' }
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

// ========== MANAGER ROUTES ==========

// @desc    Get all employees attendance
// @route   GET /api/attendance/all
// @access  Private (Manager)
exports.getAllAttendance = async (req, res) => {
  try {
    const { startDate, endDate, status, employeeId, department } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59))
      };
    }

    if (status) {
      filter.status = status;
    }

    let userFilter = { role: 'employee' };
    if (department) {
      userFilter.department = department;
    }

    const employees = await User.find(userFilter).select('_id');
    const employeeIds = employees.map(e => e._id);

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        filter.userId = user._id;
      }
    } else {
      filter.userId = { $in: employeeIds };
    }

    const attendance = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
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

// @desc    Get specific employee attendance
// @route   GET /api/attendance/employee/:id
// @access  Private (Manager)
exports.getEmployeeAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;

    let dateFilter = { userId: req.params.id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(dateFilter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
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

// @desc    Get team attendance summary
// @route   GET /api/attendance/summary
// @access  Private (Manager)
exports.getTeamSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const employees = await User.find({ role: 'employee' });
    const employeeIds = employees.map(e => e._id);

    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalEmployees: employees.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      halfDay: attendance.filter(a => a.status === 'half-day').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: summary
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

// @desc    Export attendance to CSV
// @route   GET /api/attendance/export
// @access  Private (Manager)
exports.exportAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    let filter = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: getStartOfDay(new Date(startDate)),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59))
      };
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        filter.userId = user._id;
      }
    }

    const attendance = await Attendance.find(filter)
      .populate('userId', 'name email employeeId department')
      .sort({ date: -1 });

    // Helper function to format date as MM/DD/YYYY (Excel-friendly)
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${month}/${day}/${year}`;
    };

    // Helper function to format time as HH:MM AM/PM
    const formatTime = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // Generate CSV with proper quoting and tab prefix to prevent Excel auto-formatting
    const headers = 'Employee ID,Name,Email,Department,Date,Check In,Check Out,Status,Total Hours\n';
    const rows = attendance.map(a => {
      const user = a.userId;
      return [
        user.employeeId,
        `"${user.name}"`,
        user.email,
        `"${user.department}"`,
        `"${formatDate(a.date)}"`,
        `"${formatTime(a.checkInTime)}"`,
        `"${formatTime(a.checkOutTime)}"`,
        a.status,
        a.totalHours?.toFixed(2) || '0'
      ].join(',');
    }).join('\n');

    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const csv = BOM + headers + rows;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get today's attendance status for all employees
// @route   GET /api/attendance/today-status
// @access  Private (Manager)
exports.getTodayStatusAll = async (req, res) => {
  try {
    const today = getStartOfDay();

    const employees = await User.find({ role: 'employee' });
    const employeeIds = employees.map(e => e._id);

    const attendance = await Attendance.find({
      userId: { $in: employeeIds },
      date: today
    }).populate('userId', 'name email employeeId department');

    const presentIds = attendance.map(a => a.userId._id.toString());
    const absentEmployees = employees.filter(e => !presentIds.includes(e._id.toString()));

    res.status(200).json({
      success: true,
      data: {
        present: attendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day'),
        absent: absentEmployees,
        late: attendance.filter(a => a.status === 'late'),
        halfDay: attendance.filter(a => a.status === 'half-day'),
        totalPresent: attendance.length,
        totalAbsent: absentEmployees.length
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

