import { createSlice } from '@reduxjs/toolkit';

/**
 * favoritesSlice
 *
 * Manages user's saved/favorite movies.
 * Persisted to localStorage via redux-persist.
 */
const initialState = {
  favorites: [],
};

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action) => {
      const movie = action.payload;
      if (!movie || !movie.id) return;
      const index = state.favorites.findIndex(
        (item) => String(item.id) === String(movie.id)
      );
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.unshift(movie);
      }
    },
    addFavorite: (state, action) => {
      const movie = action.payload;
      if (!movie || !movie.id) return;
      const exists = state.favorites.some(
        (item) => String(item.id) === String(movie.id)
      );
      if (!exists) {
        state.favorites.unshift(movie);
      }
    },
    removeFavorite: (state, action) => {
      const movieId = action.payload;
      state.favorites = state.favorites.filter(
        (item) => String(item.id) !== String(movieId)
      );
    },
    clearFavorites: (state) => {
      state.favorites = [];
    },
  },
});

export const { toggleFavorite, addFavorite, removeFavorite, clearFavorites } =
  favoritesSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoritesCount = (state) => state.favorites.favorites.length;
export const selectIsFavorite = (movieId) => (state) =>
  Boolean(
    movieId &&
      state.favorites.favorites.some(
        (item) => String(item.id) === String(movieId)
      )
  );

export default favoritesSlice.reducer;
