import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiHome, FiClock, FiCalendar, FiUser, FiUsers, FiFileText, FiLogOut, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { useState, useEffect } from 'react';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);



  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const employeeLinks = [
    { path: '/employee/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/employee/attendance', icon: FiClock, label: 'Mark Attendance' },
    { path: '/employee/history', icon: FiCalendar, label: 'My History' },
    { path: '/employee/profile', icon: FiUser, label: 'Profile' },
  ];

  const managerLinks = [
    { path: '/manager/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/manager/attendance', icon: FiUsers, label: 'All Attendance' },
    { path: '/manager/calendar', icon: FiCalendar, label: 'Team Calendar' },
    { path: '/manager/reports', icon: FiFileText, label: 'Reports' },
  ];

  const links = user?.role === 'manager' ? managerLinks : employeeLinks;

  return (
    <div className="min-h-screen relative">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          {sidebarOpen ? <FiX size={20} className="text-white" /> : <FiMenu size={20} className="text-white" />}
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <FiClock className="text-white text-lg" />
          </div>
          <span className="font-bold text-white">AttendanceHub</span>
        </div>
        <div className="avatar avatar-sm">{user?.name?.charAt(0)}</div>
      </header>

      {/* Glass Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-[280px] glass-card rounded-none border-y-0 border-l-0 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-cyan">
              <FiClock className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">AttendanceHub</h1>
              <p className="text-xs text-white/50 capitalize">{user?.role} Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider px-3 mb-4">Navigation</p>
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path} onClick={() => setSidebarOpen(false)}
                  className={`nav-item ${isActive ? 'active' : ''}`}>
                  <link.icon size={18} />
                  <span>{link.label}</span>

                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
              <div className="avatar avatar-md">{user?.name?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">{user?.name}</p>
                <p className="text-xs text-white/50 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-danger-400 hover:bg-danger-500/10 hover:shadow-glow-red">
              <FiLogOut size={18} />
              <span className="font-medium text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen relative z-10">
        {/* Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 glass-card rounded-none border-x-0 border-t-0">
          <h2 className="text-lg font-semibold text-white">
            {links.find(l => l.path === location.pathname)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative">
              <FiBell size={18} className="text-white/70" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full animate-pulse"></span>
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md">{user?.name?.charAt(0)}</div>
              <div>
                <p className="font-semibold text-white text-sm">{user?.name}</p>
                <p className="text-xs text-white/50 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Layout;

