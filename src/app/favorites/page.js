'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';

export default function FavoritesPage() {
  const { favorites, clearFavorites, isHydrated } = useFavorites();
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#1f2230] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <Link href="/" className="hover:text-cerulean-light flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Discover</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>My Saved Favorites</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-rose-neon/20 text-rose-neon border border-rose-neon/40">
              {isHydrated ? favorites.length : 0} {favorites.length === 1 ? 'Title' : 'Titles'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Persisted locally via <code className="text-cerulean-light">localStorage (cinestream_favorites)</code> across sessions.
          </p>
        </div>

        {isHydrated && favorites.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all saved favorites?')) {
                clearFavorites();
              }
            }}
            className="self-start sm:self-center flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-neon bg-rose-neon/10 border border-rose-neon/30 hover:bg-rose-neon/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Favorites</span>
          </button>
        )}
      </div>

      {/* Grid of Saved Movies */}
      {isHydrated && favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={(m) => setSelectedMovie(m)}
              enableLink={false}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-neon/10 border border-rose-neon/30 flex items-center justify-center text-rose-neon mb-5 shadow-inner">
            <Heart className="w-10 h-10 stroke-1 fill-rose-neon/20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            No Favorites Saved Yet
          </h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            Click the heart icon on any movie card in the catalog or AI Mood Matcher to bookmark it here for offline persistence.
          </p>
          <Link
            href="/"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-cerulean hover:bg-cerulean-light shadow-lg shadow-cerulean/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Cinema Catalog</span>
          </Link>
        </div>
      )}

      {/* Detail Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
