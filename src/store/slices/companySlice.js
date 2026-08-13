import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import companyApi from '../../services/companyApi';
import { formatApiError } from '../../services/errorNormalizer';

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
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'company/updateCompanyProfile',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const updated = await companyApi.updateCompanyProfile(payload);
      // Re-fetch authoritative backend company profile to ensure exact parity
      await dispatch(fetchCompanyProfile());
      return updated;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const uploadCompanyLogo = createAsyncThunk(
  'company/uploadCompanyLogo',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      const res = await companyApi.uploadCompanyLogo(file);
      // Re-fetch authoritative profile to update logo URL throughout app
      await dispatch(fetchCompanyProfile());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const uploadCompanyBanner = createAsyncThunk(
  'company/uploadCompanyBanner',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      const res = await companyApi.uploadCompanyBanner(file);
      // Re-fetch authoritative profile to update banner URL throughout app
      await dispatch(fetchCompanyProfile());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

const initialState = {
  profile: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  saving: false,
  uploadingLogo: false,
  uploadingBanner: false,
  actionStatus: null, // { type: 'update_success' | 'logo_success' | 'banner_success' }
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
      state.actionStatus = null;
    },
    setCompanyProfile: (state, action) => {
      state.profile = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    clearCompanyError: (state) => {
      state.error = null;
    },
    clearCompanyActionStatus: (state) => {
      state.actionStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCompanyProfile
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
      })
      // updateCompanyProfile
      .addCase(updateCompanyProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateCompanyProfile.fulfilled, (state) => {
        state.saving = false;
        state.actionStatus = { type: 'update_success' };
      })
      .addCase(updateCompanyProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // uploadCompanyLogo
      .addCase(uploadCompanyLogo.pending, (state) => {
        state.uploadingLogo = true;
        state.error = null;
      })
      .addCase(uploadCompanyLogo.fulfilled, (state) => {
        state.uploadingLogo = false;
        state.actionStatus = { type: 'logo_success' };
      })
      .addCase(uploadCompanyLogo.rejected, (state, action) => {
        state.uploadingLogo = false;
        state.error = action.payload;
      })
      // uploadCompanyBanner
      .addCase(uploadCompanyBanner.pending, (state) => {
        state.uploadingBanner = true;
        state.error = null;
      })
      .addCase(uploadCompanyBanner.fulfilled, (state) => {
        state.uploadingBanner = false;
        state.actionStatus = { type: 'banner_success' };
      })
      .addCase(uploadCompanyBanner.rejected, (state, action) => {
        state.uploadingBanner = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearCompanyProfile,
  setCompanyProfile,
  clearCompanyError,
  clearCompanyActionStatus,
} = companySlice.actions;

export const selectCompanyState = (state) => state.company || initialState;
export const selectCompanyProfile = (state) => state.company?.profile || null;
export const selectCompanyStatus = (state) => state.company?.status || 'idle';
export const selectCompanySaving = (state) => state.company?.saving || false;
export const selectUploadingLogo = (state) => state.company?.uploadingLogo || false;
export const selectUploadingBanner = (state) => state.company?.uploadingBanner || false;
export const selectCompanyActionStatus = (state) => state.company?.actionStatus || null;
export const selectCompanyError = (state) => state.company?.error || null;

export const selectCompanyName = (state) => {
  const profile = state.company?.profile;
  if (!profile) return null;
  return profile.company_name || profile.companyName || profile.name || null;
};

export const selectCompanyLogo = (state) => {
  const profile = state.company?.profile;
  if (!profile) return null;
  return profile.logo || profile.companyLogo || null;
};

export default companySlice.reducer;
