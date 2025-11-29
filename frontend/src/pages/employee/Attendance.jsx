import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiLogIn, FiLogOut, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { format } from 'date-fns';

const Attendance = () => {
  const dispatch = useDispatch();
  const { todayStatus, isLoading } = useSelector((state) => state.attendance);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { dispatch(getTodayStatus()); }, [dispatch]);
  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);

  const handleCheckIn = async () => { try { await dispatch(checkIn()).unwrap(); toast.success('Checked in successfully!'); } catch (error) { toast.error(error); } };
  const handleCheckOut = async () => { try { await dispatch(checkOut()).unwrap(); toast.success('Checked out successfully!'); } catch (error) { toast.error(error); } };

  const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
  const isCheckedOut = todayStatus?.checkInTime && todayStatus?.checkOutTime;

  return (
    <div className="max-w-xl mx-auto animate-fade-in">
      {/* Time Display Card */}
      <div className="card p-8 text-center mb-6">
        <p className="text-dark-500 mb-2">{format(currentTime, 'EEEE, MMMM d, yyyy')}</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-6xl font-bold text-dark-900 tabular-nums">{format(currentTime, 'hh:mm:ss')}</span>
          <span className="text-2xl text-dark-400 self-end mb-2">{format(currentTime, 'a')}</span>
        </div>
      </div>

      {/* Status Card */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-dark-500 uppercase tracking-wider mb-5 text-center">Today's Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Check In', value: todayStatus?.checkInTime ? format(new Date(todayStatus.checkInTime), 'hh:mm a') : '--:--', icon: FiLogIn, color: 'success' },
            { label: 'Check Out', value: todayStatus?.checkOutTime ? format(new Date(todayStatus.checkOutTime), 'hh:mm a') : '--:--', icon: FiLogOut, color: 'danger' },
            { label: 'Total Hours', value: todayStatus?.totalHours ? `${todayStatus.totalHours.toFixed(1)}h` : '0h', icon: FiClock, color: 'primary' },
          ].map((item, i) => (
            <div key={i} className="text-center p-4 bg-dark-50 rounded-2xl">
              <div className={`icon-container icon-container-${item.color} mx-auto mb-3`}><item.icon size={18} /></div>
              <p className="text-xs text-dark-400 mb-1">{item.label}</p>
              <p className="text-lg font-bold text-dark-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Area */}
      <div className="card p-6">
        {!isCheckedIn && !isCheckedOut && (
          <button onClick={handleCheckIn} disabled={isLoading} className="btn-success w-full btn-lg group">
            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiLogIn size={22} /><span>Check In Now</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        )}

        {isCheckedIn && (
          <div className="space-y-4">
            <div className="text-center p-5 bg-success-50 rounded-2xl border border-success-200">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-success-500 flex items-center justify-center"><FiCheckCircle className="text-white text-2xl" /></div>
              <p className="text-success-700 font-semibold">Currently Working</p>
              <p className="text-success-600 text-sm mt-1">Since {format(new Date(todayStatus.checkInTime), 'hh:mm a')}</p>
            </div>
            <button onClick={handleCheckOut} disabled={isLoading} className="btn-danger w-full btn-lg group">
              {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiLogOut size={22} /><span>Check Out</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </div>
        )}

        {isCheckedOut && (
          <div className="text-center p-6 bg-primary-50 rounded-2xl border border-primary-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-600 flex items-center justify-center"><FiCheckCircle className="text-white text-3xl" /></div>
            <p className="text-dark-900 font-semibold text-lg mb-4">Day Complete!</p>
            <div className="flex justify-center gap-8">
              <div><p className="text-xs text-dark-400 mb-1">Check In</p><p className="font-bold text-dark-900">{format(new Date(todayStatus.checkInTime), 'hh:mm a')}</p></div>
              <div><p className="text-xs text-dark-400 mb-1">Check Out</p><p className="font-bold text-dark-900">{format(new Date(todayStatus.checkOutTime), 'hh:mm a')}</p></div>
              <div><p className="text-xs text-dark-400 mb-1">Total</p><p className="font-bold text-primary-600">{todayStatus.totalHours?.toFixed(1)}h</p></div>
            </div>
          </div>
        )}

        {todayStatus?.status && todayStatus.status !== 'not-checked-in' && (
          <div className="mt-5 text-center">
            <span className={`badge badge-${todayStatus.status === 'present' ? 'present' : todayStatus.status === 'late' ? 'late' : 'absent'}`}>
              {todayStatus.status.charAt(0).toUpperCase() + todayStatus.status.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;

