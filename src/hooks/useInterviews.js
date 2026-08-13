import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInterviews,
  fetchInterviewDetails,
  createInterview as createInterviewThunk,
  updateInterview as updateInterviewThunk,
  changeInterviewStatus as changeInterviewStatusThunk,
  deleteInterview as deleteInterviewThunk,
  setSearch as setSearchAction,
  setFilters as setFiltersAction,
  resetFilters as resetFiltersAction,
  setPage as setPageAction,
  setPageSize as setPageSizeAction,
  setSelectedInterview as setSelectedInterviewAction,
  clearSelectedInterview as clearSelectedInterviewAction,
  clearError as clearErrorAction,
  clearActionStatus as clearActionStatusAction,
} from '../store/slices/interviewSlice';

export const useInterviews = () => {
  const dispatch = useDispatch();
  const interviewState = useSelector((state) => state.interview);

  const {
    items,
    selectedInterview,
    pagination,
    filters,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    actionStatus,
    error,
  } = interviewState;

  const loadInterviews = useCallback(
    (overrideParams = {}) => {
      return dispatch(fetchInterviews(overrideParams));
    },
    [dispatch]
  );

  const getInterviewDetails = useCallback(
    (interviewId) => {
      return dispatch(fetchInterviewDetails(interviewId));
    },
    [dispatch]
  );

  const createInterview = useCallback(
    (data) => {
      return dispatch(createInterviewThunk(data));
    },
    [dispatch]
  );

  const updateInterview = useCallback(
    (interviewId, data) => {
      return dispatch(updateInterviewThunk({ interviewId, data }));
    },
    [dispatch]
  );

  const changeStatus = useCallback(
    (interviewId, status) => {
      return dispatch(changeInterviewStatusThunk({ interviewId, status }));
    },
    [dispatch]
  );

  const deleteInterview = useCallback(
    (interviewId) => {
      return dispatch(deleteInterviewThunk(interviewId));
    },
    [dispatch]
  );

  const setSearch = useCallback(
    (searchTerm) => {
      dispatch(setSearchAction(searchTerm));
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setFiltersAction(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(resetFiltersAction());
  }, [dispatch]);

  const setPage = useCallback(
    (page) => {
      dispatch(setPageAction(page));
    },
    [dispatch]
  );

  const setPageSize = useCallback(
    (pageSize) => {
      dispatch(setPageSizeAction(pageSize));
    },
    [dispatch]
  );

  const setSelectedInterview = useCallback(
    (interview) => {
      dispatch(setSelectedInterviewAction(interview));
    },
    [dispatch]
  );

  const clearSelectedInterview = useCallback(() => {
    dispatch(clearSelectedInterviewAction());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  const clearActionStatus = useCallback(() => {
    dispatch(clearActionStatusAction());
  }, [dispatch]);

  return {
    items,
    interviews: items,
    selectedInterview,
    pagination,
    filters,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    actionStatus,
    error,
    loadInterviews,
    refreshInterviews: () => loadInterviews(),
    getInterviewDetails,
    createInterview,
    updateInterview,
    changeStatus,
    deleteInterview,
    setSearch,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSelectedInterview,
    clearSelectedInterview,
    clearError,
    clearActionStatus,
  };
};

export default useInterviews;
