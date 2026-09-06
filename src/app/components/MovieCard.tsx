import { Link } from "react-router";
import { Star, Play } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { type TMDBMovie, img, getTitle, getYear, getRating, getGenreNames, getMediaType } from "./tmdb";

export function MovieCard({
  movie,
  size = "md",
}: {
  movie: TMDBMovie;
  size?: "sm" | "md" | "lg" | "fluid";
}) {
  const isFluid = size === "fluid";
  const w = isFluid ? "w-full" : size === "sm" ? "w-40 shrink-0" : size === "lg" ? "w-60 shrink-0" : "w-48 shrink-0";
  const h = isFluid ? "aspect-[2/3] w-full" : size === "sm" ? "h-60" : size === "lg" ? "h-[22rem]" : "h-72";

  const title = getTitle(movie);
  const year = getYear(movie);
  const rating = getRating(movie);
  const genres = getGenreNames(movie.genre_ids || []);
  const mediaType = getMediaType(movie);
  const detailPath = `/title/${mediaType}-${movie.id}`;

  return (
    <Link
      to={detailPath}
      className={`group relative block ${w} rounded-2xl overflow-hidden glass-card cursor-pointer`}
    >
      <div className={`relative ${h} overflow-hidden`}>
        <ImageWithFallback
          src={img(movie.poster_path, "w500")}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />

        {/* Rating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-md border border-white/[0.08] text-[11px] text-white/90">
          <Star className="w-3 h-3 fill-white text-white" /> {rating}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-black/50 scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="text-sm text-white/95 truncate" style={{ fontWeight: 500 }}>
            {title}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">
            {year} · {genres.slice(0, 2).join(" · ")}
          </div>
        </div>
      </div>
    </Link>
  );
}
