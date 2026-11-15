'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'cinestream_favorites';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Safely read from localStorage only on client after mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to parse favorites from localStorage:', err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever favorites change after initial mount
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to persist favorites to localStorage:', err);
    }
  }, [favorites, isHydrated]);

  const toggleFavorite = (movie) => {
    if (!movie || !movie.id) return;
    setFavorites((prev) => {
      const exists = prev.some((item) => String(item.id) === String(movie.id));
      if (exists) {
        return prev.filter((item) => String(item.id) !== String(movie.id));
      } else {
        return [movie, ...prev];
      }
    });
  };

  const isFavorite = (movieId) => {
    if (!movieId) return false;
    return favorites.some((item) => String(item.id) === String(movieId));
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const value = {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    isHydrated,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

export default FavoritesContext;
