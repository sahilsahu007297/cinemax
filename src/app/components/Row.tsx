import { ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { MovieCard } from "./MovieCard";
import { type TMDBMovie } from "./tmdb";

export function Row({
  title,
  movies,
  loading = false,
  seeAllLink,
}: {
  title: string;
  movies: TMDBMovie[];
  loading?: boolean;
  seeAllLink?: string;
}) {
  return (
    <section className="px-4 sm:px-6 lg:px-10 mt-8 sm:mt-10">
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
        <h2 className="text-white/90 font-semibold text-sm sm:text-base tracking-tight truncate">
          {title}
        </h2>
        {seeAllLink ? (
          <Link
            to={seeAllLink}
            className="shrink-0 whitespace-nowrap flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors"
          >
            <span>See all</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        ) : (
          <button className="shrink-0 whitespace-nowrap flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors">
            <span>See all</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 -mx-2 px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shrink-0 w-36 h-56 sm:w-48 sm:h-72 skeleton rounded-2xl" />
            ))
          : movies.map((m, i) => (
              <MovieCard key={`${m.id}-${i}`} movie={m} />
            ))}
      </div>
    </section>
  );
}
