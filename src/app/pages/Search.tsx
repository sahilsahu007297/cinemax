import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { MovieCard } from "../components/MovieCard";
import { CelebrityModal } from "../components/CelebrityModal";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  searchMulti,
  searchPerson,
  img,
  type TMDBMovie,
  type TMDBPerson,
} from "../components/tmdb";
import { Search as SearchIcon, User, Film, Tv, Sparkles, X } from "lucide-react";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const [queryInput, setQueryInput] = useState(q);
  const [activeTab, setActiveTab] = useState<"all" | "movie" | "tv" | "person">("all");

  const [movieResults, setMovieResults] = useState<TMDBMovie[]>([]);
  const [peopleResults, setPeopleResults] = useState<TMDBPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  useEffect(() => {
    setQueryInput(q);
    if (!q.trim()) {
      setMovieResults([]);
      setPeopleResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      searchMulti(q.trim()).catch(() => ({ results: [] })),
      searchPerson(q.trim()).catch(() => ({ results: [] })),
    ])
      .then(([multiRes, personRes]) => {
        if (!cancelled) {
          const titles = (multiRes.results || []).filter(
            (item: any) => item.media_type === "movie" || item.media_type === "tv" || item.title || item.name
          );
          setMovieResults(titles);
          setPeopleResults(personRes.results || []);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      setParams({ q: queryInput.trim() });
    }
  };

  const filteredMovies =
    activeTab === "movie"
      ? movieResults.filter((m) => m.media_type === "movie" || (m.title && !m.name))
      : activeTab === "tv"
      ? movieResults.filter((m) => m.media_type === "tv" || Boolean(m.name))
      : movieResults;

  const showPeople = activeTab === "all" || activeTab === "person";
  const showMovies = activeTab !== "person";

  const totalCount =
    (showMovies ? filteredMovies.length : 0) + (showPeople ? peopleResults.length : 0);

  return (
    <div className="px-4 sm:px-8 lg:px-12 pt-20 sm:pt-24 animate-fade-in pb-24 max-w-7xl mx-auto">
      {/* Search Input Header */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Search by title, actor, director, or character..."
              className="w-full h-13 pl-12 pr-12 rounded-full glass-sheet border border-white/20 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/45 transition-all shadow-xl"
            />
            {queryInput && (
              <button
                type="button"
                onClick={() => setQueryInput("")}
                className="absolute right-4 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Tab Filters */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {[
            { id: "all", label: "All Matches", icon: Sparkles },
            { id: "movie", label: "Movies", icon: Film },
            { id: "tv", label: "TV Shows", icon: Tv },
            { id: "person", label: "Actors & Directors", icon: User },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === id
                  ? "bg-white text-black shadow-lg shadow-white/10"
                  : "glass-pill text-white/70 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <p className="text-white/40 text-xs sm:text-sm mt-3">
          {loading
            ? "Searching database..."
            : `${totalCount} result${totalCount === 1 ? "" : "s"} found for "${q}"`}
        </p>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-full skeleton rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-10">
          {/* Celebrities & Crew Row if any found */}
          {showPeople && peopleResults.length > 0 && (
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                <span>Cast, Crew & Celebrities</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {peopleResults.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => setSelectedPersonId(person.id)}
                    className="group p-3 rounded-2xl glass-card border border-white/10 hover:border-white/30 text-left transition-all flex flex-col items-center text-center"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-2.5 border-2 border-white/15 shadow-xl bg-white/5">
                      <ImageWithFallback
                        src={img(person.profile_path, "w185")}
                        alt={person.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="text-xs font-bold text-white truncate w-full">
                      {person.name}
                    </div>
                    <div className="text-[10px] text-white/40 truncate w-full">
                      {person.known_for_department || "Actor"}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Movies & Shows Grid */}
          {showMovies && filteredMovies.length > 0 && (
            <section>
              {showPeople && peopleResults.length > 0 && (
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                  <Film className="w-4 h-4 text-cyan-400" />
                  <span>Movies & TV Shows</span>
                </h2>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {filteredMovies.map((m, i) => (
                  <MovieCard key={`${m.id}-${i}`} movie={m} size="fluid" />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {totalCount === 0 && q.length > 0 && (
            <div className="rounded-3xl glass-card p-12 text-center max-w-md mx-auto mt-10">
              <SearchIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No matches found</h3>
              <p className="text-xs text-white/50 mt-1">
                Try searching for a different movie title, actor, or director name.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Celebrity Filmography & Biography Modal */}
      {selectedPersonId && (
        <CelebrityModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      )}
    </div>
  );
}
