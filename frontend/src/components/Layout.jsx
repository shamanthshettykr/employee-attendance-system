import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FiHome, FiClock, FiCalendar, FiUser, FiUsers, FiFileText, FiLogOut, FiMenu, FiX, FiBell, FiSearch } from 'react-icons/fi';
import { useState } from 'react';

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
    <div className="min-h-screen bg-surface-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-dark-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 rounded-xl bg-dark-100 hover:bg-dark-200 transition-colors">
          {sidebarOpen ? <FiX size={20} className="text-dark-700" /> : <FiMenu size={20} className="text-dark-700" />}
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <FiClock className="text-white text-lg" />
          </div>
          <span className="font-bold text-dark-900">AttendanceHub</span>
        </div>
        <div className="avatar avatar-sm avatar-primary">{user?.name?.charAt(0)}</div>
      </header>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-[280px] bg-white border-r border-dark-200 transform transition-transform duration-300 ease-smooth ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/20">
              <FiClock className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-dark-900">AttendanceHub</h1>
              <p className="text-xs text-dark-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider px-3 mb-4">Navigation</p>
            {links.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`icon-container ${isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' : 'bg-dark-100 text-dark-500'}`}>
                    <link.icon size={18} />
                  </div>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-dark-200">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-dark-50 mb-3">
              <div className="avatar avatar-md avatar-primary">{user?.name?.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-dark-900 truncate text-sm">{user?.name}</p>
                <p className="text-xs text-dark-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-danger-600 hover:bg-danger-50 rounded-xl transition-colors">
              <FiLogOut size={18} />
              <span className="font-medium text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-16 lg:pt-0 min-h-screen">
        {/* Top Bar */}
        <div className="hidden lg:flex items-center justify-between px-8 py-5 bg-white border-b border-dark-200">
          <div className="flex items-center gap-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input type="text" placeholder="Search..." className="w-72 pl-11 pr-4 py-2.5 bg-dark-50 rounded-xl text-sm border-2 border-transparent focus:border-primary-400 focus:bg-white transition-all outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-dark-50 hover:bg-dark-100 transition-colors relative">
              <FiBell size={18} className="text-dark-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-dark-200"></div>
            <div className="flex items-center gap-3">
              <div className="avatar avatar-md avatar-primary">{user?.name?.charAt(0)}</div>
              <div>
                <p className="font-semibold text-dark-900 text-sm">{user?.name}</p>
                <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
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
        <div className="fixed inset-0 bg-dark-900/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Layout;

