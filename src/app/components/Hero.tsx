import { useState, useEffect } from "react";
import { Play, Heart, Bookmark, Plus, X, Film } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  type TMDBMovie,
  backdrop,
  img,
  getTitle,
  getYear,
  getGenreNames,
  getMediaType,
  getMovieDetail,
  getTVDetail,
} from "./tmdb";
import { useAuth } from "./auth";

interface HeroProps {
  movie: TMDBMovie | null;
  featuredList?: TMDBMovie[];
}

export function Hero({ movie: initialMovie, featuredList = [] }: HeroProps) {
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuth();

  // Combine initialMovie with featuredList so we always have a rich carousel of 5 items
  const candidates = (
    featuredList.length > 0
      ? featuredList
      : initialMovie
      ? [initialMovie]
      : []
  ).filter((m) => m && m.backdrop_path).slice(0, 5);

  const [activeIndex, setActiveIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isTrailerLoading, setIsTrailerLoading] = useState(false);

  const activeMovie = candidates[activeIndex] || initialMovie;

  // Auto cycle carousel gently if user is just gazing (every 8s)
  useEffect(() => {
    if (candidates.length <= 1 || showTrailerModal) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % candidates.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [candidates.length, showTrailerModal]);

  if (!activeMovie) return <HeroSkeleton />;

  const mediaType = getMediaType(activeMovie);
  const title = getTitle(activeMovie);
  const year = getYear(activeMovie);
  const genres = getGenreNames(activeMovie.genre_ids || []);
  const favorited = isFavorite(activeMovie.id, mediaType);

  // Format release date e.g. "May, 17"
  const rawDate = activeMovie.release_date || activeMovie.first_air_date;
  let formattedDate = "Trending";
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      // Fallback
    }
  }

  // Genre string e.g. "action, thriller"
  const genreSubtitle = genres.slice(0, 2).map((g) => g.toLowerCase()).join(", ");

  const handleTrailer = async () => {
    setIsTrailerLoading(true);
    setShowTrailerModal(true);
    try {
      const detail = mediaType === "tv"
        ? await getTVDetail(activeMovie.id)
        : await getMovieDetail(activeMovie.id);

      const videos = detail.videos?.results || [];
      const trailer = videos.find(
        (v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube"
      ) || videos.find((v) => v.site === "YouTube");

      if (trailer?.key) {
        setTrailerKey(trailer.key);
      } else {
        setTrailerKey(null);
      }
    } catch {
      setTrailerKey(null);
    } finally {
      setIsTrailerLoading(false);
    }
  };

  const handleFavoriteClick = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    await toggleFavorite(activeMovie, mediaType);
  };

  return (
    <section className="relative w-full overflow-hidden bg-[#08090c] select-none">
      {/* High-definition Backdrop with smooth cinematic edge blending */}
      <div className="relative min-h-[86vh] sm:min-h-[90vh] lg:min-h-[94vh] max-h-[1050px] w-full overflow-hidden flex flex-col justify-between">
        {/* Background Image Layer */}
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback
            key={activeMovie.id}
            src={backdrop(activeMovie.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover object-[center_22%] transition-all duration-1000 transform scale-105 filter brightness-[0.88] contrast-[1.05]"
          />
        </div>

        {/* Cinematic Vignette Gradients matching Screenshot 1 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090c] via-[#08090c]/70 to-transparent w-full md:w-[68%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#08090c]/80 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#08090c] via-[#08090c]/90 to-transparent" />

        {/* Content Container */}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 pt-24 sm:pt-28 pb-32 max-w-4xl">
          {/* Metadata Row: e.g. "May, 17     action, thriller" */}
          <div className="flex items-center gap-6 text-xs sm:text-sm font-medium tracking-wide text-white/70 uppercase">
            <span>{formattedDate}</span>
            {genreSubtitle && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                <span className="lowercase text-white/60">{genreSubtitle}</span>
              </>
            )}
          </div>

          {/* Huge bold modern Title matching Screenshot 1 (e.g. JOHN WICK) */}
          <h1
            className="mt-3 text-white font-hero-title tracking-tighter"
            style={{
              fontSize: "clamp(2.4rem, 6.8vw, 5.8rem)",
              lineHeight: 0.95,
              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
            }}
          >
            {title}
          </h1>

          {/* Subtitle / Tagline: e.g. "Chapter 3-Parabellum(2019)" */}
          <p className="mt-2 text-white/70 text-sm sm:text-base font-normal tracking-wide max-w-xl">
            {mediaType === "tv" ? `TV Series (${year})` : `(${year})`}
            {activeMovie.overview ? ` — ${activeMovie.overview.slice(0, 110)}...` : ""}
          </p>

          {/* Action Buttons: "Watch now" and "Trailer" */}
          <div className="mt-7 flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              to={`/watch/${mediaType}-${activeMovie.id}`}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/85 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_4px_25px_rgba(255,255,255,0.3)]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Watch now</span>
            </Link>

            <button
              onClick={handleTrailer}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full glass-pill text-white font-medium text-sm hover:bg-white/[0.18] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Film className="w-4 h-4 text-white/80" />
              <span>Trailer</span>
            </button>
          </div>
        </div>

        {/* Bottom Carousel & Floating Action Bar matching Screenshot 1 */}
        <div className="relative z-20 px-6 sm:px-12 lg:px-16 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          {/* Bottom-left: Thumbnails Row with slim active indicator underneath */}
          {candidates.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                {candidates.map((m, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative w-14 sm:w-16 h-20 sm:h-24 rounded-xl overflow-hidden transition-all duration-300 transform shrink-0 ${
                        isActive
                          ? "ring-2 ring-white scale-105 shadow-xl shadow-black/80"
                          : "opacity-50 hover:opacity-90 hover:scale-100"
                      }`}
                    >
                      <ImageWithFallback
                        src={img(m.poster_path, "w185")}
                        alt={getTitle(m)}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </button>
                  );
                })}
              </div>

              {/* Slim progress bar indicating active card */}
              <div className="w-28 sm:w-36 h-[3px] bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-500 rounded-full"
                  style={{
                    width: `${((activeIndex + 1) / candidates.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Bottom-right: Floating Glass Actions (Heart, Bookmark, Plus) */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Heart / Favorite Toggle */}
            <button
              onClick={handleFavoriteClick}
              title={favorited ? "Remove from Favorites" : "Add to Favorites (Supabase)"}
              className={`glass-circle transition-all duration-300 ${
                favorited
                  ? "bg-rose-600/90 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] scale-105"
                  : "text-white/80 hover:text-white hover:scale-105"
              }`}
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  favorited ? "fill-white scale-110" : ""
                }`}
              />
            </button>

            {/* Bookmark / Watchlist */}
            <Link
              to="/watchlist"
              title="Go to Library & Watchlist"
              className="glass-circle text-white/80 hover:text-white hover:scale-105 transition-all"
            >
              <Bookmark className="w-5 h-5" />
            </Link>

            {/* Plus / Quick Add */}
            <button
              onClick={handleFavoriteClick}
              title="Save to My List"
              className="glass-circle text-white/80 hover:text-white hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Trailer Modal (Frosted Glass Overlay) */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl glass-sheet overflow-hidden p-2 sm:p-4 shadow-2xl border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-white/70" />
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  {title} — Official Trailer
                </h3>
              </div>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black mt-2">
              {isTrailerLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/60">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs font-medium">Loading trailer...</span>
                </div>
              ) : trailerKey ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                  title={`${title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/60">
                  <p className="text-sm">Trailer not available for this title.</p>
                  <Link
                    to={`/watch/${mediaType}-${activeMovie.id}`}
                    className="px-5 py-2 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/80"
                  >
                    Watch Full Title
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative w-full min-h-[85vh] bg-[#08090c] p-8 flex flex-col justify-end">
      <div className="skeleton h-6 w-40 mb-4 rounded-full" />
      <div className="skeleton h-16 w-80 mb-3 rounded-2xl" />
      <div className="skeleton h-5 w-64 mb-6 rounded-full" />
      <div className="flex gap-4">
        <div className="skeleton h-12 w-36 rounded-full" />
        <div className="skeleton h-12 w-36 rounded-full" />
      </div>
    </section>
  );
}
