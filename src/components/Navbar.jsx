'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Film, Heart, Sparkles, ShieldCheck, Wifi, Radio, Search } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { setProviderMode, getProviderMode, setProviderListener } from '../services/movieService';

export function Navbar() {
  const { favorites, isHydrated } = useFavorites();
  const pathname = usePathname();
  const router = useRouter();
  const [providerMode, setMode] = useState(() => getProviderMode());
  const [providerInfo, setProviderInfo] = useState({
    name: 'TMDB Primary CDN',
    reason: 'Auto-detection active',
  });
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');

  useEffect(() => {
    return setProviderListener((info) => {
      setProviderInfo(info);
      if (info.mode) setMode(info.mode);
    });
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setProviderMode(newMode);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cinestream:provider-change', { detail: newMode }));
    }
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (!navSearchQuery.trim()) return;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cinestream:search', { detail: navSearchQuery.trim() })
      );
    }

    if (pathname !== '/') {
      router.push(`/?search=${encodeURIComponent(navSearchQuery.trim())}`);
    }
  };

  const isDiscoverActive = pathname === '/' || pathname.startsWith('/movie');
  const isFavoritesActive = pathname === '/favorites';

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0A0A0A]/80 border-b border-[#1F2230] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* ── Brand Logo Treatment ───────────────────────────────────────── */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#005877] via-[#007BA7] to-[#FF2D95] p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#0A0A0A] rounded-[10px] flex items-center justify-center">
                <Film className="w-5 h-5 text-[#00A3DF] group-hover:text-[#FF2D95] transition-colors duration-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-white">
                CINE<span className="text-[#FF2D95] font-extrabold">-STREAM</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
                Premium Cinema
              </span>
            </div>
          </Link>

          {/* ── Sleek Search Input with Neon Rose Focus Ring ─────────────────── */}
          <form
            onSubmit={handleNavSearch}
            className="relative hidden md:flex items-center flex-1 max-w-md mx-4"
          >
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-[#007BA7]" />
            </div>
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder="Search movies, genres, actors..."
              className="w-full pl-10 pr-4 py-2 bg-[#14161F] border border-[#2D3142] text-sm text-white placeholder-slate-400 rounded-full focus:outline-none focus:border-[#FF2D95] focus:ring-2 focus:ring-[#FF2D95]/40 transition-all duration-200 shadow-inner"
            />
          </form>

          {/* ── Right-Side Controls: Network Info + Nav Links ───────────────── */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
            {/* Airtel / ISP DNS Protection & Mode Switcher */}
            <div className="hidden lg:flex items-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNetworkInfo(!showNetworkInfo)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#14161F] border border-[#2D3142] hover:border-[#007BA7] text-slate-300 hover:text-white transition-all shadow-sm"
                  title="Indian ISP / Airtel TMDB DNS Fallback status"
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="font-semibold text-[#00A3DF]">ISP Fallback:</span>
                  <span className="text-slate-200">{providerInfo.name || 'Auto'}</span>
                </button>

                {showNetworkInfo && (
                  <div className="absolute right-0 mt-2 w-80 p-4 rounded-xl bg-[#0F1015] border border-[#2D3142] shadow-2xl z-50 text-xs text-slate-300">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F2230]">
                      <div className="flex items-center space-x-1.5 font-bold text-white">
                        <Wifi className="w-4 h-4 text-[#FF2D95]" />
                        <span>Network & ISP Routing Diagnostics</span>
                      </div>
                      <button
                        onClick={() => setShowNetworkInfo(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="mb-3 leading-relaxed text-slate-400">
                      Indian ISPs (such as <strong className="text-white">Airtel</strong>, Jio, and ACT) frequently block <code className="text-[#00A3DF]">api.themoviedb.org</code> at the DNS level. Cine-Stream&apos;s dual-engine automatically detects this and routes queries seamlessly through OMDb or offline curated cache.
                    </p>
                    
                    <div className="space-y-1.5 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Manual Data Feed Force</span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => handleModeChange('tmdb')}
                          className={`py-1 px-2 rounded text-[11px] font-medium border ${
                            providerMode === 'tmdb'
                              ? 'bg-[#007BA7] text-white border-[#00A3DF] font-bold'
                              : 'bg-[#14161F] text-slate-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          TMDB
                        </button>
                        <button
                          onClick={() => handleModeChange('omdb')}
                          className={`py-1 px-2 rounded text-[11px] font-medium border ${
                            providerMode === 'omdb'
                              ? 'bg-[#007BA7] text-white border-[#00A3DF] font-bold'
                              : 'bg-[#14161F] text-slate-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          OMDb (Airtel)
                        </button>
                        <button
                          onClick={() => handleModeChange('demo')}
                          className={`py-1 px-2 rounded text-[11px] font-medium border ${
                            providerMode === 'demo'
                              ? 'bg-[#007BA7] text-white border-[#00A3DF] font-bold'
                              : 'bg-[#14161F] text-slate-400 border-gray-700 hover:text-white'
                          }`}
                        >
                          Curated
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1F2230]">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Zero-Crash QA Safe
                      </span>
                      <button
                        onClick={() => handleModeChange('auto')}
                        className="underline hover:text-[#00A3DF]"
                      >
                        Reset to Auto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-2 sm:space-x-3">
              <Link
                href="/"
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isDiscoverActive
                    ? 'bg-[#007BA7]/20 text-[#00A3DF] border border-[#007BA7]/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#14161F]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#00A3DF]" />
                <span>Discover</span>
              </Link>

              <Link
                href="/favorites"
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 relative ${
                  isFavoritesActive
                    ? 'bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-[#14161F]'
                }`}
              >
                <Heart className="w-4 h-4 text-[#FF2D95] fill-[#FF2D95]/30" />
                <span>Favorites</span>
                {isHydrated && favorites.length > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-[#FF2D95] rounded-full transform scale-90 shadow-sm">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
