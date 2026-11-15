'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Film } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleFavorite, selectIsFavorite } from '@/redux/favoritesSlice';
import { getPosterUrl } from '@/services/movieService';

/**
 * MovieCard Component
 *
 * Performance-optimized VOD poster card:
 * - Direct Redux Toolkit integration for user favorites.
 * - Memoized with React.memo to prevent unnecessary repaints.
 * - Restricts image height/width with Next.js <Image /> in an aspect-[2/3] container.
 * - Smooth hover effect: hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-cyan-900/50.
 * - Dark gradient overlay on hover with Star rating badge & Heart favorite toggle.
 */
export function MovieCard({ movie, onSelectMovie, enableLink = false, priority = false }) {
  const dispatch = useDispatch();
  const isFavSelector = useMemo(() => selectIsFavorite(movie?.id), [movie?.id]);
  const favorited = useSelector(isFavSelector);

  const [imageError, setImageError] = useState(false);

  const rawPoster = movie?.poster_path || movie?.Poster;
  const posterUrl = useMemo(() => getPosterUrl(rawPoster), [rawPoster]);

  const releaseYear = useMemo(() => {
    return movie?.release_date
      ? movie.release_date.split('-')[0]
      : movie?.Year || 'N/A';
  }, [movie?.release_date, movie?.Year]);

  const formattedRating = useMemo(() => {
    return typeof movie?.vote_average === 'number'
      ? movie.vote_average.toFixed(1)
      : movie?.imdbRating || '7.5';
  }, [movie?.vote_average, movie?.imdbRating]);

  const handleHeartClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch(toggleFavorite(movie));
    },
    [dispatch, movie]
  );

  const handleCardClick = useCallback(() => {
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  }, [onSelectMovie, movie]);

  const isAmazon = posterUrl?.includes('media-amazon.com');

  const cardInner = (
    <div
      onClick={handleCardClick}
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-900 dark:bg-gray-900 shadow-lg hover:shadow-cyan-900/50 hover:scale-105 transition-transform duration-300 cursor-pointer select-none border border-transparent hover:border-gray-700/60"
    >
      {/* ── Poster Image Container with explicit relative position ────────── */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={movie?.title || movie?.Title || 'Movie Poster'}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover object-center group-hover:opacity-85 transition-opacity duration-300"
            priority={priority}
            unoptimized={isAmazon}
            onError={() => setImageError(true)}
          />
        ) : (
          /* Fallback Poster when image is missing or errors */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 p-3 text-center">
            <Film className="w-10 h-10 mb-2 text-gray-500 opacity-60" />
            <span className="text-xs font-semibold line-clamp-3 text-slate-300">
              {movie?.title || movie?.Title || 'Unknown Title'}
            </span>
            <span className="text-[10px] text-gray-400 mt-1">{releaseYear}</span>
          </div>
        )}

        {/* ── Dark Gradient Vignette Overlay (always visible on hover) ──────── */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* ── Top Floating Badges: Star Rating & Heart Favorite ─────────────── */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
          {/* Star Rating Badge */}
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur-md text-amber-400 border border-amber-400/30 shadow-md">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{formattedRating}</span>
          </span>

          {/* Heart Favorite Toggle Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            className="p-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white hover:border-[#FF2D95] hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer pointer-events-auto"
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors duration-200 ${
                favorited
                  ? 'fill-[#FF2D95] text-[#FF2D95] filter drop-shadow-[0_0_6px_rgba(255,45,149,0.8)]'
                  : 'text-white hover:text-[#FF2D95]'
              }`}
            />
          </button>
        </div>

        {/* ── Bottom Info Bar Overlay (visible on hover) ───────────────────── */}
        <div className="absolute bottom-0 inset-x-0 p-3 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <p className="text-white text-xs font-bold line-clamp-1 drop-shadow-md">
            {movie?.title || movie?.Title || 'Unknown Title'}
          </p>
          <div className="flex items-center justify-between text-[10px] text-gray-300 mt-1">
            <span className="font-semibold text-[#00A3DF]">{releaseYear}</span>
            <span className="text-slate-400 font-medium">Click for details</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (enableLink && movie?.id) {
    return (
      <Link href={`/movie/${movie.id}`} className="block w-full">
        {cardInner}
      </Link>
    );
  }

  return cardInner;
}

export default React.memo(MovieCard);
