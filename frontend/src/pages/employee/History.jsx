import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'react-calendar/dist/Calendar.css';

const History = () => {
  const dispatch = useDispatch();
  const { myHistory, mySummary } = useSelector((state) => state.attendance);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const month = currentMonth.getMonth() + 1;
    const year = currentMonth.getFullYear();
    dispatch(getMyHistory({ month, year }));
    dispatch(getMySummary({ month, year }));
  }, [dispatch, currentMonth]);

  const getAttendanceForDate = (date) => {
    return myHistory.find(
      (a) => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getTileClassName = ({ date }) => {
    const attendance = getAttendanceForDate(date);
    if (!attendance) return '';
    
    switch (attendance.status) {
      case 'present': return 'attendance-present';
      case 'late': return 'attendance-late';
      case 'absent': return 'attendance-absent';
      case 'half-day': return 'attendance-half-day';
      default: return '';
    }
  };

  const handleDateClick = (date) => {
    const attendance = getAttendanceForDate(date);
    setSelectedDate(attendance || null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Attendance History</h1>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{mySummary?.present || 0}</p>
          <p className="text-gray-500 text-sm">Present</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{mySummary?.absent || 0}</p>
          <p className="text-gray-500 text-sm">Absent</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{mySummary?.late || 0}</p>
          <p className="text-gray-500 text-sm">Late</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">{mySummary?.halfDay || 0}</p>
          <p className="text-gray-500 text-sm">Half Day</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{mySummary?.totalHours?.toFixed(1) || 0}</p>
          <p className="text-gray-500 text-sm">Total Hours</p>
        </div>
      </div>

      {/* Color Legend */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-200"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-200"></div>
            <span className="text-sm text-gray-600">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-200"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-200"></div>
            <span className="text-sm text-gray-600">Half Day</span>
          </div>
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
            value={currentMonth}
            onClickDay={handleDateClick}
            tileClassName={getTileClassName}
            showNavigation={false}
          />
        </div>

        {/* Selected Date Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Details</h2>
          {selectedDate ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{format(new Date(selectedDate.date), 'MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Check In</span>
                <span className="font-medium">
                  {selectedDate.checkInTime ? format(new Date(selectedDate.checkInTime), 'hh:mm a') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Check Out</span>
                <span className="font-medium">
                  {selectedDate.checkOutTime ? format(new Date(selectedDate.checkOutTime), 'hh:mm a') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDate.status === 'present' ? 'bg-green-100 text-green-800' :
                  selectedDate.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  selectedDate.status === 'absent' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {selectedDate.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Hours</span>
                <span className="font-medium">{selectedDate.totalHours?.toFixed(1) || 0} hours</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Click on a date to see details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

