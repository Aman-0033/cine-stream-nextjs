'use client';

import React from 'react';
import { Search, X, Activity, Cpu, Zap, Clock } from 'lucide-react';

export function SearchBar({
  searchTerm = '',
  onSearchChange,
  onClear,
  isDebouncing = false,
  keystrokeCount = 0,
  requestCount = 0,
}) {
  const requestsSaved = Math.max(0, keystrokeCount - requestCount);

  return (
    <div className="w-full">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5 text-cerulean-light" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search by title, genre, actor, or franchise (e.g. Inception, Marvel)..."
          className="w-full pl-11 pr-12 py-3.5 bg-[#0F1015] border border-[#2D3142] focus:border-[#FF2D95] focus:ring-2 focus:ring-[#FF2D95]/30 text-white placeholder-slate-400 rounded-2xl text-base shadow-inner transition-all duration-200 outline-none"
        />

        {searchTerm && (
          <button
            type="button"
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
            title="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Live 500ms Debounce Telemetry Badge & Bar */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border transition-all duration-300 ${
              isDebouncing
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                : searchTerm
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-dark-800 border-dark-700 text-gray-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">
              {isDebouncing
                ? 'Typing (Throttled 500ms...)'
                : searchTerm
                ? 'Dispatched & Synced'
                : 'Debounce Idle (500ms)'}
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#14161F] border border-[#222530] text-gray-400">
            <Cpu className="w-3.5 h-3.5 text-cerulean-light" />
            <span>Delay: <strong>500ms</strong></span>
          </div>
        </div>

        {/* Telemetry Counter Metrics */}
        <div className="flex items-center space-x-3 text-[11px] text-gray-400">
          <span className="flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Keystrokes: <strong className="text-gray-200">{keystrokeCount}</strong></span>
          </span>

          <span className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>HTTP Dispatched: <strong className="text-gray-200">{requestCount}</strong></span>
          </span>

          <span className="hidden md:inline-flex items-center space-x-1 font-semibold text-cerulean-light bg-cerulean/10 px-2 py-0.5 rounded-md border border-cerulean/20">
            <span>Saved: {requestsSaved} requests</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default SearchBar;
