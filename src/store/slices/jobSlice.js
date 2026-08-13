import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobApi } from '../../services/jobApi';

const initialFilters = {
  status: null,
  department: null,
  employmentType: null,
  city: null,
  state: null,
  country: null,
  remote: null,
  hybrid: null,
  published: null,
  featuredJob: null,
  location: null,
};

const initialState = {
  items: [],
  selectedJob: null,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },
  filters: { ...initialFilters },
  search: '',
  sorting: {
    orderBy: 'creation',
    orderDir: 'desc',
  },
  loading: false,
  refreshing: false,
  saving: false,
  publishing: false,
  closing: false,
  deleting: false,
  error: null,
  actionStatus: null,
};

/**
 * Fetch jobs (list or search) with current state parameters
 */
export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async ({ isRefresh = false } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().job;
      const { page, pageSize } = state.pagination;
      const { search, filters, sorting } = state;

      // Filter out null/undefined/empty string filters
      const activeFilters = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          // Convert camelCase filter key to snake_case for backend
          const snakeKey = k.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          activeFilters[snakeKey] = v;
        }
      });

      let response;
      if (search && search.trim()) {
        response = await jobApi.searchJobs({
          search: search.trim(),
          page,
          pageSize,
          filters: activeFilters,
          orderBy: sorting.orderBy,
          orderDir: sorting.orderDir,
        });
      } else {
        response = await jobApi.listJobs({
          page,
          pageSize,
          filters: activeFilters,
          orderBy: sorting.orderBy,
          orderDir: sorting.orderDir,
        });
      }

      return { ...response, isRefresh };
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to fetch jobs'));
    }
  }
);

/**
 * Fetch details of a single job
 */
export const fetchJobDetails = createAsyncThunk(
  'jobs/fetchJobDetails',
  async (jobId, { rejectWithValue }) => {
    try {
      const data = await jobApi.getJob(jobId);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to fetch job details'));
    }
  }
);

/**
 * Save draft job
 */
export const saveJobDraft = createAsyncThunk(
  'jobs/saveJobDraft',
  async ({ data, jobId = null }, { rejectWithValue }) => {
    try {
      const saved = await jobApi.saveDraft(data, jobId);
      return saved;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to save job draft'));
    }
  }
);

/**
 * Create job
 */
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (data, { rejectWithValue }) => {
    try {
      const created = await jobApi.createJob(data);
      return created;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to create job opening'));
    }
  }
);

/**
 * Update job
 */
export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ jobId, data }, { rejectWithValue }) => {
    try {
      const updated = await jobApi.updateJob(jobId, data);
      return updated;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to update job opening'));
    }
  }
);

/**
 * Publish job
 */
export const publishJob = createAsyncThunk(
  'jobs/publishJob',
  async ({ jobId, data = null }, { rejectWithValue }) => {
    try {
      const published = await jobApi.publishJob(jobId, data);
      return published;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to publish job opening'));
    }
  }
);

/**
 * Close job
 */
export const closeJob = createAsyncThunk(
  'jobs/closeJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const closed = await jobApi.closeJob(jobId);
      return closed;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to close job opening'));
    }
  }
);

/**
 * Delete job
 */
export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobApi.deleteJob(jobId);
      return jobId;
    } catch (err) {
      return rejectWithValue(err?.message || err?.error?.message || (typeof err === 'string' ? err : 'Failed to delete job opening'));
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.search = action.payload;
      state.pagination.page = 1;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters(state) {
      state.filters = { ...initialFilters };
      state.search = '';
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    setPageSize(state, action) {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setSorting(state, action) {
      state.sorting = { ...state.sorting, ...action.payload };
      state.pagination.page = 1;
    },
    setSelectedJob(state, action) {
      state.selectedJob = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    clearActionStatus(state) {
      state.actionStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchJobs
      .addCase(fetchJobs.pending, (state, action) => {
        if (action.meta.arg?.isRefresh) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.items = action.payload.items;
        state.pagination.total = action.payload.total;
        state.pagination.page = action.payload.page;
        state.pagination.pageSize = action.payload.pageSize;
        state.pagination.totalPages = action.payload.totalPages;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload;
      })

      // fetchJobDetails
      .addCase(fetchJobDetails.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.error = action.payload;
      })

      // saveJobDraft
      .addCase(saveJobDraft.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveJobDraft.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedJob = action.payload;
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        state.actionStatus = { type: 'save_draft_success', message: 'Job Opening draft saved.' };
      })
      .addCase(saveJobDraft.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // createJob
      .addCase(createJob.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedJob = action.payload;
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        } else {
          state.items.unshift(action.payload);
        }
        state.actionStatus = { type: 'create_success', message: 'Job Opening created successfully.' };
      })
      .addCase(createJob.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // updateJob
      .addCase(updateJob.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.saving = false;
        state.selectedJob = action.payload;
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
        state.actionStatus = { type: 'update_success', message: 'Job Opening updated successfully.' };
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // publishJob
      .addCase(publishJob.pending, (state) => {
        state.publishing = true;
        state.error = null;
      })
      .addCase(publishJob.fulfilled, (state, action) => {
        state.publishing = false;
        state.selectedJob = action.payload;
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
        state.actionStatus = { type: 'publish_success', message: 'Job Opening published successfully.' };
      })
      .addCase(publishJob.rejected, (state, action) => {
        state.publishing = false;
        state.error = action.payload;
      })

      // closeJob
      .addCase(closeJob.pending, (state) => {
        state.closing = true;
        state.error = null;
      })
      .addCase(closeJob.fulfilled, (state, action) => {
        state.closing = false;
        state.selectedJob = action.payload;
        const idx = state.items.findIndex((j) => j.id === action.payload.id);
        if (idx >= 0) {
          state.items[idx] = action.payload;
        }
        state.actionStatus = { type: 'close_success', message: 'Job Opening closed successfully.' };
      })
      .addCase(closeJob.rejected, (state, action) => {
        state.closing = false;
        state.error = action.payload;
      })

      // deleteJob
      .addCase(deleteJob.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((j) => j.id !== action.payload);
        if (state.selectedJob?.id === action.payload) {
          state.selectedJob = null;
        }
        state.actionStatus = { type: 'delete_success', message: 'Job Opening deleted successfully.' };
      })
      .addCase(deleteJob.rejected, (state, action) => {
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
  setSorting,
  setSelectedJob,
  clearError,
  clearActionStatus,
} = jobSlice.actions;

export default jobSlice.reducer;
