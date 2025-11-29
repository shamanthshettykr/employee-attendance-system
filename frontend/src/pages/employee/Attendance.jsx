import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkIn, checkOut, getTodayStatus } from '../../store/slices/attendanceSlice';
import { toast } from 'react-toastify';
import { FiClock, FiLogIn, FiLogOut } from 'react-icons/fi';
import { format } from 'date-fns';

const Attendance = () => {
  const dispatch = useDispatch();
  const { todayStatus, isLoading } = useSelector((state) => state.attendance);

  useEffect(() => {
    dispatch(getTodayStatus());
  }, [dispatch]);

  const handleCheckIn = async () => {
    try {
      await dispatch(checkIn()).unwrap();
      toast.success('Checked in successfully!');
    } catch (error) {
      toast.error(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await dispatch(checkOut()).unwrap();
      toast.success('Checked out successfully!');
    } catch (error) {
      toast.error(error);
    }
  };

  const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
  const isCheckedOut = todayStatus?.checkInTime && todayStatus?.checkOutTime;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mark Attendance</h1>

      <div className="bg-white rounded-xl shadow-sm p-8">
        {/* Current Time */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <FiClock size={20} />
            <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <p className="text-5xl font-bold text-gray-800">
            {format(new Date(), 'hh:mm a')}
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-gray-600 mb-4 text-center">Today's Status</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Check In</p>
              <p className="text-lg font-semibold text-gray-800">
                {todayStatus?.checkInTime ? format(new Date(todayStatus.checkInTime), 'hh:mm a') : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check Out</p>
              <p className="text-lg font-semibold text-gray-800">
                {todayStatus?.checkOutTime ? format(new Date(todayStatus.checkOutTime), 'hh:mm a') : '--:--'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Hours</p>
              <p className="text-lg font-semibold text-gray-800">
                {todayStatus?.totalHours ? `${todayStatus.totalHours.toFixed(1)}h` : '0h'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {!isCheckedIn && !isCheckedOut && (
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-3 text-lg disabled:opacity-50"
            >
              <FiLogIn size={24} />
              Check In
            </button>
          )}

          {isCheckedIn && (
            <>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-green-600 font-semibold">You are currently checked in</p>
                <p className="text-green-500 text-sm">
                  Since {format(new Date(todayStatus.checkInTime), 'hh:mm a')}
                </p>
              </div>
              <button
                onClick={handleCheckOut}
                disabled={isLoading}
                className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-3 text-lg disabled:opacity-50"
              >
                <FiLogOut size={24} />
                Check Out
              </button>
            </>
          )}

          {isCheckedOut && (
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <p className="text-blue-600 font-semibold text-lg mb-2">
                You have completed your attendance for today!
              </p>
              <div className="flex justify-center gap-8 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Check In</p>
                  <p className="font-semibold text-gray-800">
                    {format(new Date(todayStatus.checkInTime), 'hh:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Check Out</p>
                  <p className="font-semibold text-gray-800">
                    {format(new Date(todayStatus.checkOutTime), 'hh:mm a')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-semibold text-gray-800">{todayStatus.totalHours?.toFixed(1)}h</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {todayStatus?.status && todayStatus.status !== 'not-checked-in' && (
          <div className="mt-6 text-center">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              todayStatus.status === 'present' ? 'bg-green-100 text-green-800' :
              todayStatus.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Status: {todayStatus.status.charAt(0).toUpperCase() + todayStatus.status.slice(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;

