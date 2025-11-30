import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getManagerStats } from '../../store/slices/dashboardSlice';
import { getPendingApprovals, approveUser, rejectUser } from '../../store/slices/authSlice';
import { FiUsers, FiUserCheck, FiUserX, FiAlertCircle, FiClock, FiRefreshCw, FiActivity, FiSun, FiMail, FiBriefcase, FiHash } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const COLORS = ['#22c55e', '#ef4444', '#facc15', '#fb923c'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { managerStats, isLoading } = useSelector((state) => state.dashboard);
  const { pendingApprovals } = useSelector((state) => state.auth);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => { const timer = setInterval(() => setCurrentDateTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { dispatch(getManagerStats()); const interval = setInterval(() => dispatch(getManagerStats()), 30000); return () => clearInterval(interval); }, [dispatch]);
  useEffect(() => { dispatch(getPendingApprovals()); }, [dispatch]);

  if (isLoading || !managerStats) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin"></div>
    </div>
  );

  const stats = managerStats;
  const pieData = [
    { name: 'Present', value: stats.todayStats.present },
    { name: 'Absent', value: stats.todayStats.absent },
    { name: 'Late', value: stats.todayStats.late },
    { name: 'Half-Day', value: stats.todayStats.halfDay || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manager Dashboard</h1>
          <p className="text-white/50 mt-1">{format(currentDateTime, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass-card flex items-center gap-3 px-5 py-3">
            <FiClock className="text-primary-400 text-xl" />
            <span className="text-2xl font-bold text-white tabular-nums">{format(currentDateTime, 'hh:mm:ss')}</span>
            <span className="text-white/40 text-sm">{format(currentDateTime, 'a')}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success-500/10 border border-success-500/30">
            <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
            <span className="text-success-400 text-sm font-medium">Live</span>
            <FiRefreshCw className="text-success-400 text-sm" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Employees', value: stats.totalEmployees, icon: FiUsers, color: 'primary' },
          { label: 'Present Today', value: stats.todayStats.present, icon: FiUserCheck, color: 'success' },
          { label: 'Absent Today', value: stats.todayStats.absent, icon: FiUserX, color: 'danger' },
          { label: 'Late Arrivals', value: stats.todayStats.late, icon: FiAlertCircle, color: 'warning' },
          { label: 'Half Days', value: stats.todayStats.halfDay || 0, icon: FiSun, color: 'orange' },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card p-5" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex items-start justify-between mb-4">
              <div className={`icon-container icon-container-${stat.color}`}><stat.icon size={20} /></div>
              <FiActivity className="text-white/20" size={16} />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Weekly Trend</h2>
              <p className="text-sm text-white/40">Last 7 days overview</p>
            </div>
            <span className="badge badge-primary">Auto-refresh</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.weeklyTrend?.map(item => ({ ...item, dayWithDate: `${item.day} ${new Date(item.date).getDate()}` }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="dayWithDate" tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <Tooltip labelFormatter={(l, p) => p?.[0] ? format(new Date(p[0].payload.date), 'EEEE, MMMM d') : l} contentStyle={{ borderRadius: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="present" fill="#22c55e" name="Present" radius={[6, 6, 0, 0]} />
              <Bar dataKey="late" fill="#facc15" name="Late" radius={[6, 6, 0, 0]} />
              <Bar dataKey="halfDay" fill="#fb923c" name="Half-Day" radius={[6, 6, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Overview Pie */}
        <div className="glass-card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Today's Distribution</h2>
            <p className="text-sm text-white/40">Attendance breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}>
                {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Stats */}
      <div className="glass-card p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Department Overview</h2>
          <p className="text-sm text-white/40">Attendance by department</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.departmentStats?.filter(d => d.total > 0).map((dept, i) => (
            <div key={dept.department} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-white">{dept.department}</span>
                <span className="text-sm text-white/40">{dept.total} members</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full transition-all duration-500" style={{ width: `${(dept.present / dept.total) * 100}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-success-400">{dept.present}/{dept.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Absent, Late & Half-Day Employees */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Absent Employees */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container icon-container-danger"><FiUserX size={20} /></div>
            <div>
              <h2 className="font-semibold text-white">Absent Today</h2>
              <p className="text-sm text-white/40">{stats.absentEmployees?.length || 0} employees</p>
            </div>
          </div>
          {stats.absentEmployees?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats.absentEmployees.map((emp, i) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl hover:bg-danger-500/20 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="avatar avatar-md">{emp.name.charAt(0)}</div>
                  <div>
                    <p className="font-medium text-white">{emp.name}</p>
                    <p className="text-sm text-white/50">{emp.employeeId} • {emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><FiUserCheck size={28} /></div>
              <p className="text-white/50">All employees are present today!</p>
            </div>
          )}
        </div>

        {/* Late Arrivals */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container icon-container-warning"><FiAlertCircle size={20} /></div>
            <div>
              <h2 className="font-semibold text-white">Late Arrivals</h2>
              <p className="text-sm text-white/40">{stats.lateArrivals?.length || 0} employees</p>
            </div>
          </div>
          {stats.lateArrivals?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats.lateArrivals.map((record, i) => (
                <div key={record._id} className="flex items-center gap-3 p-3 bg-warning-500/10 border border-warning-500/20 rounded-xl hover:bg-warning-500/20 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="avatar avatar-md">{record.userId?.name?.charAt(0) || '?'}</div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{record.userId?.name}</p>
                    <p className="text-sm text-white/50">{record.userId?.employeeId} • {record.userId?.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-warning-400">{new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-white/40">Check-in</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><FiClock size={28} /></div>
              <p className="text-white/50">No late arrivals today!</p>
            </div>
          )}
        </div>

        {/* Half-Day Employees */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="icon-container icon-container-orange"><FiSun size={20} /></div>
            <div>
              <h2 className="font-semibold text-white">Half-Day Today</h2>
              <p className="text-sm text-white/40">{stats.halfDayEmployees?.length || 0} employees</p>
            </div>
          </div>
          {stats.halfDayEmployees?.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {stats.halfDayEmployees.map((record, i) => (
                <div key={record._id} className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl hover:bg-orange-500/20 transition-colors" style={{ animationDelay: `${i * 0.03}s` }}>
                  <div className="avatar avatar-md">{record.userId?.name?.charAt(0) || '?'}</div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{record.userId?.name}</p>
                    <p className="text-sm text-white/50">{record.userId?.employeeId} • {record.userId?.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-orange-400">{record.totalHours?.toFixed(1)}h</p>
                    <p className="text-xs text-white/40">Hours worked</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><FiSun size={28} /></div>
              <p className="text-white/50">No half-day employees today!</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Pending Approvals</h2>
            <p className="text-sm text-white/40">Review and approve new employee registrations</p>
          </div>
          {pendingApprovals?.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-500/10 border border-warning-500/30">
              <FiClock className="text-warning-400" />
              <span className="text-warning-400 font-medium">{pendingApprovals.length} Pending</span>
            </div>
          )}
        </div>
        {pendingApprovals?.length === 0 ? (
          <div className="empty-state py-8">
            <div className="empty-state-icon"><FiUserCheck size={28} /></div>
            <p className="text-white/50">No pending approvals</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingApprovals.slice(0, 5).map((user) => (
              <div key={user._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary-500/30 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="avatar avatar-md text-lg">{user.name.charAt(0)}</div>
                    <div>
                      <h3 className="font-semibold text-white">{user.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-white/50">
                        <span className="flex items-center gap-1.5">
                          <FiMail size={12} /> {user.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiHash size={12} /> {user.employeeId}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiBriefcase size={12} /> {user.department}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FiClock size={12} /> {format(new Date(user.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to reject this registration?')) {
                          const result = await dispatch(rejectUser(user._id));
                          if (!result.error) {
                            dispatch(getPendingApprovals());
                          }
                        }
                      }}
                      className="btn-outline-danger flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <FiUserX size={16} />
                      Reject
                    </button>
                    <button
                      onClick={async () => {
                        const result = await dispatch(approveUser(user._id));
                        if (result.error) {
                          toast.error(result.payload || 'Failed to approve user');
                        } else {
                          const response = result.payload;
                          if (response.generatedPassword) {
                            toast.success(
                              <div>
                                <div className="font-semibold mb-2">{response.message}</div>
                                <div className="text-sm">
                                  <strong>Login Credentials:</strong><br />
                                  Email: {response.data.email}<br />
                                  Password: <span className="font-mono bg-white/10 px-2 py-1 rounded">{response.generatedPassword}</span>
                                </div>
                              </div>,
                              { autoClose: 10000 }
                            );
                          } else {
                            toast.success(response.message || 'User approved successfully');
                          }
                          dispatch(getPendingApprovals());
                        }
                      }}
                      className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      <FiUserCheck size={16} />
                      {user.passwordSetupRequired ? 'Approve & Generate' : 'Approve'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {pendingApprovals.length > 5 && (
              <div className="text-center pt-2">
                <Link to="/manager/approvals" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                  View all {pendingApprovals.length} pending approvals →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

