// src/store/slices/applicationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchApplications = createAsyncThunk(
  'applications/fetch',
  async (_, thunkAPI) => {
    const token = thunkAPI.getState().auth.user.token;
    const res = await axios.get('/api/student/applications', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  }
);

const applicationSlice = createSlice({
  name: 'application',
  initialState: {
    applications: [],
    loading: false,
    error: null,
  },
  reducers: {
    setUpdatedApplication: (state, action) => {
      const updated = action.payload;
      const index = state.applications.findIndex((app) => app._id === updated._id);
      if (index !== -1) {
        state.applications[index] = updated;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setUpdatedApplication } = applicationSlice.actions;
export default applicationSlice.reducer;
