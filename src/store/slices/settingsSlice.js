import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingsApi from '../../services/settingsApi';
import { formatApiError } from '../../services/errorNormalizer';

/**
 * RecruitTrain Employer Settings Slice
 * Redux store for company-scoped settings and user notification preferences.
 * Strictly non-persisted to enforce backend single source of truth and prevent leaking sensitive configuration.
 */

export const fetchAllSettings = createAsyncThunk(
  'settings/fetchAllSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getSettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const fetchGeneralSettings = createAsyncThunk(
  'settings/fetchGeneralSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getGeneralSettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateGeneralSettings = createAsyncThunk(
  'settings/updateGeneralSettings',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await settingsApi.updateGeneralSettings(payload);
      await dispatch(fetchGeneralSettings());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const fetchBrandingSettings = createAsyncThunk(
  'settings/fetchBrandingSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getBrandingSettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateBrandingSettings = createAsyncThunk(
  'settings/updateBrandingSettings',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await settingsApi.updateBrandingSettings(payload);
      await dispatch(fetchBrandingSettings());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const fetchNotificationSettings = createAsyncThunk(
  'settings/fetchNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getNotificationSettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'settings/updateNotificationSettings',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await settingsApi.updateNotificationSettings(payload);
      await dispatch(fetchNotificationSettings());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const fetchSecuritySettings = createAsyncThunk(
  'settings/fetchSecuritySettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getSecuritySettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateSecuritySettings = createAsyncThunk(
  'settings/updateSecuritySettings',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await settingsApi.updateSecuritySettings(payload);
      await dispatch(fetchSecuritySettings());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const fetchRecruitmentSettings = createAsyncThunk(
  'settings/fetchRecruitmentSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getRecruitmentSettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateRecruitmentSettings = createAsyncThunk(
  'settings/updateRecruitmentSettings',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await settingsApi.updateRecruitmentSettings(payload);
      await dispatch(fetchRecruitmentSettings());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const fetchIntegrationSettings = createAsyncThunk(
  'settings/fetchIntegrationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsApi.getIntegrationSettings();
      return data;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

export const updateIntegrationSettings = createAsyncThunk(
  'settings/updateIntegrationSettings',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const res = await settingsApi.updateIntegrationSettings(payload);
      await dispatch(fetchIntegrationSettings());
      return res;
    } catch (err) {
      return rejectWithValue(formatApiError(err));
    }
  }
);

const initialState = {
  general: null,
  branding: null,
  notification: null,
  security: null,
  recruitment: null,
  integration: null,
  loading: false,
  savingSection: null, // 'general' | 'branding' | 'notification' | 'security' | 'recruitment' | 'integration'
  actionStatus: null, // { type: string, section: string }
  error: null,
  securityPermissionError: null,
  integrationPermissionError: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearSettingsActionStatus: (state) => {
      state.actionStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAllSettings
      .addCase(fetchAllSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSettings.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        if (payload.general) state.general = payload.general;
        if (payload.branding) state.branding = payload.branding;
        if (payload.notification) state.notification = payload.notification;
        if (payload.security) state.security = payload.security;
        if (payload.recruitment) state.recruitment = payload.recruitment;
        if (payload.integration) state.integration = payload.integration;
        state.error = null;
      })
      .addCase(fetchAllSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchGeneralSettings
      .addCase(fetchGeneralSettings.fulfilled, (state, action) => {
        state.general = action.payload;
      })
      // updateGeneralSettings
      .addCase(updateGeneralSettings.pending, (state) => {
        state.savingSection = 'general';
        state.error = null;
      })
      .addCase(updateGeneralSettings.fulfilled, (state) => {
        state.savingSection = null;
        state.actionStatus = { type: 'save_success', section: 'general' };
      })
      .addCase(updateGeneralSettings.rejected, (state, action) => {
        state.savingSection = null;
        state.error = action.payload;
      })
      // fetchBrandingSettings
      .addCase(fetchBrandingSettings.fulfilled, (state, action) => {
        state.branding = action.payload;
      })
      // updateBrandingSettings
      .addCase(updateBrandingSettings.pending, (state) => {
        state.savingSection = 'branding';
        state.error = null;
      })
      .addCase(updateBrandingSettings.fulfilled, (state) => {
        state.savingSection = null;
        state.actionStatus = { type: 'save_success', section: 'branding' };
      })
      .addCase(updateBrandingSettings.rejected, (state, action) => {
        state.savingSection = null;
        state.error = action.payload;
      })
      // fetchNotificationSettings
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.notification = action.payload;
      })
      // updateNotificationSettings
      .addCase(updateNotificationSettings.pending, (state) => {
        state.savingSection = 'notification';
        state.error = null;
      })
      .addCase(updateNotificationSettings.fulfilled, (state) => {
        state.savingSection = null;
        state.actionStatus = { type: 'save_success', section: 'notification' };
      })
      .addCase(updateNotificationSettings.rejected, (state, action) => {
        state.savingSection = null;
        state.error = action.payload;
      })
      // fetchSecuritySettings
      .addCase(fetchSecuritySettings.fulfilled, (state, action) => {
        state.security = action.payload;
        state.securityPermissionError = null;
      })
      .addCase(fetchSecuritySettings.rejected, (state, action) => {
        if (action.payload?.status === 403 || action.payload?.code === 'PERMISSION_DENIED') {
          state.securityPermissionError = action.payload?.message || 'Administrator role required.';
        }
      })
      // updateSecuritySettings
      .addCase(updateSecuritySettings.pending, (state) => {
        state.savingSection = 'security';
        state.error = null;
      })
      .addCase(updateSecuritySettings.fulfilled, (state) => {
        state.savingSection = null;
        state.actionStatus = { type: 'save_success', section: 'security' };
      })
      .addCase(updateSecuritySettings.rejected, (state, action) => {
        state.savingSection = null;
        if (action.payload?.status === 403 || action.payload?.code === 'PERMISSION_DENIED') {
          state.securityPermissionError = action.payload?.message || 'Administrator role required.';
        }
        state.error = action.payload;
      })
      // fetchRecruitmentSettings
      .addCase(fetchRecruitmentSettings.fulfilled, (state, action) => {
        state.recruitment = action.payload;
      })
      // updateRecruitmentSettings
      .addCase(updateRecruitmentSettings.pending, (state) => {
        state.savingSection = 'recruitment';
        state.error = null;
      })
      .addCase(updateRecruitmentSettings.fulfilled, (state) => {
        state.savingSection = null;
        state.actionStatus = { type: 'save_success', section: 'recruitment' };
      })
      .addCase(updateRecruitmentSettings.rejected, (state, action) => {
        state.savingSection = null;
        state.error = action.payload;
      })
      // fetchIntegrationSettings
      .addCase(fetchIntegrationSettings.fulfilled, (state, action) => {
        state.integration = action.payload;
        state.integrationPermissionError = null;
      })
      .addCase(fetchIntegrationSettings.rejected, (state, action) => {
        if (action.payload?.status === 403 || action.payload?.code === 'PERMISSION_DENIED') {
          state.integrationPermissionError = action.payload?.message || 'Administrator role required.';
        }
      })
      // updateIntegrationSettings
      .addCase(updateIntegrationSettings.pending, (state) => {
        state.savingSection = 'integration';
        state.error = null;
      })
      .addCase(updateIntegrationSettings.fulfilled, (state) => {
        state.savingSection = null;
        state.actionStatus = { type: 'save_success', section: 'integration' };
      })
      .addCase(updateIntegrationSettings.rejected, (state, action) => {
        state.savingSection = null;
        if (action.payload?.status === 403 || action.payload?.code === 'PERMISSION_DENIED') {
          state.integrationPermissionError = action.payload?.message || 'Administrator role required.';
        }
        state.error = action.payload;
      });
  },
});

export const { clearSettingsError, clearSettingsActionStatus } = settingsSlice.actions;

export const selectSettingsState = (state) => state.settings || initialState;
export const selectGeneralSettings = (state) => state.settings?.general || null;
export const selectBrandingSettings = (state) => state.settings?.branding || null;
export const selectNotificationSettings = (state) => state.settings?.notification || null;
export const selectSecuritySettings = (state) => state.settings?.security || null;
export const selectRecruitmentSettings = (state) => state.settings?.recruitment || null;
export const selectIntegrationSettings = (state) => state.settings?.integration || null;
export const selectSettingsLoading = (state) => state.settings?.loading || false;
export const selectSavingSection = (state) => state.settings?.savingSection || null;
export const selectSettingsActionStatus = (state) => state.settings?.actionStatus || null;
export const selectSettingsError = (state) => state.settings?.error || null;
export const selectSecurityPermissionError = (state) => state.settings?.securityPermissionError || null;
export const selectIntegrationPermissionError = (state) => state.settings?.integrationPermissionError || null;

export default settingsSlice.reducer;
