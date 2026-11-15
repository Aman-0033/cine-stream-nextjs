/**
 * src/app/movie/[id]/not-found.js
 *
 * Next.js App Router special file: rendered when notFound() is thrown
 * inside the dynamic page Server Component.
 */

import Link from 'next/link';
import { Film, ArrowLeft, Sparkles } from 'lucide-react';

export default function MovieNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-cerulean/10 border border-cerulean/30 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Film className="w-12 h-12 text-cerulean-light/60" />
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Movie Not Found</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          This movie ID doesn&apos;t exist in the TMDB catalog, OMDb database, or our curated offline collection.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-cerulean hover:bg-cerulean-light shadow-lg shadow-cerulean/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Back to Discover</span>
          </Link>
          <Link
            href="/movie"
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm bg-[#14161F] text-gray-300 border border-[#2D3142] hover:border-cerulean/40 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog Index</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
