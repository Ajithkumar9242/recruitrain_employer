import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCandidates as fetchCandidatesThunk,
  searchCandidates as searchCandidatesThunk,
  fetchDomesticCandidates as fetchDomesticCandidatesThunk,
  fetchInternationalCandidates as fetchInternationalCandidatesThunk,
  fetchCandidateById as fetchCandidateByIdThunk,
  fetchProfileCompleteness as fetchProfileCompletenessThunk,
  createCandidate as createCandidateThunk,
  updateCandidate as updateCandidateThunk,
  deleteCandidate as deleteCandidateThunk,
  updateCandidateSkills as updateCandidateSkillsThunk,
  updateCandidateEducation as updateCandidateEducationThunk,
  updateCandidateExperience as updateCandidateExperienceThunk,
  saveSubresource as saveSubresourceThunk,
  setCandidateFilters,
  resetCandidateFilters,
  setViewMode as setViewModeAction,
  setSelectedCandidate,
  clearSelectedCandidate,
  clearCandidateError,
  selectCandidateList,
  selectSelectedCandidate,
  selectProfileCompleteness,
  selectCandidateStatus,
  selectCandidateDrawerLoading,
  selectCandidateActionStatus,
  selectCandidateError,
  selectCandidateViewMode,
  selectCandidatePagination,
  selectCandidateFilters,
} from '../store/slices/candidateSlice';

export const useCandidates = () => {
  const dispatch = useDispatch();

  const candidates = useSelector(selectCandidateList);
  const selectedCandidate = useSelector(selectSelectedCandidate);
  const profileCompleteness = useSelector(selectProfileCompleteness);
  const status = useSelector(selectCandidateStatus);
  const drawerLoading = useSelector(selectCandidateDrawerLoading);
  const actionStatus = useSelector(selectCandidateActionStatus);
  const error = useSelector(selectCandidateError);
  const viewMode = useSelector(selectCandidateViewMode);
  const pagination = useSelector(selectCandidatePagination);
  const filters = useSelector(selectCandidateFilters);

  const loadCandidates = useCallback(
    (overrideParams = {}) => {
      return dispatch(fetchCandidatesThunk(overrideParams));
    },
    [dispatch]
  );

  const searchCandidates = useCallback(
    (params = {}) => {
      return dispatch(searchCandidatesThunk(params));
    },
    [dispatch]
  );

  const loadDomesticCandidates = useCallback(
    (overrideParams = {}) => {
      return dispatch(fetchDomesticCandidatesThunk(overrideParams));
    },
    [dispatch]
  );

  const loadInternationalCandidates = useCallback(
    (overrideParams = {}) => {
      return dispatch(fetchInternationalCandidatesThunk(overrideParams));
    },
    [dispatch]
  );

  const getCandidateDetails = useCallback(
    (candidateId) => {
      return dispatch(fetchCandidateByIdThunk(candidateId));
    },
    [dispatch]
  );

  const getProfileCompleteness = useCallback(
    (candidateId) => {
      return dispatch(fetchProfileCompletenessThunk(candidateId));
    },
    [dispatch]
  );

  const createCandidate = useCallback(
    (data) => {
      return dispatch(createCandidateThunk(data));
    },
    [dispatch]
  );

  const updateCandidate = useCallback(
    (candidateId, data) => {
      return dispatch(updateCandidateThunk({ candidateId, data }));
    },
    [dispatch]
  );

  const deleteCandidate = useCallback(
    (candidateId) => {
      return dispatch(deleteCandidateThunk(candidateId));
    },
    [dispatch]
  );

  const updateSkills = useCallback(
    (candidateId, skills) => {
      return dispatch(updateCandidateSkillsThunk({ candidateId, skills }));
    },
    [dispatch]
  );

  const updateEducation = useCallback(
    (candidateId, education) => {
      return dispatch(updateCandidateEducationThunk({ candidateId, education }));
    },
    [dispatch]
  );

  const updateExperience = useCallback(
    (candidateId, experience) => {
      return dispatch(updateCandidateExperienceThunk({ candidateId, experience }));
    },
    [dispatch]
  );

  const saveSubresource = useCallback(
    (candidateId, resourceType, items) => {
      return dispatch(saveSubresourceThunk({ candidateId, resourceType, items }));
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setCandidateFilters(newFilters));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(resetCandidateFilters());
  }, [dispatch]);

  const setViewMode = useCallback(
    (mode) => {
      dispatch(setViewModeAction(mode));
    },
    [dispatch]
  );

  const selectCandidate = useCallback(
    (candidate) => {
      dispatch(setSelectedCandidate(candidate));
    },
    [dispatch]
  );

  const clearSelected = useCallback(() => {
    dispatch(clearSelectedCandidate());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearCandidateError());
  }, [dispatch]);

  return {
    candidates,
    items: candidates,
    selectedCandidate,
    profileCompleteness,
    status,
    loading: status === 'loading',
    drawerLoading,
    actionStatus,
    saving: actionStatus === 'saving',
    deleting: actionStatus === 'deleting',
    error,
    viewMode,
    pagination,
    filters,
    loadCandidates,
    refreshCandidates: () => loadCandidates(),
    searchCandidates,
    loadDomesticCandidates,
    loadInternationalCandidates,
    getCandidateDetails,
    getProfileCompleteness,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    updateSkills,
    updateEducation,
    updateExperience,
    saveSubresource,
    setFilters,
    resetFilters,
    setViewMode,
    selectCandidate,
    clearSelected,
    clearError,
  };
};

export default useCandidates;
