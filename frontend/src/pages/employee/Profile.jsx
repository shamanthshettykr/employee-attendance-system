import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiBriefcase, FiHash, FiCalendar, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  const profileFields = [
    { label: 'Full Name', value: user?.name, icon: FiUser, color: 'primary' },
    { label: 'Email Address', value: user?.email, icon: FiMail, color: 'primary' },
    { label: 'Employee ID', value: user?.employeeId, icon: FiHash, color: 'accent' },
    { label: 'Department', value: user?.department, icon: FiBriefcase, color: 'success' },
    { label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1), icon: FiShield, color: 'warning' },
    { label: 'Member Since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : 'N/A', icon: FiCalendar, color: 'primary' },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="glass-card overflow-hidden">
        {/* Profile Header */}
        <div className="relative p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-accent-500/10 to-transparent"></div>
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-glow-cyan">
              <span className="text-4xl font-bold text-white">{user?.name?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-white/50">{user?.employeeId}</p>
              <span className="inline-block mt-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-sm capitalize border border-white/20 text-white/80">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-3 border-t border-white/10">
          {profileFields.map((field, i) => (
            <div key={field.label} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`icon-container icon-container-${field.color}`}><field.icon size={20} /></div>
              <div><p className="text-sm text-white/40">{field.label}</p><p className="font-semibold text-white">{field.value}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

