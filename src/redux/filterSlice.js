import { createSlice } from '@reduxjs/toolkit';

/**
 * TMDB Genre Dictionary
 * Standard mapping for movie category IDs to names.
 */
export const TMDB_GENRES = [
  { id: 'ALL', name: 'All Genres' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const AVAILABLE_YEARS = [
  'ALL',
  '2026',
  '2025',
  '2024',
  '2023',
  '2022',
  '2021',
  '2020',
  '2010s',
  '2000s',
  '1990s',
];

const initialState = {
  genre: 'ALL',        // 'ALL' or numeric TMDB genre ID
  minRating: 0,        // 0 to 10
  releaseYear: 'ALL',  // 'ALL' or specific year / era string
  sortBy: 'default',   // 'default', 'rating-desc', 'year-desc', 'title-asc'
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setGenre: (state, action) => {
      state.genre = action.payload;
    },
    setMinRating: (state, action) => {
      state.minRating = Number(action.payload);
    },
    setReleaseYear: (state, action) => {
      state.releaseYear = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    resetFilters: (state) => {
      state.genre = 'ALL';
      state.minRating = 0;
      state.releaseYear = 'ALL';
      state.sortBy = 'default';
    },
  },
});

export const {
  setGenre,
  setMinRating,
  setReleaseYear,
  setSortBy,
  resetFilters,
} = filterSlice.actions;

// Selectors
export const selectFilterState = (state) => state.filter;
export const selectActiveGenre = (state) => state.filter.genre;
export const selectMinRating = (state) => state.filter.minRating;
export const selectReleaseYear = (state) => state.filter.releaseYear;
export const selectSortBy = (state) => state.filter.sortBy;

export const selectHasActiveFilters = (state) =>
  state.filter.genre !== 'ALL' ||
  state.filter.minRating > 0 ||
  state.filter.releaseYear !== 'ALL' ||
  state.filter.sortBy !== 'default';

export const selectActiveFilterCount = (state) => {
  let count = 0;
  if (state.filter.genre !== 'ALL') count += 1;
  if (state.filter.minRating > 0) count += 1;
  if (state.filter.releaseYear !== 'ALL') count += 1;
  if (state.filter.sortBy !== 'default') count += 1;
  return count;
};

export default filterSlice.reducer;
