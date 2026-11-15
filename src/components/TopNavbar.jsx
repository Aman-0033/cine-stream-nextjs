'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Radio, Wifi, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { setProviderMode, getProviderMode, setProviderListener } from '@/services/movieService';

export function TopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [providerMode, setMode] = useState(() => getProviderMode());
  const [providerInfo, setProviderInfo] = useState({
    name: 'TMDB Primary CDN',
    reason: 'Auto-detection active',
  });
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* ── Left: Brand Logo ──────────────────────────────────────────────── */}
      <Link href="/" className="flex items-center space-x-3 shrink-0 group">
        <div className="flex flex-col">
          <span className="text-xl sm:text-2xl font-black tracking-wider">
            <span className="font-bold text-white">CINE</span>
            <span className="font-bold text-[#007BA7]">-STREAM</span>
          </span>
          <span className="hidden sm:inline text-[10px] tracking-widest uppercase font-semibold text-slate-400">
            Premium Cinema
          </span>
        </div>
      </Link>

      {/* ── Center: Search Bar with Neon Rose Focus Ring ──────────────────── */}
      <form
        onSubmit={handleNavSearch}
        className="relative flex-1 max-w-md mx-4"
      >
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={navSearchQuery}
          onChange={(e) => setNavSearchQuery(e.target.value)}
          placeholder="Search movies, genres, actors..."
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 text-sm text-white placeholder-slate-400 rounded-full focus:outline-none focus:border-[#FF2D95] focus:ring-2 focus:ring-[#FF2D95] transition-all shadow-inner"
        />
      </form>

      {/* ── Right: Theme Toggle & 'ISP Fallback' Button ──────────────────── */}
      <div className="flex items-center space-x-2.5 shrink-0 relative">
        <ThemeToggle />

        <button
          type="button"
          onClick={() => setShowNetworkInfo(!showNetworkInfo)}
          className="flex items-center space-x-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium bg-gray-900 dark:bg-gray-900 border border-gray-800 dark:border-gray-800 text-slate-300 hover:text-white hover:border-[#FF2D95] transition-all shadow-sm cursor-pointer"
          title="ISP Fallback status & diagnostics"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">ISP Fallback (OMDb API)</span>
          <span className="sm:hidden">ISP</span>
        </button>

        {/* Network Diagnostics Dropdown */}
        {showNetworkInfo && (
          <div className="absolute right-0 top-10 mt-2 w-80 p-4 rounded-xl bg-[#0F1015] border border-[#2D3142] shadow-2xl z-50 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F2230]">
              <div className="flex items-center space-x-1.5 font-bold text-white">
                <Wifi className="w-4 h-4 text-[#FF2D95]" />
                <span>ISP & TMDB Routing</span>
              </div>
              <button
                onClick={() => setShowNetworkInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="mb-3 leading-relaxed text-slate-400">
              Indian ISPs (Airtel, Jio, ACT) can block <code className="text-[#007BA7]">api.themoviedb.org</code>. Cine-Stream automatically routes requests through OMDb.
            </p>
            <div className="space-y-1.5 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Provider Mode</span>
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
                  OMDb
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
                Active: {providerInfo.name || 'Auto'}
              </span>
              <button
                onClick={() => handleModeChange('auto')}
                className="underline hover:text-[#007BA7]"
              >
                Reset Auto
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default TopNavbar;
