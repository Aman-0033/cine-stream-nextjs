import { createSlice } from '@reduxjs/toolkit';

/**
 * themeSlice
 *
 * Manages global application theme mode (dark vs light).
 * Persisted to localStorage via redux-persist so the user's aesthetic
 * choice survives page reloads and new sessions.
 */
const initialState = {
  mode: 'dark', // Default to Cine-Stream's signature dark aesthetic
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
    setTheme: (state, action) => {
      state.mode = action.payload === 'light' ? 'light' : 'dark';
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;

// Selectors
export const selectThemeMode = (state) => state.theme.mode;
export const selectIsDarkMode = (state) => state.theme.mode === 'dark';

export default themeSlice.reducer;
