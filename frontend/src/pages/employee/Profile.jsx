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
      <h1 className="text-2xl font-bold text-dark-900 mb-6">My Profile</h1>

      <div className="card overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-dark-900 p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{user?.name?.charAt(0)}</span>
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-white/70">{user?.employeeId}</p>
              <span className="inline-block mt-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-sm capitalize border border-white/20">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
          {profileFields.map((field, i) => (
            <div key={field.label} className="flex items-center gap-4 p-4 bg-dark-50 rounded-2xl hover:bg-dark-100 transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`icon-container icon-container-${field.color}`}><field.icon size={20} /></div>
              <div><p className="text-sm text-dark-400">{field.label}</p><p className="font-semibold text-dark-900">{field.value}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;

