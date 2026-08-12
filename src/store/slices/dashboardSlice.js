import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  overview: null,
  pipelineSummary: [],
  todaysInterviews: [],
  recentActivity: [],
  recentApplications: [],
  loading: false,
  refreshing: false,
  errors: {
    overview: null,
    pipeline: null,
    interviews: null,
    activity: null,
    applications: null,
    general: null,
  },
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    fetchDashboardStart: (state, action) => {
      if (action.payload?.isRefresh) {
        state.refreshing = true;
      } else {
        state.loading = true;
      }
      state.errors.general = null;
    },
    fetchDashboardSuccess: (state, action) => {
      const { overview, pipelineSummary, todaysInterviews, recentActivity, recentApplications } = action.payload;
      state.loading = false;
      state.refreshing = false;
      state.overview = overview || null;
      state.pipelineSummary = pipelineSummary || [];
      state.todaysInterviews = todaysInterviews || [];
      state.recentActivity = recentActivity || [];
      state.recentApplications = recentApplications || [];
      state.errors = {
        overview: null,
        pipeline: null,
        interviews: null,
        activity: null,
        applications: null,
        general: null,
      };
      state.lastUpdated = new Date().toISOString();
    },
    fetchDashboardFailure: (state, action) => {
      state.loading = false;
      state.refreshing = false;
      state.errors.general = action.payload;
    },
    setSectionError: (state, action) => {
      const { section, error } = action.payload;
      if (state.errors[section] !== undefined) {
        state.errors[section] = error;
      }
    },
  },
});

export const {
  fetchDashboardStart,
  fetchDashboardSuccess,
  fetchDashboardFailure,
  setSectionError,
} = dashboardSlice.actions;

export const selectDashboard = (state) => state.dashboard;
export const selectDashboardOverview = (state) => state.dashboard.overview;
export const selectPipelineSummary = (state) => state.dashboard.pipelineSummary;
export const selectTodaysInterviews = (state) => state.dashboard.todaysInterviews;
export const selectRecentActivity = (state) => state.dashboard.recentActivity;
export const selectRecentApplications = (state) => state.dashboard.recentApplications;
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardRefreshing = (state) => state.dashboard.refreshing;
export const selectDashboardErrors = (state) => state.dashboard.errors;

export default dashboardSlice.reducer;
