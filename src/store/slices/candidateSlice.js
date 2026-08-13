import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidateApi } from '../../services/candidateApi';
import {
  normalizeCandidate,
  normalizeCandidateList,
  normalizeProfileCompleteness,
} from '../../utils/candidateNormalizer';

const initialState = {
  list: [],
  selectedCandidate: null,
  profileCompleteness: { score: 0, completeness: 0, fields: {} },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  drawerLoading: false,
  actionStatus: 'idle', // 'idle' | 'saving' | 'deleting' | 'succeeded' | 'failed'
  error: null,
  viewMode: 'all', // 'all' | 'domestic' | 'international'
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
        country: overrideParams.country !== undefined ? overrideParams.country : state.filters.country,
        profession: overrideParams.profession !== undefined ? overrideParams.profession : state.filters.profession,
        employmentType:
          overrideParams.employmentType !== undefined
            ? overrideParams.employmentType
            : state.filters.employmentType,
        orderBy: overrideParams.orderBy || state.filters.orderBy,
      };

      const response = await candidateApi.listCandidates(params);
      const normalized = normalizeCandidateList(response);
      return { normalized, params };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch candidate list');
    }
  }
);

export const searchCandidates = createAsyncThunk(
  'candidate/searchCandidates',
  async ({ search = '', page = 1, pageSize = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await candidateApi.searchCandidates({ search, page, pageSize });
      const normalized = normalizeCandidateList(response);
      return { normalized, search };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to search candidates');
    }
  }
);

export const fetchDomesticCandidates = createAsyncThunk(
  'candidate/fetchDomesticCandidates',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().candidate;
      const params = {
        page: overrideParams.page || state.pagination.page,
        pageSize: overrideParams.pageSize || state.pagination.pageSize,
        search: overrideParams.search !== undefined ? overrideParams.search : state.filters.search,
        orderBy: overrideParams.orderBy || state.filters.orderBy,
      };
      const response = await candidateApi.listDomesticCandidates(params);
      const normalized = normalizeCandidateList(response);
      return { normalized, params };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch domestic candidates');
    }
  }
);

export const fetchInternationalCandidates = createAsyncThunk(
  'candidate/fetchInternationalCandidates',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().candidate;
      const params = {
        page: overrideParams.page || state.pagination.page,
        pageSize: overrideParams.pageSize || state.pagination.pageSize,
        search: overrideParams.search !== undefined ? overrideParams.search : state.filters.search,
        orderBy: overrideParams.orderBy || state.filters.orderBy,
      };
      const response = await candidateApi.listInternationalCandidates(params);
      const normalized = normalizeCandidateList(response);
      return { normalized, params };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch international candidates');
    }
  }
);

export const fetchCandidateById = createAsyncThunk(
  'candidate/fetchCandidateById',
  async (candidateId, { rejectWithValue }) => {
    try {
      const response = await candidateApi.getCandidate(candidateId);
      const data = normalizeCandidate(response);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch candidate profile');
    }
  }
);

export const fetchProfileCompleteness = createAsyncThunk(
  'candidate/fetchProfileCompleteness',
  async (candidateId, { rejectWithValue }) => {
    try {
      const response = await candidateApi.getProfileCompleteness(candidateId);
      const data = normalizeProfileCompleteness(response);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch profile completeness');
    }
  }
);

export const createCandidate = createAsyncThunk(
  'candidate/createCandidate',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await candidateApi.createCandidate(payload);
      const data = normalizeCandidate(response);
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
      const response = await candidateApi.updateCandidate(candidateId, data);
      const updated = normalizeCandidate(response);
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

export const updateCandidateSkills = createAsyncThunk(
  'candidate/updateCandidateSkills',
  async ({ candidateId, skills }, { dispatch, rejectWithValue }) => {
    try {
      await candidateApi.updateSkills(candidateId, skills);
      dispatch(fetchCandidateById(candidateId));
      dispatch(fetchProfileCompleteness(candidateId));
      return { candidateId, skills };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update candidate skills');
    }
  }
);

export const updateCandidateEducation = createAsyncThunk(
  'candidate/updateCandidateEducation',
  async ({ candidateId, education }, { dispatch, rejectWithValue }) => {
    try {
      await candidateApi.updateEducation(candidateId, education);
      dispatch(fetchCandidateById(candidateId));
      dispatch(fetchProfileCompleteness(candidateId));
      return { candidateId, education };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update candidate education');
    }
  }
);

export const updateCandidateExperience = createAsyncThunk(
  'candidate/updateCandidateExperience',
  async ({ candidateId, experience }, { dispatch, rejectWithValue }) => {
    try {
      await candidateApi.updateExperience(candidateId, experience);
      dispatch(fetchCandidateById(candidateId));
      dispatch(fetchProfileCompleteness(candidateId));
      return { candidateId, experience };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update candidate experience');
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
      dispatch(fetchCandidateById(candidateId));
      dispatch(fetchProfileCompleteness(candidateId));
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
      state.pagination.page = 1;
    },
    resetCandidateFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload; // 'all' | 'domestic' | 'international'
      state.pagination.page = 1;
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
      state.profileCompleteness = { score: 0, completeness: 0, fields: {} };
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
        const { normalized, params } = action.payload;
        state.status = 'succeeded';
        state.list = normalized.items;
        state.pagination = {
          page: normalized.page,
          pageSize: normalized.pageSize,
          total: normalized.total,
          totalPages: normalized.totalPages,
        };
        state.filters = { ...state.filters, ...params };
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // searchCandidates
      .addCase(searchCandidates.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchCandidates.fulfilled, (state, action) => {
        const { normalized, search } = action.payload;
        state.status = 'succeeded';
        state.list = normalized.items;
        state.pagination = {
          page: normalized.page,
          pageSize: normalized.pageSize,
          total: normalized.total,
          totalPages: normalized.totalPages,
        };
        state.filters.search = search;
      })
      .addCase(searchCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // fetchDomesticCandidates
      .addCase(fetchDomesticCandidates.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDomesticCandidates.fulfilled, (state, action) => {
        const { normalized, params } = action.payload;
        state.status = 'succeeded';
        state.list = normalized.items;
        state.pagination = {
          page: normalized.page,
          pageSize: normalized.pageSize,
          total: normalized.total,
          totalPages: normalized.totalPages,
        };
        state.filters = { ...state.filters, ...params };
      })
      .addCase(fetchDomesticCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // fetchInternationalCandidates
      .addCase(fetchInternationalCandidates.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInternationalCandidates.fulfilled, (state, action) => {
        const { normalized, params } = action.payload;
        state.status = 'succeeded';
        state.list = normalized.items;
        state.pagination = {
          page: normalized.page,
          pageSize: normalized.pageSize,
          total: normalized.total,
          totalPages: normalized.totalPages,
        };
        state.filters = { ...state.filters, ...params };
      })
      .addCase(fetchInternationalCandidates.rejected, (state, action) => {
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

      // fetchProfileCompleteness
      .addCase(fetchProfileCompleteness.fulfilled, (state, action) => {
        state.profileCompleteness = action.payload;
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
  setViewMode,
  setSelectedCandidate,
  clearSelectedCandidate,
  clearCandidateError,
} = candidateSlice.actions;

export const selectCandidateList = (state) => state.candidate.list;
export const selectSelectedCandidate = (state) => state.candidate.selectedCandidate;
export const selectProfileCompleteness = (state) => state.candidate.profileCompleteness;
export const selectCandidateStatus = (state) => state.candidate.status;
export const selectCandidateDrawerLoading = (state) => state.candidate.drawerLoading;
export const selectCandidateActionStatus = (state) => state.candidate.actionStatus;
export const selectCandidateError = (state) => state.candidate.error;
export const selectCandidateViewMode = (state) => state.candidate.viewMode;
export const selectCandidatePagination = (state) => state.candidate.pagination;
export const selectCandidateFilters = (state) => state.candidate.filters;

export default candidateSlice.reducer;

