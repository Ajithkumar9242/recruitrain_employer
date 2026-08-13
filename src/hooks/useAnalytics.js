import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOverview as fetchOverviewThunk,
  fetchFunnel as fetchFunnelThunk,
  fetchTrends as fetchTrendsThunk,
  fetchJobMetrics as fetchJobMetricsThunk,
  fetchApplicationMetrics as fetchApplicationMetricsThunk,
  fetchInterviewMetrics as fetchInterviewMetricsThunk,
  fetchOfferMetrics as fetchOfferMetricsThunk,
  fetchTimeToHire as fetchTimeToHireThunk,
  fetchRecentActivity as fetchRecentActivityThunk,
  fetchAllAnalytics as fetchAllAnalyticsThunk,
  setFilters as setFiltersAction,
  setGranularity as setGranularityAction,
  setActivityEntity as setActivityEntityAction,
  setActivityPage as setActivityPageAction,
  resetFilters as resetFiltersAction,
} from '../store/slices/analyticsSlice';

export const useAnalytics = () => {
  const dispatch = useDispatch();
  const analyticsState = useSelector((state) => state.analytics);

  const {
    overview,
    funnel,
    trends,
    jobMetrics,
    applicationMetrics,
    interviewMetrics,
    offerMetrics,
    timeToHire,
    recentActivity,
    filters,
    pagination,
    loading,
    errors,
  } = analyticsState;

  const getOverview = useCallback(() => {
    return dispatch(fetchOverviewThunk());
  }, [dispatch]);

  const getFunnel = useCallback(() => {
    return dispatch(fetchFunnelThunk());
  }, [dispatch]);

  const getTrends = useCallback(() => {
    return dispatch(fetchTrendsThunk());
  }, [dispatch]);

  const getJobMetrics = useCallback(() => {
    return dispatch(fetchJobMetricsThunk());
  }, [dispatch]);

  const getApplicationMetrics = useCallback(() => {
    return dispatch(fetchApplicationMetricsThunk());
  }, [dispatch]);

  const getInterviewMetrics = useCallback(() => {
    return dispatch(fetchInterviewMetricsThunk());
  }, [dispatch]);

  const getOfferMetrics = useCallback(() => {
    return dispatch(fetchOfferMetricsThunk());
  }, [dispatch]);

  const getTimeToHire = useCallback(() => {
    return dispatch(fetchTimeToHireThunk());
  }, [dispatch]);

  const getRecentActivity = useCallback(
    (page) => {
      return dispatch(fetchRecentActivityThunk(page));
    },
    [dispatch]
  );

  const refreshAll = useCallback(() => {
    return dispatch(fetchAllAnalyticsThunk());
  }, [dispatch]);

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setFiltersAction(newFilters));
    },
    [dispatch]
  );

  const setGranularity = useCallback(
    (granularity) => {
      dispatch(setGranularityAction(granularity));
    },
    [dispatch]
  );

  const setActivityEntity = useCallback(
    (entity) => {
      dispatch(setActivityEntityAction(entity));
      dispatch(fetchRecentActivityThunk(1));
    },
    [dispatch]
  );

  const setActivityPage = useCallback(
    (page) => {
      dispatch(setActivityPageAction(page));
      dispatch(fetchRecentActivityThunk(page));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(resetFiltersAction());
  }, [dispatch]);

  return {
    overview,
    funnel,
    trends,
    jobMetrics,
    applicationMetrics,
    interviewMetrics,
    offerMetrics,
    timeToHire,
    recentActivity,
    filters,
    pagination,
    loading,
    errors,
    getOverview,
    getFunnel,
    getTrends,
    getJobMetrics,
    getApplicationMetrics,
    getInterviewMetrics,
    getOfferMetrics,
    getTimeToHire,
    getRecentActivity,
    refreshAll,
    setFilters,
    setGranularity,
    setActivityEntity,
    setActivityPage,
    resetFilters,
  };
};

export default useAnalytics;
