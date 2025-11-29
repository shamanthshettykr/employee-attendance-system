import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeStats } from '../../store/slices/dashboardSlice';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { employeeStats, isLoading } = useSelector((state) => state.dashboard);
  const { todayStatus, isLoading: attendanceLoading } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEmployeeStats());
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    try {
      await dispatch(checkIn()).unwrap();
      toast.success('Checked in successfully!');
      dispatch(getEmployeeStats());
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await dispatch(checkOut()).unwrap();
      toast.success('Checked out successfully!');
      dispatch(getEmployeeStats());
    } catch (error) {
      toast.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'half-day': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><span className="text-gray-500">Loading...</span></div>;
  }

  const stats = employeeStats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
          <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </div>

      {/* Quick Check In/Out */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Attendance</h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full ${
              stats?.today?.status === 'checked-in' ? 'bg-green-100 text-green-800' :
              stats?.today?.status === 'checked-out' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {stats?.today?.status === 'checked-in' ? 'Checked In' :
               stats?.today?.status === 'checked-out' ? 'Checked Out' : 'Not Checked In'}
            </div>
            {stats?.today?.checkInTime && (
              <span className="text-gray-600">
                In: {format(new Date(stats.today.checkInTime), 'hh:mm a')}
              </span>
            )}
            {stats?.today?.checkOutTime && (
              <span className="text-gray-600">
                Out: {format(new Date(stats.today.checkOutTime), 'hh:mm a')}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {stats?.today?.status === 'not-checked-in' && (
              <button
                onClick={handleCheckIn}
                disabled={attendanceLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiClock /> Check In
              </button>
            )}
            {stats?.today?.status === 'checked-in' && (
              <button
                onClick={handleCheckOut}
                disabled={attendanceLoading}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <FiClock /> Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg"><FiCheckCircle className="text-green-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.monthly?.present || 0}</p>
              <p className="text-gray-500 text-sm">Present</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg"><FiXCircle className="text-red-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.monthly?.absent || 0}</p>
              <p className="text-gray-500 text-sm">Absent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg"><FiAlertCircle className="text-yellow-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.monthly?.late || 0}</p>
              <p className="text-gray-500 text-sm">Late</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg"><FiClock className="text-blue-600 text-xl" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats?.monthly?.totalHours?.toFixed(1) || 0}</p>
              <p className="text-gray-500 text-sm">Hours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Attendance (Last 7 Days)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3">Date</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Hours</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentAttendance?.map((record) => (
                <tr key={record._id} className="border-b last:border-0">
                  <td className="py-3">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                  <td className="py-3">{record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}</td>
                  <td className="py-3">{record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}</td>
                  <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>{record.status}</span></td>
                  <td className="py-3">{record.totalHours?.toFixed(1) || 0}h</td>
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

