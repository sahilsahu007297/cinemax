import { useState, useEffect } from "react";
import { Film, Tv, Sparkles, Filter, Calendar, TrendingUp, Flame } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import {
  getLatestHindiMovies,
  getPopularHindiMovies,
  getLatestHindiTV,
  getPopularHindiTV,
  HINDI_MOVIE_GENRES,
  HINDI_TV_GENRES,
  type TMDBMovie,
} from "../components/tmdb";
import { useSearchParams } from "react-router";

export default function HindiHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get("type") === "shows" ? "shows" : "movies";
  
  // Section state: "movies" (Latest Hindi Movies) or "shows" (Latest Hindi Shows & Series)
  const [section, setSection] = useState<"movies" | "shows">(initialType);
  const [sortMode, setSortMode] = useState<"latest" | "popular">("latest");
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state when URL param changes
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "shows" && section !== "shows") {
      setSection("shows");
      setPage(1);
    } else if (typeParam === "movies" && section !== "movies") {
      setSection("movies");
      setPage(1);
    }
  }, [searchParams]);

  const genres = section === "movies" ? HINDI_MOVIE_GENRES : HINDI_TV_GENRES;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetcher =
      section === "movies"
        ? sortMode === "latest"
          ? getLatestHindiMovies(page, selectedGenre)
          : getPopularHindiMovies(page, selectedGenre)
        : sortMode === "latest"
        ? getLatestHindiTV(page, selectedGenre)
        : getPopularHindiTV(page, selectedGenre);

    fetcher
      .then((res) => {
        if (!cancelled) {
          setItems(res.results.filter((m) => m.poster_path));
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [section, sortMode, selectedGenre, page]);

  const handleSectionChange = (newSection: "movies" | "shows") => {
    setSection(newSection);
    setSelectedGenre(0);
    setPage(1);
    setSearchParams({ type: newSection });
  };

  const handleSortChange = (newSort: "latest" | "popular") => {
    setSortMode(newSort);
    setPage(1);
  };

  const handleGenreChange = (genreId: number) => {
    setSelectedGenre(genreId);
    setPage(1);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-20 sm:pt-16 animate-fade-in pb-24 sm:pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-orange-950/30 via-stone-900/40 to-emerald-950/30 p-5 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-medium text-orange-300 backdrop-blur-md mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Hindi Cinema & Web Series Hub</span>
          </div>

          <h1
            className="text-white tracking-tight"
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {section === "movies" ? "Latest Hindi Movies" : "Hindi Shows & Web Series"}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed max-w-2xl">
            Stream and download today's newest theatrical and digital releases, Bollywood blockbusters, and top Hindi web series in 4K UHD & 1080p.
          </p>

          {/* Dedicated Section Switcher */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => handleSectionChange("movies")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 ${
                section === "movies"
                  ? "bg-white text-black shadow-lg shadow-white/10 font-semibold"
                  : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Latest Hindi Movies</span>
            </button>

            <button
              onClick={() => handleSectionChange("shows")}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 ${
                section === "shows"
                  ? "bg-white text-black shadow-lg shadow-white/10 font-semibold"
                  : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15"
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Hindi Shows & Series</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Sort Modes & Genre Filters */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Release / Sorting Modes */}
          <div className="flex items-center gap-2 rounded-2xl bg-white/[0.04] p-1.5 border border-white/[0.08]">
            <button
              onClick={() => handleSortChange("latest")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                sortMode === "latest"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Same-Day & Latest Releases</span>
            </button>

            <button
              onClick={() => handleSortChange("popular")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                sortMode === "popular"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular & Trending</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Genre</span>
          </div>
        </div>

        {/* Genre Pill Filter Row */}
        <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGenreChange(g.id)}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 border ${
                selectedGenre === g.id
                  ? "bg-white text-black border-white shadow-md shadow-black/40 font-medium"
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Results */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-full aspect-[2/3] skeleton rounded-2xl" />
            ))
          : items.map((m, i) => (
              <div key={`${m.id}-${i}`} className="relative group">
                <MovieCard movie={m} size="fluid" />
                {/* 4K UHD Available badge indicator */}
                <div className="absolute top-2.5 right-2.5 pointer-events-none z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[9px] font-bold shadow-md">
                  4K / HD
                </div>
              </div>
            ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-white/40 text-sm">
            No Hindi {section === "movies" ? "movies" : "shows"} found for this genre. Try selecting "All Genres".
          </p>
        </div>
      )}

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="mt-12 flex justify-center items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-5 py-2 rounded-full glass-button text-xs text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
            Page {page}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-5 py-2 rounded-full glass-button text-xs text-white/80 transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
