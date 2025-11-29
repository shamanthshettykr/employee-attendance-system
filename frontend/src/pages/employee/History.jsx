import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyHistory, getMySummary } from '../../store/slices/attendanceSlice';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock, FiCalendar, FiLogIn, FiLogOut } from 'react-icons/fi';
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

  const getAttendanceForDate = (date) => myHistory.find((a) => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  const getTileClassName = ({ date }) => { const a = getAttendanceForDate(date); return a ? `attendance-${a.status}` : ''; };
  const handleDateClick = (date) => setSelectedDate(getAttendanceForDate(date) || null);

  const stats = [
    { label: 'Present', value: mySummary?.present || 0, icon: FiCheckCircle, color: 'success' },
    { label: 'Absent', value: mySummary?.absent || 0, icon: FiXCircle, color: 'danger' },
    { label: 'Late', value: mySummary?.late || 0, icon: FiAlertCircle, color: 'warning' },
    { label: 'Total Hours', value: mySummary?.totalHours?.toFixed(1) || 0, icon: FiClock, color: 'primary' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-dark-900">Attendance History</h1>
        <span className="text-sm text-dark-400">{format(currentMonth, 'MMMM yyyy')}</span>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-center gap-4">
              <div className={`icon-container icon-container-${stat.color}`}><stat.icon size={20} /></div>
              <div><p className="text-2xl font-bold text-dark-900">{stat.value}</p><p className="text-dark-500 text-sm">{stat.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-6 justify-center">
          {[{ label: 'Present', color: 'bg-success-500' }, { label: 'Late', color: 'bg-warning-500' }, { label: 'Absent', color: 'bg-danger-500' }].map((item) => (
            <div key={item.label} className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${item.color}`}></div><span className="text-sm text-dark-600 font-medium">{item.label}</span></div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-dark-100 rounded-xl transition-colors"><FiChevronLeft className="text-dark-600" /></button>
            <h2 className="text-lg font-semibold text-dark-900 flex items-center gap-2"><FiCalendar className="text-primary-600" />{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-dark-100 rounded-xl transition-colors"><FiChevronRight className="text-dark-600" /></button>
          </div>
          <Calendar value={currentMonth} onClickDay={handleDateClick} tileClassName={getTileClassName} showNavigation={false} />
        </div>

        {/* Details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-dark-900 mb-6">Attendance Details</h2>
          {selectedDate ? (
            <div className="space-y-3">
              {[
                { label: 'Date', value: format(new Date(selectedDate.date), 'MMMM d, yyyy'), icon: FiCalendar, color: 'primary' },
                { label: 'Check In', value: selectedDate.checkInTime ? format(new Date(selectedDate.checkInTime), 'hh:mm a') : 'N/A', icon: FiLogIn, color: 'success' },
                { label: 'Check Out', value: selectedDate.checkOutTime ? format(new Date(selectedDate.checkOutTime), 'hh:mm a') : 'N/A', icon: FiLogOut, color: 'danger' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                  <div className="flex items-center gap-3"><div className={`icon-container-sm icon-container-${item.color}`}><item.icon size={16} /></div><span className="text-dark-600">{item.label}</span></div>
                  <span className="font-semibold text-dark-900">{item.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                <span className="text-dark-600">Status</span>
                <span className={`badge badge-${selectedDate.status}`}>{selectedDate.status}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                <div className="flex items-center gap-3"><div className="icon-container-sm icon-container-primary"><FiClock size={16} /></div><span className="text-dark-600">Total Hours</span></div>
                <span className="font-bold text-primary-600 text-lg">{selectedDate.totalHours?.toFixed(1) || 0}h</span>
              </div>
            </div>
          ) : (
            <div className="empty-state py-12">
              <div className="empty-state-icon"><FiCalendar size={28} /></div>
              <p className="text-dark-500">Click on a date to see details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;

