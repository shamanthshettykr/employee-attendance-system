import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight, FiClock } from 'react-icons/fi';

const InputField = ({ name, type = 'text', icon: Icon, placeholder, value, onChange, onFocus, onBlur, focusedField, ...props }) => (
  <div className="relative">
    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${focusedField === name ? 'text-primary-400' : 'text-white/40'}`}>
      <Icon size={18} />
    </div>
    <input type={type} name={name} value={value} onChange={onChange}
      onFocus={onFocus} onBlur={onBlur}
      className="input pl-12" placeholder={placeholder} {...props} />
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '' });
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message, pendingApproval } = useSelector((state) => state.auth);
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess && pendingApproval) {
      toast.success(message || 'Registration successful! Awaiting manager approval.');
      setTimeout(() => navigate('/login'), 3000);
    } else if (isSuccess || user) {
      navigate('/employee/dashboard');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, pendingApproval, navigate, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    const { confirmPassword, ...userData } = formData;
    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary-500/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 glass-card flex items-center justify-center">
            <FiClock className="text-2xl text-primary-400" />
          </div>
          <span className="text-xl font-bold text-white">AttendanceHub</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Start tracking<br />
            <span className="gradient-text">your attendance</span>
          </h1>
          <p className="text-lg text-white/60">Join thousands of employees who use AttendanceHub to manage their work hours efficiently.</p>
        </div>
        <div className="text-white/30 text-sm">© 2025 AttendanceHub. All rights reserved.</div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 glass-card flex items-center justify-center"><FiClock className="text-xl text-primary-400" /></div>
            <span className="text-xl font-bold text-white">AttendanceHub</span>
          </div>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
              <p className="text-white/50">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="label">Full Name</label><InputField name="name" icon={FiUser} placeholder="John Doe" value={formData.name} onChange={handleChange} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} focusedField={focusedField} required /></div>
              <div><label className="label">Email</label><InputField name="email" type="email" icon={FiMail} placeholder="you@example.com" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} focusedField={focusedField} required /></div>
              <div>
                <label className="label">Department</label>
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none ${focusedField === 'department' ? 'text-primary-400' : 'text-white/40'}`}><FiBriefcase size={18} /></div>
                  <select name="department" value={formData.department} onChange={handleChange} onFocus={() => setFocusedField('department')} onBlur={() => setFocusedField(null)} required className="input pl-12 appearance-none cursor-pointer">
                    <option value="">Select Department</option>
                    {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Password</label><InputField name="password" type="password" icon={FiLock} placeholder="••••••" value={formData.password} onChange={handleChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} focusedField={focusedField} required minLength={6} /></div>
                <div><label className="label">Confirm</label><InputField name="confirmPassword" type="password" icon={FiLock} placeholder="••••••" value={formData.confirmPassword} onChange={handleChange} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} focusedField={focusedField} required /></div>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 mt-2">
                {isLoading ? (<div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Creating...</span></div>) : (<><span>Create account</span><FiArrowRight /></>)}
              </button>
            </form>

            <p className="text-center mt-6 text-white/50">Already have an account? <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

