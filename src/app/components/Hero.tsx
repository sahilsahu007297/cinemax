import { Play, Star, ChevronRight, Info } from "lucide-react";
import { Link } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { type TMDBMovie, backdrop, getTitle, getYear, getRating, getGenreNames, getMediaType } from "./tmdb";

export function Hero({ movie }: { movie: TMDBMovie | null }) {
  const mediaType = movie ? getMediaType(movie) : "movie";

  if (!movie) return <HeroSkeleton />;

  const title = getTitle(movie);
  const year = getYear(movie);
  const rating = getRating(movie);
  const genres = getGenreNames(movie.genre_ids || []);
  const detailPath = `/title/${mediaType}-${movie.id}`;

  return (
    <section className="relative left-1/2 mt-0 w-screen -translate-x-1/2 overflow-hidden bg-black">
      <div className="relative min-h-[88vh] lg:min-h-[96vh] max-h-[1050px] overflow-hidden bg-black">
        {/* Backdrop Image - placed down and extended with seamless edge blending */}
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback
            src={backdrop(movie.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover object-[center_18%] transition-transform duration-700"
          />
        </div>

        {/* Soft atmospheric gradients that keep the cover image fully visible */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black to-transparent pointer-events-none" />

        <div className="relative mx-auto flex min-h-[85vh] sm:min-h-[88vh] lg:min-h-[96vh] max-h-[1000px] max-w-3xl flex-col items-center justify-end px-4 sm:px-6 pb-10 sm:pb-12 pt-20 sm:pt-28 text-center">
          <div className="flex items-center gap-2 text-xs text-white/75 tracking-widest uppercase">
            <span className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
              <Play className="w-2.5 h-2.5 text-black fill-black" />
            </span>
            Featured {mediaType === "tv" ? "Series" : "Film"}
          </div>

          <h1
            className="mt-4 sm:mt-5 text-white"
            style={{ fontSize: "clamp(2.1rem, 5.5vw, 5.5rem)", fontWeight: 700, lineHeight: 1.02 }}
          >
            {title}
          </h1>

          <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-white/60">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 text-white border border-white/20">
              <Star className="w-3 h-3 fill-white text-white" /> {rating}
            </span>
            <span>· {year}</span>
            {mediaType === "tv" && <span>· TV Series</span>}
          </div>

          <p className="mt-3 sm:mt-4 text-white/65 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-2 px-2">
            {movie.overview}
          </p>

          <div className="mt-3 sm:mt-4 hidden sm:flex gap-2 flex-wrap justify-center">
            {genres.slice(0, 3).map((g) => (
              <span key={g} className="px-3 py-1 rounded-full glass text-xs text-white/70">
                {g}
              </span>
            ))}
          </div>

          <div className="mt-6 sm:mt-7 flex items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-none">
            <Link
              to={`/watch/${mediaType}-${movie.id}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-7 rounded-full bg-white text-sm text-black hover:bg-white/80 transition-colors shadow-lg shadow-white/10"
              style={{ fontWeight: 500 }}
            >
              <Play className="w-4 h-4 fill-current" /> Play now
            </Link>
            <Link
              to={detailPath}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full border border-white/10 bg-white/10 text-sm text-white hover:bg-white/20 transition-colors"
            >
              <Info className="w-4 h-4" /> Details
            </Link>
          </div>
        </div>

        <button className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass-button text-white/50 hover:text-white items-center justify-center">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="px-6 lg:px-10 mt-2">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0d0d14] min-h-[560px]">
        <div className="absolute inset-0 skeleton" />
        <div className="relative p-8 lg:p-12 max-w-2xl flex flex-col justify-end min-h-[560px]">
          <div className="h-4 w-32 skeleton mb-4" />
          <div className="h-12 w-80 skeleton mb-4" />
          <div className="h-6 w-48 skeleton mb-4" />
          <div className="h-16 w-full skeleton mb-4" />
          <div className="flex gap-3">
            <div className="h-11 w-36 skeleton rounded-full" />
            <div className="h-11 w-44 skeleton rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
