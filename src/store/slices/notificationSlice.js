import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationApi from '../../services/notificationApi';
import {
  normalizeNotification,
  normalizeNotificationList,
  normalizeNotificationCounts,
  normalizeNotificationPreferences,
} from '../../utils/notificationNormalizer';

const initialState = {
  items: [],
  selectedNotification: null,

  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  },

  search: '',

  filters: {
    type: null,
    priority: null,
    read: null,
    category: null,
  },

  counts: {
    unread: 0,
    read: 0,
    total: 0,
    high: 0,
    urgent: 0,
  },

  preferences: null,

  loading: false,
  loadingDetails: false,
  saving: false,
  deleting: false,
  bulkProcessing: false,

  error: null,
  actionStatus: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async (overrideParams = {}, { getState, rejectWithValue }) => {
    try {
      const { notification } = getState();
      const params = {
        page: overrideParams.page ?? notification.pagination.page,
        pageSize: overrideParams.pageSize ?? notification.pagination.pageSize,
        search: overrideParams.search !== undefined ? overrideParams.search : notification.search,
        type: overrideParams.type !== undefined ? overrideParams.type : notification.filters.type,
        priority: overrideParams.priority !== undefined ? overrideParams.priority : notification.filters.priority,
        read: overrideParams.read !== undefined ? overrideParams.read : notification.filters.read,
        category: overrideParams.category !== undefined ? overrideParams.category : notification.filters.category,
      };

      const response = await notificationApi.listNotifications(params);
      const normalized = normalizeNotificationList(response);
      return normalized;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to fetch notifications'
      );
    }
  }
);

export const fetchNotificationDetails = createAsyncThunk(
  'notification/fetchNotificationDetails',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotification(notificationId);
      const normalized = normalizeNotification(response);
      if (!normalized) {
        throw new Error('Notification record not found');
      }
      return normalized;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to fetch notification details'
      );
    }
  }
);

export const fetchNotificationCounts = createAsyncThunk(
  'notification/fetchNotificationCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotificationCounts();
      const normalized = normalizeNotificationCounts(response);
      return normalized;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to fetch notification counts'
      );
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount();
      const normalized = normalizeNotificationCounts(response);
      return normalized.unread;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to fetch unread count'
      );
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notification/markNotificationRead',
  async (notificationId, { dispatch, rejectWithValue }) => {
    try {
      const response = await notificationApi.markNotificationRead(notificationId);
      const updated = normalizeNotification(response) || { id: notificationId, read: true, isRead: true };
      dispatch(fetchNotificationCounts());
      return { id: notificationId, updated };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to mark notification as read'
      );
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notification/markAllNotificationsRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await notificationApi.markAllNotificationsRead();
      dispatch(fetchNotifications({ page: 1 }));
      dispatch(fetchNotificationCounts());
      return response;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to mark all notifications as read'
      );
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notification/deleteNotification',
  async (notificationId, { dispatch, rejectWithValue }) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      dispatch(fetchNotificationCounts());
      return notificationId;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to delete notification'
      );
    }
  }
);

export const clearNotifications = createAsyncThunk(
  'notification/clearNotifications',
  async (mode = 'read', { dispatch, rejectWithValue }) => {
    try {
      const response = await notificationApi.clearNotifications(mode);
      dispatch(fetchNotifications({ page: 1 }));
      dispatch(fetchNotificationCounts());
      return response;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to clear notifications'
      );
    }
  }
);

export const fetchNotificationPreferences = createAsyncThunk(
  'notification/fetchNotificationPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotificationPreferences();
      const normalized = normalizeNotificationPreferences(response);
      return normalized;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to fetch preferences'
      );
    }
  }
);

export const updateNotificationPreferences = createAsyncThunk(
  'notification/updateNotificationPreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await notificationApi.updateNotificationPreferences(preferences);
      const normalized = normalizeNotificationPreferences(response);
      return normalized;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to update preferences'
      );
    }
  }
);

export const bulkUpdateNotifications = createAsyncThunk(
  'notification/bulkUpdateNotifications',
  async ({ notificationIds, action }, { dispatch, rejectWithValue }) => {
    try {
      const response = await notificationApi.bulkUpdateNotifications(notificationIds, action);
      dispatch(fetchNotifications());
      dispatch(fetchNotificationCounts());
      return response;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.error?.message || err?.message || 'Failed to execute bulk operation'
      );
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
      state.pagination.page = 1;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.search = '';
      state.filters = {
        type: null,
        priority: null,
        read: null,
        category: null,
      };
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setPageSize: (state, action) => {
      state.pagination.pageSize = action.payload;
      state.pagination.page = 1;
    },
    setSelectedNotification: (state, action) => {
      state.selectedNotification = action.payload;
    },
    clearActionStatus: (state) => {
      state.actionStatus = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          pageSize: action.payload.pageSize,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchNotificationDetails
      .addCase(fetchNotificationDetails.pending, (state) => {
        state.loadingDetails = true;
        state.error = null;
      })
      .addCase(fetchNotificationDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.selectedNotification = action.payload;
      })
      .addCase(fetchNotificationDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.error = action.payload;
      })

      // fetchNotificationCounts
      .addCase(fetchNotificationCounts.fulfilled, (state, action) => {
        state.counts = action.payload;
      })

      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.counts.unread = action.payload;
      })

      // markNotificationRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { id, updated } = action.payload;
        state.items = state.items.map((item) =>
          item.id === id ? { ...item, ...updated, read: true, isRead: true } : item
        );
        if (state.selectedNotification && state.selectedNotification.id === id) {
          state.selectedNotification = {
            ...state.selectedNotification,
            ...updated,
            read: true,
            isRead: true,
          };
        }
      })

      // markAllNotificationsRead
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.saving = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.saving = false;
        state.items = state.items.map((item) => ({ ...item, read: true, isRead: true }));
        state.actionStatus = 'mark_all_read_success';
      })
      .addCase(markAllNotificationsRead.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // deleteNotification
      .addCase(deleteNotification.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedNotification && state.selectedNotification.id === action.payload) {
          state.selectedNotification = null;
        }
        state.actionStatus = 'delete_success';
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // clearNotifications
      .addCase(clearNotifications.pending, (state) => {
        state.deleting = true;
      })
      .addCase(clearNotifications.fulfilled, (state) => {
        state.deleting = false;
        state.actionStatus = 'clear_success';
      })
      .addCase(clearNotifications.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // fetchNotificationPreferences
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })

      // updateNotificationPreferences
      .addCase(updateNotificationPreferences.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateNotificationPreferences.fulfilled, (state, action) => {
        state.saving = false;
        state.preferences = action.payload;
        state.actionStatus = 'preferences_update_success';
      })
      .addCase(updateNotificationPreferences.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // bulkUpdateNotifications
      .addCase(bulkUpdateNotifications.pending, (state) => {
        state.bulkProcessing = true;
      })
      .addCase(bulkUpdateNotifications.fulfilled, (state) => {
        state.bulkProcessing = false;
        state.actionStatus = 'bulk_update_success';
      })
      .addCase(bulkUpdateNotifications.rejected, (state, action) => {
        state.bulkProcessing = false;
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
  setSelectedNotification,
  clearActionStatus,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.items;
export const selectSelectedNotification = (state) => state.notification.selectedNotification;
export const selectNotificationPagination = (state) => state.notification.pagination;
export const selectNotificationSearch = (state) => state.notification.search;
export const selectNotificationFilters = (state) => state.notification.filters;
export const selectNotificationCounts = (state) => state.notification.counts;
export const selectUnreadNotificationCount = (state) => state.notification.counts.unread;
export const selectNotificationPreferences = (state) => state.notification.preferences;
export const selectNotificationLoading = (state) => state.notification.loading;
export const selectNotificationLoadingDetails = (state) => state.notification.loadingDetails;
export const selectNotificationSaving = (state) => state.notification.saving;
export const selectNotificationDeleting = (state) => state.notification.deleting;
export const selectNotificationBulkProcessing = (state) => state.notification.bulkProcessing;
export const selectNotificationError = (state) => state.notification.error;
export const selectNotificationActionStatus = (state) => state.notification.actionStatus;

export default notificationSlice.reducer;
