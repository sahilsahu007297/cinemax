import { useParams, Link } from "react-router";
import { useEffect, useState } from "react";
import { Play, Plus, Share2, Star, ChevronLeft, Download } from "lucide-react";
import { useDetail } from "../components/useTMDB";
import { MovieCard } from "../components/MovieCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { backdrop, img, getTitle, getYear, getRating, formatRuntime, getTVSeason, type TMDBEpisode } from "../components/tmdb";
import { DownloadManager } from "../components/DownloadManager";

export default function TitleDetail() {
  const { id } = useParams();

  // Parse "movie-12345" or "tv-12345"
  const [mediaType, rawId] = (id ?? "").split("-");
  const numericId = Number(rawId);
  const type = mediaType === "tv" ? "tv" as const : "movie" as const;

  const { data: movie, loading } = useDetail(numericId, type);
  const [showDownloads, setShowDownloads] = useState(false);

  // Always ensure page starts from top when movie/show is opened
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id, loading]);

  if (loading || !movie) {
    return (
      <div className="animate-fade-in">
        <div className="relative h-[60vh] min-h-[460px] skeleton" />
        <div className="px-6 lg:px-10 mt-8 space-y-4">
          <div className="h-12 w-64 skeleton" />
          <div className="h-6 w-48 skeleton" />
          <div className="h-32 w-full max-w-lg skeleton" />
        </div>
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
  const seasons = type === "tv" ? (movie.seasons || []).filter((season) => season.season_number > 0) : [];
  const totalEpisodes = seasons.reduce((total, season) => total + season.episode_count, 0);

  return (
    <div className="animate-fade-in">
      <div className="relative h-[60vh] min-h-[460px] overflow-hidden">
        <ImageWithFallback
          src={backdrop(movie.backdrop_path)}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent" />

        <Link
          to="/"
          className="absolute top-20 sm:top-6 left-4 sm:left-6 lg:left-10 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs sm:text-sm text-white/80 hover:text-white transition-all shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
          <div className="text-xs uppercase tracking-widest text-white/70">
            {type === "tv" ? "TV Series" : "Movie"}
          </div>
          <h1
            className="mt-3 text-white"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </h1>
          {movie.tagline && (
            <p className="mt-2 text-white/40 text-sm italic">"{movie.tagline}"</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 text-white border border-white/20">
              <Star className="w-3 h-3 fill-white text-white" /> {rating}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black font-bold text-[10px] tracking-wide">
              4K UHD
            </span>
            <span>{year}</span>
            {movie.number_of_seasons && (
              <span>
                · {movie.number_of_seasons} Season
                {movie.number_of_seasons > 1 ? "s" : ""}
              </span>
            )}
            {type === "tv" && <span>· {totalEpisodes} Episodes</span>}
            {runtime && <span>· {runtime}</span>}
            {genres.map((g) => (
              <span key={g} className="px-2.5 py-0.5 rounded-full glass text-white/70">
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10 -mt-6 relative">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Link
            to={`/watch/${mediaType}-${rawId}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-white text-black hover:bg-white/85 transition-all duration-300 font-semibold"
          >
            <Play className="w-4 h-4 fill-black" /> Play
          </Link>
          <button
            onClick={() => setShowDownloads((prev) => !prev)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:brightness-110 transition-all duration-300 shadow-lg shadow-orange-500/20"
          >
            <Download className="w-4 h-4 text-black" />
            <span>{showDownloads ? "Hide Downloads" : "⚡ Fast 4K"}</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-full glass-button text-white/80 hover:text-white">
            <Plus className="w-4 h-4" /> <span className="hidden xs:inline">Watchlist</span>
          </button>
          <button className="inline-flex items-center justify-center gap-2 h-11 px-4 sm:px-5 rounded-full glass-button text-white/80 hover:text-white">
            <Share2 className="w-4 h-4" /> <span className="hidden xs:inline">Share</span>
          </button>
        </div>

        {/* 4K Fast Downloads Section */}
        {showDownloads && (
          <div className="mt-8 animate-fade-in">
            <DownloadManager
              title={title}
              year={year}
              imdbId={movie.external_ids?.imdb_id}
              type={type}
              onClose={() => setShowDownloads(false)}
            />
          </div>
        )}

        {type === "tv" && seasons.length > 0 && (
          <SeasonEpisodes tvId={numericId} seasons={seasons} />
        )}

        <div className="mt-8 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h3 className="text-white/90" style={{ fontWeight: 600 }}>
              Synopsis
            </h3>
            <p className="mt-3 text-white/60 leading-relaxed text-sm">
              {movie.overview}
            </p>

            {cast.length > 0 && (
              <>
                <h3 className="mt-10 text-white/90" style={{ fontWeight: 600 }}>
                  Cast
                </h3>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cast.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-2xl glass-card flex items-center gap-3"
                    >
                      {c.profile_path ? (
                        <img
                          src={img(c.profile_path, "w185")}
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center text-white/30 text-xs">
                          {c.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div
                          className="text-xs text-white/90 truncate"
                          style={{ fontWeight: 500 }}
                        >
                          {c.name}
                        </div>
                        <div className="text-[10px] text-white/40 truncate">
                          {c.character}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside className="space-y-3">
            <h3 className="text-white/90" style={{ fontWeight: 600 }}>
              Details
            </h3>
            <DetailRow label="Type" value={type === "tv" ? "TV Series" : "Movie"} />
            <DetailRow label="Released" value={String(year)} />
            <DetailRow label="Rating" value={`${rating} / 10`} />
            {movie.status && <DetailRow label="Status" value={movie.status} />}
            <DetailRow label="Genres" value={genres.join(", ")} />
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <h3 className="text-white/90 mb-4" style={{ fontWeight: 600 }}>
              You may also like
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {similar.map((m, i) => (
                <MovieCard key={`${m.id}-${i}`} movie={m} size="fluid" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SeasonEpisodes({ tvId, seasons }: { tvId: number; seasons: NonNullable<import("../components/tmdb").TMDBDetail["seasons"]> }) {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0].season_number);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTVSeason(tvId, selectedSeason)
      .then((result) => { if (!cancelled) setEpisodes(result.episodes || []); })
      .catch(() => { if (!cancelled) setEpisodes([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tvId, selectedSeason]);

  return (
    <section className="mt-8 rounded-2xl glass-heavy p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Seasons & Episodes</h2>
          <p className="mt-1 text-xs text-white/40">{seasons.length} seasons · {seasons.reduce((total, season) => total + season.episode_count, 0)} total episodes</p>
        </div>
        <select value={selectedSeason} onChange={(event) => setSelectedSeason(Number(event.target.value))} className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none">
          {seasons.map((season) => <option key={season.id} value={season.season_number}>{season.name} · {season.episode_count} episodes</option>)}
        </select>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 skeleton rounded-xl" />) : episodes.map((episode) => (
          <Link
            key={episode.id}
            to={`/watch/tv-${tvId}?season=${episode.season_number}&episode=${episode.episode_number}`}
            className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-left transition-colors hover:border-white/30 hover:bg-white/[0.08]"
          >
            {episode.still_path ? <img src={img(episode.still_path, "w300")} alt="" className="h-16 w-28 rounded-lg object-cover" /> : <div className="h-16 w-28 rounded-lg bg-white/[0.06]" />}
            <div className="min-w-0">
              <div className="text-xs text-white/40">Episode {episode.episode_number}</div>
              <div className="mt-1 truncate text-sm font-medium text-white">{episode.name}</div>
              <div className="mt-1 line-clamp-2 text-[11px] text-white/40">{episode.overview || "No episode synopsis available."}</div>
            </div>
            <span className="ml-auto self-center rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">Play</span>
          </Link>
        ))}
      </div>
      {!loading && episodes.length === 0 && <p className="mt-4 text-xs text-white/35">Episode details are not available for this season.</p>}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm py-2.5 border-b border-white/[0.04]">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80 text-right">{value}</span>
    </div>
  );
}
