import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeStats } from '../../store/slices/dashboardSlice';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiLogIn, FiLogOut, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
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
      <div className="w-12 h-12 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin"></div>
    </div>
  );

  const stats = employeeStats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-white/50 mt-1">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="glass-card flex items-center gap-3 px-5 py-3">
          <FiClock className="text-primary-400 text-xl" />
          <span className="text-2xl font-bold text-white tabular-nums">{format(currentTime, 'hh:mm:ss')}</span>
          <span className="text-white/40 text-sm">{format(currentTime, 'a')}</span>
        </div>
      </div>

      {/* Today's Status Card */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stats?.today?.status === 'checked-in' ? 'bg-success-500/20 shadow-glow-green' : stats?.today?.status === 'checked-out' ? 'bg-primary-500/20 shadow-glow-cyan' : 'bg-white/10'}`}>
              <FiClock className={`text-2xl ${stats?.today?.status === 'checked-in' ? 'text-success-400' : stats?.today?.status === 'checked-out' ? 'text-primary-400' : 'text-white/50'}`} />
            </div>
            <div>
              <p className="text-sm text-white/50 mb-1">Today's Status</p>
              <div className={`badge ${stats?.today?.status === 'checked-in' ? 'badge-present' : stats?.today?.status === 'checked-out' ? 'badge-primary' : 'bg-white/10 text-white/60 border border-white/20'}`}>
                <span className={`w-2 h-2 rounded-full ${stats?.today?.status === 'checked-in' ? 'bg-success-400 animate-pulse' : stats?.today?.status === 'checked-out' ? 'bg-primary-400' : 'bg-white/40'}`}></span>
                {stats?.today?.status === 'checked-in' ? 'Currently Working' : stats?.today?.status === 'checked-out' ? 'Day Complete' : 'Not Checked In'}
              </div>
              <div className="flex items-center gap-5 mt-3">
                {stats?.today?.checkInTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="icon-container-sm icon-container-success"><FiLogIn className="text-sm" /></div>
                    <span className="text-white/70">{format(new Date(stats.today.checkInTime), 'hh:mm a')}</span>
                  </div>
                )}
                {stats?.today?.checkOutTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="icon-container-sm icon-container-danger"><FiLogOut className="text-sm" /></div>
                    <span className="text-white/70">{format(new Date(stats.today.checkOutTime), 'hh:mm a')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {stats?.today?.status === 'not-checked-in' && (
              <button onClick={handleCheckIn} disabled={attendanceLoading} className="btn-success btn-lg">
                {attendanceLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiLogIn /><span>Check In</span><FiArrowRight /></>}
              </button>
            )}
            {stats?.today?.status === 'checked-in' && (
              <button onClick={handleCheckOut} disabled={attendanceLoading} className="btn-danger btn-lg">
                {attendanceLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiLogOut /><span>Check Out</span><FiArrowRight /></>}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Present Days', value: stats?.monthly?.present || 0, icon: FiCheckCircle, color: 'success' },
          { label: 'Absent Days', value: stats?.monthly?.absent || 0, icon: FiXCircle, color: 'danger' },
          { label: 'Late Arrivals', value: stats?.monthly?.late || 0, icon: FiAlertCircle, color: 'warning' },
          { label: 'Half Days', value: stats?.monthly?.halfDay || 0, icon: FiClock, color: 'orange' },
          { label: 'Total Hours', value: stats?.monthly?.totalHours?.toFixed(1) || 0, icon: FiTrendingUp, color: 'primary' },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card p-5" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`icon-container icon-container-${stat.color} mb-4`}><stat.icon size={20} /></div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Attendance */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Recent Attendance</h2>
          <span className="badge badge-primary">Last 7 days</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Hours</th></tr></thead>
            <tbody>
              {stats?.recentAttendance?.map((record, i) => (
                <tr key={record._id}>
                  <td className="font-medium text-white">{format(new Date(record.date), 'EEE, MMM d')}</td>
                  <td>{record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '—'}</td>
                  <td>{record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '—'}</td>
                  <td><span className={`badge badge-${record.status}`}>{record.status}</span></td>
                  <td className="font-medium text-white">{record.totalHours?.toFixed(1) || 0}h</td>
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

