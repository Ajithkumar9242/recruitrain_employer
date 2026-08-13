import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications as fetchNotificationsThunk,
  fetchNotificationDetails as fetchNotificationDetailsThunk,
  fetchNotificationCounts as fetchNotificationCountsThunk,
  fetchUnreadCount as fetchUnreadCountThunk,
  markNotificationRead as markNotificationReadThunk,
  markAllNotificationsRead as markAllNotificationsReadThunk,
  deleteNotification as deleteNotificationThunk,
  clearNotifications as clearNotificationsThunk,
  fetchNotificationPreferences as fetchNotificationPreferencesThunk,
  updateNotificationPreferences as updateNotificationPreferencesThunk,
  bulkUpdateNotifications as bulkUpdateNotificationsThunk,
  setSearch as setSearchAction,
  setFilters as setFiltersAction,
  resetFilters as resetFiltersAction,
  setPage as setPageAction,
  setPageSize as setPageSizeAction,
  setSelectedNotification as setSelectedNotificationAction,
  clearActionStatus as clearActionStatusAction,
  selectNotifications,
  selectSelectedNotification,
  selectNotificationPagination,
  selectNotificationSearch,
  selectNotificationFilters,
  selectNotificationCounts,
  selectUnreadNotificationCount,
  selectNotificationPreferences,
  selectNotificationLoading,
  selectNotificationLoadingDetails,
  selectNotificationSaving,
  selectNotificationDeleting,
  selectNotificationBulkProcessing,
  selectNotificationError,
  selectNotificationActionStatus,
} from '../store/slices/notificationSlice';

/**
 * Custom React Hook for Notification domain state management
 */
export const useNotifications = () => {
  const dispatch = useDispatch();

  const notifications = useSelector(selectNotifications);
  const selectedNotification = useSelector(selectSelectedNotification);
  const pagination = useSelector(selectNotificationPagination);
  const search = useSelector(selectNotificationSearch);
  const filters = useSelector(selectNotificationFilters);
  const counts = useSelector(selectNotificationCounts);
  const unreadCount = useSelector(selectUnreadNotificationCount);
  const preferences = useSelector(selectNotificationPreferences);
  const loading = useSelector(selectNotificationLoading);
  const loadingDetails = useSelector(selectNotificationLoadingDetails);
  const saving = useSelector(selectNotificationSaving);
  const deleting = useSelector(selectNotificationDeleting);
  const bulkProcessing = useSelector(selectNotificationBulkProcessing);
  const error = useSelector(selectNotificationError);
  const actionStatus = useSelector(selectNotificationActionStatus);

  const fetchNotifications = useCallback(
    (overrideParams) => dispatch(fetchNotificationsThunk(overrideParams)),
    [dispatch]
  );

  const fetchNotification = useCallback(
    (notificationId) => dispatch(fetchNotificationDetailsThunk(notificationId)),
    [dispatch]
  );

  const fetchCounts = useCallback(
    () => dispatch(fetchNotificationCountsThunk()),
    [dispatch]
  );

  const fetchUnread = useCallback(
    () => dispatch(fetchUnreadCountThunk()),
    [dispatch]
  );

  const searchNotifications = useCallback(
    (searchQuery) => {
      dispatch(setSearchAction(searchQuery));
      return dispatch(fetchNotificationsThunk({ search: searchQuery, page: 1 }));
    },
    [dispatch]
  );

  const setFilters = useCallback(
    (newFilters) => {
      dispatch(setFiltersAction(newFilters));
      return dispatch(fetchNotificationsThunk({ ...newFilters, page: 1 }));
    },
    [dispatch]
  );

  const resetFilters = useCallback(() => {
    dispatch(resetFiltersAction());
    return dispatch(fetchNotificationsThunk({ page: 1, search: '', type: null, priority: null, read: null, category: null }));
  }, [dispatch]);

  const changePage = useCallback(
    (page) => {
      dispatch(setPageAction(page));
      return dispatch(fetchNotificationsThunk({ page }));
    },
    [dispatch]
  );

  const changePageSize = useCallback(
    (pageSize) => {
      dispatch(setPageSizeAction(pageSize));
      return dispatch(fetchNotificationsThunk({ pageSize, page: 1 }));
    },
    [dispatch]
  );

  const markAsRead = useCallback(
    (notificationId) => dispatch(markNotificationReadThunk(notificationId)),
    [dispatch]
  );

  const markAllAsRead = useCallback(
    () => dispatch(markAllNotificationsReadThunk()),
    [dispatch]
  );

  const deleteNotification = useCallback(
    (notificationId) => dispatch(deleteNotificationThunk(notificationId)),
    [dispatch]
  );

  const clearNotifications = useCallback(
    (mode = 'read') => dispatch(clearNotificationsThunk(mode)),
    [dispatch]
  );

  const bulkUpdate = useCallback(
    (notificationIds, action) =>
      dispatch(bulkUpdateNotificationsThunk({ notificationIds, action })),
    [dispatch]
  );

  const fetchPreferences = useCallback(
    () => dispatch(fetchNotificationPreferencesThunk()),
    [dispatch]
  );

  const updatePreferences = useCallback(
    (prefs) => dispatch(updateNotificationPreferencesThunk(prefs)),
    [dispatch]
  );

  const selectNotification = useCallback(
    (notification) => dispatch(setSelectedNotificationAction(notification)),
    [dispatch]
  );

  const clearActionStatus = useCallback(
    () => dispatch(clearActionStatusAction()),
    [dispatch]
  );

  const refresh = useCallback(() => {
    dispatch(fetchNotificationCountsThunk());
    return dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  return {
    // State
    notifications,
    selectedNotification,
    pagination,
    search,
    filters,
    counts,
    unreadCount,
    preferences,
    loading,
    loadingDetails,
    saving,
    deleting,
    bulkProcessing,
    error,
    actionStatus,

    // Actions
    fetchNotifications,
    fetchNotification,
    fetchCounts,
    fetchUnread,
    searchNotifications,
    setFilters,
    resetFilters,
    changePage,
    changePageSize,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    bulkUpdate,
    fetchPreferences,
    updatePreferences,
    selectNotification,
    clearActionStatus,
    refresh,
  };
};

export default useNotifications;
