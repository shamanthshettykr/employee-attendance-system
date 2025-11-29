import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import { FiDownload, FiFileText, FiSearch } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    dispatch(getAllAttendance(params));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await api.get(`/attendance/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary
  const summary = {
    total: allAttendance.length,
    present: allAttendance.filter(a => a.status === 'present').length,
    late: allAttendance.filter(a => a.status === 'late').length,
    absent: allAttendance.filter(a => a.status === 'absent').length,
    totalHours: allAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Attendance Reports</h1>
        <button
          onClick={handleExport}
          disabled={isExporting || allAttendance.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <FiDownload />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFileText className="text-gray-500" />
          <h2 className="font-semibold text-gray-800">Generate Report</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Employee ID (Optional)</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="e.g., EMP001 or leave empty for all"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              <FiSearch />
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {allAttendance.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
            <p className="text-gray-500 text-sm">Total Records</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{summary.present}</p>
            <p className="text-gray-500 text-sm">Present</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
            <p className="text-gray-500 text-sm">Late</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
            <p className="text-gray-500 text-sm">Absent</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{summary.totalHours.toFixed(1)}</p>
            <p className="text-gray-500 text-sm">Total Hours</p>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allAttendance.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">{record.userId?.employeeId}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{record.userId?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{record.userId?.department}</td>
                  <td className="px-6 py-4 text-gray-600">{format(new Date(record.date), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-gray-600">{record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}</td>
                  <td className="px-6 py-4 text-gray-600">{record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>{record.status}</span></td>
                  <td className="px-6 py-4 text-gray-600">{record.totalHours?.toFixed(1) || 0}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {allAttendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">Select a date range and click Generate to view report</div>
        )}
      </div>
    </div>
  );
};

export default Reports;

