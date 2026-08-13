import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOffers,
  fetchOfferDetails,
  createOffer as createOfferThunk,
  updateOffer as updateOfferThunk,
  changeOfferStatus as changeOfferStatusThunk,
  sendOffer as sendOfferThunk,
  acceptOffer as acceptOfferThunk,
  rejectOffer as rejectOfferThunk,
  withdrawOffer as withdrawOfferThunk,
  deleteOffer as deleteOfferThunk,
  setSearch as setSearchAction,
  setFilters as setFiltersAction,
  resetFilters as resetFiltersAction,
  setPage as setPageAction,
  setPageSize as setPageSizeAction,
  setSelectedOffer as setSelectedOfferAction,
  clearSelectedOffer as clearSelectedOfferAction,
  clearError as clearErrorAction,
  clearActionStatus as clearActionStatusAction,
} from '../store/slices/offerSlice';

export const useOffers = () => {
  const dispatch = useDispatch();
  const offerState = useSelector((state) => state.offer);

  const {
    items,
    selectedOffer,
    pagination,
    filters,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    actionStatus,
    error,
  } = offerState;

  const loadOffers = useCallback(
    (overrideParams = {}) => {
      return dispatch(fetchOffers(overrideParams));
    },
    [dispatch]
  );

  const getOfferDetails = useCallback(
    (offerId) => {
      return dispatch(fetchOfferDetails(offerId));
    },
    [dispatch]
  );

  const createOffer = useCallback(
    (data) => {
      return dispatch(createOfferThunk(data));
    },
    [dispatch]
  );

  const updateOffer = useCallback(
    (offerId, data) => {
      return dispatch(updateOfferThunk({ offerId, data }));
    },
    [dispatch]
  );

  const changeStatus = useCallback(
    (offerId, status) => {
      return dispatch(changeOfferStatusThunk({ offerId, status }));
    },
    [dispatch]
  );

  const sendOffer = useCallback(
    (offerId) => {
      return dispatch(sendOfferThunk(offerId));
    },
    [dispatch]
  );

  const acceptOffer = useCallback(
    (offerId) => {
      return dispatch(acceptOfferThunk(offerId));
    },
    [dispatch]
  );

  const rejectOffer = useCallback(
    (offerId) => {
      return dispatch(rejectOfferThunk(offerId));
    },
    [dispatch]
  );

  const withdrawOffer = useCallback(
    (offerId) => {
      return dispatch(withdrawOfferThunk(offerId));
    },
    [dispatch]
  );

  const deleteOffer = useCallback(
    (offerId) => {
      return dispatch(deleteOfferThunk(offerId));
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

  const setSelectedOffer = useCallback(
    (offer) => {
      dispatch(setSelectedOfferAction(offer));
    },
    [dispatch]
  );

  const clearSelectedOffer = useCallback(() => {
    dispatch(clearSelectedOfferAction());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearErrorAction());
  }, [dispatch]);

  const clearActionStatus = useCallback(() => {
    dispatch(clearActionStatusAction());
  }, [dispatch]);

  return {
    items,
    offers: items,
    selectedOffer,
    pagination,
    filters,
    search,
    loading,
    loadingDetails,
    saving,
    deleting,
    actionStatus,
    error,
    loadOffers,
    fetchOffers: loadOffers,
    refreshOffers: () => loadOffers(),
    getOfferDetails,
    getOffer: getOfferDetails,
    createOffer,
    updateOffer,
    changeStatus,
    sendOffer,
    acceptOffer,
    rejectOffer,
    withdrawOffer,
    deleteOffer,
    setSearch,
    setFilters,
    resetFilters,
    setPage,
    setPageSize,
    setSelectedOffer,
    clearSelectedOffer,
    clearError,
    clearActionStatus,
  };
};

export default useOffers;
