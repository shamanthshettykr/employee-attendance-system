import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerStats } from '../../store/slices/dashboardSlice';
import { FiUsers, FiUserCheck, FiUserX, FiAlertCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const dispatch = useDispatch();
  const { managerStats, isLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getManagerStats());
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
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
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

      {/* Department Stats & Absent Employees */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Department Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Department-wise Attendance</h2>
          <div className="space-y-3">
            {stats.departmentStats?.filter(d => d.total > 0).map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{dept.department}</span>
                <div className="flex items-center gap-4">
                  <span className="text-green-600">{dept.present} present</span>
                  <span className="text-red-600">{dept.absent} absent</span>
                  <span className="text-gray-500">/ {dept.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Absent Employees */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Absent Today</h2>
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
      </div>
    </div>
  );
};

export default Dashboard;

