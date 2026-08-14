import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import billingApi from '../../services/billingApi';

const initialState = {
  overview: null,
  subscription: null,
  usage: null,
  plans: [],
  invoices: [],
  paymentHistory: [],
  upgradePreviewData: null,
  loading: false,
  updating: false,
  error: null,
};

export const fetchBillingOverview = createAsyncThunk(
  'billing/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getBillingOverview();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load billing overview');
    }
  }
);

export const fetchSubscription = createAsyncThunk(
  'billing/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getCurrentSubscription();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load subscription details');
    }
  }
);

export const fetchUsage = createAsyncThunk(
  'billing/fetchUsage',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getUsage();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load subscription usage');
    }
  }
);

export const fetchPlans = createAsyncThunk(
  'billing/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getAvailablePlans();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load available plans');
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getInvoices();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load invoices');
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'billing/fetchPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await billingApi.getPaymentHistory();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load payment history');
    }
  }
);

export const fetchUpgradePreview = createAsyncThunk(
  'billing/fetchUpgradePreview',
  async (planName, { rejectWithValue }) => {
    try {
      return await billingApi.upgradePreview(planName);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to generate upgrade preview');
    }
  }
);

export const fetchAllBillingData = createAsyncThunk(
  'billing/fetchAll',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await Promise.all([
        dispatch(fetchBillingOverview()),
        dispatch(fetchSubscription()),
        dispatch(fetchUsage()),
        dispatch(fetchPlans()),
        dispatch(fetchInvoices()),
        dispatch(fetchPaymentHistory()),
      ]);
      return true;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch billing data');
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearUpgradePreview: (state) => {
      state.upgradePreviewData = null;
    },
    clearBillingError: (state) => {
      state.error = null;
    },
    resetBillingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // fetchBillingOverview
      .addCase(fetchBillingOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.overview = action.payload;
      })
      .addCase(fetchBillingOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchSubscription
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.subscription = action.payload;
      })

      // fetchUsage
      .addCase(fetchUsage.fulfilled, (state, action) => {
        state.usage = action.payload;
      })

      // fetchPlans
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plans = action.payload;
      })

      // fetchInvoices
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
      })

      // fetchPaymentHistory
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.paymentHistory = action.payload;
      })

      // fetchUpgradePreview
      .addCase(fetchUpgradePreview.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(fetchUpgradePreview.fulfilled, (state, action) => {
        state.updating = false;
        state.upgradePreviewData = action.payload;
      })
      .addCase(fetchUpgradePreview.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // fetchAllBillingData
      .addCase(fetchAllBillingData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBillingData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchAllBillingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUpgradePreview, clearBillingError, resetBillingState } = billingSlice.actions;

export default billingSlice.reducer;
