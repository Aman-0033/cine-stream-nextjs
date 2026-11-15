import React from 'react';
import { Film, Sparkles } from 'lucide-react';

/**
 * Root Loading UI (app/loading.js)
 *
 * Implements a Next.js 15 Suspense streaming skeleton fallback:
 * - Mimics the exact shape and proportions of the Cine-Stream movie grid
 * - Exact responsive layout: grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6
 * - Subtle pulse animation on skeleton blocks
 * - Color tokens: Jet Black (#0A0A0A) background, slate-800/slate-700 shimmer
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
      {/* ── Hero Banner Skeleton ─────────────────────────────────────────── */}
      <div className="relative w-full h-[55vh] min-h-[440px] max-h-[640px] rounded-3xl overflow-hidden bg-[#14161F] animate-pulse mb-12 shadow-2xl border border-[#1F2230]/50">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-2xl space-y-4">
          {/* Badge Skeleton */}
          <div className="h-6 w-36 bg-[#1F2230] rounded-full" />
          
          {/* Title Skeleton */}
          <div className="space-y-2">
            <div className="h-10 sm:h-12 bg-[#1F2230] rounded-xl w-3/4" />
            <div className="h-6 bg-[#1F2230] rounded-lg w-1/2" />
          </div>

          {/* Overview Skeleton */}
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-[#1F2230] rounded w-full" />
            <div className="h-4 bg-[#1F2230] rounded w-5/6" />
          </div>

          {/* CTA Buttons Skeleton */}
          <div className="flex items-center space-x-4 pt-2">
            <div className="h-12 w-36 bg-[#007BA7]/40 rounded-xl" />
            <div className="h-12 w-32 bg-[#1F2230] rounded-xl" />
          </div>
        </div>
      </div>

      {/* ── Section Header Skeleton ───────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1F2230]">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-md bg-[#1F2230] animate-pulse" />
          <div className="h-6 w-48 bg-[#1F2230] rounded-lg animate-pulse" />
        </div>
        <div className="h-6 w-32 bg-[#1F2230] rounded-full animate-pulse" />
      </div>

      {/* ── Movie Grid Skeleton (Exact shape: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col aspect-[2/3] w-full rounded-lg overflow-hidden bg-[#0A0A0A] shadow-md animate-pulse relative"
          >
            {/* Poster Skeleton Block */}
            <div className="w-full h-full bg-gradient-to-b from-[#14161F] via-[#1A1D2A] to-[#12131A] relative">
              {/* Top rating badge skeleton */}
              <div className="absolute top-3 left-3 w-12 h-6 rounded-full bg-[#1F2230]" />
              {/* Top favorite button skeleton */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#1F2230]" />
              
              {/* Bottom metadata placeholder lines */}
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-2 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent">
                <div className="h-4 bg-[#1F2230] rounded w-3/4" />
                <div className="h-3 bg-[#1F2230] rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
