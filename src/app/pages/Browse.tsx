import { useState, useEffect } from "react";
import { MovieCard } from "../components/MovieCard";
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTV,
  getTopRatedTV,
  getAiringTodayTV,
  type TMDBMovie,
} from "../components/tmdb";

const movieCategories = [
  { label: "Popular", fetcher: getPopularMovies },
  { label: "Top Rated", fetcher: getTopRatedMovies },
  { label: "Now Playing", fetcher: getNowPlayingMovies },
  { label: "Upcoming", fetcher: getUpcomingMovies },
];

const tvCategories = [
  { label: "Popular", fetcher: getPopularTV },
  { label: "Top Rated", fetcher: getTopRatedTV },
  { label: "Airing Today", fetcher: getAiringTodayTV },
];

export default function Browse({
  heading = "Browse",
  filterType,
}: {
  heading?: string;
  filterType?: "Movie" | "Series";
}) {
  const categories = filterType === "Series" ? tvCategories : movieCategories;
  const [activeCategory, setActiveCategory] = useState(0);
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    categories[activeCategory]
      .fetcher(page)
      .then((r) => {
        if (!cancelled) setItems(r.results.filter((m) => m.poster_path));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeCategory, page]);

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-20 sm:pt-16 animate-fade-in pb-20">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-white"
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {heading}
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            {loading ? "Loading..." : `${items.length} titles`} · powered by
            TMDB
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] touch-pan-x -mx-1 px-1">
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => {
                setActiveCategory(i);
                setPage(1);
              }}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 shrink-0 ${
                activeCategory === i
                  ? "bg-white text-black shadow-lg shadow-black/40 font-medium"
                  : "glass-button text-white/60 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-full aspect-[2/3] skeleton rounded-2xl" />
            ))
          : items.map((m, i) => (
              <MovieCard key={`${m.id}-${i}`} movie={m} size="fluid" />
            ))}
      </div>

      {!loading && (
        <div className="mt-10 flex justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-5 py-2 rounded-full glass-button text-sm text-white/70 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-white/50">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-5 py-2 rounded-full glass-button text-sm text-white/70"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
