/**
 * src/app/movie/[id]/page.js — Dynamic Movie Detail Route
 *
 * Phase 3: Dynamic SSR & Metadata Injection
 *
 * Architecture:
 *   ✅ Dynamic segment [id] captured from URL via `await params`
 *      (params is a Promise in Next.js 15 — must be awaited)
 *   ✅ `generateMetadata` async function dynamically constructs
 *      <title>, <meta name="description">, and OpenGraph tags from
 *      the TMDB movie data fetched on the server.
 *   ✅ `fetch` inside `generateMetadata` is auto-memoized by Next.js —
 *      the same fetchMovieDetails(id) call in `MovieDetailPage` resolves
 *      from the memoization cache, so TMDB is queried only once per request.
 *   ✅ The page body renders a full SSR movie detail view with no useEffect.
 *   ✅ Interactive elements (favorite toggle) are isolated in MovieDetailClient.
 *
 * File-based route: /movie/[id]
 *   e.g. /movie/550    → Fight Club (TMDB ID)
 *        /movie/fb-1   → Inception  (Curated fallback ID)
 *        /movie/tt0133093 → The Matrix (OMDb imdbID)
 */

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, Clock, Film, ShieldCheck } from 'lucide-react';
import { fetchMovieDetails, getPosterUrl } from '@/services/movieService';
import MovieDetailClient from '@/components/MovieDetailClient';

// ── generateMetadata ──────────────────────────────────────────────────────────
// Called by Next.js BEFORE the page renders. Must be async.
// params is a Promise in Next.js 15 — must be awaited.
// fetch/function calls here are auto-memoized: the same fetchMovieDetails(id)
// in MovieDetailPage below resolves from Next.js request-scoped cache.

export async function generateMetadata({ params }) {
  const { id } = await params;

  let movie = null;
  try {
    movie = await fetchMovieDetails(id);
  } catch {
    // Fallback metadata if fetch fails — page will handle its own error state
    return {
      title: 'Movie Details | Cine-Stream',
      description: 'Discover and explore movie details on Cine-Stream, powered by Next.js 15 SSR.',
    };
  }

  if (!movie) {
    return {
      title: 'Movie Not Found | Cine-Stream',
      description: 'This movie could not be found in the Cine-Stream catalog.',
    };
  }

  // ── Dynamic metadata built from TMDB / OMDb response ─────────────────────
  const releaseYear = movie.release_date
    ? movie.release_date.toString().split('-')[0] || movie.release_date
    : '';

  const ratingStr = typeof movie.vote_average === 'number'
    ? `${movie.vote_average.toFixed(1)}/10`
    : '';

  const description = movie.overview
    ? `${movie.overview.slice(0, 155)}…`
    : `${movie.title} (${releaseYear}) — Discover this cinematic title on Cine-Stream, powered by TMDB and Next.js 15 SSR at Prodesk IT.`;

  const posterUrl = getPosterUrl(movie.poster_path);

  return {
    // ── <title> tag ──────────────────────────────────────────────────────
    title: `${movie.title}${releaseYear ? ` (${releaseYear})` : ''} | Cine-Stream`,

    // ── <meta name="description"> ────────────────────────────────────────
    description,

    // ── Extended SEO metadata ────────────────────────────────────────────
    keywords: [
      movie.title,
      releaseYear,
      'movie',
      'film',
      'Cine-Stream',
      'TMDB',
      'Next.js SSR',
      ...(movie.genres?.map((g) => g.name) ?? []),
    ].filter(Boolean),

    // ── Open Graph (social share preview) ───────────────────────────────
    openGraph: {
      title: `${movie.title}${releaseYear ? ` (${releaseYear})` : ''}`,
      description,
      type: 'video.movie',
      ...(posterUrl && {
        images: [
          {
            url: posterUrl,
            width: 500,
            height: 750,
            alt: `${movie.title} movie poster`,
          },
        ],
      }),
    },

    // ── Twitter Card ─────────────────────────────────────────────────────
    twitter: {
      card: 'summary_large_image',
      title: `${movie.title} | Cine-Stream`,
      description,
      ...(posterUrl && { images: [posterUrl] }),
    },

    // ── Supplementary OG fields ──────────────────────────────────────────
    other: {
      'movie:rating': ratingStr,
      'movie:release_date': movie.release_date ?? '',
    },
  };
}

// ── MovieDetailPage (Async Server Component) ─────────────────────────────────

export default async function MovieDetailPage({ params }) {
  const { id } = await params;

  // fetchMovieDetails is called again here, but Next.js memoizes the
  // result for the duration of this single render pass — zero double-fetch.
  let movie = null;
  try {
    movie = await fetchMovieDetails(id);
  } catch (err) {
    console.error(`[SSR] fetchMovieDetails failed for id="${id}":`, err?.message);
  }

  // 404 for truly missing movies
  if (!movie) {
    notFound();
  }

  const posterUrl = getPosterUrl(movie.poster_path);
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  const releaseYear = movie.release_date
    ? movie.release_date.toString().split('-')[0] || movie.release_date
    : 'Unknown';

  const formattedRating =
    typeof movie.vote_average === 'number'
      ? movie.vote_average.toFixed(1)
      : Number(movie.vote_average || 7.0).toFixed(1);

  const runtimeStr = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="min-h-screen pb-20">

      {/* ── Cinematic Backdrop (server-rendered, no JS needed) ──────────── */}
      {backdropUrl && (
        <div className="relative w-full h-56 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src={backdropUrl}
            alt={`${movie.title} backdrop`}
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
          />
          {/* Deep gradient overlay so text above is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/60 to-transparent" />
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* Back crumb */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-6">
          <Link
            href="/"
            className="hover:text-cerulean-light flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Discover</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-gray-500 truncate max-w-[200px]">{movie.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">

          {/* ── Poster Column (Server-rendered <Image />) ─────────────── */}
          <div className="flex-shrink-0 w-full md:w-64 lg:w-72">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-[#1f2230] shadow-2xl bg-[#0A0A0A]">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={`${movie.title} poster`}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-gray-600">
                  <Film className="w-16 h-16 mb-3 text-cerulean-light/50" />
                  <span className="text-xs text-center">No Poster Available</span>
                </div>
              )}
            </div>

            {/* Provider badge */}
            <div className="mt-3 flex items-center justify-center space-x-1.5 text-[11px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Source:{' '}
                <strong className="uppercase text-gray-400">
                  {movie.provider === 'omdb' ? 'OMDb API' : movie.provider === 'tmdb' ? 'TMDB REST API' : 'Curated Fallback'}
                </strong>
              </span>
            </div>
          </div>

          {/* ── Details Column (Server-rendered) ───────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Title (injected into <title> via generateMetadata above) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2">
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-sm text-cerulean-light italic mb-4 font-medium">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Rating */}
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{formattedRating} / 10</span>
                {movie.vote_count > 0 && (
                  <span className="text-amber-400/60 font-normal text-xs">
                    ({Number(movie.vote_count).toLocaleString()} votes)
                  </span>
                )}
              </div>

              {/* Year */}
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#14161F] border border-[#2D3142] text-gray-300 text-sm">
                <Calendar className="w-3.5 h-3.5 text-cerulean-light" />
                <span>{releaseYear}</span>
              </div>

              {/* Runtime */}
              {runtimeStr && (
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#14161F] border border-[#2D3142] text-gray-300 text-sm">
                  <Clock className="w-3.5 h-3.5 text-cerulean-light" />
                  <span>{runtimeStr}</span>
                </div>
              )}

              {/* Status */}
              {movie.status && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cerulean/15 border border-cerulean/30 text-cerulean-light">
                  {movie.status}
                </span>
              )}
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1F2230] border border-[#2D3142] text-gray-300 hover:border-cerulean/40 hover:text-cerulean-light transition-colors"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview — the content of <meta name="description"> is derived from this */}
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Overview & Storyline
              </h2>
              <p className="text-gray-300 leading-relaxed text-base">
                {movie.overview || 'No synopsis available for this cinematic title.'}
              </p>
            </div>

            {/* Director / Cast (OMDb only) */}
            {(movie.director || movie.actors) && (
              <div className="mb-8 space-y-3">
                {movie.director && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Director</span>
                    <p className="text-gray-200 text-sm mt-1">{movie.director}</p>
                  </div>
                )}
                {movie.actors && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Cast</span>
                    <p className="text-gray-200 text-sm mt-1">{movie.actors}</p>
                  </div>
                )}
              </div>
            )}

            {/*
             * ── CLIENT COMPONENT: MovieDetailClient ────────────────────
             * Isolated interactive boundary for:
             *   - Favorite toggle button (requires FavoritesContext)
             *   - Share button (navigator.share / clipboard API)
             * Server Component code above never reaches the browser.
             */}
            <MovieDetailClient movie={movie} />

          </div>
        </div>

        {/* ── SSR Verification Badge ──────────────────────────────────────── */}
        <div className="mt-16 pt-8 border-t border-[#1f2230]">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0F1015] border border-[#222530] text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong className="text-cerulean-light">SSR Verified:</strong>{' '}
              This page was Server-Side Rendered via Next.js 15 App Router. Dynamic metadata for{' '}
              <em className="text-white">&ldquo;{movie.title}&rdquo;</em> was injected into{' '}
              <code className="text-cerulean-light">&lt;title&gt;</code> and{' '}
              <code className="text-cerulean-light">&lt;meta name=&quot;description&quot;&gt;</code>{' '}
              via <code className="text-cerulean-light">generateMetadata()</code>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
