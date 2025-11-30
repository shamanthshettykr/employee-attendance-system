import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance, getTodayStatusAll } from '../../store/slices/attendanceSlice';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiUsers, FiCheckCircle, FiXCircle, FiAlertCircle, FiCalendar } from 'react-icons/fi';
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
    setDateAttendance(allAttendance.filter((a) => format(new Date(a.date), 'yyyy-MM-dd') === dateStr));
  };

  const getAttendanceCountForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allAttendance.filter((a) => format(new Date(a.date), 'yyyy-MM-dd') === dateStr).length;
  };

  const getTileContent = ({ date }) => {
    const count = getAttendanceCountForDate(date);
    if (count > 0) return <div className="text-xs mt-1 text-primary-400 font-semibold">{count} ✓</div>;
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Team Calendar View</h1>

      {/* Today's Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card p-5 text-center">
          <div className="icon-container icon-container-success mx-auto mb-3"><FiCheckCircle size={20} /></div>
          <p className="text-2xl font-bold text-white">{todayStatusAll?.totalPresent || 0}</p>
          <p className="text-white/50 text-sm">Present Today</p>
        </div>
        <div className="stat-card p-5 text-center">
          <div className="icon-container icon-container-danger mx-auto mb-3"><FiXCircle size={20} /></div>
          <p className="text-2xl font-bold text-white">{todayStatusAll?.totalAbsent || 0}</p>
          <p className="text-white/50 text-sm">Absent Today</p>
        </div>
        <div className="stat-card p-5 text-center">
          <div className="icon-container icon-container-warning mx-auto mb-3"><FiAlertCircle size={20} /></div>
          <p className="text-2xl font-bold text-white">{todayStatusAll?.late?.length || 0}</p>
          <p className="text-white/50 text-sm">Late Today</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><FiChevronLeft className="text-white/60" /></button>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2"><FiCalendar className="text-primary-400" />{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><FiChevronRight className="text-white/60" /></button>
          </div>
          <Calendar value={selectedDate} onClickDay={handleDateClick} tileContent={getTileContent} showNavigation={false} />
        </div>

        {/* Selected Date Details */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container icon-container-primary"><FiUsers size={18} /></div>
            <h2 className="font-semibold text-white">Attendance for {format(selectedDate, 'MMMM d, yyyy')}</h2>
          </div>

          {dateAttendance.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dateAttendance.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="avatar avatar-md">{record.userId?.name?.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-white">{record.userId?.name}</p>
                      <p className="text-sm text-white/50">{record.userId?.employeeId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`badge badge-${record.status}`}>{record.status}</span>
                    <p className="text-sm text-white/40 mt-1">
                      {record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'} - {record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-12">
              <div className="empty-state-icon"><FiCalendar size={28} /></div>
              <p className="text-white/50">No attendance records for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamCalendar;

