import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBillingOverview,
  fetchSubscription,
  fetchUsage,
  fetchPlans,
  fetchInvoices,
  fetchPaymentHistory,
  fetchUpgradePreview,
  fetchAllBillingData,
  clearUpgradePreview,
  clearBillingError,
} from '../store/slices/billingSlice';

/**
 * Custom hook to interact with Billing state & API actions
 */
export const useBilling = () => {
  const dispatch = useDispatch();
  const billingState = useSelector((state) => state.billing || {});

  const {
    overview,
    subscription,
    usage,
    plans = [],
    invoices = [],
    paymentHistory = [],
    upgradePreviewData,
    loading = false,
    updating = false,
    error = null,
  } = billingState;

  const handleFetchBillingOverview = useCallback(() => {
    return dispatch(fetchBillingOverview()).unwrap();
  }, [dispatch]);

  const handleFetchSubscription = useCallback(() => {
    return dispatch(fetchSubscription()).unwrap();
  }, [dispatch]);

  const handleFetchUsage = useCallback(() => {
    return dispatch(fetchUsage()).unwrap();
  }, [dispatch]);

  const handleFetchPlans = useCallback(() => {
    return dispatch(fetchPlans()).unwrap();
  }, [dispatch]);

  const handleFetchInvoices = useCallback(() => {
    return dispatch(fetchInvoices()).unwrap();
  }, [dispatch]);

  const handleFetchPaymentHistory = useCallback(() => {
    return dispatch(fetchPaymentHistory()).unwrap();
  }, [dispatch]);

  const handleUpgradePreview = useCallback(
    (planName) => {
      return dispatch(fetchUpgradePreview(planName)).unwrap();
    },
    [dispatch]
  );

  const handleClearPreview = useCallback(() => {
    dispatch(clearUpgradePreview());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearBillingError());
  }, [dispatch]);

  const handleRefreshAll = useCallback(() => {
    return dispatch(fetchAllBillingData()).unwrap();
  }, [dispatch]);

  return {
    overview,
    subscription,
    usage,
    plans,
    invoices,
    paymentHistory,
    upgradePreviewData,
    loading,
    updating,
    error,
    fetchBillingOverview: handleFetchBillingOverview,
    fetchSubscription: handleFetchSubscription,
    fetchUsage: handleFetchUsage,
    fetchPlans: handleFetchPlans,
    fetchInvoices: handleFetchInvoices,
    fetchPaymentHistory: handleFetchPaymentHistory,
    upgradePreview: handleUpgradePreview,
    clearPreview: handleClearPreview,
    clearError: handleClearError,
    refreshAll: handleRefreshAll,
  };
};

export default useBilling;
