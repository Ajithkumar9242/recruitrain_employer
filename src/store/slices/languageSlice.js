import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentLanguage: 'en', // 'en' | 'de'
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export const selectCurrentLanguage = (state) => state.language.currentLanguage;
export default languageSlice.reducer;
