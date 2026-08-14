import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import profileApi from '../../services/profileApi';
import { formatApiError } from '../../services/errorNormalizer';
import normalizeProfile from '../../utils/profileNormalizer';

/**
 * RecruitTrain Employer Profile Redux Slice
 * Manages active user profile state, photo upload/removal, and partial field updates.
 * Strictly non-persisted to prevent leaking sensitive profile data in localStorage.
 */

export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const rawData = await profileApi.getMyProfile();
      return normalizeProfile(rawData);
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'profile/updateMyProfile',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      await profileApi.updateMyProfile(payload);
      // Re-fetch to guarantee absolute sync with server database
      const freshProfile = await dispatch(fetchMyProfile()).unwrap();
      return freshProfile;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadProfilePhoto',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      const res = await profileApi.uploadProfilePhoto(file);
      await dispatch(fetchMyProfile());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const removeProfilePhoto = createAsyncThunk(
  'profile/removeProfilePhoto',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await profileApi.removeProfilePhoto();
      await dispatch(fetchMyProfile());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  updating: false,
  uploading: false,
  removingPhoto: false,
  error: null,
  updateError: null,
  uploadError: null,
  actionStatus: null, // { type: 'update_success' | 'upload_success' | 'remove_success' }
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.uploadError = null;
    },
    clearProfileActionStatus: (state) => {
      state.actionStatus = null;
    },
    resetProfileState: (state) => {
      state.profile = null;
      state.loading = false;
      state.updating = false;
      state.uploading = false;
      state.removingPhoto = false;
      state.error = null;
      state.updateError = null;
      state.uploadError = null;
      state.actionStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchMyProfile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateMyProfile
      .addCase(updateMyProfile.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload) {
          state.profile = action.payload;
        }
        state.actionStatus = { type: 'update_success' };
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      })

      // uploadProfilePhoto
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state) => {
        state.uploading = false;
        state.actionStatus = { type: 'upload_success' };
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
      })

      // removeProfilePhoto
      .addCase(removeProfilePhoto.pending, (state) => {
        state.removingPhoto = true;
        state.uploadError = null;
      })
      .addCase(removeProfilePhoto.fulfilled, (state) => {
        state.removingPhoto = false;
        state.actionStatus = { type: 'remove_success' };
      })
      .addCase(removeProfilePhoto.rejected, (state, action) => {
        state.removingPhoto = false;
        state.uploadError = action.payload;
      });
  },
});

export const { clearProfileErrors, clearProfileActionStatus, resetProfileState } =
  profileSlice.actions;

export const selectProfile = (state) => state.profile?.profile;
export const selectProfileLoading = (state) => state.profile?.loading;
export const selectProfileUpdating = (state) => state.profile?.updating;
export const selectProfileUploading = (state) => state.profile?.uploading;
export const selectProfileRemovingPhoto = (state) => state.profile?.removingPhoto;
export const selectProfileError = (state) => state.profile?.error;
export const selectProfileUpdateError = (state) => state.profile?.updateError;
export const selectProfileUploadError = (state) => state.profile?.uploadError;
export const selectProfileActionStatus = (state) => state.profile?.actionStatus;

export default profileSlice.reducer;
