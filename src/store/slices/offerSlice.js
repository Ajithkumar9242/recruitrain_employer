import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { offerApi } from '../../services/offerApi';

const initialState = {
  items: [],
  selectedOffer: null,
  loading: false,
  loadingDetails: false,
  saving: false,
  deleting: false,
  actionStatus: null,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    offerStatus: null,
    jobApplication: null,
    candidate: null,
    jobOpening: null,
    orderBy: 'creation',
    orderDir: 'desc',
  },
  search: '',
};

// Async Thunks
export const fetchOffers = createAsyncThunk(
  'offer/fetchOffers',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState().offer;
      const page = overrideParams.page || state.pagination.page;
      const pageSize = overrideParams.pageSize || state.pagination.pageSize;
      const search = overrideParams.search !== undefined ? overrideParams.search : state.search;
      const offerStatus = overrideParams.offerStatus !== undefined ? overrideParams.offerStatus : state.filters.offerStatus;
      const jobApplication = overrideParams.jobApplication !== undefined ? overrideParams.jobApplication : state.filters.jobApplication;
      const candidate = overrideParams.candidate !== undefined ? overrideParams.candidate : state.filters.candidate;
      const jobOpening = overrideParams.jobOpening !== undefined ? overrideParams.jobOpening : state.filters.jobOpening;

      let result;
      if (search && search.trim() !== '') {
        result = await offerApi.searchOffers({
          search: search.trim(),
          page,
          pageSize,
          offerStatus,
          jobApplication,
          candidate,
          jobOpening,
        });
      } else {
        result = await offerApi.listOffers({
          page,
          pageSize,
          offerStatus,
          jobApplication,
          candidate,
          jobOpening,
        });
      }

      return {
        result,
        params: {
          page,
          pageSize,
          search,
          offerStatus,
          jobApplication,
          candidate,
          jobOpening,
        },
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch offers');
    }
  }
);

export const fetchOfferDetails = createAsyncThunk(
  'offer/fetchOfferDetails',
  async (offerId, { rejectWithValue }) => {
    try {
      const data = await offerApi.getOffer(offerId);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch offer details');
    }
  }
);

export const createOffer = createAsyncThunk(
  'offer/createOffer',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await offerApi.createOffer(payload);
      dispatch(fetchOffers({ page: 1 }));
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create offer');
    }
  }
);

export const updateOffer = createAsyncThunk(
  'offer/updateOffer',
  async ({ offerId, data }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await offerApi.updateOffer(offerId, data);
      dispatch(fetchOffers());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update offer');
    }
  }
);

export const changeOfferStatus = createAsyncThunk(
  'offer/changeOfferStatus',
  async ({ offerId, status }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await offerApi.changeStatus(offerId, status);
      dispatch(fetchOffers());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update offer status');
    }
  }
);

export const sendOffer = createAsyncThunk(
  'offer/sendOffer',
  async (offerId, { dispatch, rejectWithValue }) => {
    try {
      const updated = await offerApi.sendOffer(offerId);
      dispatch(fetchOffers());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send offer');
    }
  }
);

export const acceptOffer = createAsyncThunk(
  'offer/acceptOffer',
  async (offerId, { dispatch, rejectWithValue }) => {
    try {
      const updated = await offerApi.acceptOffer(offerId);
      dispatch(fetchOffers());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to accept offer');
    }
  }
);

export const rejectOffer = createAsyncThunk(
  'offer/rejectOffer',
  async (offerId, { dispatch, rejectWithValue }) => {
    try {
      const updated = await offerApi.rejectOffer(offerId);
      dispatch(fetchOffers());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reject offer');
    }
  }
);

export const withdrawOffer = createAsyncThunk(
  'offer/withdrawOffer',
  async (offerId, { dispatch, rejectWithValue }) => {
    try {
      const updated = await offerApi.withdrawOffer(offerId);
      dispatch(fetchOffers());
      return updated;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to withdraw offer');
    }
  }
);

export const deleteOffer = createAsyncThunk(
  'offer/deleteOffer',
  async (offerId, { dispatch, rejectWithValue }) => {
    try {
      const res = await offerApi.deleteOffer(offerId);
      dispatch(fetchOffers());
      return { offerId, res };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete offer');
    }
  }
);

const offerSlice = createSlice({
  name: 'offer',
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
    setSelectedOffer: (state, action) => {
      state.selectedOffer = action.payload;
    },
    clearSelectedOffer: (state) => {
      state.selectedOffer = null;
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
      // fetchOffers
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
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
        state.filters.offerStatus = params.offerStatus;
        state.filters.jobApplication = params.jobApplication;
        state.filters.candidate = params.candidate;
        state.filters.jobOpening = params.jobOpening;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchOfferDetails
      .addCase(fetchOfferDetails.pending, (state) => {
        state.loadingDetails = true;
        state.selectedOffer = null;
        state.error = null;
      })
      .addCase(fetchOfferDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedOffer = action.payload;
      })
      .addCase(fetchOfferDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.selectedOffer = null;
        state.error = action.payload;
      })

      // createOffer
      .addCase(createOffer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'create_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // updateOffer
      .addCase(updateOffer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'update_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(updateOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // changeOfferStatus
      .addCase(changeOfferStatus.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(changeOfferStatus.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'status_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(changeOfferStatus.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // sendOffer
      .addCase(sendOffer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(sendOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'send_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(sendOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // acceptOffer
      .addCase(acceptOffer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'accept_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(acceptOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // rejectOffer
      .addCase(rejectOffer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(rejectOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'reject_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(rejectOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // withdrawOffer
      .addCase(withdrawOffer.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(withdrawOffer.fulfilled, (state, action) => {
        state.saving = false;
        state.actionStatus = { type: 'withdraw_success' };
        state.selectedOffer = action.payload;
      })
      .addCase(withdrawOffer.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // deleteOffer
      .addCase(deleteOffer.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.deleting = false;
        state.actionStatus = { type: 'delete_success' };
        if (state.selectedOffer?.id === action.payload.offerId) {
          state.selectedOffer = null;
        }
      })
      .addCase(deleteOffer.rejected, (state, action) => {
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
  setSelectedOffer,
  clearSelectedOffer,
  clearError,
  clearActionStatus,
} = offerSlice.actions;

export const selectOfferItems = (state) => state.offer.items;
export const selectSelectedOffer = (state) => state.offer.selectedOffer;
export const selectOfferLoading = (state) => state.offer.loading;
export const selectOfferLoadingDetails = (state) => state.offer.loadingDetails;
export const selectOfferSaving = (state) => state.offer.saving;
export const selectOfferDeleting = (state) => state.offer.deleting;
export const selectOfferActionStatus = (state) => state.offer.actionStatus;
export const selectOfferError = (state) => state.offer.error;
export const selectOfferPagination = (state) => state.offer.pagination;
export const selectOfferFilters = (state) => state.offer.filters;
export const selectOfferSearch = (state) => state.offer.search;

export default offerSlice.reducer;
