'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star, Heart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectFavoritesCount } from '@/redux/favoritesSlice';

/**
 * SidebarNav Component
 *
 * Implements secondary navigation in the left sidebar:
 * - "Discover" with Star icon
 * - "Favorites" with Heart icon and live saved count badge from Redux store
 * - Active link styling with Cerulean Blue (#007BA7) background & left-border highlight
 * - Neon Rose (#FF2D95) hover states
 */
export function SidebarNav() {
  const pathname = usePathname();
  const favoritesCount = useSelector(selectFavoritesCount);

  const isDiscoverActive = pathname === '/' || pathname.startsWith('/movie');
  const isFavoritesActive = pathname === '/favorites';

  return (
    <nav className="flex flex-col space-y-1.5 w-full">
      {/* Discover Link */}
      <Link
        href="/"
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border-l-4 ${
          isDiscoverActive
            ? 'bg-[#007BA7] text-white border-[#007BA7] shadow-lg shadow-[#007BA7]/30'
            : 'border-transparent text-slate-400 hover:text-[#FF2D95] hover:border-[#FF2D95] hover:bg-white/5'
        }`}
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            isDiscoverActive ? 'text-white fill-white' : 'text-slate-400 group-hover:text-[#FF2D95]'
          }`}
        />
        <span>Discover</span>
      </Link>

      {/* Favorites Link */}
      <Link
        href="/favorites"
        className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border-l-4 ${
          isFavoritesActive
            ? 'bg-[#007BA7] text-white border-[#007BA7] shadow-lg shadow-[#007BA7]/30'
            : 'border-transparent text-slate-400 hover:text-[#FF2D95] hover:border-[#FF2D95] hover:bg-white/5'
        }`}
      >
        <div className="flex items-center space-x-3">
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavoritesActive ? 'text-white fill-white' : 'text-slate-400 group-hover:text-[#FF2D95]'
            }`}
          />
          <span>Favorites</span>
        </div>
        {favoritesCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#FF2D95] text-white shadow-sm">
            {favoritesCount}
          </span>
        )}
      </Link>
    </nav>
  );
}

export default React.memo(SidebarNav);
