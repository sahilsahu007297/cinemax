import { useParams, Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Play,
  Plus,
  Star,
  ChevronLeft,
  Download,
  Heart,
  Film,
  X,
  ShieldAlert,
  Lightbulb,
  Quote,
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useDetail } from "../components/useTMDB";
import { MovieCard } from "../components/MovieCard";
import { CelebrityModal } from "../components/CelebrityModal";
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
import {
  getParentsGuide,
  getMovieTrivia,
  getMovieQuotes,
  getMovieGoofs,
  type ParentsGuide,
} from "../lib/imdbData";
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
  const { user, isFavorite, toggleFavorite, rateTitle, getUserRating } = useAuth();

  // Parse "movie-12345" or "tv-12345"
  const [mediaType, rawId] = (id ?? "").split("-");
  const numericId = Number(rawId);
  const type = mediaType === "tv" ? ("tv" as const) : ("movie" as const);

  const { data: movie, loading } = useDetail(numericId, type);
  const [showDownloads, setShowDownloads] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeExtrasTab, setActiveExtrasTab] = useState<
    "cast" | "parentsGuide" | "trivia" | "quotes" | "goofs" | "reviews"
  >("cast");

  // 1-10 User Rating State
  const currentRating = getUserRating(numericId, type);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);

  // Selected celebrity for modal
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Custom Reviews State
  const [newReviewRating, setNewReviewRating] = useState(9);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [customReviews, setCustomReviews] = useState<UserReview[]>([]);

  // Always scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  // Load reviews from local storage
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
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const similar = movie.similar?.results?.filter((m) => m.poster_path).slice(0, 6) || [];
  const seasons =
    type === "tv"
      ? (movie.seasons || []).filter((season) => season.season_number > 0)
      : [];
  const favorited = isFavorite(movie.id, type);

  // IMDb Extras Data
  const parentsGuide: ParentsGuide = getParentsGuide(movie);
  const triviaList = getMovieTrivia(movie);
  const quotesList = getMovieQuotes(movie);
  const goofsList = getMovieGoofs(movie);

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

  const handleRate = async (score: number) => {
    if (!user) {
      navigate("/signin");
      return;
    }
    await rateTitle(numericId, score, type);
    setShowRatingSuccess(true);
    setTimeout(() => setShowRatingSuccess(false), 2500);
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

  // Helper for severity color
  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "None":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
      case "Mild":
        return "bg-sky-500/15 text-sky-400 border-sky-500/25";
      case "Moderate":
        return "bg-amber-500/15 text-amber-400 border-amber-500/25";
      case "Severe":
        return "bg-rose-500/15 text-rose-400 border-rose-500/25";
      default:
        return "bg-white/10 text-white/70 border-white/20";
    }
  };

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

        {/* Top Floating Navigation */}
        <div className="relative z-30 pt-20 sm:pt-8 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
          <Link
            to="/"
            className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white transition-all shadow-xl"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleFavorite}
              title="Add to List"
              className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white transition-all shadow-xl"
            >
              <Plus className="w-5 h-5" />
            </button>

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

            <button
              onClick={() => setShowDownloads((prev) => !prev)}
              title="Download 4K"
              className="w-10 h-10 rounded-full glass-circle text-white/80 hover:text-white transition-all shadow-xl"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Frosted Glass Bottom Sheet */}
        <div className="relative z-30 px-4 sm:px-8 lg:px-12 pb-6 pt-16">
          <div className="max-w-xl p-6 sm:p-8 rounded-[32px] glass-sheet border border-white/20 shadow-2xl backdrop-blur-3xl animate-fade-in">
            {/* Title + HD Badge + IMDb Yellow Badge */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              <div className="flex items-center gap-2">
                {/* Official IMDb Community Scoring Badge */}
                <div className="px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wide bg-[#f5c518] text-black shadow-sm flex items-center gap-1">
                  <span>IMDb</span>
                  <span className="font-bold">{rating}</span>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white border border-white/30">
                  HD
                </span>
              </div>
            </div>

            {/* Genres Row */}
            <div className="mt-1.5 text-xs sm:text-sm text-white/60 font-medium">
              {genres.slice(0, 3).join(", ")}
            </div>

            {/* Rating & Runtime Row */}
            <div className="mt-3 flex items-center gap-2.5 text-xs text-white/70 flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{rating} / 10</span>
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
              <span>·</span>
              <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-bold">
                {parentsGuide.certification}
              </span>
            </div>

            {/* Interactive 1–10 Scale User Rating Widget */}
            <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400" />
                  <span>Your Rating:</span>
                  <strong className="text-amber-400 font-bold ml-1">
                    {hoverRating || currentRating ? `${hoverRating || currentRating}/10` : "Rate this"}
                  </strong>
                </span>
                {showRatingSuccess && (
                  <span className="text-[10px] text-emerald-400 font-semibold animate-fade-in">
                    Rating saved & synced!
                  </span>
                )}
              </div>

              {/* 10 Stars row */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => {
                  const active = (hoverRating || currentRating || 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => handleRate(star)}
                      title={`Rate ${star}/10`}
                      className="p-0.5 group focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-4 h-4 transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400"
                            : "text-white/25 group-hover:text-amber-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
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

            {/* Buttons: "Watch now" & "Trailer" */}
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
      <div className="px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto mt-8 space-y-10">
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

        {/* ========================================================================= */}
        {/* COMPREHENSIVE IMDB EXTRAS & GUIDES SUITE */}
        {/* ========================================================================= */}
        <section className="rounded-3xl glass-sheet p-6 sm:p-8 border border-white/15 shadow-2xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="px-2 py-0.5 rounded bg-[#f5c518] text-black font-black text-xs">
                IMDb
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Guides, Trivia & Community Media
              </h2>
            </div>

            {/* Extras Tab Selector */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.06] border border-white/10 overflow-x-auto [scrollbar-width:none]">
              {[
                { id: "cast", label: "Cast & Crew", icon: Sparkles },
                { id: "parentsGuide", label: "Parents Guide", icon: ShieldAlert },
                { id: "trivia", label: "Trivia", icon: Lightbulb },
                { id: "quotes", label: "Quotes", icon: Quote },
                { id: "goofs", label: "Goofs", icon: AlertTriangle },
                { id: "reviews", label: "Reviews", icon: MessageSquare },
              ].map(({ id: tabId, label, icon: Icon }) => (
                <button
                  key={tabId}
                  onClick={() => setActiveExtrasTab(tabId as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeExtrasTab === tabId
                      ? "bg-white text-black shadow-md"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: CAST & CREW FILMOGRAPHIES */}
          {activeExtrasTab === "cast" && (
            <div className="space-y-4">
              <div className="text-xs text-white/50">
                Click any actor or director to view their full filmography, biography, and titles available to stream.
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {cast.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedPersonId(c.id)}
                    className="p-3 rounded-2xl glass-card border border-white/[0.08] hover:border-white/30 text-left transition-all flex flex-col items-center text-center group"
                  >
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2 border-2 border-white/15 shadow-xl bg-white/5">
                      <ImageWithFallback
                        src={img(c.profile_path, "w185")}
                        alt={c.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="text-xs font-bold text-white truncate w-full group-hover:text-amber-300 transition-colors">
                      {c.name}
                    </div>
                    <div className="text-[10px] text-white/40 truncate w-full">
                      {c.character || "Cast Member"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PARENTS GUIDE */}
          {activeExtrasTab === "parentsGuide" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Content Rating & Advisory
                  </span>
                  <div className="text-lg font-bold text-white mt-0.5">
                    Rated {parentsGuide.certification}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white">
                  Family Guidance Advisory
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Sex & Nudity", data: parentsGuide.sexAndNudity },
                  { title: "Violence & Gore", data: parentsGuide.violenceAndGore },
                  { title: "Profanity", data: parentsGuide.profanity },
                  { title: "Alcohol, Drugs & Smoking", data: parentsGuide.alcoholDrugs },
                  { title: "Frightening & Intense Scenes", data: parentsGuide.frighteningIntense },
                ].map(({ title: categoryTitle, data }) => (
                  <div
                    key={categoryTitle}
                    className="p-4 rounded-2xl glass-card border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{categoryTitle}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(
                          data.level
                        )}`}
                      >
                        {data.level}
                      </span>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed">{data.summary}</p>
                    <ul className="text-[11px] text-white/50 list-disc list-inside space-y-1 pt-1">
                      {data.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRIVIA & BEHIND-THE-SCENES */}
          {activeExtrasTab === "trivia" && (
            <div className="space-y-3">
              <div className="text-xs text-white/50 mb-2">
                Verified behind-the-scenes facts, stunt choreography secrets, and production trivia.
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {triviaList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl glass-card border border-white/10 space-y-2"
                  >
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {item.category}
                    </span>
                    <p className="text-xs text-white/75 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEMORABLE QUOTES */}
          {activeExtrasTab === "quotes" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {quotesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl glass-card border border-white/10 space-y-2 relative"
                  >
                    <Quote className="w-5 h-5 text-amber-400/40 absolute top-3 right-3" />
                    <p className="text-xs sm:text-sm text-white/90 italic font-medium leading-relaxed pr-6">
                      "{item.quote}"
                    </p>
                    <div className="text-[11px] text-white/50 font-bold pt-1">
                      — {item.character}
                      {item.actor ? ` (${item.actor})` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GOOFS & INCONSISTENCIES */}
          {activeExtrasTab === "goofs" && (
            <div className="space-y-3">
              <div className="text-xs text-white/50 mb-2">
                Documented continuity slips, audio/visual dubbing variations, and technical trivia.
              </div>
              <div className="space-y-2.5">
                {goofsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl glass-card border border-white/10 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {item.type}
                      </span>
                      <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: REVIEWS & COMMUNITY DISCUSSIONS */}
          {activeExtrasTab === "reviews" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  {allReviews.length} community reviews from verified viewers
                </span>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-white/85 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Write Review</span>
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
            </div>
          )}
        </section>

        {/* Related Movies Section */}
        {similar.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                More like this
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
      </div>

      {/* Celebrity Filmography & Biography Modal */}
      {selectedPersonId && (
        <CelebrityModal
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      )}

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
