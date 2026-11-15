# Cine-Stream (Sprint 9 - Next.js 15 App Router Migration)
## Principal Frontend Architecture & Engineering Log (`PROMPTS.md`)

This technical document tracks the architectural decisions, migration patterns, and execution milestones for migrating **Cine-Stream** from a React/Vite SPA to Next.js 15 App Router at Prodesk IT.

---

### Phase 1: Next.js Initialization & UI Porting

#### 1. Architectural Challenge & Scope
- **Deprecation of React Router DOM**: The legacy Vite SPA used client-side `<Routes>`, `<Route>`, `<Link>`, and `<NavLink>` from `react-router-dom`. In Next.js 15 App Router, routing is strictly file-system based within the `src/app/` hierarchy.
- **Client Hydration Guarding**: `FavoritesContext` in Vite relied on synchronous `localStorage` reading in `useState()`. On the server in Next.js, `window` and `localStorage` do not exist, causing potential hydration mismatch warnings if accessed during SSR.
- **Next.js Asset Whitelisting**: TMDB media delivery uses `image.tmdb.org`. Next.js requires explicit domain authorization under `images.remotePatterns` in `next.config.mjs` to prevent SSR security and optimization blocks.

#### 2. Key Execution Steps
1. **Scaffold Next.js 15 with App Router**:
   - Initialized Next.js 15 with Turbopack, Tailwind CSS, ESLint, and App Router in `src/app/`.
   - Installed `lucide-react` for streaming icons and `axios` for failover services.
2. **TMDB Remote Pattern Whitelisting**:
   - Updated `next.config.mjs` with `images.remotePatterns` for `image.tmdb.org` and `m.media-amazon.com`.
3. **Hydration-Safe Context Porting**:
   - Migrated `FavoritesContext` to `src/context/FavoritesContext.jsx` with `'use client'` directive.
   - Introduced `isHydrated` state guard ensuring `localStorage` is queried only after initial client mount.
4. **Component & Layout Migration**:
   - Architected root layout `src/app/layout.js` wrapping the application in `FavoritesProvider`, persistent sticky `Navbar`, and global dark footer.
   - Created `Navbar.jsx` with Next.js `Link` and `usePathname` for active route pill state.
   - Migrated `MovieCard.jsx`, `MovieModal.jsx`, `SearchBar.jsx`, and `MoodMatcher.jsx` into `src/components/`.
   - Created `src/app/page.js` for the primary discovery feed.
   - Created `src/app/favorites/page.js` for the saved titles feed.
   - Created `src/app/movie/page.js` for the cinema catalog index.
5. **Airtel / Indian ISP DNS Failover Support**:
   - Ported dual-provider discovery engine in `src/services/movieService.js` and Gemini LLM mood synthesis in `src/services/geminiMoodService.js`.
   - Configured `.env.local` and `.env.example`.
6. **Production Build Verification**:
   - Executed `npm run build`. Prerendered static and dynamic App Router routes (`/`, `/favorites`, `/movie`, `/_not-found`) with zero fatal errors.

---

### Phase 2: Server & Client Component Isolation

#### 1. Architectural Challenge & Problem Statement
In a React/Vite SPA, every component runs exclusively in the browser. `useEffect` is mandatory to trigger data fetching after mount. This means:
- The user receives an empty HTML shell (`<div id="root" />`), and content only appears after the JS bundle loads, parses, and executes.
- Search engines and social crawlers that do not execute JavaScript see zero movie content.

In Next.js 15 App Router, components are **Server Components by default**. The goal of Phase 2 is to surgically identify which logic belongs exclusively on the server (data-fetching) and which belongs in the browser (interactivity), and enforce that split at the module boundary.

#### 2. The Server / Client Split Architecture

```
src/app/page.js                    ← async SERVER COMPONENT (zero 'use client')
│  await fetchPopularMovies(1)     ← Runs on Node.js during SSR render
│  Returns serialized props ──────────────────────────────────────────┐
│                                                                     │
└── <HomeClient initialMovies={[…]} />   ← CLIENT COMPONENT BOUNDARY │
       │  'use client' directive         ← drawn here, not deeper    │
       │                                                             │
       ├── <SearchBar />           ← 'use client' (useState, controlled input)
       ├── <MoodMatcher />         ← 'use client' (Gemini LLM fetch, useState)
       ├── <MovieCard />           ← 'use client' (favorite toggle, Context)
       └── <MovieModal />          ← 'use client' (useEffect Escape key, Context)
```

#### 3. Technical Solution & Implementation

**Step 1 — `src/app/page.js` (Async Server Component):**
- Declared as a plain `async` function with **no `'use client'`** directive.
- Calls `await fetchPopularMovies(1)` directly during render — the fetch runs on the Node.js server thread, **never in the browser**.
- **Strict Constraint met**: Zero `useEffect` on this layer. Data arrives as a resolved value before the component returns JSX.
- Passes `initialMovies`, `initialProvider`, and `initialTotalPages` as serialized props to `<HomeClient />`. Serializable data can safely cross the Server→Client boundary per the RSC spec.

**Step 2 — `src/components/HomeClient.jsx` (`'use client'` boundary):**
- `'use client'` is declared **once** at the top of `HomeClient.jsx`. All child components it imports automatically become part of the client module graph — no need to add `'use client'` to every file.
- Accepts `initialMovies` from the server as the initial `useState` value, ensuring zero loading flash on the first paint (SSR HTML already contains the movie grid).
- A `isFirstRender` ref guard prevents re-triggering `loadMovies` on the first client mount when `debouncedSearchTerm` is still `''`, preserving the SSR-provided data.
- IntersectionObserver infinite scroll, 500ms debounce telemetry, AI Mood Matcher handoff, and modal state all live here.

**Step 3 — `src/services/movieService.js` (env var hygiene):**
- Replaced dynamic `process.env[varName]` lookups (which Next.js cannot inline) with direct `process.env.TMDB_API_KEY` and `process.env.NEXT_PUBLIC_TMDB_API_KEY` references.
- Server-only key (`TMDB_API_KEY`) accessed on the server; `NEXT_PUBLIC_TMDB_API_KEY` inlined into the client bundle at build time.

#### 4. Isolation Verification
- `src/app/page.js` contains: `async`, `await`, `export const metadata`, zero hooks, zero event handlers. ✅ Valid Server Component.
- `src/components/HomeClient.jsx` contains: `'use client'`, `useState`, `useEffect`, `useRef`, `useCallback`. ✅ Valid Client Component boundary.
- Build output confirms route `/` is prerendered as static content with the SSR data injected.

---

### Phase 3: Dynamic SSR & Metadata Injection

#### 1. Architectural Challenge & Problem Statement
In a React/Vite SPA, every page URL receives the same static `<title>Cine-Stream</title>` and a single generic `<meta name="description">`. This means:
- Google, Bing, and social media crawlers (Facebook, Twitter/X, LinkedIn) cannot distinguish between `/movie/550` (Fight Club) and `/movie/238` (The Godfather).
- Link previews in messaging apps show a blank or generic image card.
- SEO performance is severely degraded as search engines assign no contextual relevance per URL.

The goal of Phase 3 is to inject **per-movie `<title>` and `<meta name="description">` tags** at the server level before any HTML reaches the browser.

#### 2. File-Based Dynamic Route Architecture
Created `src/app/movie/[id]/page.js` as a **dynamic segment** using Next.js square-bracket folder convention.

```
src/app/movie/
  page.js                ← Catalog index (SSR, page 1 movies)
  [id]/
    page.js              ← Dynamic movie detail (SSR per ID)
    loading.js           ← Suspense skeleton (shown during SSR stream)
    not-found.js         ← Rendered when notFound() is thrown
```

**URL mapping:** `/movie/550` → `params = { id: '550' }`

#### 3. `generateMetadata` Implementation (Phase 3 Core)
```javascript
// src/app/movie/[id]/page.js

export async function generateMetadata({ params }) {
  const { id } = await params;           // params is a Promise in Next.js 15
  const movie = await fetchMovieDetails(id);

  return {
    title: `${movie.title} (${releaseYear}) | Cine-Stream`,
    description: movie.overview?.slice(0, 155) + '…',
    openGraph: {
      title: movie.title,
      description: movie.overview,
      images: [{ url: posterUrl, width: 500, height: 750 }],
      type: 'video.movie',
    },
    twitter: { card: 'summary_large_image', ... },
  };
}
```

**Critical Next.js 15 behavior:**
- `params` is a **Promise** — must `await params` before destructuring.
- `generateMetadata` runs **before** the page component renders — metadata is embedded in the initial HTML response.
- `fetch` / function calls inside `generateMetadata` are **auto-memoized** for the request's duration. The same `fetchMovieDetails(id)` call in the `MovieDetailPage` body resolves from the memoization cache — TMDB is queried **exactly once** per request.
- `generateMetadata` is **Server Component only** — it cannot be used with `'use client'`.

#### 4. Server / Client Split on the Detail Page
```
/movie/[id]/page.js    ← async SERVER COMPONENT
│  await params         ← Next.js 15 Promise-based params
│  generateMetadata()   ← Injects <title>, <meta>, <og:*> into <head>
│  fetchMovieDetails(id) ← SSR fetch, memoized with generateMetadata call
│  <Image /> (next/image) ← Poster + backdrop, optimized via TMDB domain
│  All text content (title, overview, genres, cast) → Server-rendered HTML
│
└── <MovieDetailClient />   ← 'use client' BOUNDARY (drawn here)
      ├── Favorite toggle   ← FavoritesContext (localStorage)
      └── Share button      ← navigator.share / navigator.clipboard
```

#### 5. Generated `<head>` Output Live Verification
Live SSR verification against `http://localhost:3000/movie/fb-1`:
```html
<title>Inception (2010) | Cine-Stream</title>
<meta name="description" content="Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as paymen…"/>
<meta name="keywords" content="Inception,2010,movie,film,Cine-Stream,TMDB,Next.js SSR,Cinema,Curated"/>
<meta name="movie:rating" content="8.8/10"/>
<meta name="movie:release_date" content="2010-07-16"/>
<meta property="og:title" content="Inception (2010)"/>
<meta property="og:description" content="Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as paymen…"/>
<meta property="og:image" content="https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"/>
<meta property="og:image:width" content="500"/>
<meta property="og:image:height" content="750"/>
<meta property="og:image:alt" content="Inception movie poster"/>
<meta property="og:type" content="video.movie"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Inception | Cine-Stream"/>
<meta name="twitter:description" content="Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as paymen…"/>
<meta name="twitter:image" content="https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg"/>
```

#### 6. Supporting Special Route Files
- **`loading.js`**: Animated Tailwind skeleton grid shown as a Suspense fallback while the SSR stream resolves. Zero client JS — pure static HTML from the server.
- **`not-found.js`**: Rendered when `notFound()` is called inside the page Server Component (e.g., TMDB returns 404). Contains navigation back to the catalog.
- **`MovieDetailClient.jsx`**: Isolated interactive component handling bookmarking in `FavoritesContext` and Web Share / Clipboard API.

---

### Phase 4: Premium Dark-Mode Streaming Architecture & Design System

#### 1. Architectural Challenge & Scope
Architect a premium, cinematic streaming interface for "Cine-Stream" comparable to Netflix and Max:
- **Core Design System Tokens**:
  - Background/Base: Jet Black (`#0A0A0A`)
  - Primary Accent: Cerulean Blue (`#007BA7`)
  - Secondary/Highlight: Neon Rose (`#FF2D95`)
  - Typography: High-contrast white (`#FFFFFF`) for primary headings, slate-300 (`#CBD5E1`) for secondary metadata, and Arial (`Arial, Helvetica, sans-serif`) system font family stack for universal rendering with zero layout shift.
- **Glassmorphic Sticky Navigation**:
  - `sticky top-0 z-50 w-full backdrop-blur-md bg-[#0A0A0A]/80 border-b border-[#1F2230]`
  - Brand logo treatment with illuminated gradient border
  - Search input with subtle Neon Rose focus ring (`focus:ring-2 focus:ring-[#FF2D95]/40 focus:border-[#FF2D95]`)
- **Cinematic Trending Hero Section**:
  - Dynamic backdrop showcase with multi-stop gradient vignette overlay fading from transparent to Jet Black (`#0A0A0A`) at the bottom.
  - Cerulean Blue (`#007BA7`) primary CTA button with smooth 300ms hover transitions.
- **Movie Grid & Card Micro-Interactions**:
  - Responsive CSS Grid: `grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6`
  - Borderless poster cards (`rounded-2xl`, `bg-[#0A0A0A]`, aspect ratio `2/3`)
  - Subtle `hover:scale-105` transform with `transition-transform duration-300`
  - Dark gradient overlay on hover revealing movie rating and "Favorite" toggle button.
- **Suspense Feedback**:
  - Root `loading.js` implementing matching skeleton blocks with subtle pulse animations for zero blank screens during SSR navigation.

#### 2. Key Artifacts Delivered
1. `tailwind.config.js`: Integrated design tokens, color palette, and Arial typography stack.
2. `src/app/layout.js`: Global root layout establishing Jet Black base, Arial font inheritance, glassmorphic header, and cinematic footer.
3. `src/components/MovieCard.jsx`: Clean borderless poster card with hover overlay revealing rating and favorite toggle.
4. `src/app/loading.js`: Suspense skeleton loader replicating the 5-column grid.
5. `src/components/HomeClient.jsx`: Upgraded with cinematic trending hero banner and responsive grid layout.

---

# Cine-Stream (Sprint 10 — "The Data Storm": Global State Architecture & Performance)
## Principal Frontend Architecture & Engineering Log

### Overview & Core Objectives
Sprint 10 ("The Data Storm") modernizes Cine-Stream's client state layer by implementing Redux Toolkit (RTK) and Redux-Persist. This replaces the legacy React Context API (`FavoritesContext`), introduces cross-cutting multi-parameter filtering, adds a dynamic theme manager, and enforces strict React rendering optimizations.

---

### Phase 1: Global Store Initialization & Persistence

#### 1. Architectural Strategy & Dependencies
- Installed `@reduxjs/toolkit` (modern Redux core with `createSlice` and Immer), `react-redux` (React bindings), and `redux-persist` (client-side state persistence).
- **SSR-Safe Storage Adapter**: Next.js App Router pre-renders components in Node.js where `window` and `localStorage` are undefined. Directly accessing `localStorage` causes build-time and SSR runtime crashes. We implemented a fallback `createNoopStorage` adapter returning resolved promises during SSR and delegating to `window.localStorage` on the client.
- **Serialization Middleware**: RTK warns when non-serializable values pass through actions. Redux-Persist lifecycle actions (`FLUSH`, `REHYDRATE`, `PAUSE`, `PERSIST`, `PURGE`, `REGISTER`) carry function handlers. We whitelisted these actions in `getDefaultMiddleware({ serializableCheck: { ignoredActions: [...] } })`.

#### 2. App Router Client Boundary (`ReduxProvider.js`)
- **Server Component Rule**: React Context and Redux Store listeners depend on client hooks (`useSyncExternalStore`), which cannot run in Server Components.
- Placing `<Provider>` directly in `app/layout.js` causes Next.js runtime errors (`createContext is not a function`).
- **Architectural Solution**: Encapsulated `<Provider>` and `<PersistGate>` inside a dedicated Client Component (`ReduxProvider.js`) with `"use client";`. Because Server Components can be passed as `children` into Client Components, `app/layout.js` remains an async Server Component with server metadata and streaming SSR intact.

#### 3. Favorites Slice (`favoritesSlice.js`)
- Manages user liked movies with atomic actions: `toggleFavorite`, `addFavorite`, `removeFavorite`, `clearFavorites`.
- Selectors: `selectFavorites`, `selectFavoritesCount`, `selectIsFavorite(id)`.
- Whitelisted in `persistConfig` for persistent cross-session retention in browser `localStorage`.

---

### Phase 2: Complex Filtering & State Sync

#### 1. Filter Slice (`filterSlice.js`)
- Manages active parameters:
  - `genre`: TMDB numeric genre ID or `'ALL'`.
  - `minRating`: Float rating boundary (0.0 to 9.0).
  - `releaseYear`: Specific release year (`'2024'`, `'2023'`, etc.) or era (`'2010s'`, `'2000s'`).
  - `sortBy`: Order criterion (`'default'`, `'rating-desc'`, `'year-desc'`, `'title-asc'`).
- Reducers: `setGenre`, `setMinRating`, `setReleaseYear`, `setSortBy`, and `resetFilters`.
- Intentionally excluded from `persistConfig.whitelist` so filter queries reset cleanly on new browser visits.

#### 2. Sidebar Filter Component (`SidebarFilter.jsx`)
- Interactive desktop filter panel integrated into `<aside>` under `<SidebarNav />`.
- Features TMDB Genre dropdown, live Star rating slider with reactive badges (`★ 7.5+`), Year selector, and Sort By options.
- Dynamic Reset button surfaces with an active counter badge whenever filters diverge from default.

#### 3. Connected Movie Grid (`MovieGrid.jsx`)
- Intercepts raw TMDB & OMDb movie payloads.
- Dynamically filters the list in real-time according to Redux state:
  - Matches TMDB `genre_ids`, detailed `genres` arrays, and OMDb `Genre` strings.
  - Matches numeric ratings across `vote_average` and `imdbRating`.
  - Matches 4-digit release dates and decade boundaries.
- Displays active filter summary pills with a single-click "Clear Filters" button and an intuitive zero-match empty state.

---

### Phase 3: Render Optimization & Theming

#### 1. Dynamic Theming Engine (`themeSlice.js`)
- Manages `mode: 'dark' | 'light'`, default to Cine-Stream's signature Dark Mode.
- Persisted in `localStorage` via Redux-Persist.
- **Theme Synchronization (`ThemeEffect`)**: Automatically synchronizes the root `<html>` element class (`dark` vs `light`) and `data-theme` attribute upon store rehydration.
- **Semantic CSS Tokens (`globals.css`)**: Defined CSS variables (`--bg-primary`, `--bg-surface`, `--bg-sidebar`, `--border-primary`, `--text-primary`) that transition background colors from Jet Black (`#0A0A0A`) to Soft Slate (`#F8FAFC`).
- **Interactive Theme Toggle (`ThemeToggle.jsx`)**: Added to `TopNavbar.jsx` with Sun/Moon iconography and fluid micro-interactions.

#### 2. Render Optimization Audit (High Frame-Rate Guarantee)
- **`useMemo` Array Computations**: Multi-dimensional filtering across TMDB payloads is wrapped in `useMemo` to eliminate expensive CPU work during unrelated renders.
- **`useCallback` Dispatchers**: Mutation dispatchers across `SidebarFilter`, `MovieGrid`, `MovieCard`, and `ThemeToggle` are wrapped in `useCallback` to guarantee referential stability.
- **`React.memo` Component Isolation**: `MovieGrid`, `SidebarFilter`, `MovieCard`, and `SidebarNav` are wrapped in `React.memo` to eliminate component re-renders when parent states change.
- **Fine-Grained Selectors**: Components subscribe to specific primitive slices of state rather than the monolithic state tree, minimizing dispatch re-evaluation overhead.
- **Zero Hydro Mismatch**: Added `suppressHydrationWarning` on `<html>` and ensured theme classes synchronize cleanly post-mount.

