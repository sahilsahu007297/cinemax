import { useParams, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Play,
  Plus,
  Share2,
  Star,
  ChevronLeft,
  Download,
  Heart,
  Film,
  X,
  MessageSquarePlus,
  Check,
} from "lucide-react";
import { useDetail } from "../components/useTMDB";
import { MovieCard } from "../components/MovieCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  backdrop,
  img,
  getTitle,
  getYear,
  getRating,
  formatRuntime,
  getTVSeason,
  type TMDBEpisode,
} from "../components/tmdb";
import { DownloadManager } from "../components/DownloadManager";
import { useAuth } from "../components/auth";

interface UserReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export default function TitleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isFavorite, toggleFavorite } = useAuth();

  // Parse "movie-12345" or "tv-12345"
  const [mediaType, rawId] = (id ?? "").split("-");
  const numericId = Number(rawId);
  const type = mediaType === "tv" ? ("tv" as const) : ("movie" as const);

  const { data: movie, loading } = useDetail(numericId, type);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(9);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [customReviews, setCustomReviews] = useState<UserReview[]>([]);

  // Always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  // Load custom stored reviews for this title
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`cinemax_reviews_${numericId}`);
      if (stored) setCustomReviews(JSON.parse(stored));
    } catch {
      // Ignore
    }
  }, [numericId]);

  if (loading || !movie) {
    return (
      <div className="animate-fade-in p-6 lg:p-12">
        <div className="relative h-[65vh] min-h-[480px] skeleton rounded-3xl" />
      </div>
    );
  }

  const title = getTitle(movie);
  const year = getYear(movie);
  const rating = getRating(movie);
  const runtime = formatRuntime(movie.runtime);
  const genres = movie.genres?.map((g) => g.name) || [];
  const cast = movie.credits?.cast?.slice(0, 8) || [];
  const similar = movie.similar?.results?.filter((m) => m.poster_path).slice(0, 6) || [];
  const seasons =
    type === "tv"
      ? (movie.seasons || []).filter((season) => season.season_number > 0)
      : [];
  const favorited = isFavorite(movie.id, type);

  // Extract trailer video
  const trailerVideo =
    movie.videos?.results?.find(
      (v) => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube"
    ) || movie.videos?.results?.find((v) => v.site === "YouTube");

  const handleFavorite = async () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    await toggleFavorite(movie, type);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    const rev: UserReview = {
      id: String(Date.now()),
      author: user?.name || "Verified Viewer",
      rating: newReviewRating,
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      comment: newReviewComment.trim(),
    };
    const updated = [rev, ...customReviews];
    setCustomReviews(updated);
    try {
      localStorage.setItem(`cinemax_reviews_${numericId}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
    setNewReviewComment("");
    setShowReviewModal(false);
  };

  // Pre-seed sample reviews matching Screenshot 3
  const allReviews: UserReview[] = [
    ...customReviews,
    {
      id: "seed-1",
      author: "Princefiona",
      rating: 8.5,
      date: "14 May 2024",
      comment:
        "Masterfully directed with breathtaking cinematography and exceptional sound design. A genuine tour de force that commands attention from start to finish.",
    },
    {
      id: "seed-2",
      author: "Alex Morgan",
      rating: 9.0,
      date: "28 Jun 2024",
      comment:
        "The emotional depth and world-building elevate this beyond genre expectations. Incredible performance by the lead cast.",
    },
  ];

  return (
    <div className="animate-fade-in pb-24 select-none">
      {/* Hero & Backdrop Container */}
      <div className="relative min-h-[82vh] lg:min-h-[88vh] w-full overflow-hidden flex flex-col justify-between">
        {/* Backdrop Image */}
        <div className="absolute inset-0 overflow-hidden">
          <ImageWithFallback
            src={backdrop(movie.backdrop_path)}
            alt={title}
            className="w-full h-full object-cover object-[center_20%] filter brightness-[0.85]"
          />
        </div>

        {/* Ambient Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/40 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#08090c]/80 via-transparent to-transparent" />

        {/* Top Floating Navigation: Back button + Top-Right Actions (Screenshot 3) */}
        <div className="relative z-30 pt-20 sm:pt-8 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <Link
            to="/"
            className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white transition-all shadow-xl"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Plus / Watchlist */}
            <button
              onClick={handleFavorite}
              title="Add to List"
              className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white transition-all shadow-xl"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Heart Favorite */}
            <button
              onClick={handleFavorite}
              title={favorited ? "Saved in Favorites" : "Add to Favorites"}
              className={`w-10 h-10 rounded-full glass-circle transition-all shadow-xl ${
                favorited
                  ? "bg-rose-600 border-rose-500 text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? "fill-white" : ""}`} />
            </button>

            {/* Download */}
            <button
              onClick={() => setShowDownloads((prev) => !prev)}
              title="Download 4K"
              className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white transition-all shadow-xl"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Frosted Glass Bottom Sheet (Screenshot 3) */}
        <div className="relative z-30 px-4 sm:px-8 lg:px-12 pb-6 pt-16">
          <div className="max-w-xl p-6 sm:p-8 rounded-[32px] glass-sheet border border-white/20 shadow-2xl backdrop-blur-3xl animate-fade-in">
            {/* Title + HD Badge */}
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white border border-white/30 shrink-0">
                HD
              </span>
            </div>

            {/* Genres Row */}
            <div className="mt-1.5 text-xs sm:text-sm text-white/60 font-medium">
              {genres.slice(0, 3).join(", ")}
            </div>

            {/* Rating & Runtime Row: e.g. ⭐ 8.2 · 2019 · 102 min */}
            <div className="mt-3 flex items-center gap-2.5 text-xs text-white/70">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{rating}</span>
              </span>
              <span>·</span>
              <span>{year}</span>
              {runtime && (
                <>
                  <span>·</span>
                  <span>{runtime}</span>
                </>
              )}
              {type === "tv" && (
                <>
                  <span>·</span>
                  <span>{movie.number_of_seasons || 1} Season(s)</span>
                </>
              )}
            </div>

            {/* Synopsis with "...more" link */}
            <div className="mt-4 text-xs sm:text-sm text-white/70 leading-relaxed">
              {showFullSynopsis ? (
                <>
                  {movie.overview}
                  <button
                    onClick={() => setShowFullSynopsis(false)}
                    className="ml-1 text-white font-semibold underline"
                  >
                    less
                  </button>
                </>
              ) : (
                <>
                  {movie.overview ? movie.overview.slice(0, 160) : "No overview available."}
                  {movie.overview && movie.overview.length > 160 && (
                    <button
                      onClick={() => setShowFullSynopsis(true)}
                      className="ml-1 text-white font-semibold underline cursor-pointer"
                    >
                      more
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Buttons: "Watch now" (white pill) & "Trailer" (frosted outline pill) */}
            <div className="mt-6 flex items-center gap-3">
              <Link
                to={`/watch/${mediaType}-${rawId}`}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/85 transition-all shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Watch now</span>
              </Link>

              <button
                onClick={() => setShowTrailerModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full glass-pill text-white font-medium text-xs sm:text-sm hover:bg-white/20 transition-all"
              >
                <Film className="w-4 h-4 text-white/70" />
                <span>Trailer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto mt-6 space-y-10">
        {/* 4K Fast Download Manager */}
        {showDownloads && (
          <div className="rounded-3xl glass-card p-6 border border-white/15 animate-fade-in">
            <DownloadManager
              title={title}
              year={year}
              imdbId={movie.external_ids?.imdb_id}
              type={type}
              onClose={() => setShowDownloads(false)}
            />
          </div>
        )}

        {/* TV Seasons and Episodes if TV */}
        {type === "tv" && seasons.length > 0 && (
          <SeasonEpisodes tvId={numericId} seasons={seasons} />
        )}

        {/* Related Movies Section (Screenshot 3) */}
        {similar.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Related movies
              </h3>
              <Link to="/browse" className="text-xs text-white/40 hover:text-white">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {similar.map((m, idx) => (
                <MovieCard key={`${m.id}-${idx}`} movie={m} size="fluid" />
              ))}
            </div>
          </section>
        )}

        {/* Top Cast Section with Circular Portraits (Screenshot 3) */}
        {cast.length > 0 && (
          <section>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mb-4">
              Top cast
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
              {cast.map((c) => (
                <div key={c.id} className="flex flex-col items-center text-center shrink-0 w-20 sm:w-24">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-white/15 shadow-xl bg-white/5 mb-2">
                    {c.profile_path ? (
                      <img
                        src={img(c.profile_path, "w185")}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-base font-bold">
                        {c.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-white truncate w-full">
                    {c.name}
                  </div>
                  <div className="text-[10px] text-white/40 truncate w-full">
                    {c.character || "Actor"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section matching Screenshot 3 */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Reviews
              </h3>
              <span className="text-xs text-white/40 font-medium">
                {allReviews.length} &gt;
              </span>
            </div>

            <button
              onClick={() => setShowReviewModal(true)}
              className="w-8 h-8 rounded-full glass-circle text-white/70 hover:text-white transition-colors"
              title="Add a review"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}/10</span>
                  </div>
                  <span className="text-[11px] text-white/40">{rev.date}</span>
                </div>

                <div className="text-xs font-bold text-white/90">{rev.author}</div>
                <p className="text-xs text-white/60 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl glass-sheet overflow-hidden p-3 sm:p-5 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm sm:text-base font-semibold text-white">
                {title} — Official Trailer
              </h3>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
              {trailerVideo?.key ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerVideo.key}?autoplay=1`}
                  title={`${title} Trailer`}
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
                  Trailer not found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl glass-sheet p-6 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Write a Review</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 block mb-1.5">Rating (1 to 10)</label>
                <div className="flex items-center gap-1.5">
                  {[6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        newReviewRating === star
                          ? "bg-amber-400 text-black"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 block mb-1.5">Your Thoughts</label>
                <textarea
                  required
                  rows={4}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your experience watching this movie..."
                  className="w-full rounded-xl bg-white/[0.06] border border-white/15 p-3 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/40"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/80 transition-colors"
              >
                Post Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SeasonEpisodes({
  tvId,
  seasons,
}: {
  tvId: number;
  seasons: NonNullable<import("../components/tmdb").TMDBDetail["seasons"]>;
}) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0].season_number);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTVSeason(tvId, selectedSeason)
      .then((result) => {
        if (!cancelled) setEpisodes(result.episodes || []);
      })
      .catch(() => {
        if (!cancelled) setEpisodes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tvId, selectedSeason]);

  return (
    <section className="rounded-3xl glass-heavy p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Seasons & Episodes</h2>
          <p className="mt-1 text-xs text-white/40">
            {seasons.length} seasons ·{" "}
            {seasons.reduce((total, season) => total + season.episode_count, 0)} episodes
          </p>
        </div>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(Number(e.target.value))}
          className="rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none"
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.season_number}>
              {s.name} · {s.episode_count} episodes
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))
          : episodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/watch/tv-${tvId}?season=${ep.season_number}&episode=${ep.episode_number}`}
                className="flex gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-left transition-all hover:border-white/30 hover:bg-white/[0.08]"
              >
                {ep.still_path ? (
                  <img
                    src={img(ep.still_path, "w300")}
                    alt=""
                    className="h-16 w-28 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-16 w-28 rounded-xl bg-white/[0.06]" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] text-white/40">Episode {ep.episode_number}</div>
                  <div className="mt-0.5 truncate text-xs font-semibold text-white">
                    {ep.name}
                  </div>
                  <div className="mt-1 line-clamp-2 text-[10px] text-white/40">
                    {ep.overview || "No episode synopsis available."}
                  </div>
                </div>
                <span className="ml-auto self-center rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-black">
                  Play
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
}
