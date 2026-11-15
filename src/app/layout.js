import "./globals.css";
import ReduxProvider from "@/redux/ReduxProvider";
import TopNavbar from "@/components/TopNavbar";
import SidebarNav from "@/components/SidebarNav";
import SidebarFilter from "@/components/SidebarFilter";
import { Film, ShieldCheck, Heart } from "lucide-react";

export const metadata = {
  title: "Cine-Stream | Premium VOD Cinema",
  description:
    "Next.js 15 App Router premium streaming interface for Cine-Stream featuring responsive VOD architecture, dark-mode styling, and TMDB discovery.",
  keywords: [
    "Next.js 15",
    "App Router",
    "Streaming",
    "VOD",
    "TMDB",
    "Cine-Stream",
    "Cinematic UI",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-slate-300 font-sans antialiased selection:bg-[#FF2D95] selection:text-white transition-colors duration-300"
        style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <ReduxProvider>
          {/* ── 1. Fixed Top Navigation Bar with Glassmorphic Background ────── */}
          <TopNavbar />

          {/* ── 2. Responsive Layout Container (Sidebar + Main Content) ─────── */}
          <div className="flex flex-1 pt-16 min-h-screen">
            {/* Left Sidebar (Hidden on mobile, visible on md screens) */}
            <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 dark:border-gray-800 border-slate-200 bg-[var(--bg-sidebar)] shrink-0 p-4 space-y-4 sticky top-16 h-[calc(100vh-4rem)] z-20 overflow-y-auto transition-colors duration-300">
              <div className="px-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Menu
              </div>
              <SidebarNav />

              <div className="pt-4 border-t border-gray-800 dark:border-gray-800 border-slate-200">
                <SidebarFilter />
              </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 w-full min-w-0 bg-[var(--bg-primary)] flex flex-col transition-colors duration-300">
              {children}
            </main>
          </div>

          {/* ── Global Cinematic Dark Footer ─────────────────────────────────── */}
          <footer className="border-t border-gray-800 dark:border-gray-800 border-slate-200 bg-[var(--bg-sidebar)] py-8 mt-auto z-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Film className="w-4 h-4 text-[#007BA7]" />
                  <span className="font-bold text-white dark:text-white text-slate-900">CINE-STREAM</span>
                  <span>•</span>
                  <span>Premium VOD Streaming Architecture</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Dual TMDB + OMDb ISP Fallback Active</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Crafted with</span>
                  <Heart className="w-3.5 h-3.5 text-[#FF2D95] fill-[#FF2D95] mx-0.5 inline" />
                  <span>for Next.js 15 UI/UX Excellence</span>
                </div>
              </div>
            </div>
          </footer>
        </ReduxProvider>
      </body>
    </html>
  );
}
