import Link from 'next/link';
import { Film, Sparkles, ArrowLeft } from 'lucide-react';
import { fetchPopularMovies } from '@/services/movieService';
import { MovieCard } from '@/components/MovieCard';

export const metadata = {
  title: 'Movie Catalog | Cine-Stream Next.js 15',
  description: 'Explore the full Cine-Stream cinema catalog with Server-Side Rendered media cards.',
};

export default async function MovieDirectoryPage() {
  const initialData = await fetchPopularMovies(1);
  const movies = initialData?.movies || [];

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#1f2230] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
            <Link href="/" className="hover:text-cerulean-light flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <span>Cinema Catalog Index</span>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-cerulean/20 text-cerulean-light border border-cerulean/30">
              SSR Route: /movie
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Server-side rendered catalog index powered by Next.js 15 App Router.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            enableLink={true}
          />
        ))}
      </div>
    </div>
  );
}
