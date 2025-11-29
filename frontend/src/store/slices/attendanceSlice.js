import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  todayStatus: null,
  myHistory: [],
  mySummary: null,
  allAttendance: [],
  teamSummary: null,
  todayStatusAll: null,
  isLoading: false,
  isError: false,
  message: '',
};

// Check in
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, thunkAPI) => {
    try {
      const response = await api.post('/attendance/checkin');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Check out
export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, thunkAPI) => {
    try {
      const response = await api.post('/attendance/checkout');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get today's status
export const getTodayStatus = createAsyncThunk(
  'attendance/getTodayStatus',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/attendance/today');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get my history
export const getMyHistory = createAsyncThunk(
  'attendance/getMyHistory',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/attendance/my-history', { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get my summary
export const getMySummary = createAsyncThunk(
  'attendance/getMySummary',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/attendance/my-summary', { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Manager: Get all attendance
export const getAllAttendance = createAsyncThunk(
  'attendance/getAllAttendance',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/attendance/all', { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Manager: Get team summary
export const getTeamSummary = createAsyncThunk(
  'attendance/getTeamSummary',
  async (params, thunkAPI) => {
    try {
      const response = await api.get('/attendance/summary', { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Manager: Get today's status for all
export const getTodayStatusAll = createAsyncThunk(
  'attendance/getTodayStatusAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/attendance/today-status');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    resetAttendance: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkIn.pending, (state) => { state.isLoading = true; })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayStatus = action.payload.data;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(checkOut.pending, (state) => { state.isLoading = true; })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayStatus = action.payload.data;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTodayStatus.fulfilled, (state, action) => {
        state.todayStatus = action.payload.data;
      })
      .addCase(getMyHistory.fulfilled, (state, action) => {
        state.myHistory = action.payload.data;
      })
      .addCase(getMySummary.fulfilled, (state, action) => {
        state.mySummary = action.payload.data;
      })
      .addCase(getAllAttendance.fulfilled, (state, action) => {
        state.allAttendance = action.payload.data;
      })
      .addCase(getTeamSummary.fulfilled, (state, action) => {
        state.teamSummary = action.payload.data;
      })
      .addCase(getTodayStatusAll.fulfilled, (state, action) => {
        state.todayStatusAll = action.payload.data;
      });
  },
});

export const { resetAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;

