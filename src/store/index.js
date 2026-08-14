import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import rawStorage from 'redux-persist/lib/storage';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import languageReducer from './slices/languageSlice';
import notificationReducer from './slices/notificationSlice';
import dashboardReducer from './slices/dashboardSlice';
import jobReducer from './slices/jobSlice';
import candidateReducer from './slices/candidateSlice';
import jobApplicationReducer from './slices/jobApplicationSlice';
import interviewReducer from './slices/interviewSlice';
import offerReducer from './slices/offerSlice';
import analyticsReducer from './slices/analyticsSlice';
import companyReducer from './slices/companySlice';
import settingsReducer from './slices/settingsSlice';
import profileReducer from './slices/profileSlice';

/**
 * Safely resolve Redux Persist storage adapter under Vite / ESM / CommonJS interop.
 * Ensures storage.getItem, storage.setItem, storage.removeItem are guaranteed functions.
 */
const getStorageAdapter = () => {
  if (rawStorage && typeof rawStorage.getItem === 'function') {
    return rawStorage;
  }
  if (rawStorage && rawStorage.default && typeof rawStorage.default.getItem === 'function') {
    return rawStorage.default;
  }
  // Standard web storage fallback using window.localStorage
  return {
    getItem: (key) => {
      return new Promise((resolve) => {
        try {
          resolve(typeof window !== 'undefined' ? window.localStorage.getItem(key) : null);
        } catch {
          resolve(null);
        }
      });
    },
    setItem: (key, value) => {
      return new Promise((resolve) => {
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
          resolve(value);
        } catch {
          resolve(value);
        }
      });
    },
    removeItem: (key) => {
      return new Promise((resolve) => {
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
          resolve();
        } catch {
          resolve();
        }
      });
    },
  };
};

const storage = getStorageAdapter();

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  language: languageReducer,
  notification: notificationReducer,
  dashboard: dashboardReducer,
  candidate: candidateReducer,
  job: jobReducer,
  jobApplication: jobApplicationReducer,
  interview: interviewReducer,
  offer: offerReducer,
  analytics: analyticsReducer,
  company: companyReducer,
  settings: settingsReducer,
  profile: profileReducer,
});

const persistConfig = {
  key: 'recruittrain_root_v2',
  version: 2,
  storage,
  whitelist: ['ui', 'language'], // Strictly persist non-sensitive UI & language preferences only
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export default store;
