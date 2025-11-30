import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Get user from localStorage
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

const initialState = {
  user: user ? JSON.parse(user) : null,
  token: token || null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
  pendingApproval: false,
  pendingApprovals: [],
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await api.post('/auth/login', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      const pendingApproval = error.response?.data?.pendingApproval || false;
      return thunkAPI.rejectWithValue({ message, pendingApproval });
    }
  }
);

// Get current user
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});

// Get pending approvals (Manager only)
export const getPendingApprovals = createAsyncThunk(
  'auth/getPendingApprovals',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/auth/pending-approvals');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Approve user (Manager only)
export const approveUser = createAsyncThunk(
  'auth/approveUser',
  async (userId, thunkAPI) => {
    try {
      const response = await api.put(`/auth/approve/${userId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reject user (Manager only)
export const rejectUser = createAsyncThunk(
  'auth/rejectUser',
  async (userId, thunkAPI) => {
    try {
      const response = await api.delete(`/auth/reject/${userId}`);
      return { ...response.data, userId };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
      state.pendingApproval = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pendingApproval = action.payload.pendingApproval || false;
        state.message = action.payload.message || '';
        // Only set user/token if not pending approval
        if (!action.payload.pendingApproval) {
          state.user = action.payload.data;
          state.token = action.payload.token;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.data;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload?.message || action.payload;
        state.pendingApproval = action.payload?.pendingApproval || false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.data;
      })
      .addCase(getPendingApprovals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingApprovals = action.payload.data;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(approveUser.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(
          user => user._id !== action.payload.data._id
        );
        state.message = action.payload.message;
        state.isSuccess = true;
      })
      .addCase(rejectUser.fulfilled, (state, action) => {
        state.pendingApprovals = state.pendingApprovals.filter(
          user => user._id !== action.payload.userId
        );
        state.message = action.payload.message;
        state.isSuccess = true;
      });
  },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;

