import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companyApi from '../../services/companyApi';

/**
 * RecruitTrain Company Slice
 * In-memory Redux store for authenticated employer's Company Profile.
 * Strictly non-persisted to prevent client-side company identity spoofing.
 */

export const fetchCompanyProfile = createAsyncThunk(
  'company/fetchCompanyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await companyApi.getCompanyProfile();
      return profile;
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch company profile');
    }
  }
);

const initialState = {
  profile: null, // { companyName, name, logo, companyLogo, industry, email, ... }
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearCompanyProfile: (state) => {
      state.profile = null;
      state.status = 'idle';
      state.error = null;
    },
    setCompanyProfile: (state, action) => {
      state.profile = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearCompanyProfile, setCompanyProfile } = companySlice.actions;

export const selectCompanyState = (state) => state.company || initialState;
export const selectCompanyProfile = (state) => state.company?.profile || null;
export const selectCompanyStatus = (state) => state.company?.status || 'idle';
export const selectCompanyError = (state) => state.company?.error || null;

export const selectCompanyName = (state) => {
  const profile = state.company?.profile;
  if (!profile) return null;
  return profile.companyName || profile.name || null;
};

export const selectCompanyLogo = (state) => {
  const profile = state.company?.profile;
  if (!profile) return null;
  return profile.logo || profile.companyLogo || null;
};

export default companySlice.reducer;
