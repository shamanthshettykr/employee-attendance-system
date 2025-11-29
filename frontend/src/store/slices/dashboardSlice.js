import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  employeeStats: null,
  managerStats: null,
  isLoading: false,
  isError: false,
  message: '',
};

// Get employee dashboard stats
export const getEmployeeStats = createAsyncThunk(
  'dashboard/getEmployeeStats',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/dashboard/employee');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get manager dashboard stats
export const getManagerStats = createAsyncThunk(
  'dashboard/getManagerStats',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/dashboard/manager');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEmployeeStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getEmployeeStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeeStats = action.payload.data;
      })
      .addCase(getEmployeeStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getManagerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getManagerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.managerStats = action.payload.data;
      })
      .addCase(getManagerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export default dashboardSlice.reducer;

