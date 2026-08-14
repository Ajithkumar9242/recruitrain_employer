import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchApplications,
  searchApplications as searchApplicationsThunk,
  fetchApplicationDetails,
  createApplication as createApplicationThunk,
  updateApplication as updateApplicationThunk,
  changeApplicationStatus as changeApplicationStatusThunk,
  changeApplicationStage as changeApplicationStageThunk,
  deleteApplication as deleteApplicationThunk,
  setSearch as setSearchAction,
  setFilters as setFiltersAction,
  resetFilters as resetFiltersAction,
  setSorting as setSortingAction,
  setPage as setPageAction,
  setPageSize as setPageSizeAction,
  setSelectedApplication as setSelectedApplicationAction,
  clearSelectedApplication as clearSelectedApplicationAction,
  clearError as clearErrorAction,
  clearActionStatus as clearActionStatusAction,
} from '../store/slices/jobApplicationSlice';

export const useJobApplications = () => {
  const dispatch = useDispatch();
  const appState = useSelector((state) => state.jobApplication || {});

  const {
    items = [],
    selectedApplication = null,
    pagination = { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters = { status: null, currentStage: null, candidate: null, jobOpening: null, source: null, priority: null },
    sorting = { orderBy: 'creation', orderDir: 'desc' },
    search = '',
    loading = false,
    loadingDetails = false,
    saving = false,
    deleting = false,
    changingStatus = false,
    changingStage = false,
    actionStatus = null,
    error = null,
  } = appState;

  const filteredItems = useMemo(() => {
    if (!filters.currentStage) return items;
    const targetStage = filters.currentStage.trim().toLowerCase();
    return items.filter((app) => {
      const appStage = (app.currentStage || app.stage || '').trim().toLowerCase();
      return appStage === targetStage;
    });
  }, [items, filters.currentStage]);

  const effectivePagination = useMemo(() => {
    if (filters.currentStage) {
      return {
        ...pagination,
        total: filteredItems.length,
        totalPages: filteredItems.length > 0 ? Math.ceil(filteredItems.length / (pagination.pageSize || 20)) : 0,
      };
    }
    return pagination;
  }, [pagination, filteredItems.length, filters.currentStage]);

  const loadApplications = useCallback(
    (overrideParams = {}) => {
      return dispatch(fetchApplications(overrideParams));
    },
    [dispatch]
  );

  const searchApplications = useCallback(
    (searchQuery) => {
      return dispatch(searchApplicationsThunk(searchQuery));
    },
    [dispatch]
  );

  const getApplicationDetails = useCallback(
    (applicationId) => {
      return dispatch(fetchApplicationDetails(applicationId));
    },
    [dispatch]
  );

  const createApplication = useCallback(
    (data) => {
      return dispatch(createApplicationThunk(data));
    },
    [dispatch]
  );

  const updateApplication = useCallback(
    (applicationId, data) => {
      return dispatch(updateApplicationThunk({ applicationId, data }));
    },
    [dispatch]
  );

  const changeStatus = useCallback(
    (applicationId, status, rejectionReason = null) => {
      return dispatch(changeApplicationStatusThunk({ applicationId, status, rejectionReason }));
    },
    [dispatch]
  );

  const changeStage = useCallback(
    (applicationId, stage) => {
      return dispatch(changeApplicationStageThunk({ applicationId, stage }));
    },
    [dispatch]
  );

  const deleteApplication = useCallback(
    (applicationId) => {
      return dispatch(deleteApplicationThunk(applicationId));
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

  const setSorting = useCallback(
    (newSorting) => {
      dispatch(setSortingAction(newSorting));
    },
    [dispatch]
  );

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

  const setSelectedApplication = useCallback(
    (application) => {
      dispatch(setSelectedApplicationAction(application));
    },
    [dispatch]
  );

  const clearSelectedApplication = useCallback(() => {
    dispatch(clearSelectedApplicationAction());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  const clearActionStatus = useCallback(() => {
    dispatch(clearActionStatusAction());
  }, [dispatch]);

  return {
    items: filteredItems,
    applications: filteredItems,
    selectedApplication,
    pagination: effectivePagination,
    filters,
    sorting,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    changingStatus,
    changingStage,
    actionStatus,
    error,
    loadApplications,
    searchApplications,
    fetchApplications: loadApplications,
    fetchApplicationDetails: getApplicationDetails,
    refreshApplications: () => loadApplications(),
    getApplicationDetails,
    createApplication,
    updateApplication,
    changeStatus,
    changeApplicationStatus: changeStatus,
    changeStage,
    changeApplicationStage: changeStage,
    deleteApplication,
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
  };
};

export default useJobApplications;
