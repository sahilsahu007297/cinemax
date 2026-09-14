import { Link, useNavigate } from "react-router";
import { Star, Play, Heart } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  type TMDBMovie,
  img,
  getTitle,
  getYear,
  getRating,
  getGenreNames,
  getMediaType,
} from "./tmdb";
import { useAuth } from "./auth";

export function MovieCard({
  movie,
  size = "md",
}: {
  movie: TMDBMovie;
  size?: "sm" | "md" | "lg" | "fluid";
}) {
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const mediaType = getMediaType(movie);
  const favorited = isFavorite(movie.id, mediaType);

  const isFluid = size === "fluid";
  const w = isFluid
    ? "w-full"
    : size === "sm"
    ? "w-40 shrink-0"
    : size === "lg"
    ? "w-60 shrink-0"
    : "w-48 shrink-0";
  const h = isFluid
    ? "aspect-[2/3] w-full"
    : size === "sm"
    ? "h-60"
    : size === "lg"
    ? "h-[22rem]"
    : "h-72";

  const title = getTitle(movie);
  const year = getYear(movie);
  const rating = getRating(movie);
  const genres = getGenreNames(movie.genre_ids || []);
  const detailPath = `/title/${mediaType}-${movie.id}`;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/signin");
      return;
    }
    await toggleFavorite(movie, mediaType);
  };

  return (
    <Link
      to={detailPath}
      className={`group relative block ${w} rounded-2xl overflow-hidden glass-card cursor-pointer border border-white/[0.08] shadow-md`}
    >
      <div className={`relative ${h} overflow-hidden`}>
        <ImageWithFallback
          src={img(movie.poster_path, "w500")}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-[0.9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-transparent opacity-95" />

        {/* Rating badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/[0.12] text-[11px] font-semibold text-white/90">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating}
        </div>

        {/* Heart Favorite Quick Button */}
        <button
          onClick={handleFavoriteClick}
          title={favorited ? "Remove from Favorites" : "Add to Favorites"}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            favorited
              ? "bg-rose-600 text-white opacity-100"
              : "bg-black/50 text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? "fill-white" : ""}`} />
        </button>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-black/50 scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <div className="text-xs sm:text-sm font-semibold text-white truncate">{title}</div>
          <div className="text-[10px] text-white/45 mt-0.5 truncate">
            {year} · {genres.slice(0, 2).join(" · ")}
          </div>
        </div>
      </div>
    </Link>
  );
}
