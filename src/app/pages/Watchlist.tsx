import { useState } from "react";
import { useSearchParams, Link } from "react-router";
import { Plus, Clock, Heart, Download, Film, Sparkles } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { useAuth } from "../components/auth";
import { useHomeData } from "../components/useTMDB";
import { getTitle } from "../components/tmdb";

export default function Watchlist() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "recent";
  const [tab, setTab] = useState<"recent" | "favorites" | "downloaded">(
    initialTab === "favorites" ? "favorites" : initialTab === "downloaded" ? "downloaded" : "recent"
  );

  const { user, favorites, continueWatching } = useAuth();
  const { data } = useHomeData();

  // Switch tab and sync url
  const switchTab = (nextTab: "recent" | "favorites" | "downloaded") => {
    setTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

  return (
    <div className="px-4 sm:px-8 lg:px-12 pt-20 sm:pt-24 pb-24 animate-fade-in max-w-7xl mx-auto">
      {/* Header matching Screenshot 2 Library view */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Library
          </h1>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            {user
              ? `Signed in as ${user.name} · Personal library`
              : "Saved items, watch progress and downloads"}
          </p>
        </div>

        <Link
          to="/browse"
          className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white hover:scale-105 transition-all"
          title="Browse more movies"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {/* Segmented Pill Tabs matching Screenshot 2 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        <button
          onClick={() => switchTab("recent")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
            tab === "recent"
              ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
              : "glass-pill text-white/70 hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recently watched</span>
          {continueWatching.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                tab === "recent" ? "bg-black/20 text-black font-bold" : "bg-white/20 text-white"
              }`}
            >
              {continueWatching.length}
            </span>
          )}
        </button>

        <button
          onClick={() => switchTab("favorites")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
            tab === "favorites"
              ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
              : "glass-pill text-white/70 hover:text-white"
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Favorites</span>
          {favorites.length > 0 && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                tab === "favorites" ? "bg-black/20 text-black font-bold" : "bg-white/20 text-white"
              }`}
            >
              {favorites.length}
            </span>
          )}
        </button>

        <button
          onClick={() => switchTab("downloaded")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
            tab === "downloaded"
              ? "bg-white text-black font-semibold shadow-lg shadow-white/10"
              : "glass-pill text-white/70 hover:text-white"
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Downloaded & 4K</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {/* TAB 1: RECENTLY WATCHED */}
        {tab === "recent" && (
          <div>
            <div className="text-sm font-semibold text-white/80 mb-4 flex items-center justify-between">
              <span>Recently watched</span>
              <span className="text-xs text-white/40">{continueWatching.length} items</span>
            </div>

            {continueWatching.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {continueWatching.map((item) => (
                  <div key={`${item.media_type}-${item.id}`} className="relative group">
                    <MovieCard movie={item} size="fluid" />
                    {/* Progress pill overlay */}
                    <div className="mt-2 px-1 flex items-center justify-between text-[11px] text-white/50">
                      <span>{item.timeLeftMinutes || 45} min left</span>
                      <span className="font-semibold text-white/80">{item.progress || 35}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/15 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${item.progress || 35}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl glass-card p-10 text-center flex flex-col items-center justify-center">
                <Film className="w-12 h-12 text-white/20 mb-3" />
                <h3 className="text-base font-semibold text-white">No watched titles yet</h3>
                <p className="text-xs text-white/50 max-w-sm mt-1 mb-5">
                  Play any movie or series and it will seamlessly track your progress here.
                </p>
                <Link
                  to="/browse"
                  className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/80 transition-colors"
                >
                  Explore Trending Movies
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FAVORITES (SUPABASE SYNCHRONIZED) */}
        {tab === "favorites" && (
          <div>
            <div className="text-sm font-semibold text-white/80 mb-4 flex items-center justify-between">
              <span>Favorites & Saved List</span>
              <span className="text-xs text-white/40">
                {favorites.length} saved · Scoped to your account
              </span>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {favorites.map((item) => (
                  <div key={`${item.media_type}-${item.id}`} className="relative group">
                    <MovieCard movie={item} size="fluid" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl glass-card p-10 text-center flex flex-col items-center justify-center">
                <Heart className="w-12 h-12 text-rose-500/30 mb-3" />
                <h3 className="text-base font-semibold text-white">Your favorites list is empty</h3>
                <p className="text-xs text-white/50 max-w-sm mt-1 mb-5">
                  Click the heart icon on any title or hero banner to add it to your personal Supabase favorites.
                </p>
                <Link
                  to="/"
                  className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/80 transition-colors"
                >
                  Discover Movies to Save
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOWNLOADED & 4K */}
        {tab === "downloaded" && (
          <div>
            <div className="text-sm font-semibold text-white/80 mb-4 flex items-center justify-between">
              <span>4K Downloads & High-Speed Media</span>
              <span className="text-xs text-amber-400 font-medium">Ready for offline stream</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data?.topRated?.slice(0, 6) || []).map((movie) => {
                const title = getTitle(movie);
                return (
                  <div
                    key={movie.id}
                    className="p-4 rounded-2xl glass-card border border-white/10 flex items-center gap-4 hover:border-white/25 transition-all"
                  >
                    <div className="w-16 h-22 rounded-xl overflow-hidden shrink-0 bg-white/10">
                      <img
                        src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-black">
                          4K UHD
                        </span>
                        <span className="text-[10px] text-white/40">2.4 GB</span>
                      </div>
                      <h4 className="mt-1 text-sm font-semibold text-white truncate">{title}</h4>
                      <p className="text-xs text-white/40 mt-0.5">High Speed Torrent Ready</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Link
                          to={`/watch/movie-${movie.id}`}
                          className="px-3.5 py-1 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/80"
                        >
                          Play 4K
                        </Link>
                        <Link
                          to={`/title/movie-${movie.id}`}
                          className="px-3 py-1 rounded-full glass-pill text-white text-xs hover:bg-white/10"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
