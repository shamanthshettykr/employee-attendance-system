import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import { FiDownload, FiFileText, FiSearch, FiCheckCircle, FiAlertCircle, FiXCircle, FiClock, FiList } from 'react-icons/fi';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', employeeId: '' });
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
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
      const response = await api.get(`/attendance/export?${params.toString()}`, { responseType: 'blob' });
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

  const summary = {
    total: allAttendance.length,
    present: allAttendance.filter(a => a.status === 'present').length,
    late: allAttendance.filter(a => a.status === 'late').length,
    absent: allAttendance.filter(a => a.status === 'absent').length,
    totalHours: allAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
  };

  const summaryStats = [
    { label: 'Total Records', value: summary.total, icon: FiList, color: 'primary' },
    { label: 'Present', value: summary.present, icon: FiCheckCircle, color: 'success' },
    { label: 'Late', value: summary.late, icon: FiAlertCircle, color: 'warning' },
    { label: 'Absent', value: summary.absent, icon: FiXCircle, color: 'danger' },
    { label: 'Total Hours', value: summary.totalHours.toFixed(1), icon: FiClock, color: 'primary' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Attendance Reports</h1>
        <button onClick={handleExport} disabled={isExporting || allAttendance.length === 0} className="btn-success">
          <FiDownload size={18} />{isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="icon-container icon-container-primary"><FiFileText size={18} /></div>
          <h2 className="font-semibold text-white">Generate Report</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="label">Start Date</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input" /></div>
          <div><label className="label">End Date</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input" /></div>
          <div><label className="label">Employee ID (Optional)</label><input type="text" name="employeeId" value={filters.employeeId} onChange={handleFilterChange} placeholder="e.g., EMP001" className="input" /></div>
          <div className="flex items-end"><button onClick={handleSearch} className="btn-primary w-full"><FiSearch size={18} />Generate</button></div>
        </div>
      </div>

      {/* Summary */}
      {allAttendance.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {summaryStats.map((stat, i) => (
            <div key={stat.label} className="stat-card p-4" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center gap-3">
                <div className={`icon-container icon-container-${stat.color}`}><stat.icon size={18} /></div>
                <div><p className="text-xl font-bold text-white">{stat.value}</p><p className="text-white/50 text-sm">{stat.label}</p></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th><th>Name</th><th>Department</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.userId?.employeeId}</td>
                  <td className="font-medium text-white">{record.userId?.name}</td>
                  <td>{record.userId?.department}</td>
                  <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                  <td>{record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}</td>
                  <td>{record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : '-'}</td>
                  <td><span className={`badge badge-${record.status}`}>{record.status}</span></td>
                  <td>{record.totalHours?.toFixed(1) || 0}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {allAttendance.length === 0 && (
          <div className="empty-state py-12"><div className="empty-state-icon"><FiFileText size={28} /></div><p className="text-white/50">Select a date range and click Generate to view report</p></div>
        )}
      </div>
    </div>
  );
};

export default Reports;

