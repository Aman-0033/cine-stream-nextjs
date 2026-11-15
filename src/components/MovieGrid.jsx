'use client';

import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectActiveGenre,
  selectMinRating,
  selectReleaseYear,
  selectSortBy,
  selectHasActiveFilters,
  resetFilters,
  TMDB_GENRES,
} from '@/redux/filterSlice';
import { MovieCard } from '@/components/MovieCard';
import { Film, FilterX, Star, Calendar, SlidersHorizontal } from 'lucide-react';

/**
 * MovieGrid Component
 *
 * Performance-optimized Client Component:
 * - Strictly utilizes useMemo for filtering large TMDB arrays to prevent expensive repaints.
 * - Utilizes fine-grained Redux selectors to isolate rendering triggers.
 * - Strictly utilizes useCallback for dispatching filter mutations to guarantee 60fps interaction.
 * - Wrapped with React.memo to prevent unnecessary parent re-renders.
 */
export function MovieGrid({ movies = [], onSelectMovie, loading = false, error = null }) {
  const dispatch = useDispatch();

  // ─── Fine-Grained Redux Subscriptions ─────────────────────────────────────
  const genre = useSelector(selectActiveGenre);
  const minRating = useSelector(selectMinRating);
  const releaseYear = useSelector(selectReleaseYear);
  const sortBy = useSelector(selectSortBy);
  const hasActiveFilters = useSelector(selectHasActiveFilters);

  // ─── Memoized Mutation Dispatcher ─────────────────────────────────────────
  const handleReset = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const handleCardSelect = useCallback(
    (movie) => {
      if (onSelectMovie) onSelectMovie(movie);
    },
    [onSelectMovie]
  );

  // ─── High-Performance Memoized Filter Engine ──────────────────────────────
  const filteredMovies = useMemo(() => {
    if (!movies || movies.length === 0) return [];

    let result = [...movies];

    // 1. Genre Filtering
    if (genre !== 'ALL') {
      const targetGenreId = Number(genre);
      const genreObj = TMDB_GENRES.find((g) => g.id === targetGenreId);
      const genreName = genreObj ? genreObj.name.toLowerCase() : '';

      result = result.filter((m) => {
        if (Array.isArray(m.genre_ids) && m.genre_ids.includes(targetGenreId)) return true;
        if (Array.isArray(m.genres) && m.genres.some((g) => g.id === targetGenreId || g.name?.toLowerCase() === genreName)) return true;
        if (typeof m.Genre === 'string' && genreName && m.Genre.toLowerCase().includes(genreName)) return true;
        if (typeof m.overview === 'string' && genreName && m.overview.toLowerCase().includes(genreName)) return true;
        return false;
      });
    }

    // 2. Minimum Rating Filtering
    if (minRating > 0) {
      result = result.filter((m) => {
        const rating =
          typeof m.vote_average === 'number'
            ? m.vote_average
            : parseFloat(m.imdbRating || 0);
        return rating >= minRating;
      });
    }

    // 3. Release Year Filtering
    if (releaseYear !== 'ALL') {
      result = result.filter((m) => {
        const dateStr = String(m.release_date || m.Year || '');
        const yearMatch = dateStr.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
        if (!year) return false;

        if (releaseYear === '2010s') return year >= 2010 && year <= 2019;
        if (releaseYear === '2000s') return year >= 2000 && year <= 2009;
        if (releaseYear === '1990s') return year >= 1990 && year <= 1999;
        return String(year) === releaseYear;
      });
    }

    // 4. Sorting
    if (sortBy === 'rating-desc') {
      result.sort((a, b) => {
        const rA = typeof a.vote_average === 'number' ? a.vote_average : parseFloat(a.imdbRating || 0);
        const rB = typeof b.vote_average === 'number' ? b.vote_average : parseFloat(b.imdbRating || 0);
        return rB - rA;
      });
    } else if (sortBy === 'year-desc') {
      result.sort((a, b) => {
        const yA = parseInt((a.release_date || a.Year || '0').slice(0, 4), 10) || 0;
        const yB = parseInt((b.release_date || b.Year || '0').slice(0, 4), 10) || 0;
        return yB - yA;
      });
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => (a.title || a.Title || '').localeCompare(b.title || b.Title || ''));
    }

    return result;
  }, [movies, genre, minRating, releaseYear, sortBy]);

  // ─── Memoized Active Genre Badge ──────────────────────────────────────────
  const activeGenreLabel = useMemo(() => {
    if (genre === 'ALL') return null;
    const found = TMDB_GENRES.find((g) => g.id === Number(genre));
    return found ? found.name : null;
  }, [genre]);

  return (
    <div className="w-full space-y-4">
      {/* ── Active Filter Bar ─────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#14161F]/90 dark:bg-[#14161F]/90 border border-gray-800 dark:border-gray-800 text-xs backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#007BA7]" />
              <span>Active Filters:</span>
            </span>

            {activeGenreLabel && (
              <span className="px-2.5 py-1 rounded-md bg-[#007BA7]/20 text-[#00A3DF] border border-[#007BA7]/40 font-medium">
                Genre: {activeGenreLabel}
              </span>
            )}

            {minRating > 0 && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-300" />
                <span>★ {minRating.toFixed(1)}+</span>
              </span>
            )}

            {releaseYear !== 'ALL' && (
              <span className="px-2.5 py-1 rounded-md bg-[#FF2D95]/15 text-[#FF2D95] border border-[#FF2D95]/30 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Year: {releaseYear}</span>
              </span>
            )}

            <span className="text-slate-400 ml-1">
              ({filteredMovies.length} of {movies.length} titles match)
            </span>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all font-semibold cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      )}

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-900 animate-pulse border border-gray-800"
            >
              <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
            </div>
          ))}
        </div>
      )}

      {/* ── Filtered Movie Grid ───────────────────────────────────────────── */}
      {!loading && filteredMovies.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={handleCardSelect}
              enableLink={false}
            />
          ))}
        </div>
      )}

      {/* ── Zero Results: No Movies Match Filters ─────────────────────────── */}
      {!loading && movies.length > 0 && filteredMovies.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center justify-center rounded-2xl bg-[#14161F]/50 dark:bg-[#14161F]/50 border border-gray-800 dark:border-gray-800 p-8">
          <Film className="w-14 h-14 text-slate-600 mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">No Titles Match Your Filters</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            No movies in the currently loaded payload match the selected genre, minimum rating, or release year combination.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#007BA7] hover:bg-[#005877] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#007BA7]/30 cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(MovieGrid);
