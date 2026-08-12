import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // payload: { id, type: 'success'|'error'|'warning'|'info', title, message, duration }
      const newNotification = {
        id: action.payload.id || Date.now(),
        type: action.payload.type || 'info',
        title: action.payload.title || '',
        message: action.payload.message || '',
        duration: action.payload.duration || 4500,
      };
      state.notifications.push(newNotification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (item) => item.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationSlice.actions;
export const selectNotifications = (state) => state.notification.notifications;
export default notificationSlice.reducer;
