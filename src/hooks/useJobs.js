import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobs,
  fetchJobDetails,
  saveJobDraft,
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  setSearch,
  setFilters,
  resetFilters,
  setPage,
  setPageSize,
  setSorting,
  setSelectedJob,
  clearError,
  clearActionStatus,
} from '../store/slices/jobSlice';

export const useJobs = () => {
  const dispatch = useDispatch();
  const jobState = useSelector((state) => state.job);

  const {
    items,
    selectedJob,
    pagination,
    filters,
    search,
    sorting,
    loading,
    refreshing,
    saving,
    publishing,
    closing,
    deleting,
    error,
    actionStatus,
  } = jobState;

  const loadJobs = useCallback(
    (isRefresh = false) => {
      return dispatch(fetchJobs({ isRefresh }));
    },
    [dispatch]
  );

  const getJobDetails = useCallback(
    (jobId) => {
      return dispatch(fetchJobDetails(jobId));
    },
    [dispatch]
  );

  const saveDraft = useCallback(
    (data, jobId = null) => {
      return dispatch(saveJobDraft({ data, jobId }));
    },
    [dispatch]
  );

  const handleCreateJob = useCallback(
    (data) => {
      return dispatch(createJob(data));
    },
    [dispatch]
  );

  const handleUpdateJob = useCallback(
    (jobId, data) => {
      return dispatch(updateJob({ jobId, data }));
    },
    [dispatch]
  );

  const handlePublishJob = useCallback(
    (jobId, data = null) => {
      return dispatch(publishJob({ jobId, data }));
    },
    [dispatch]
  );

  const handleCloseJob = useCallback(
    (jobId) => {
      return dispatch(closeJob(jobId));
    },
    [dispatch]
  );

  const handleDeleteJob = useCallback(
    (jobId) => {
      return dispatch(deleteJob(jobId));
    },
    [dispatch]
  );

  const handleSetSearch = useCallback(
    (searchTerm) => {
      dispatch(setSearch(searchTerm));
    },
    [dispatch]
  );

  const handleSetFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const handleSetPage = useCallback(
    (page) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  const handleSetPageSize = useCallback(
    (pageSize) => {
      dispatch(setPageSize(pageSize));
    },
    [dispatch]
  );

  const handleSetSorting = useCallback(
    (sortObj) => {
      dispatch(setSorting(sortObj));
    },
    [dispatch]
  );

  const handleSelectJob = useCallback(
    (job) => {
      dispatch(setSelectedJob(job));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClearActionStatus = useCallback(() => {
    dispatch(clearActionStatus());
  }, [dispatch]);

  return {
    items,
    selectedJob,
    pagination,
    filters,
    search,
    sorting,
    loading,
    refreshing,
    saving,
    publishing,
    closing,
    deleting,
    error,
    actionStatus,
    loadJobs,
    refreshJobs: () => loadJobs(true),
    getJobDetails,
    saveDraft,
    createJob: handleCreateJob,
    updateJob: handleUpdateJob,
    publishJob: handlePublishJob,
    closeJob: handleCloseJob,
    deleteJob: handleDeleteJob,
    setSearch: handleSetSearch,
    setFilters: handleSetFilters,
    resetFilters: handleResetFilters,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setSorting: handleSetSorting,
    setSelectedJob: handleSelectJob,
    clearError: handleClearError,
    clearActionStatus: handleClearActionStatus,
  };
};

export default useJobs;
