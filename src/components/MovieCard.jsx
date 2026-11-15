'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Film } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { getPosterUrl } from '@/services/movieService';

/**
 * MovieCard Component
 *
 * Implements a premium VOD poster card:
 * - Restricts image height/width with Next.js <Image /> in an aspect-[2/3] container
 * - Rounded corners with rounded-lg
 * - Smooth hover effect: hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-cyan-900/50
 * - Dark gradient overlay on hover with Star rating badge & Heart favorite toggle
 * - Hides native text links; provides clean interactive card surface
 */
export function MovieCard({ movie, onSelectMovie, enableLink = false, priority = false }) {
  const { toggleFavorite, isFavorite, isHydrated } = useFavorites();
  const [imageError, setImageError] = useState(false);

  const favorited = isHydrated && isFavorite(movie?.id);
  const rawPoster = movie?.poster_path || movie?.Poster;
  const posterUrl = getPosterUrl(rawPoster);

  const releaseYear = movie?.release_date
    ? movie.release_date.split('-')[0]
    : movie?.Year || 'N/A';

  const formattedRating =
    typeof movie?.vote_average === 'number'
      ? movie.vote_average.toFixed(1)
      : movie?.imdbRating || '7.5';

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(movie);
  };

  const handleCardClick = () => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  const isAmazon = posterUrl?.includes('media-amazon.com');

  const cardInner = (
    <div
      onClick={handleCardClick}
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-900 shadow-lg hover:shadow-cyan-900/50 hover:scale-105 transition-transform duration-300 cursor-pointer select-none"
    >
      {/* ── Poster Image Container with explicit relative position ────────── */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={movie.title || movie.Title || 'Movie Poster'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover rounded-lg"
            priority={priority}
            unoptimized={isAmazon}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-900 text-center rounded-lg">
            <Film className="w-8 h-8 text-[#007BA7] mb-2 opacity-80" />
            <p className="text-xs font-bold text-white line-clamp-2 px-1">
              {movie?.title || movie?.Title || 'Untitled'}
            </p>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-1">
              No Poster
            </span>
          </div>
        )}
      </div>

      {/* ── Persistent Ambient Bottom Vignette ────────────────────────────── */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
        <p className="text-xs font-bold text-white truncate drop-shadow">
          {movie?.title || movie?.Title}
        </p>
        <p className="text-[11px] text-slate-300 drop-shadow">
          {releaseYear}
        </p>
      </div>

      {/* ── Dark Gradient Overlay on Hover (Micro-Interactions) ───────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10 rounded-lg">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between w-full">
          {/* Star Rating Badge */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#0A0A0A]/90 backdrop-blur-md border border-gray-800 text-xs font-bold text-amber-400 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{formattedRating}</span>
          </div>

          {/* Favorite Toggle Button with Neon Rose Highlight */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-md ${
              favorited
                ? 'bg-[#0A0A0A]/90 text-[#FF2D95] ring-2 ring-[#FF2D95]/60'
                : 'bg-[#0A0A0A]/70 text-slate-300 hover:text-white hover:bg-[#0A0A0A]'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-colors duration-200 ${
                favorited ? 'fill-[#FF2D95] text-[#FF2D95]' : 'fill-none'
              }`}
            />
          </button>
        </div>

        {/* Bottom Information */}
        <div className="pointer-events-none">
          <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug drop-shadow mb-1">
            {movie?.title || movie?.Title}
          </h3>
          <div className="flex items-center space-x-2 text-xs text-slate-300 mb-1.5">
            <span>{releaseYear}</span>
            <span>•</span>
            <span className="text-[10px] uppercase font-bold text-[#007BA7]">
              {movie?.provider === 'omdb' ? 'OMDb' : 'TMDB'}
            </span>
          </div>
          {movie?.overview && (
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed drop-shadow">
              {movie.overview}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // If enableLink is requested, wrap in Next.js Link without native raw text link styling
  if (enableLink && movie?.id) {
    return (
      <Link href={`/movie/${movie.id}`} className="block h-full no-underline">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}

export default MovieCard;
