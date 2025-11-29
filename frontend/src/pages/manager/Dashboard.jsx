import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerStats } from '../../store/slices/dashboardSlice';
import { FiUsers, FiUserCheck, FiUserX, FiAlertCircle, FiClock } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { managerStats, isLoading } = useSelector((state) => state.dashboard);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update date/time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch stats initially and refresh every 30 seconds
  useEffect(() => {
    dispatch(getManagerStats());
    const refreshInterval = setInterval(() => {
      dispatch(getManagerStats());
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  if (isLoading || !managerStats) {
    return <div className="flex items-center justify-center h-64"><span className="text-gray-500">Loading...</span></div>;
  }

  const stats = managerStats;

  const pieData = [
    { name: 'Present', value: stats.todayStats.present },
    { name: 'Absent', value: stats.todayStats.absent },
    { name: 'Late', value: stats.todayStats.late },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manager Dashboard</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <FiClock className="text-lg" />
            <span className="font-medium">{format(currentDateTime, 'EEEE, MMMM d, yyyy')}</span>
            <span className="text-blue-600 font-semibold">{format(currentDateTime, 'hh:mm:ss a')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Live updates</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><FiUsers className="text-blue-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
              <p className="text-gray-500 text-sm">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><FiUserCheck className="text-green-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.todayStats.present}</p>
              <p className="text-gray-500 text-sm">Present Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg"><FiUserX className="text-red-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.todayStats.absent}</p>
              <p className="text-gray-500 text-sm">Absent Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg"><FiAlertCircle className="text-yellow-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.todayStats.late}</p>
              <p className="text-gray-500 text-sm">Late Arrivals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Weekly Attendance Trend</h2>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Auto-refresh</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyTrend?.map(item => ({
              ...item,
              dayWithDate: `${item.day} ${new Date(item.date).getDate()}`
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dayWithDate"
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    const date = new Date(payload[0].payload.date);
                    return format(date, 'EEEE, MMMM d, yyyy');
                  }
                  return label;
                }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" name="Late" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Attendance</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.departmentStats?.filter(d => d.total > 0).map((dept) => (
            <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{dept.department}</span>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-600">{dept.present}P</span>
                <span className="text-red-600">{dept.absent}A</span>
                <span className="text-gray-500">/{dept.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Absent & Late Employees */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Absent Employees */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            Absent Today ({stats.absentEmployees?.length || 0})
          </h2>
          {stats.absentEmployees?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.absentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-semibold">{emp.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{emp.name}</p>
                    <p className="text-sm text-gray-500">{emp.employeeId} • {emp.department}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">All employees are present today!</p>
          )}
        </div>

        {/* Late Arrivals */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            Late Arrivals ({stats.lateArrivals?.length || 0})
          </h2>
          {stats.lateArrivals?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.lateArrivals.map((record) => (
                <div key={record._id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 font-semibold">{record.userId?.name?.charAt(0) || '?'}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{record.userId?.name}</p>
                    <p className="text-sm text-gray-500">{record.userId?.employeeId} • {record.userId?.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">
                      {new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400">Check-in</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No late arrivals today!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

