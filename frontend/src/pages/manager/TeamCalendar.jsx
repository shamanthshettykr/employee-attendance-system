import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance, getTodayStatusAll } from '../../store/slices/attendanceSlice';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiUsers } from 'react-icons/fi';
import 'react-calendar/dist/Calendar.css';

const TeamCalendar = () => {
  const dispatch = useDispatch();
  const { allAttendance, todayStatusAll } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateAttendance, setDateAttendance] = useState([]);

  useEffect(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    dispatch(getAllAttendance({ startDate, endDate }));
    dispatch(getTodayStatusAll());
  }, [dispatch, currentMonth]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const attendance = allAttendance.filter(
      (a) => format(new Date(a.date), 'yyyy-MM-dd') === dateStr
    );
    setDateAttendance(attendance);
  };

  const getAttendanceCountForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allAttendance.filter(
      (a) => format(new Date(a.date), 'yyyy-MM-dd') === dateStr
    ).length;
  };

  const getTileContent = ({ date }) => {
    const count = getAttendanceCountForDate(date);
    if (count > 0) {
      return (
        <div className="text-xs mt-1 text-primary-600 font-semibold">
          {count} ✓
        </div>
      );
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Team Calendar View</h1>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{todayStatusAll?.totalPresent || 0}</p>
          <p className="text-gray-500 text-sm">Present Today</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{todayStatusAll?.totalAbsent || 0}</p>
          <p className="text-gray-500 text-sm">Absent Today</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{todayStatusAll?.late?.length || 0}</p>
          <p className="text-gray-500 text-sm">Late Today</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiChevronLeft />
            </button>
            <h2 className="text-lg font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiChevronRight />
            </button>
          </div>
          <Calendar
            value={selectedDate}
            onClickDay={handleDateClick}
            tileContent={getTileContent}
            showNavigation={false}
          />
        </div>

        {/* Selected Date Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiUsers className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Attendance for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
          </div>
          
          {dateAttendance.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dateAttendance.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">{record.userId?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{record.userId?.name}</p>
                      <p className="text-sm text-gray-500">{record.userId?.employeeId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'} - {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No attendance records for this date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;

