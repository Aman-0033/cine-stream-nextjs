'use client';

import React, { useState } from 'react';
import { Heart, Share2, CheckCircle2 } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

/**
 * MovieDetailClient — the ONLY client-side boundary on the /movie/[id] page.
 *
 * Receives the full movie object as a serialized prop from the
 * async Server Component (src/app/movie/[id]/page.js).
 *
 * Owns ONLY what requires browser APIs:
 *   1. Favorite toggle → FavoritesContext (localStorage)
 *   2. Share button    → navigator.share / navigator.clipboard
 *
 * Everything else (poster, title, synopsis, genres, metadata) is
 * server-rendered above and never re-renders on the client.
 */
export default function MovieDetailClient({ movie }) {
  const { toggleFavorite, isFavorite, isHydrated } = useFavorites();
  const [copied, setCopied] = useState(false);

  const favorited = isHydrated && isFavorite(movie.id);

  const handleShare = async () => {
    const shareData = {
      title: movie.title,
      text: movie.overview?.slice(0, 120) || `Check out ${movie.title} on Cine-Stream!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // User cancelled share or clipboard failed — silent fail
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* ── Favorite Toggle ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => toggleFavorite(movie)}
        disabled={!isHydrated}
        className={`flex items-center space-x-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
          favorited
            ? 'bg-rose-neon/15 text-rose-neon border border-rose-neon/40 hover:bg-rose-neon/25'
            : 'bg-[#14161F] hover:bg-[#1F2230] text-gray-200 border border-[#2D3142] hover:border-cerulean/40'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Heart
          className={`w-4 h-4 transition-all ${
            favorited ? 'fill-rose-neon text-rose-neon scale-110' : 'fill-none'
          }`}
        />
        <span>{favorited ? 'Favorited' : 'Add to Favorites'}</span>
      </button>

      {/* ── Share / Copy Link ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleShare}
        className="flex items-center space-x-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-cerulean hover:bg-cerulean-light text-white border border-cerulean/40 shadow-md transition-all"
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </>
        )}
      </button>
    </div>
  );
}
