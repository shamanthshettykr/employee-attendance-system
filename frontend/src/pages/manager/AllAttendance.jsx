import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAttendance } from '../../store/slices/attendanceSlice';
import { format } from 'date-fns';
import { FiSearch, FiFilter } from 'react-icons/fi';

const AllAttendance = () => {
  const dispatch = useDispatch();
  const { allAttendance } = useSelector((state) => state.attendance);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', employeeId: '', department: '' });

  useEffect(() => { dispatch(getAllAttendance({})); }, [dispatch]);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = () => {
    const params = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.status) params.status = filters.status;
    if (filters.employeeId) params.employeeId = filters.employeeId;
    if (filters.department) params.department = filters.department;
    dispatch(getAllAttendance(params));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">All Employees Attendance</h1>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="icon-container icon-container-primary"><FiFilter size={18} /></div>
          <h2 className="font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div><label className="label">Start Date</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input" /></div>
          <div><label className="label">End Date</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input" /></div>
          <div>
            <label className="label">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="input">
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half-day">Half-Day</option>
            </select>
          </div>
          <div><label className="label">Employee ID</label><input type="text" name="employeeId" value={filters.employeeId} onChange={handleFilterChange} placeholder="e.g., EMP001" className="input" /></div>
          <div>
            <label className="label">Department</label>
            <select name="department" value={filters.department} onChange={handleFilterChange} className="input">
              <option value="">All</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>
          <div className="flex items-end"><button onClick={handleSearch} className="btn-primary w-full"><FiSearch size={18} />Search</button></div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {allAttendance.map((record) => {
                const getStatusBadgeClass = (status) => {
                  switch (status) {
                    case 'present': return 'badge-present';
                    case 'late': return 'badge-late';
                    case 'absent': return 'badge-absent';
                    case 'half-day': return 'badge-half-day';
                    default: return 'badge-primary';
                  }
                };
                const getStatusLabel = (status) => {
                  switch (status) {
                    case 'present': return 'Present';
                    case 'late': return 'Late';
                    case 'absent': return 'Absent';
                    case 'half-day': return 'Half-Day';
                    default: return status;
                  }
                };
                return (
                  <tr key={record._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar avatar-md">{record.userId?.name?.charAt(0)}</div>
                        <div>
                          <div className="font-medium text-white">{record.userId?.name}</div>
                          <div className="text-sm text-white/50">{record.userId?.employeeId} • {record.userId?.department}</div>
                        </div>
                      </div>
                    </td>
                    <td>{format(new Date(record.date), 'MMM d, yyyy')}</td>
                    <td>{record.checkInTime ? format(new Date(record.checkInTime), 'hh:mm a') : '-'}</td>
                    <td>{record.checkOutTime ? format(new Date(record.checkOutTime), 'hh:mm a') : (record.status === 'absent' ? '-' : 'Not checked out')}</td>
                    <td><span className={`badge ${getStatusBadgeClass(record.status)}`}>{getStatusLabel(record.status)}</span></td>
                    <td>{record.totalHours?.toFixed(1) || 0}h</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {allAttendance.length === 0 && (
          <div className="empty-state py-12"><p className="text-white/50">No attendance records found</p></div>
        )}
      </div>
    </div>
  );
};

export default AllAttendance;

