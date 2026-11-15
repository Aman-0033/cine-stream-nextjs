'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectFavorites,
  toggleFavorite,
  clearFavorites,
  selectIsFavorite,
} from '@/redux/favoritesSlice';

/**
 * Legacy Context Adapter
 *
 * Fully backed by Redux Toolkit (RTK) global state.
 * Eliminates custom Context state and localStorage synchronization boilerplate
 * while maintaining 100% backward-compatibility for any existing consumer.
 */
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  // Pass-through wrapper: ReduxProvider handles store and persistence
  return <>{children}</>;
}

export function useFavorites() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);

  const handleToggle = useCallback(
    (movie) => {
      dispatch(toggleFavorite(movie));
    },
    [dispatch]
  );

  const handleClear = useCallback(() => {
    dispatch(clearFavorites());
  }, [dispatch]);

  const checkIsFavorite = useCallback(
    (movieId) => {
      if (!movieId) return false;
      return favorites.some((item) => String(item.id) === String(movieId));
    },
    [favorites]
  );

  return {
    favorites,
    toggleFavorite: handleToggle,
    clearFavorites: handleClear,
    isFavorite: checkIsFavorite,
    isHydrated: true,
  };
}

export default FavoritesContext;
