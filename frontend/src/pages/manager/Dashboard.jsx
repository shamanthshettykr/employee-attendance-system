import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerStats } from '../../store/slices/dashboardSlice';
import { FiUsers, FiUserCheck, FiUserX, FiAlertCircle, FiClock, FiRefreshCw, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { managerStats, isLoading } = useSelector((state) => state.dashboard);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => { const timer = setInterval(() => setCurrentDateTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { dispatch(getManagerStats()); const interval = setInterval(() => dispatch(getManagerStats()), 30000); return () => clearInterval(interval); }, [dispatch]);

  if (isLoading || !managerStats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  const stats = managerStats;
  const pieData = [
    { name: 'Present', value: stats.todayStats.present },
    { name: 'Absent', value: stats.todayStats.absent },
    { name: 'Late', value: stats.todayStats.late },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Manager Dashboard</h1>
          <p className="text-dark-500 mt-1">{format(currentDateTime, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-2xl border border-dark-200">
            <FiClock className="text-primary-600 text-xl" />
            <span className="text-2xl font-bold text-dark-900 tabular-nums">{format(currentDateTime, 'hh:mm:ss')}</span>
            <span className="text-dark-400 text-sm">{format(currentDateTime, 'a')}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 bg-success-50 rounded-2xl border border-success-200">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
            <span className="text-success-700 text-sm font-medium">Live</span>
            <FiRefreshCw className="text-success-600 text-sm" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, icon: FiUsers, color: 'primary' },
          { label: 'Present Today', value: stats.todayStats.present, icon: FiUserCheck, color: 'success' },
          { label: 'Absent Today', value: stats.todayStats.absent, icon: FiUserX, color: 'danger' },
          { label: 'Late Arrivals', value: stats.todayStats.late, icon: FiAlertCircle, color: 'warning' },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`icon-container icon-container-${stat.color}`}><stat.icon size={20} /></div>
              <FiActivity className="text-dark-300" size={16} />
            </div>
            <p className="text-3xl font-bold text-dark-900 mb-1">{stat.value}</p>
            <p className="text-sm text-dark-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-dark-900">Weekly Trend</h2>
              <p className="text-sm text-dark-400">Last 7 days overview</p>
            </div>
            <span className="badge badge-primary">Auto-refresh</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.weeklyTrend?.map(item => ({ ...item, dayWithDate: `${item.day} ${new Date(item.date).getDate()}` }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="dayWithDate" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={(l, p) => p?.[0] ? format(new Date(p[0].payload.date), 'EEEE, MMMM d') : l} contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[8, 8, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[8, 8, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Overview Pie */}
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-dark-900">Today's Distribution</h2>
            <p className="text-sm text-dark-400">Attendance breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Stats */}
      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-dark-900">Department Overview</h2>
          <p className="text-sm text-dark-400">Attendance by department</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.departmentStats?.filter(d => d.total > 0).map((dept, i) => (
            <div key={dept.department} className="p-4 rounded-2xl bg-dark-50 border border-dark-100 hover:border-primary-200 transition-all" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-dark-900">{dept.department}</span>
                <span className="text-sm text-dark-400">{dept.total} members</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-dark-200 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full transition-all duration-500" style={{ width: `${(dept.present / dept.total) * 100}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-success-600">{dept.present}/{dept.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Absent & Late Employees */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Absent Employees */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container icon-container-danger"><FiUserX size={20} /></div>
            <div>
              <h2 className="font-semibold text-dark-900">Absent Today</h2>
              <p className="text-sm text-dark-400">{stats.absentEmployees?.length || 0} employees</p>
            </div>
          </div>
          {stats.absentEmployees?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats.absentEmployees.map((emp, i) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-danger-50 rounded-xl hover:bg-danger-100 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="avatar avatar-md bg-danger-500 text-white">{emp.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-dark-900">{emp.name}</p>
                    <p className="text-sm text-dark-500">{emp.employeeId} • {emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><FiUserCheck size={28} /></div>
              <p className="text-dark-500">All employees are present today!</p>
            </div>
          )}
        </div>

        {/* Late Arrivals */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container icon-container-warning"><FiAlertCircle size={20} /></div>
            <div>
              <h2 className="font-semibold text-dark-900">Late Arrivals</h2>
              <p className="text-sm text-dark-400">{stats.lateArrivals?.length || 0} employees</p>
            </div>
          </div>
          {stats.lateArrivals?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats.lateArrivals.map((record, i) => (
                <div key={record._id} className="flex items-center gap-3 p-3 bg-warning-50 rounded-xl hover:bg-warning-100 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="avatar avatar-md bg-warning-500 text-white">{record.userId?.name?.charAt(0) || '?'}</div>
                  <div className="flex-1">
                    <p className="font-medium text-dark-900">{record.userId?.name}</p>
                    <p className="text-sm text-dark-500">{record.userId?.employeeId} • {record.userId?.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-warning-600">{new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-dark-400">Check-in</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><FiClock size={28} /></div>
              <p className="text-dark-500">No late arrivals today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

