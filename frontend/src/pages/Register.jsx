import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiBriefcase, FiArrowRight, FiClock } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '' });
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess || user) navigate('/employee/dashboard');
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    const { confirmPassword, ...userData } = formData;
    dispatch(register(userData));
  };

  const InputField = ({ name, type = 'text', icon: Icon, placeholder, ...props }) => (
    <div className="relative">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === name ? 'text-primary-600' : 'text-dark-400'}`}>
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        onFocus={() => setFocusedField(name)}
        onBlur={() => setFocusedField(null)}
        className="input pl-12"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex bg-surface-100">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-primary-600 to-dark-900">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-500/30 rounded-full blur-3xl animate-float-slow"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <FiClock className="text-2xl text-white" />
            </div>
            <span className="text-xl font-bold text-white">AttendanceHub</span>
          </div>
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">Start tracking<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-white">your attendance</span></h1>
            <p className="text-lg text-white/70">Join thousands of employees who use AttendanceHub to manage their work hours efficiently.</p>
          </div>
          <div className="mt-auto text-white/50 text-sm">© 2025 AttendanceHub. All rights reserved.</div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center"><FiClock className="text-xl text-white" /></div>
            <span className="text-xl font-bold text-dark-900">AttendanceHub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-dark-900 mb-2">Create account</h2>
            <p className="text-dark-500">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div><label className="label">Full Name</label><InputField name="name" icon={FiUser} placeholder="John Doe" required /></div>
            <div><label className="label">Email</label><InputField name="email" type="email" icon={FiMail} placeholder="you@example.com" required /></div>
            <div>
              <label className="label">Department</label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focusedField === 'department' ? 'text-primary-600' : 'text-dark-400'}`}><FiBriefcase size={18} /></div>
                <select name="department" value={formData.department} onChange={handleChange} onFocus={() => setFocusedField('department')} onBlur={() => setFocusedField(null)} required className="input pl-12 appearance-none cursor-pointer">
                  <option value="">Select Department</option>
                  {departments.map((dept) => (<option key={dept} value={dept}>{dept}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Password</label><InputField name="password" type="password" icon={FiLock} placeholder="••••••" required minLength={6} /></div>
              <div><label className="label">Confirm</label><InputField name="confirmPassword" type="password" icon={FiLock} placeholder="••••••" required /></div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full btn-lg group mt-2">
              {isLoading ? (<div className="flex items-center gap-3"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Creating account...</span></div>) : (<><span>Create account</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </form>

          <p className="text-center mt-8 text-dark-500">Already have an account? <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;

