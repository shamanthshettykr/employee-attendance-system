import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingApprovals, approveUser, rejectUser, reset } from '../../store/slices/authSlice';
import { FiUserCheck, FiUserX, FiClock, FiMail, FiBriefcase, FiHash } from 'react-icons/fi';
import { format } from 'date-fns';

const Approvals = () => {
  const dispatch = useDispatch();
  const { pendingApprovals, isLoading, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getPendingApprovals());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && message) {
      setTimeout(() => dispatch(reset()), 3000);
    }
  }, [isSuccess, message, dispatch]);

  const handleApprove = (userId) => {
    dispatch(approveUser(userId));
  };

  const handleReject = (userId) => {
    if (window.confirm('Are you sure you want to reject this registration? This action cannot be undone.')) {
      dispatch(rejectUser(userId));
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
          <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-white/50 mt-1">Review and approve new employee registrations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-warning-500/10 border border-warning-500/30">
          <FiClock className="text-warning-400" />
          <span className="text-warning-400 font-medium">{pendingApprovals.length} Pending</span>
        </div>
      </div>

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
                        <FiClock size={14} /> Registered {format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleReject(user._id)}
                    className="btn-outline-danger flex items-center gap-2 px-5 py-2.5"
                  >
                    <FiUserX size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="btn-primary flex items-center gap-2 px-5 py-2.5"
                  >
                    <FiUserCheck size={18} />
                    Approve
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

