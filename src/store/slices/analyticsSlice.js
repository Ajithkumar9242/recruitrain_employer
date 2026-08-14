import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import analyticsApi from '../../services/analyticsApi';

// Initial State
const initialState = {
  overview: null,
  funnel: null,
  trends: [],
  jobMetrics: null,
  applicationMetrics: null,
  interviewMetrics: null,
  offerMetrics: null,
  timeToHire: null,
  recentActivity: [],
  filters: {
    fromDate: null,
    toDate: null,
    jobOpening: null,
    granularity: 'monthly',
    activityEntity: null,
  },
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  loading: {
    overview: false,
    funnel: false,
    trends: false,
    jobMetrics: false,
    applicationMetrics: false,
    interviewMetrics: false,
    offerMetrics: false,
    timeToHire: false,
    activity: false,
  },
  errors: {
    overview: null,
    funnel: null,
    trends: null,
    jobMetrics: null,
    applicationMetrics: null,
    interviewMetrics: null,
    offerMetrics: null,
    timeToHire: null,
    activity: null,
  },
};

// Async Thunks

export const fetchOverview = createAsyncThunk(
  'analytics/fetchOverview',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getOverview({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch overview metrics');
    }
  }
);

export const fetchFunnel = createAsyncThunk(
  'analytics/fetchFunnel',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getFunnel({
        jobOpening: filters.jobOpening,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recruitment funnel');
    }
  }
);

export const fetchTrends = createAsyncThunk(
  'analytics/fetchTrends',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getTrends({
        jobOpening: filters.jobOpening,
        granularity: filters.granularity,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch application trends');
    }
  }
);

export const fetchJobMetrics = createAsyncThunk(
  'analytics/fetchJobMetrics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getJobMetrics({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch job metrics');
    }
  }
);

export const fetchApplicationMetrics = createAsyncThunk(
  'analytics/fetchApplicationMetrics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getApplicationMetrics({
        jobOpening: filters.jobOpening,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch application metrics');
    }
  }
);

export const fetchInterviewMetrics = createAsyncThunk(
  'analytics/fetchInterviewMetrics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getInterviewMetrics({
        jobOpening: filters.jobOpening,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch interview metrics');
    }
  }
);

export const fetchOfferMetrics = createAsyncThunk(
  'analytics/fetchOfferMetrics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getOfferMetrics({
        jobOpening: filters.jobOpening,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch offer metrics');
    }
  }
);

export const fetchTimeToHire = createAsyncThunk(
  'analytics/fetchTimeToHire',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getTimeToHire({
        jobOpening: filters.jobOpening,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch time to hire metrics');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'analytics/fetchRecentActivity',
  async (pageParam, { getState, rejectWithValue }) => {
    try {
      const { filters, pagination } = getState().analytics;
      const targetPage = pageParam ?? pagination.page;
      return await analyticsApi.getRecentActivity({
        entity: filters.activityEntity,
        page: targetPage,
        pageSize: pagination.pageSize,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch recent activity');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState().analytics;
      return await analyticsApi.getAnalytics({
        jobOpening: filters.jobOpening,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        granularity: filters.granularity,
      });
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchAllAnalytics = createAsyncThunk(
  'analytics/fetchAllAnalytics',
  async (_, { dispatch }) => {
    await Promise.allSettled([
      dispatch(fetchAnalytics()),
      dispatch(fetchRecentActivity(1)),
    ]);
  }
);

// Analytics Slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    setGranularity(state, action) {
      state.filters.granularity = action.payload;
    },
    setActivityEntity(state, action) {
      state.filters.activityEntity = action.payload;
      state.pagination.page = 1;
    },
    setActivityPage(state, action) {
      state.pagination.page = action.payload;
    },
    resetFilters(state) {
      state.filters = {
        fromDate: null,
        toDate: null,
        jobOpening: null,
        granularity: 'monthly',
        activityEntity: null,
      };
      state.pagination.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Full Analytics (get_analytics)
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading.overview = true;
        state.loading.funnel = true;
        state.loading.trends = true;
        state.loading.jobMetrics = true;
        state.loading.applicationMetrics = true;
        state.loading.interviewMetrics = true;
        state.loading.offerMetrics = true;
        state.loading.timeToHire = true;
        state.errors.overview = null;
        state.errors.funnel = null;
        state.errors.trends = null;
        state.errors.jobMetrics = null;
        state.errors.applicationMetrics = null;
        state.errors.interviewMetrics = null;
        state.errors.offerMetrics = null;
        state.errors.timeToHire = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.loading.funnel = false;
        state.loading.trends = false;
        state.loading.jobMetrics = false;
        state.loading.applicationMetrics = false;
        state.loading.interviewMetrics = false;
        state.loading.offerMetrics = false;
        state.loading.timeToHire = false;

        if (action.payload) {
          state.overview = action.payload.overview;
          state.funnel = action.payload.funnel;
          state.trends = action.payload.trends;
          state.jobMetrics = action.payload.jobMetrics;
          state.applicationMetrics = action.payload.applicationMetrics;
          state.interviewMetrics = action.payload.interviewMetrics;
          state.offerMetrics = action.payload.offerMetrics;
          state.timeToHire = action.payload.timeToHire;
        }
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading.overview = false;
        state.loading.funnel = false;
        state.loading.trends = false;
        state.loading.jobMetrics = false;
        state.loading.applicationMetrics = false;
        state.loading.interviewMetrics = false;
        state.loading.offerMetrics = false;
        state.loading.timeToHire = false;
        state.errors.overview = action.payload;
      })

      // Overview
      .addCase(fetchOverview.pending, (state) => {
        state.loading.overview = true;
        state.errors.overview = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.loading.overview = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.loading.overview = false;
        state.errors.overview = action.payload;
      })

      // Funnel
      .addCase(fetchFunnel.pending, (state) => {
        state.loading.funnel = true;
        state.errors.funnel = null;
      })
      .addCase(fetchFunnel.fulfilled, (state, action) => {
        state.loading.funnel = false;
        state.funnel = action.payload;
      })
      .addCase(fetchFunnel.rejected, (state, action) => {
        state.loading.funnel = false;
        state.errors.funnel = action.payload;
      })

      // Trends
      .addCase(fetchTrends.pending, (state) => {
        state.loading.trends = true;
        state.errors.trends = null;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.loading.trends = false;
        state.trends = action.payload;
      })
      .addCase(fetchTrends.rejected, (state, action) => {
        state.loading.trends = false;
        state.errors.trends = action.payload;
      })

      // Job Metrics
      .addCase(fetchJobMetrics.pending, (state) => {
        state.loading.jobMetrics = true;
        state.errors.jobMetrics = null;
      })
      .addCase(fetchJobMetrics.fulfilled, (state, action) => {
        state.loading.jobMetrics = false;
        state.jobMetrics = action.payload;
      })
      .addCase(fetchJobMetrics.rejected, (state, action) => {
        state.loading.jobMetrics = false;
        state.errors.jobMetrics = action.payload;
      })

      // Application Metrics
      .addCase(fetchApplicationMetrics.pending, (state) => {
        state.loading.applicationMetrics = true;
        state.errors.applicationMetrics = null;
      })
      .addCase(fetchApplicationMetrics.fulfilled, (state, action) => {
        state.loading.applicationMetrics = false;
        state.applicationMetrics = action.payload;
      })
      .addCase(fetchApplicationMetrics.rejected, (state, action) => {
        state.loading.applicationMetrics = false;
        state.errors.applicationMetrics = action.payload;
      })

      // Interview Metrics
      .addCase(fetchInterviewMetrics.pending, (state) => {
        state.loading.interviewMetrics = true;
        state.errors.interviewMetrics = null;
      })
      .addCase(fetchInterviewMetrics.fulfilled, (state, action) => {
        state.loading.interviewMetrics = false;
        state.interviewMetrics = action.payload;
      })
      .addCase(fetchInterviewMetrics.rejected, (state, action) => {
        state.loading.interviewMetrics = false;
        state.errors.interviewMetrics = action.payload;
      })

      // Offer Metrics
      .addCase(fetchOfferMetrics.pending, (state) => {
        state.loading.offerMetrics = true;
        state.errors.offerMetrics = null;
      })
      .addCase(fetchOfferMetrics.fulfilled, (state, action) => {
        state.loading.offerMetrics = false;
        state.offerMetrics = action.payload;
      })
      .addCase(fetchOfferMetrics.rejected, (state, action) => {
        state.loading.offerMetrics = false;
        state.errors.offerMetrics = action.payload;
      })

      // Time To Hire
      .addCase(fetchTimeToHire.pending, (state) => {
        state.loading.timeToHire = true;
        state.errors.timeToHire = null;
      })
      .addCase(fetchTimeToHire.fulfilled, (state, action) => {
        state.loading.timeToHire = false;
        state.timeToHire = action.payload;
      })
      .addCase(fetchTimeToHire.rejected, (state, action) => {
        state.loading.timeToHire = false;
        state.errors.timeToHire = action.payload;
      })

      // Recent Activity
      .addCase(fetchRecentActivity.pending, (state) => {
        state.loading.activity = true;
        state.errors.activity = null;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.loading.activity = false;
        state.recentActivity = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.loading.activity = false;
        state.errors.activity = action.payload;
      });
  },
});

export const {
  setFilters,
  setGranularity,
  setActivityEntity,
  setActivityPage,
  resetFilters,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
