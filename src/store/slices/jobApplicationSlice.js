import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobApplicationApi } from '../../services/jobApplicationApi';

const initialState = {
  items: [],
  selectedApplication: null,
  loading: false,
  loadingDetails: false,
  saving: false,
  deleting: false,
  changingStatus: false,
  changingStage: false,
  actionStatus: null, // null | { type: 'create_success' | 'update_success' | 'status_success' | 'stage_success' | 'delete_success', message?: string }
  error: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {
    status: null,
    currentStage: null,
    candidate: null,
    jobOpening: null,
    source: null,
    priority: null,
  },
  sorting: {
    orderBy: 'creation',
    orderDir: 'desc',
  },
  search: '',
};

// Async Thunks
export const fetchApplications = createAsyncThunk(
  'jobApplication/fetchApplications',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().jobApplication;
      const page = overrideParams.page || state.pagination.page;
      const pageSize = overrideParams.pageSize || state.pagination.pageSize;
      const search = overrideParams.search !== undefined ? overrideParams.search : state.search;
      const status = overrideParams.status !== undefined ? overrideParams.status : state.filters.status;
      const currentStage = overrideParams.currentStage !== undefined ? overrideParams.currentStage : state.filters.currentStage;
      const candidate = overrideParams.candidate !== undefined ? overrideParams.candidate : state.filters.candidate;
      const jobOpening = overrideParams.jobOpening !== undefined ? overrideParams.jobOpening : state.filters.jobOpening;
      const source = overrideParams.source !== undefined ? overrideParams.source : state.filters.source;
      const priority = overrideParams.priority !== undefined ? overrideParams.priority : state.filters.priority;
      const orderBy = overrideParams.orderBy || state.sorting.orderBy;
      const orderDir = overrideParams.orderDir || state.sorting.orderDir;

      let result;
      if (search && search.trim() !== '') {
        result = await jobApplicationApi.searchApplications({
          search: search.trim(),
          page,
          pageSize,
          status,
          currentStage,
          candidate,
          jobOpening,
          source,
          priority,
          orderBy,
          orderDir,
        });
      } else {
        result = await jobApplicationApi.listApplications({
          page,
          pageSize,
          status,
          currentStage,
          candidate,
          jobOpening,
          source,
          priority,
          orderBy,
          orderDir,
        });
      }

      return {
        result,
        params: { page, pageSize, search, status, currentStage, candidate, jobOpening, source, priority, orderBy, orderDir },
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch job applications');
    }
  }
);

export const searchApplications = createAsyncThunk(
  'jobApplication/searchApplications',
  async (searchQuery, { dispatch }) => {
    return dispatch(fetchApplications({ search: searchQuery, page: 1 }));
  }
);

export const fetchApplicationDetails = createAsyncThunk(
  'jobApplication/fetchApplicationDetails',
  async (applicationId, { rejectWithValue }) => {
    try {
      const data = await jobApplicationApi.getApplication(applicationId);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch application details');
    }
  }
);

export const createApplication = createAsyncThunk(
  'jobApplication/createApplication',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await jobApplicationApi.createApplication(payload);
      dispatch(fetchApplications({ page: 1 }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create job application');
    }
  }
);

export const updateApplication = createAsyncThunk(
  'jobApplication/updateApplication',
  async ({ applicationId, data }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await jobApplicationApi.updateApplication(applicationId, data);
      dispatch(fetchApplications());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update job application');
    }
  }
);

export const changeApplicationStatus = createAsyncThunk(
  'jobApplication/changeApplicationStatus',
  async ({ applicationId, status, rejectionReason }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await jobApplicationApi.changeStatus(applicationId, status, rejectionReason);
      dispatch(fetchApplications());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update application status');
    }
  }
);

export const changeApplicationStage = createAsyncThunk(
  'jobApplication/changeApplicationStage',
  async ({ applicationId, stage }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await jobApplicationApi.changeStage(applicationId, stage);
      dispatch(fetchApplications());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update recruitment stage');
    }
  }
);

export const deleteApplication = createAsyncThunk(
  'jobApplication/deleteApplication',
  async (applicationId, { dispatch, rejectWithValue }) => {
    try {
      const res = await jobApplicationApi.deleteApplication(applicationId);
      dispatch(fetchApplications());
      return { applicationId, res };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete job application');
    }
  }
);

const jobApplicationSlice = createSlice({
  name: 'jobApplication',
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
    setSorting: (state, action) => {
      state.sorting = { ...state.sorting, ...action.payload };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setSelectedApplication: (state, action) => {
      state.selectedApplication = action.payload;
    },
    clearSelectedApplication: (state) => {
      state.selectedApplication = null;
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
      // fetchApplications
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
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
        state.filters.currentStage = params.currentStage;
        state.filters.candidate = params.candidate;
        state.filters.jobOpening = params.jobOpening;
        state.filters.source = params.source;
        state.filters.priority = params.priority;
        state.sorting.orderBy = params.orderBy;
        state.sorting.orderDir = params.orderDir;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchApplicationDetails
      .addCase(fetchApplicationDetails.pending, (state) => {
        state.loadingDetails = true;
      })
      .addCase(fetchApplicationDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedApplication = action.payload;
      })
      .addCase(fetchApplicationDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })

      // createApplication
      .addCase(createApplication.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'create_success' };
        state.selectedApplication = action.payload;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // updateApplication
      .addCase(updateApplication.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateApplication.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'update_success' };
        state.selectedApplication = action.payload;
      })
      .addCase(updateApplication.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // changeApplicationStatus
      .addCase(changeApplicationStatus.pending, (state) => {
        state.changingStatus = true;
        state.saving = true;
        state.error = null;
      })
      .addCase(changeApplicationStatus.fulfilled, (state, action) => {
        state.changingStatus = false;
        state.saving = false;
        state.actionStatus = { type: 'status_success' };
        state.selectedApplication = action.payload;
      })
      .addCase(changeApplicationStatus.rejected, (state, action) => {
        state.changingStatus = false;
        state.saving = false;
        state.error = action.payload;
      })

      // changeApplicationStage
      .addCase(changeApplicationStage.pending, (state) => {
        state.changingStage = true;
        state.saving = true;
        state.error = null;
      })
      .addCase(changeApplicationStage.fulfilled, (state, action) => {
        state.changingStage = false;
        state.saving = false;
        state.actionStatus = { type: 'stage_success' };
        state.selectedApplication = action.payload;
      })
      .addCase(changeApplicationStage.rejected, (state, action) => {
        state.changingStage = false;
        state.saving = false;
        state.error = action.payload;
      })

      // deleteApplication
      .addCase(deleteApplication.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteApplication.fulfilled, (state, action) => {
        state.deleting = false;
        state.actionStatus = { type: 'delete_success' };
        if (state.selectedApplication?.id === action.payload.applicationId) {
          state.selectedApplication = null;
        }
      })
      .addCase(deleteApplication.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSearch,
  setFilters,
  resetFilters,
  setSorting,
  setPage,
  setPageSize,
  setSelectedApplication,
  clearSelectedApplication,
  clearError,
  clearActionStatus,
} = jobApplicationSlice.actions;

export const selectApplicationItems = (state) => state.jobApplication.items;
export const selectSelectedApplication = (state) => state.jobApplication.selectedApplication;
export const selectApplicationLoading = (state) => state.jobApplication.loading;
export const selectApplicationLoadingDetails = (state) => state.jobApplication.loadingDetails;
export const selectApplicationSaving = (state) => state.jobApplication.saving;
export const selectApplicationDeleting = (state) => state.jobApplication.deleting;
export const selectApplicationChangingStatus = (state) => state.jobApplication.changingStatus;
export const selectApplicationChangingStage = (state) => state.jobApplication.changingStage;
export const selectApplicationActionStatus = (state) => state.jobApplication.actionStatus;
export const selectApplicationError = (state) => state.jobApplication.error;
export const selectApplicationPagination = (state) => state.jobApplication.pagination;
export const selectApplicationFilters = (state) => state.jobApplication.filters;
export const selectApplicationSorting = (state) => state.jobApplication.sorting;
export const selectApplicationSearch = (state) => state.jobApplication.search;

export default jobApplicationSlice.reducer;
