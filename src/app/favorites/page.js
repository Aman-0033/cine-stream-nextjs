'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowLeft, Sparkles } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectFavorites, clearFavorites } from '@/redux/favoritesSlice';
import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';

export default function FavoritesPage() {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all saved favorites?')) {
      dispatch(clearFavorites());
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#1f2230] dark:border-[#1f2230] border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <Link href="/" className="hover:text-cerulean-light flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Discover</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>My Saved Favorites</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40">
              {favorites.length} {favorites.length === 1 ? 'Title' : 'Titles'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Persisted securely via <code className="text-[#00A3DF]">Redux-Persist (cinestream_root)</code> across sessions.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="self-start sm:self-center flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Favorites</span>
          </button>
        )}
      </div>

      {/* Grid of Saved Favorites */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
        <div className="py-24 text-center flex flex-col items-center justify-center rounded-2xl bg-[#14161F]/50 dark:bg-[#14161F]/50 border border-gray-800 dark:border-gray-800 p-8">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4 text-[#FF2D95]">
            <Heart className="w-8 h-8 fill-[#FF2D95]/20" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Saved Movies Yet</h2>
          <p className="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
            Click the heart icon on any movie poster card in the discovery catalog to save it to your local favorites.
          </p>
          <Link
            href="/"
            className="flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-[#007BA7] hover:bg-[#005877] transition-all shadow-lg shadow-[#007BA7]/30"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Trending Movies</span>
          </Link>
        </div>
      )}

      {/* Movie Modal */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
