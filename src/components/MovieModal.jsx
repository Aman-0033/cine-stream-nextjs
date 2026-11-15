'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Star, Calendar, Heart, Film, ArrowUpRight } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { getPosterUrl } from '../services/movieService';

export function MovieModal({ movie, onClose }) {
  const { toggleFavorite, isFavorite, isHydrated } = useFavorites();

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const favorited = isHydrated && isFavorite(movie.id);
  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date
    ? movie.release_date.split('-')[0] || movie.release_date
    : 'Unknown';

  const formattedRating = typeof movie.vote_average === 'number'
    ? movie.vote_average.toFixed(1)
    : Number(movie.vote_average || 7.0).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#0F1015] border border-[#2D3142] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-[#070709]/80 text-gray-400 hover:text-white hover:bg-black transition-colors"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Poster Column */}
        <div className="md:w-5/12 relative aspect-[2/3] md:aspect-auto bg-[#070709] flex items-center justify-center overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <Film className="w-16 h-16 text-cerulean-light mb-2" />
              <span>No Poster Available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-transparent to-[#0F1015] pointer-events-none" />
        </div>

        {/* Details Column */}
        <div className="md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cerulean/20 text-cerulean-light border border-cerulean/40">
                Featured Title
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                {releaseYear}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {movie.title}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 my-4">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{formattedRating} / 10</span>
              </div>
              <span className="text-xs text-gray-400">
                Source: <strong className="text-gray-200 uppercase">{movie.provider || 'Cine-Stream'}</strong>
              </span>
            </div>

            {/* Synopsis */}
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Overview & Storyline
              </h4>
              <p className="text-sm text-gray-300 leading-relaxed max-h-48 overflow-y-auto pr-1">
                {movie.overview || 'No extended overview provided for this cinema title.'}
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-6 mt-6 border-t border-[#1F2230] flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => toggleFavorite(movie)}
              className={`flex-1 flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-md ${
                favorited
                  ? 'bg-rose-neon/15 text-rose-neon border border-rose-neon/40 hover:bg-rose-neon/25'
                  : 'bg-dark-800 hover:bg-dark-700 text-gray-200 border border-dark-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-neon text-rose-neon' : ''}`} />
              <span>{favorited ? 'Favorited' : 'Bookmark Title'}</span>
            </button>

            <Link
              href={`/movie/${movie.id}`}
              onClick={onClose}
              className="flex items-center space-x-1.5 px-4 py-3 rounded-xl font-bold text-sm bg-cerulean hover:bg-cerulean-light text-white transition-all shadow-md"
            >
              <span>Full Page</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieModal;
