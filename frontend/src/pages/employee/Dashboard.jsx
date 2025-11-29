import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeStats } from '../../store/slices/dashboardSlice';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiLogIn, FiLogOut, FiTrendingUp, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employeeStats, isLoading } = useSelector((state) => state.dashboard);
  const { isLoading: attendanceLoading } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { dispatch(getEmployeeStats()); dispatch(getTodayStatus()); }, [dispatch]);
  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const handleCheckIn = async () => { try { await dispatch(checkIn()).unwrap(); toast.success('Checked in successfully!'); dispatch(getEmployeeStats()); } catch (error) { toast.error(error); } };
  const handleCheckOut = async () => { try { await dispatch(checkOut()).unwrap(); toast.success('Checked out successfully!'); dispatch(getEmployeeStats()); } catch (error) { toast.error(error); } };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  const stats = employeeStats;
  const statusConfig = {
    'checked-in': { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', label: 'Currently Working', icon: 'bg-success-500' },
    'checked-out': { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500', label: 'Day Complete', icon: 'bg-primary-500' },
    'not-checked-in': { bg: 'bg-dark-100', text: 'text-dark-600', dot: 'bg-dark-400', label: 'Not Checked In', icon: 'bg-dark-400' }
  };
  const currentStatus = statusConfig[stats?.today?.status] || statusConfig['not-checked-in'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-dark-500 mt-1">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-dark-200">
          <FiClock className="text-primary-600 text-xl" />
          <span className="text-2xl font-bold text-dark-900 tabular-nums">{format(currentTime, 'hh:mm:ss')}</span>
          <span className="text-dark-400 text-sm">{format(currentTime, 'a')}</span>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl ${currentStatus.icon} flex items-center justify-center shadow-lg`}>
              <FiClock className="text-white text-2xl" />
            </div>
            <div>
              <p className="text-sm text-dark-500 mb-1">Today's Status</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bg} ${currentStatus.text}`}>
                <span className={`w-2 h-2 rounded-full ${currentStatus.dot} ${stats?.today?.status === 'checked-in' ? 'animate-pulse' : ''}`}></span>
                <span className="font-semibold text-sm">{currentStatus.label}</span>
              </div>
              <div className="flex items-center gap-5 mt-3">
                {stats?.today?.checkInTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-success-100 flex items-center justify-center"><FiLogIn className="text-success-600 text-sm" /></div>
                    <span className="text-dark-600">{format(new Date(stats.today.checkInTime), 'hh:mm a')}</span>
                  </div>
                )}
                {stats?.today?.checkOutTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-7 h-7 rounded-lg bg-danger-100 flex items-center justify-center"><FiLogOut className="text-danger-600 text-sm" /></div>
                    <span className="text-dark-600">{format(new Date(stats.today.checkOutTime), 'hh:mm a')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {stats?.today?.status === 'not-checked-in' && (
              <button onClick={handleCheckIn} disabled={attendanceLoading} className="btn-success btn-lg group">
                {attendanceLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiLogIn /><span>Check In</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            )}
            {stats?.today?.status === 'checked-in' && (
              <button onClick={handleCheckOut} disabled={attendanceLoading} className="btn-danger btn-lg group">
                {attendanceLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiLogOut /><span>Check Out</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present Days', value: stats?.monthly?.present || 0, icon: FiCheckCircle, color: 'success' },
          { label: 'Absent Days', value: stats?.monthly?.absent || 0, icon: FiXCircle, color: 'danger' },
          { label: 'Late Arrivals', value: stats?.monthly?.late || 0, icon: FiAlertCircle, color: 'warning' },
          { label: 'Total Hours', value: stats?.monthly?.totalHours?.toFixed(1) || 0, icon: FiTrendingUp, color: 'primary' },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`icon-container icon-container-${stat.color}`}><stat.icon size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-dark-900 mb-1">{stat.value}</p>
            <p className="text-sm text-dark-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Attendance */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-dark-100">
          <h2 className="text-lg font-semibold text-dark-900">Recent Attendance</h2>
          <span className="badge badge-primary">Last 7 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Hours</th></tr></thead>
            <tbody>
              {stats?.recentAttendance?.map((record, i) => (
                <tr key={record._id} style={{ animationDelay: `${i * 0.03}s` }}>
                  <td className="font-medium text-dark-900">{format(new Date(record.date), 'EEE, MMM d')}</td>
                  <td>{record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '—'}</td>
                  <td>{record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '—'}</td>
                  <td><span className={`badge badge-${record.status === 'present' ? 'present' : record.status === 'late' ? 'late' : 'absent'}`}>{record.status}</span></td>
                  <td className="font-medium">{record.totalHours?.toFixed(1) || 0}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

