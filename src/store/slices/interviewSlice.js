import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interviewApi } from '../../services/interviewApi';

const initialState = {
  items: [],
  selectedInterview: null,
  loading: false,
  loadingDetails: false,
  saving: false,
  deleting: false,
  actionStatus: null, // null | { type: 'create_success' | 'update_success' | 'status_success' | 'delete_success', message?: string }
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: null,
    interviewType: null,
    candidate: null,
    jobOpening: null,
    jobApplication: null,
    interviewer: null,
    scheduledOn: null,
    orderBy: 'creation',
    orderDir: 'desc',
  },
  search: '',
};

// Async Thunks
export const fetchInterviews = createAsyncThunk(
  'interview/fetchInterviews',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().interview;
      const page = overrideParams.page || state.pagination.page;
      const pageSize = overrideParams.pageSize || state.pagination.pageSize;
      const search = overrideParams.search !== undefined ? overrideParams.search : state.search;
      const status = overrideParams.status !== undefined ? overrideParams.status : state.filters.status;
      const interviewType = overrideParams.interviewType !== undefined ? overrideParams.interviewType : state.filters.interviewType;
      const candidate = overrideParams.candidate !== undefined ? overrideParams.candidate : state.filters.candidate;
      const jobOpening = overrideParams.jobOpening !== undefined ? overrideParams.jobOpening : state.filters.jobOpening;
      const jobApplication = overrideParams.jobApplication !== undefined ? overrideParams.jobApplication : state.filters.jobApplication;
      const interviewer = overrideParams.interviewer !== undefined ? overrideParams.interviewer : state.filters.interviewer;
      const scheduledOn = overrideParams.scheduledOn !== undefined ? overrideParams.scheduledOn : state.filters.scheduledOn;

      let result;
      if (search && search.trim() !== '') {
        result = await interviewApi.searchInterviews({
          search: search.trim(),
          page,
          pageSize,
          status,
          interviewType,
          candidate,
          jobOpening,
          jobApplication,
          interviewer,
          scheduledOn,
        });
      } else {
        result = await interviewApi.listInterviews({
          page,
          pageSize,
          status,
          interviewType,
          candidate,
          jobOpening,
          jobApplication,
          interviewer,
          scheduledOn,
        });
      }

      return {
        result,
        params: {
          page,
          pageSize,
          search,
          status,
          interviewType,
          candidate,
          jobOpening,
          jobApplication,
          interviewer,
          scheduledOn,
        },
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch interviews');
    }
  }
);

export const fetchInterviewDetails = createAsyncThunk(
  'interview/fetchInterviewDetails',
  async (interviewId, { rejectWithValue }) => {
    try {
      const data = await interviewApi.getInterview(interviewId);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch interview details');
    }
  }
);

export const createInterview = createAsyncThunk(
  'interview/createInterview',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await interviewApi.createInterview(payload);
      dispatch(fetchInterviews({ page: 1 }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to schedule interview');
    }
  }
);

export const updateInterview = createAsyncThunk(
  'interview/updateInterview',
  async ({ interviewId, data }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await interviewApi.updateInterview(interviewId, data);
      dispatch(fetchInterviews());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update interview');
    }
  }
);

export const changeInterviewStatus = createAsyncThunk(
  'interview/changeInterviewStatus',
  async ({ interviewId, status }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await interviewApi.changeStatus(interviewId, status);
      dispatch(fetchInterviews());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update interview status');
    }
  }
);

export const deleteInterview = createAsyncThunk(
  'interview/deleteInterview',
  async (interviewId, { dispatch, rejectWithValue }) => {
    try {
      const res = await interviewApi.deleteInterview(interviewId);
      dispatch(fetchInterviews());
      return { interviewId, res };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete interview');
    }
  }
);

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.pagination.page = 1; // Server-side search resets to page 1
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Filter change resets to page 1
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.search = '';
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setSelectedInterview: (state, action) => {
      state.selectedInterview = action.payload;
    },
    clearSelectedInterview: (state) => {
      state.selectedInterview = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearActionStatus: (state) => {
      state.actionStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchInterviews
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        const { result, params } = action.payload;
        state.loading = false;
        state.items = result.items;
        state.pagination = {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        };
        state.search = params.search;
        state.filters.status = params.status;
        state.filters.interviewType = params.interviewType;
        state.filters.candidate = params.candidate;
        state.filters.jobOpening = params.jobOpening;
        state.filters.jobApplication = params.jobApplication;
        state.filters.interviewer = params.interviewer;
        state.filters.scheduledOn = params.scheduledOn;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchInterviewDetails
      .addCase(fetchInterviewDetails.pending, (state) => {
        state.loadingDetails = true;
      })
      .addCase(fetchInterviewDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedInterview = action.payload;
      })
      .addCase(fetchInterviewDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })

      // createInterview
      .addCase(createInterview.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'create_success' };
        state.selectedInterview = action.payload;
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // updateInterview
      .addCase(updateInterview.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'update_success' };
        state.selectedInterview = action.payload;
      })
      .addCase(updateInterview.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // changeInterviewStatus
      .addCase(changeInterviewStatus.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(changeInterviewStatus.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'status_success' };
        state.selectedInterview = action.payload;
      })
      .addCase(changeInterviewStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // deleteInterview
      .addCase(deleteInterview.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteInterview.fulfilled, (state, action) => {
        state.deleting = false;
        state.actionStatus = { type: 'delete_success' };
        if (state.selectedInterview?.id === action.payload.interviewId) {
          state.selectedInterview = null;
        }
      })
      .addCase(deleteInterview.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearch,
  setFilters,
  resetFilters,
  setPage,
  setPageSize,
  setSelectedInterview,
  clearSelectedInterview,
  clearError,
  clearActionStatus,
} = interviewSlice.actions;

export const selectInterviewItems = (state) => state.interview.items;
export const selectSelectedInterview = (state) => state.interview.selectedInterview;
export const selectInterviewLoading = (state) => state.interview.loading;
export const selectInterviewLoadingDetails = (state) => state.interview.loadingDetails;
export const selectInterviewSaving = (state) => state.interview.saving;
export const selectInterviewDeleting = (state) => state.interview.deleting;
export const selectInterviewActionStatus = (state) => state.interview.actionStatus;
export const selectInterviewError = (state) => state.interview.error;
export const selectInterviewPagination = (state) => state.interview.pagination;
export const selectInterviewFilters = (state) => state.interview.filters;
export const selectInterviewSearch = (state) => state.interview.search;

export default interviewSlice.reducer;
