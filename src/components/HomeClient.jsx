'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SearchBar } from '@/components/SearchBar';
import { MoodMatcher } from '@/components/MoodMatcher';
import { MovieCard } from '@/components/MovieCard';
import { MovieModal } from '@/components/MovieModal';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchPopularMovies, searchMovies, getPosterUrl } from '@/services/movieService';
import { Film, Loader2, AlertTriangle, ShieldCheck, Flame, Play, Info, Star } from 'lucide-react';

/**
 * HomeClient — isolated Client Component boundary.
 *
 * Implements:
 * - Cinematic trending movie hero banner with gradient vignette overlay
 * - Highly responsive TMDB movie grid (grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6)
 * - Clean borderless poster cards with hover rating/favorite micro-interactions
 * - 500ms debounced search + AI Mood Matcher integration
 * - Native IntersectionObserver infinite scroll
 *
 * @param {{ initialMovies: Array, initialProvider: string, initialTotalPages: number }} props
 */
export default function HomeClient({ initialMovies, initialProvider, initialTotalPages }) {
  // ─── Movie Feed State ─────────────────────────────────────────────────────
  const [movies, setMovies] = useState(initialMovies ?? []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  // ─── Search & Debounce State ──────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const { debouncedValue: debouncedSearchTerm, isDebouncing } = useDebounce(searchTerm, 500);

  // ─── AI Mood Matcher State ────────────────────────────────────────────────
  const [aiMatchedTitle, setAiMatchedTitle] = useState('');

  // ─── UI State ─────────────────────────────────────────────────────────────
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [activeProvider, setActiveProvider] = useState(initialProvider ?? 'TMDB Primary CDN');
  const [isAirtelFallback, setIsAirtelFallback] = useState(false);

  // ─── IntersectionObserver Sentinel ───────────────────────────────────────
  const observerRef = useRef(null);

  // ─── Search handlers ──────────────────────────────────────────────────────
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setKeystrokeCount((prev) => prev + 1);
    if (aiMatchedTitle) setAiMatchedTitle('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setAiMatchedTitle('');
    setPage(1);
  };

  // ─── Core data-fetcher (client-side only: search / infinite-scroll) ───────
  const loadMovies = useCallback(async (targetPage, isNewSearch = false) => {
    const activeQuery = aiMatchedTitle || debouncedSearchTerm;

    if (targetPage === 1) setLoading(true);
    else setIsFetchingMore(true);
    setError(null);

    try {
      const result = activeQuery
        ? await searchMovies(activeQuery, targetPage)
        : await fetchPopularMovies(targetPage);

      setRequestCount((prev) => prev + 1);
      setActiveProvider(result.provider);
      setIsAirtelFallback(Boolean(result.isAirtelFallback));
      setTotalPages(result.totalPages ?? 1);

      if (isNewSearch || targetPage === 1) {
        setMovies(result.movies);
      } else {
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => String(m.id)));
          return [...prev, ...result.movies.filter((m) => !existingIds.has(String(m.id)))];
        });
      }
    } catch (err) {
      console.error('[HomeClient] loadMovies failed:', err);
      setError('Unable to fetch media titles. Switch to Offline Curated mode via the Navbar.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [aiMatchedTitle, debouncedSearchTerm]);

  // ─── Effect: Trigger Page-1 fetch when search/mood changes ───────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPage(1);
    loadMovies(1, true);
  }, [debouncedSearchTerm, aiMatchedTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Effect: Infinite scroll page increment ───────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page > 1) loadMovies(page, false);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Effect: Listen to Navbar provider-change & search events ─────────────
  useEffect(() => {
    const providerHandler = () => {
      setPage(1);
      loadMovies(1, true);
    };
    const searchHandler = (e) => {
      if (e.detail) {
        handleSearchChange(e.detail);
      }
    };

    window.addEventListener('cinestream:provider-change', providerHandler);
    window.addEventListener('cinestream:search', searchHandler);

    return () => {
      window.removeEventListener('cinestream:provider-change', providerHandler);
      window.removeEventListener('cinestream:search', searchHandler);
    };
  }, [loadMovies]);

  // ─── Effect: Native IntersectionObserver infinite scroll ─────────────────
  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !isFetchingMore && page < totalPages) {
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: '300px', threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => {
      observer.unobserve(sentinel);
      observer.disconnect();
    };
  }, [loading, isFetchingMore, page, totalPages]);

  // ─── AI Mood Matcher callbacks ────────────────────────────────────────────
  const handleAiMovieMatched = (title) => {
    setAiMatchedTitle(title);
    setSearchTerm(title);
  };

  const activeQuery = aiMatchedTitle || debouncedSearchTerm;

  // Single trending hero movie
  const heroMovie = movies.length > 0 ? movies[0] : null;
  const heroBackdrop = heroMovie
    ? heroMovie.backdrop_path
      ? heroMovie.backdrop_path.startsWith('http')
        ? heroMovie.backdrop_path
        : `https://image.tmdb.org/t/p/original${heroMovie.backdrop_path.startsWith('/') ? heroMovie.backdrop_path : `/${heroMovie.backdrop_path}`}`
      : getPosterUrl(heroMovie.poster_path)
    : null;

  return (
    <div className="min-h-screen pb-20">
      {/* ── Cinematic Trending Hero Banner ─────────────────────────────────── */}
      {heroMovie && !activeQuery && (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 mb-8">
          <div className="relative w-full h-[60vh] min-h-[460px] max-h-[640px] rounded-3xl overflow-hidden shadow-2xl bg-[#0A0A0A] border border-[#1F2230]/40 group">
            {/* Movie Backdrop */}
            {heroBackdrop ? (
              <img
                src={heroBackdrop}
                alt={heroMovie.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#14161F] via-[#1A1D2A] to-[#0A0A0A]" />
            )}

            {/* Gradient Vignette Overlays: Fading to Jet Black (#0A0A0A) at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/75 via-40% to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 via-35% to-transparent pointer-events-none" />

            {/* Hero Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-3xl z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FF2D95]/15 border border-[#FF2D95]/40 text-[#FF2D95] text-xs font-bold tracking-wider uppercase mb-3 w-fit backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 fill-[#FF2D95]" />
                <span>TRENDING CINEMA</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-3 drop-shadow-md">
                {heroMovie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 mb-4 font-medium">
                <div className="flex items-center space-x-1 text-amber-400 font-bold bg-[#0A0A0A]/80 px-2.5 py-1 rounded-lg border border-[#2D3142] backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>
                    {typeof heroMovie.vote_average === 'number'
                      ? heroMovie.vote_average.toFixed(1)
                      : heroMovie.vote_average || '8.5'}
                  </span>
                </div>
                <span>•</span>
                <span>{heroMovie.release_date?.split('-')[0] || '2024'}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/15">
                  4K Ultra HD
                </span>
                <span>•</span>
                <span className="text-slate-300">
                  {heroMovie.provider === 'omdb' ? 'OMDb' : 'TMDB Cinema'}
                </span>
              </div>

              {heroMovie.overview && (
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl line-clamp-3 mb-6 leading-relaxed drop-shadow">
                  {heroMovie.overview}
                </p>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => setSelectedMovie(heroMovie)}
                  className="flex items-center space-x-2.5 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-[#007BA7] hover:bg-[#005877] shadow-lg shadow-[#007BA7]/30 hover:shadow-[#007BA7]/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Now</span>
                </button>

                <Link
                  href={`/movie/${heroMovie.id}`}
                  className="flex items-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 hover:border-white/30 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <Info className="w-4 h-4 text-slate-300" />
                  <span>More Info</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Discovery, Search & AI Mood Matcher Controls ─────────────────── */}
      <section className="relative pt-4 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2">
            Stream Without Limits
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Real-time debounced discovery, native infinite scroll, and Google Gemini AI Mood Matching.
          </p>
        </div>

        {/* SearchBar (Client Component) */}
        <div className="max-w-3xl mx-auto mb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClear={handleClearSearch}
            isDebouncing={isDebouncing}
            keystrokeCount={keystrokeCount}
            requestCount={requestCount}
          />
        </div>

        {/* MoodMatcher (Client Component) */}
        <div className="max-w-3xl mx-auto">
          <MoodMatcher
            onAiMovieMatched={handleAiMovieMatched}
            currentMatchedTitle={aiMatchedTitle}
            onClearAiMatch={() => {
              setAiMatchedTitle('');
              setSearchTerm('');
            }}
          />
        </div>
      </section>

      {/* ── Movie Grid Section ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#1F2230] gap-2">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-[#00A3DF]" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {activeQuery ? `Results for "${activeQuery}"` : 'Trending & Popular Cinema'}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              ({movies.length} titles loaded)
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Data Stream:</span>
            <span
              className={`px-2.5 py-1 rounded-full font-semibold border ${
                isAirtelFallback
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              }`}
            >
              {activeProvider}
            </span>
          </div>
        </div>

        {/* Airtel / ISP DNS Notice Banner */}
        {isAirtelFallback && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#14161F] border border-amber-500/30 flex items-start space-x-3 text-xs text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold">Airtel / Indian ISP Fallback Active:</strong>
              <span className="ml-1 text-slate-400">
                Routing through OMDb / Curated engine. TMDB DNS blocked by Airtel, ACT, or Jio.
              </span>
            </div>
          </div>
        )}

        {/* Error Callout */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-200 text-sm mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => loadMovies(1, true)}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton: Exact CSS Grid shape */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-gray-900 animate-pulse"
              >
                <div className="w-full h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
              </div>
            ))}
          </div>
        )}

        {/* Movie Grid: Responsive CSS Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={(m) => setSelectedMovie(m)}
                enableLink={false}
              />
            ))}
          </div>
        )}

        {/* Zero Results */}
        {!loading && movies.length === 0 && !error && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Film className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Matching Titles Found</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              No results for &ldquo;{activeQuery}&rdquo;. Try another keyword or use the AI Mood Matcher.
            </p>
            <button
              onClick={handleClearSearch}
              className="px-5 py-2.5 bg-[#007BA7] hover:bg-[#005877] text-white rounded-xl text-sm font-semibold transition-all shadow-md"
            >
              Reset to Popular Movies
            </button>
          </div>
        )}

        {/* IntersectionObserver Sentinel Node */}
        <div ref={observerRef} className="py-8 w-full flex items-center justify-center">
          {isFetchingMore && (
            <div className="flex items-center space-x-2 text-[#00A3DF] text-sm font-medium">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more titles (Page {page + 1} of {totalPages})…</span>
            </div>
          )}
          {!isFetchingMore && page >= totalPages && movies.length > 0 && (
            <div className="text-center text-xs text-slate-500 py-4 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>End of catalog — {movies.length} titles rendered.</span>
            </div>
          )}
        </div>
      </section>

      {/* MovieModal (Client Component) */}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}
