import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingApprovals, approveUser, rejectUser, createEmployee, reset } from '../../store/slices/authSlice';
import { FiUserCheck, FiUserX, FiClock, FiMail, FiBriefcase, FiHash, FiUserPlus, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Approvals = () => {
  const dispatch = useDispatch();
  const { pendingApprovals, isLoading, isSuccess, message } = useSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', department: '' });
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  useEffect(() => {
    dispatch(getPendingApprovals());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && message && !isLoading) {
      // Don't show toast here as we're showing it in handlers
      dispatch(getPendingApprovals()); // Refresh list
      setShowCreateForm(false);
      setFormData({ name: '', email: '', department: '' });
      setTimeout(() => dispatch(reset()), 3000);
    }
  }, [isSuccess, message, isLoading, dispatch]);

  const handleApprove = async (userId) => {
    try {
      const result = await dispatch(approveUser(userId));
      if (result.error) {
        toast.error(result.payload || 'Failed to approve user');
      } else {
        const response = result.payload;
        if (response.generatedPassword) {
          // Show password in a more prominent way
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
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this registration? This action cannot be undone.')) {
      const result = await dispatch(rejectUser(userId));
      if (result.error) {
        toast.error(result.payload || 'Failed to reject user');
      } else {
        dispatch(getPendingApprovals());
      }
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    const result = await dispatch(createEmployee(formData));
    if (result.error) {
      toast.error(result.payload || 'Failed to create employee');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-400/30 border-t-primary-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Employee Management</h1>
          <p className="text-white/50 mt-1">Create employee accounts or approve registrations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-500/10 border border-warning-500/30">
            <FiClock className="text-warning-400" />
            <span className="text-warning-400 font-medium">{pendingApprovals.length} Pending</span>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2"
          >
            <FiUserPlus size={18} />
            Create Employee
          </button>
        </div>
      </div>

      {/* Create Employee Form */}
      {showCreateForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create New Employee Account</h2>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setFormData({ name: '', email: '', department: '' });
              }}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <FiX className="text-white/60" />
            </button>
          </div>
          <form onSubmit={handleCreateEmployee} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="john@company.com"
                required
              />
            </div>
            <div>
              <label className="label">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="input"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
          <p className="text-sm text-white/50 mt-3">
            The employee will receive an account and must register to set their password.
          </p>
        </div>
      )}

      {isSuccess && message && (
        <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/30 text-success-400">
          {message}
        </div>
      )}

      {pendingApprovals.length === 0 ? (
        <div className="glass-card p-12">
          <div className="empty-state">
            <div className="empty-state-icon"><FiUserCheck size={32} /></div>
            <h3 className="text-lg font-semibold text-white mt-4">No Pending Approvals</h3>
            <p className="text-white/50 mt-2">All employee registrations have been processed</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingApprovals.map((user) => (
            <div key={user._id} className="glass-card p-6 hover:border-primary-500/30 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="avatar avatar-lg text-xl">{user.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/50">
                      <span className="flex items-center gap-1.5">
                        <FiMail size={14} /> {user.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiHash size={14} /> {user.employeeId}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiBriefcase size={14} /> {user.department}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock size={14} /> {user.passwordSetupRequired ? 'Created' : 'Registered'} {format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      {user.passwordSetupRequired && (
                        <span className="px-2 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-medium border border-primary-500/30">
                          Needs Password Setup
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(user._id)}
                    disabled={isLoading}
                    className="btn-outline-danger flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Rejecting...</span>
                      </>
                    ) : (
                      <>
                        <FiUserX size={18} />
                        Reject
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleApprove(user._id)}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <FiUserCheck size={18} />
                        {user.passwordSetupRequired ? 'Approve & Generate Password' : 'Approve'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Approvals;

