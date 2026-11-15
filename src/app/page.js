/**
 * src/app/page.js — Root Home Route
 *
 * This is a pure ASYNC SERVER COMPONENT.
 *
 * Key constraints (Phase 2):
 *   ✅ Fetches initial "Popular Movies" payload directly on the server during render.
 *   ✅ Zero `useEffect` — data is fetched during the async render, not after mount.
 *   ✅ Zero `useState` — Server Components cannot hold client-side state.
 *   ✅ Passes serialized `initialMovies`, `initialProvider`, and `initialTotalPages`
 *      as props to <HomeClient />, which owns all browser interactivity.
 *
 * Rendering strategy:
 *   - Next.js will attempt Static generation at build time.
 *   - If TMDB_API_KEY / OMDB_KEY are present and uncached, the page becomes
 *     dynamically server-rendered per request automatically.
 *   - The Curated fallback always guarantees a non-empty static shell.
 */

import HomeClient from '@/components/HomeClient';
import { fetchPopularMovies } from '@/services/movieService';

export const metadata = {
  title: 'Cine-Stream | Discover Popular Movies',
  description:
    'Explore trending and popular movies with AI Mood Matching, 500ms debounced search, and an Airtel/Indian ISP DNS-resilient TMDB + OMDb fallback engine. Built on Next.js 15 App Router at Prodesk IT.',
  keywords: ['movies', 'TMDB', 'Next.js 15', 'SSR', 'Cine-Stream', 'Prodesk IT', 'Sprint 9'],
  openGraph: {
    title: 'Cine-Stream — Stream Without Limits',
    description: 'Next.js 15 SSR movie discovery with AI Mood Matching and Airtel ISP DNS failover.',
    type: 'website',
  },
};

export default async function HomePage() {
  // ── Server-side data fetch ───────────────────────────────────────────────
  // Runs exclusively on the server during render. NEVER reaches the browser.
  // No useEffect. No axios client-side instance. Uses native fetch() with
  // Next.js ISR cache headers baked into movieService.fetchPopularMovies().
  let initialMovies = [];
  let initialProvider = 'Curated Offline Fallback';
  let initialTotalPages = 1;

  try {
    const result = await fetchPopularMovies(1);
    initialMovies = result.movies ?? [];
    initialProvider = result.provider ?? 'Curated Offline Fallback';
    initialTotalPages = result.totalPages ?? 1;
  } catch (err) {
    // Graceful degradation: HomeClient will show the curated fallback grid
    console.error('[SSR] fetchPopularMovies failed on server:', err?.message);
  }

  // ── Render: Pass serialized server data into the Client Component boundary ─
  //
  // `initialMovies` is a plain serializable array — safe to cross the
  // Server→Client boundary as props (confirmed by Next.js docs:
  // "Data crosses through props, and it must be serializable").
  //
  // HomeClient holds ALL browser-side interactivity:
  //   SearchBar, MoodMatcher, MovieCard favorites, MovieModal, IntersectionObserver.
  return (
    <HomeClient
      initialMovies={initialMovies}
      initialProvider={initialProvider}
      initialTotalPages={initialTotalPages}
    />
  );
}
