import { Link, useNavigate } from "react-router";
import { ChevronRight, Play, X, Clock } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { backdrop, img, getTitle } from "./tmdb";
import { useAuth, type ContinueItem } from "./auth";

interface ContinueWatchingRowProps {
  items: ContinueItem[];
}

export function ContinueWatchingRow({ items }: ContinueWatchingRowProps) {
  const navigate = useNavigate();
  const { removeContinue } = useAuth();

  if (!items || items.length === 0) return null;

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-5 animate-fade-in">
      {/* Header matching Screenshot 2 "Continue watching >" */}
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/watchlist?tab=continue"
          className="group inline-flex items-center gap-1.5 text-base sm:text-lg font-bold text-white hover:text-white/80 transition-colors"
        >
          <span>Continue watching</span>
          <ChevronRight className="w-4 h-4 text-white/50 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <span className="text-xs text-white/40 font-medium">
          {items.length} in progress
        </span>
      </div>

      {/* Cards Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none]">
        {items.map((item) => {
          const title = getTitle(item);
          const mediaType = item.media_type || (item.title ? "movie" : "tv");
          const progress = Math.min(100, Math.max(10, item.progress || 35));
          const timeLeft = item.timeLeftMinutes || 45;
          const watchUrl = `/watch/${mediaType}-${item.id}${
            item.season ? `?season=${item.season}&episode=${item.episode || 1}` : ""
          }`;

          return (
            <div
              key={`${mediaType}-${item.id}`}
              className="group relative w-64 sm:w-72 aspect-[16/9.5] shrink-0 rounded-2xl overflow-hidden glass-card border border-white/10 shadow-lg"
            >
              {/* Card Image */}
              <div className="relative w-full h-full">
                <ImageWithFallback
                  src={
                    item.backdrop_path
                      ? backdrop(item.backdrop_path)
                      : img(item.poster_path, "w500")
                  }
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-[0.85]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Quick Play Center Hover Overlay */}
                <Link
                  to={watchUrl}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]"
                >
                  <div className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </div>
                </Link>

                {/* Top-right delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeContinue(item.id, mediaType);
                  }}
                  title="Remove from Continue Watching"
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/50 hover:text-white hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Bottom Left Info matching Screenshot 2 ("50 min left \n Sex education") */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                  <div className="flex items-center gap-1.5 text-[11px] text-white/70 font-medium tracking-wide">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{timeLeft} min left</span>
                    {item.season && <span>· S{item.season} E{item.episode || 1}</span>}
                  </div>

                  <div className="mt-0.5 text-sm sm:text-base font-semibold text-white truncate">
                    {title}
                  </div>

                  {/* Sleek Glowing Progress Bar */}
                  <div className="mt-2 w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300 progress-glow"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
