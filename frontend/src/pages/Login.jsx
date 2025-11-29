import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowRight, FiClock, FiUsers, FiBarChart2, FiCheck } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) {
      navigate(user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(formData)); };

  const features = [
    { icon: FiClock, title: 'Real-time Tracking', desc: 'Instant attendance updates' },
    { icon: FiUsers, title: 'Team Insights', desc: 'Complete team overview' },
    { icon: FiBarChart2, title: 'Smart Reports', desc: 'Automated analytics' },
  ];

  return (
    <div className="min-h-screen flex bg-surface-100">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
          {/* Animated orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-float-slow"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <FiClock className="text-2xl text-white" />
            </div>
            <span className="text-xl font-bold text-white">AttendanceHub</span>
          </div>

          {/* Hero Content */}
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Simplify your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">workforce management</span>
            </h1>
            <p className="text-lg text-dark-300 mb-10">
              A modern attendance system designed for teams who value simplicity and efficiency.
            </p>

            {/* Feature Pills */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 animate-fade-in-up" style={{animationDelay: `${i * 0.1}s`}}>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-xl flex items-center justify-center">
                    <f.icon className="text-xl text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{f.title}</h3>
                    <p className="text-sm text-dark-400">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-dark-400 text-sm">
            © 2025 AttendanceHub. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center">
              <FiClock className="text-xl text-white" />
            </div>
            <span className="text-xl font-bold text-dark-900">AttendanceHub</span>
          </div>

          {/* Welcome Text */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-dark-900 mb-2">Welcome back</h2>
            <p className="text-dark-500">Enter your credentials to access your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-primary-600' : 'text-dark-400'}`}>
                  <FiMail className="text-lg" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="input pl-12"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-primary-600' : 'text-dark-400'}`}>
                  <FiLock className="text-lg" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="input pl-12"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg group">
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign in</span>
                  <FiArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-dark-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create account
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-10 p-5 bg-dark-50 rounded-2xl border border-dark-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-dark-700">Demo Credentials</span>
            </div>
            <div className="space-y-3">
              {[
                { role: 'Manager', email: 'manager@company.com' },
                { role: 'Employee', email: 'john@company.com' }
              ].map((cred, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-dark-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-primary-100 text-primary-600' : 'bg-accent-100 text-accent-600'}`}>
                      <FiCheck className="text-sm" />
                    </div>
                    <span className="text-sm font-medium text-dark-700">{cred.role}</span>
                  </div>
                  <code className="text-xs text-dark-500 bg-dark-50 px-2 py-1 rounded-lg">{cred.email}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-dark-400 text-center mt-3">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

