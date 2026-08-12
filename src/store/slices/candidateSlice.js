import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidateApi } from '../../services/candidateApi';

const initialState = {
  list: [],
  selectedCandidate: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  drawerLoading: false,
  actionStatus: 'idle', // 'idle' | 'saving' | 'deleting' | 'succeeded' | 'failed'
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
    status: null,
    profession: null,
    country: null,
    employmentType: null,
    orderBy: 'creation desc',
  },
};

// Async Thunks
export const fetchCandidates = createAsyncThunk(
  'candidate/fetchCandidates',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().candidate;
      const params = {
        page: overrideParams.page || state.pagination.page,
        pageSize: overrideParams.pageSize || state.pagination.pageSize,
        search: overrideParams.search !== undefined ? overrideParams.search : state.filters.search,
        status: overrideParams.status !== undefined ? overrideParams.status : state.filters.status,
        profession: overrideParams.profession !== undefined ? overrideParams.profession : state.filters.profession,
        employmentType:
          overrideParams.employmentType !== undefined
            ? overrideParams.employmentType
            : state.filters.employmentType,
        country: overrideParams.country !== undefined ? overrideParams.country : state.filters.country,
        orderBy: overrideParams.orderBy || state.filters.orderBy,
      };

      const result = await candidateApi.listCandidates(params);
      return { result, params };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch candidate list');
    }
  }
);

export const fetchCandidateById = createAsyncThunk(
  'candidate/fetchCandidateById',
  async (candidateId, { rejectWithValue }) => {
    try {
      const data = await candidateApi.getCandidate(candidateId);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch candidate profile');
    }
  }
);

export const createCandidate = createAsyncThunk(
  'candidate/createCandidate',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await candidateApi.createCandidate(payload);
      dispatch(fetchCandidates({ page: 1 }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create candidate');
    }
  }
);

export const updateCandidate = createAsyncThunk(
  'candidate/updateCandidate',
  async ({ candidateId, data }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await candidateApi.updateCandidate(candidateId, data);
      dispatch(fetchCandidates());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update candidate');
    }
  }
);

export const deleteCandidate = createAsyncThunk(
  'candidate/deleteCandidate',
  async (candidateId, { dispatch, rejectWithValue }) => {
    try {
      await candidateApi.deleteCandidate(candidateId);
      dispatch(fetchCandidates());
      return candidateId;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete candidate');
    }
  }
);

export const saveSubresource = createAsyncThunk(
  'candidate/saveSubresource',
  async ({ candidateId, resourceType, items }, { dispatch, rejectWithValue }) => {
    try {
      let result;
      switch (resourceType) {
        case 'education':
          result = await candidateApi.updateEducation(candidateId, items);
          break;
        case 'experience':
          result = await candidateApi.updateExperience(candidateId, items);
          break;
        case 'skills':
          result = await candidateApi.updateSkills(candidateId, items);
          break;
        case 'languages':
          result = await candidateApi.updateLanguages(candidateId, items);
          break;
        case 'certifications':
          result = await candidateApi.updateCertifications(candidateId, items);
          break;
        case 'documents':
          result = await candidateApi.updateDocuments(candidateId, items);
          break;
        default:
          throw new Error(`Unsupported resource type ${resourceType}`);
      }
      // Refresh candidate profile
      dispatch(fetchCandidateById(candidateId));
      return { candidateId, resourceType, result };
    } catch (err) {
      return rejectWithValue(err.message || `Failed to update ${resourceType}`);
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setCandidateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to page 1 on filter change
    },
    resetCandidateFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
    },
    clearCandidateError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCandidates
      .addCase(fetchCandidates.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        const { result, params } = action.payload;
        state.status = 'succeeded';
        state.list = result.items;
        state.pagination = {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        };
        state.filters = { ...state.filters, ...params };
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // fetchCandidateById
      .addCase(fetchCandidateById.pending, (state) => {
        state.drawerLoading = true;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.drawerLoading = false;
        state.selectedCandidate = action.payload;
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.drawerLoading = false;
        state.error = action.payload;
      })

      // createCandidate
      .addCase(createCandidate.pending, (state) => {
        state.actionStatus = 'saving';
        state.error = null;
      })
      .addCase(createCandidate.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.selectedCandidate = action.payload;
      })
      .addCase(createCandidate.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      // updateCandidate
      .addCase(updateCandidate.pending, (state) => {
        state.actionStatus = 'saving';
        state.error = null;
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        state.actionStatus = 'succeeded';
        state.selectedCandidate = action.payload;
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      })

      // deleteCandidate
      .addCase(deleteCandidate.pending, (state) => {
        state.actionStatus = 'deleting';
        state.error = null;
      })
      .addCase(deleteCandidate.fulfilled, (state) => {
        state.actionStatus = 'succeeded';
        state.selectedCandidate = null;
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setCandidateFilters,
  resetCandidateFilters,
  setSelectedCandidate,
  clearSelectedCandidate,
  clearCandidateError,
} = candidateSlice.actions;

export const selectCandidateList = (state) => state.candidate.list;
export const selectSelectedCandidate = (state) => state.candidate.selectedCandidate;
export const selectCandidateStatus = (state) => state.candidate.status;
export const selectCandidateDrawerLoading = (state) => state.candidate.drawerLoading;
export const selectCandidateActionStatus = (state) => state.candidate.actionStatus;
export const selectCandidateError = (state) => state.candidate.error;
export const selectCandidatePagination = (state) => state.candidate.pagination;
export const selectCandidateFilters = (state) => state.candidate.filters;

export default candidateSlice.reducer;
