/**
 * src/app/movie/[id]/loading.js
 *
 * Next.js App Router special file: shown as a Suspense fallback
 * while the async Server Component (page.js) is streaming in.
 * This is a Server Component — zero 'use client' required.
 */

export default function MovieDetailLoading() {
  return (
    <div className="min-h-screen pb-20 animate-pulse">
      {/* Backdrop skeleton */}
      <div className="w-full h-56 sm:h-80 md:h-96 bg-[#0F1015]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-32 bg-[#1F2230] rounded mb-6" />

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Poster skeleton */}
          <div className="flex-shrink-0 w-full md:w-64 lg:w-72">
            <div className="aspect-[2/3] rounded-2xl bg-[#14161F] border border-[#1f2230]" />
          </div>

          {/* Details skeleton */}
          <div className="flex-1 space-y-4">
            <div className="h-10 w-3/4 bg-[#1F2230] rounded-lg" />
            <div className="h-5 w-1/2 bg-[#1F2230] rounded" />
            <div className="flex gap-3">
              <div className="h-8 w-24 bg-[#1F2230] rounded-full" />
              <div className="h-8 w-20 bg-[#1F2230] rounded-full" />
              <div className="h-8 w-20 bg-[#1F2230] rounded-full" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-20 bg-[#1F2230] rounded-lg" />
              ))}
            </div>
            <div className="space-y-2 mt-4">
              <div className="h-4 w-full bg-[#1F2230] rounded" />
              <div className="h-4 w-full bg-[#1F2230] rounded" />
              <div className="h-4 w-5/6 bg-[#1F2230] rounded" />
              <div className="h-4 w-4/6 bg-[#1F2230] rounded" />
            </div>
            <div className="flex gap-3 mt-6">
              <div className="h-12 w-40 bg-[#1F2230] rounded-xl" />
              <div className="h-12 w-32 bg-[#1F2230] rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
