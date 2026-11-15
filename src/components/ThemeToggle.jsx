'use client';

import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, selectThemeMode } from '@/redux/themeSlice';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle Component
 *
 * Client Component for switching between Dark and Light cinematic themes.
 * Employs useCallback to prevent function recreation on re-renders.
 */
export function ThemeToggle() {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);

  const handleToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-300 shadow-sm cursor-pointer ${
        isDark
          ? 'bg-gray-900 border-gray-800 text-slate-300 hover:text-white hover:border-[#007BA7]'
          : 'bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:border-[#007BA7] hover:shadow-slate-200/50'
      }`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      <span className="flex items-center justify-center w-3.5 h-3.5">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-[#00A3DF]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
      </span>
      <span className="hidden sm:inline capitalize">{mode}</span>
    </button>
  );
}

export default React.memo(ThemeToggle);
