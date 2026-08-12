import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light', // 'light' | 'dark' | 'system'
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  globalLoading: false,
  reducedMotion: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
    },
    setMobileDrawerOpen: (state, action) => {
      state.mobileDrawerOpen = action.payload;
    },
    toggleMobileDrawer: (state) => {
      state.mobileDrawerOpen = !state.mobileDrawerOpen;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    setReducedMotion: (state, action) => {
      state.reducedMotion = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarCollapsed,
  setMobileDrawerOpen,
  toggleMobileDrawer,
  setGlobalLoading,
  setReducedMotion,
} = uiSlice.actions;

export const selectUI = (state) => state.ui;
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectMobileDrawerOpen = (state) => state.ui.mobileDrawerOpen;

export default uiSlice.reducer;
