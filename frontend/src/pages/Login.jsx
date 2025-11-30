import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiArrowRight, FiClock, FiUsers, FiBarChart2, FiCheck, FiShield } from 'react-icons/fi';

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
    { icon: FiUsers, title: 'Team Management', desc: 'Complete team overview' },
    { icon: FiBarChart2, title: 'Analytics', desc: 'Smart reports & insights' },
    { icon: FiShield, title: 'Secure', desc: 'Enterprise-grade security' },
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-success-500/10 rounded-full blur-[80px] animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 glass-card flex items-center justify-center">
            <FiClock className="text-2xl text-primary-400" />
          </div>
          <span className="text-xl font-bold text-white">AttendanceHub</span>
        </div>

        {/* Hero Content */}
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Simplify your<br />
            <span className="gradient-text">workforce management</span>
          </h1>
          <p className="text-lg text-white/60 mb-10">
            A futuristic attendance system designed for modern teams who value efficiency.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-4 animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="icon-container icon-container-primary w-10 h-10 mb-3">
                  <f.icon className="text-lg" />
                </div>
                <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                <p className="text-xs text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-white/30 text-sm">© 2025 AttendanceHub. All rights reserved.</div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 glass-card flex items-center justify-center">
              <FiClock className="text-xl text-primary-400" />
            </div>
            <span className="text-xl font-bold text-white">AttendanceHub</span>
          </div>

          {/* Glass Form Card */}
          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-white/50">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${focusedField === 'email' ? 'text-primary-400' : 'text-white/40'}`}>
                    <FiMail className="text-lg" />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    required className="input pl-12" placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${focusedField === 'password' ? 'text-primary-400' : 'text-white/40'}`}>
                    <FiLock className="text-lg" />
                  </div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange}
                    onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                    required className="input pl-12" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 mt-2">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <><span>Sign in</span><FiArrowRight className="text-lg" /></>
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-white/50">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">Create account</Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white/80">Demo Credentials</span>
            </div>
            <div className="space-y-2">
              {[
                { role: 'Manager', email: 'manager@company.com', color: 'primary' },
                { role: 'Employee', email: 'john@company.com', color: 'accent' }
              ].map((cred, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`icon-container-sm icon-container-${cred.color}`}><FiCheck className="text-sm" /></div>
                    <span className="text-sm font-medium text-white/80">{cred.role}</span>
                  </div>
                  <code className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg">{cred.email}</code>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 text-center mt-3">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

