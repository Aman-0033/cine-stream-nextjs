'use client';

import React, { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  setGenre,
  setMinRating,
  setReleaseYear,
  setSortBy,
  resetFilters,
  selectFilterState,
  selectHasActiveFilters,
  selectActiveFilterCount,
  TMDB_GENRES,
  AVAILABLE_YEARS,
} from '@/redux/filterSlice';
import { Filter, Star, Calendar, SlidersHorizontal, RotateCcw, ArrowUpDown } from 'lucide-react';

/**
 * SidebarFilter Component
 *
 * Highly optimized Client Component for multi-dimensional filtering.
 * Strictly uses useCallback for all mutation dispatchers to prevent reference instability
 * and useMemo for derived state to avoid unnecessary DOM operations.
 */
export function SidebarFilter() {
  const dispatch = useDispatch();
  const filter = useSelector(selectFilterState);
  const hasActiveFilters = useSelector(selectHasActiveFilters);
  const activeCount = useSelector(selectActiveFilterCount);

  // ─── Memoized Mutation Dispatchers ────────────────────────────────────────
  const handleGenreChange = useCallback(
    (e) => {
      const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
      dispatch(setGenre(val));
    },
    [dispatch]
  );

  const handleMinRatingChange = useCallback(
    (e) => {
      dispatch(setMinRating(e.target.value));
    },
    [dispatch]
  );

  const handleReleaseYearChange = useCallback(
    (e) => {
      dispatch(setReleaseYear(e.target.value));
    },
    [dispatch]
  );

  const handleSortByChange = useCallback(
    (e) => {
      dispatch(setSortBy(e.target.value));
    },
    [dispatch]
  );

  const handleReset = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // ─── Memoized Formatted Values ────────────────────────────────────────────
  const formattedRatingBadge = useMemo(() => {
    if (filter.minRating === 0) return 'All';
    return `★ ${filter.minRating.toFixed(1)}+`;
  }, [filter.minRating]);

  return (
    <div className="flex flex-col space-y-5 px-3 py-2 text-slate-300">
      {/* ── Filter Header & Reset ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#007BA7]" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-[#FF2D95] text-white">
              {activeCount}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ── 1. Genre Filter ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
          <Filter className="w-3 h-3 text-[#007BA7]" />
          <span>Genre</span>
        </label>
        <select
          value={filter.genre}
          onChange={handleGenreChange}
          className="w-full bg-[#14161F] dark:bg-[#14161F] border border-gray-800 dark:border-gray-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#007BA7] focus:ring-1 focus:ring-[#007BA7] transition-all cursor-pointer"
        >
          {TMDB_GENRES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* ── 2. Minimum Rating Filter ─────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center space-x-1.5 font-semibold text-slate-400">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Min Rating</span>
          </label>
          <span className="font-bold text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
            {formattedRatingBadge}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="9"
          step="0.5"
          value={filter.minRating}
          onChange={handleMinRatingChange}
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF2D95]"
        />

        <div className="flex justify-between text-[10px] text-slate-500 px-0.5 font-mono">
          <span>0.0</span>
          <span>5.0</span>
          <span>7.0</span>
          <span>9.0</span>
        </div>
      </div>

      {/* ── 3. Release Year Filter ───────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
          <Calendar className="w-3 h-3 text-[#007BA7]" />
          <span>Release Year</span>
        </label>
        <select
          value={filter.releaseYear}
          onChange={handleReleaseYearChange}
          className="w-full bg-[#14161F] dark:bg-[#14161F] border border-gray-800 dark:border-gray-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#007BA7] focus:ring-1 focus:ring-[#007BA7] transition-all cursor-pointer"
        >
          {AVAILABLE_YEARS.map((yr) => (
            <option key={yr} value={yr}>
              {yr === 'ALL' ? 'All Release Years' : yr}
            </option>
          ))}
        </select>
      </div>

      {/* ── 4. Sort By Selector ──────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400">
          <ArrowUpDown className="w-3 h-3 text-[#007BA7]" />
          <span>Sort By</span>
        </label>
        <select
          value={filter.sortBy}
          onChange={handleSortByChange}
          className="w-full bg-[#14161F] dark:bg-[#14161F] border border-gray-800 dark:border-gray-800 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#007BA7] focus:ring-1 focus:ring-[#007BA7] transition-all cursor-pointer"
        >
          <option value="default">Default (Trending / Popular)</option>
          <option value="rating-desc">Rating: Highest First</option>
          <option value="year-desc">Year: Newest First</option>
          <option value="title-asc">Title: Alphabetical (A-Z)</option>
        </select>
      </div>
    </div>
  );
}

export default React.memo(SidebarFilter);
