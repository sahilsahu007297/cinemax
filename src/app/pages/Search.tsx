import { useSearchParams } from "react-router";
import { MovieCard } from "../components/MovieCard";
import { useSearch } from "../components/useTMDB";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const { data: results, loading } = useSearch(q);

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-20 sm:pt-16 animate-fade-in pb-20">
      <h1
        className="text-white"
        style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.03em" }}
      >
        Search results
      </h1>
      <p className="text-white/40 text-xs sm:text-sm mt-1">
        {loading
          ? "Searching..."
          : `${results?.length ?? 0} match${(results?.length ?? 0) === 1 ? "" : "es"} for "${q}"`}
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-full aspect-[2/3] skeleton rounded-2xl" />
            ))
          : results?.map((m, i) => (
              <MovieCard key={`${m.id}-${i}`} movie={m} size="fluid" />
            ))}
      </div>

      {!loading && (!results || results.length === 0) && q.length > 0 && (
        <div className="mt-20 text-center">
          <SearchIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <div className="text-white/30 text-sm">
            No titles match your search. Try a different keyword.
          </div>
        </div>
      )}
    </div>
  );
}
