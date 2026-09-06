import { useParams, useSearchParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Server, ShieldCheck, Sparkles } from "lucide-react";
import { useDetail } from "../components/useTMDB";
import { useAuth } from "../components/auth";
import { getYear } from "../components/tmdb";
import { DownloadManager } from "../components/DownloadManager";

const SERVERS = [
  {
    id: "vidlink",
    name: "VidLink (4K Clean)",
    badge: "4K UHD",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=f59e0b`
        : `https://vidlink.pro/movie/${id}?primaryColor=f59e0b`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed (4K Ultra)",
    badge: "4K UHD",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`
        : `https://player.autoembed.cc/embed/movie/${id}`,
  },
  {
    id: "smashystream",
    name: "SmashyStream (4K VIP)",
    badge: "4K Fast",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://player.smashystream.com/tv/${id}?s=${season}&e=${episode}`
        : `https://player.smashystream.com/movie/${id}`,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI (Hindi & Multi-Audio)",
    badge: "Hindi Audio",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://moviesapi.club/tv/${id}-${season}-${episode}`
        : `https://moviesapi.club/movie/${id}`,
  },
  {
    id: "vidsrcpro",
    name: "VidSrc PRO",
    badge: "1080p",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://vidsrc.pro/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.pro/embed/movie/${id}`,
  },
  {
    id: "vidsrcxyz",
    name: "VidSrc XYZ",
    badge: "Multi",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://vidsrc.xyz/embed/tv/${id}/${season}-${episode}`
        : `https://vidsrc.xyz/embed/movie/${id}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    badge: "HD",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: "twoembed",
    name: "2Embed",
    badge: "HD",
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${id}`,
  },
];

export default function Watch() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const routeId = id ?? "";
  const [mediaType, rawId] = routeId.split("-");
  const numericId = Number(rawId);
  const type = mediaType === "tv" ? ("tv" as const) : ("movie" as const);
  const season = Math.max(1, Number(searchParams.get("season")) || 1);
  const episode = Math.max(1, Number(searchParams.get("episode")) || 1);

  const { data: movie, loading } = useDetail(numericId, type);
  const { user, saveProgress } = useAuth();
  const [activeServer, setActiveServer] = useState(0);

  useEffect(() => {
    if (!user || !movie) return;
    saveProgress({ ...movie, media_type: type, progress: 0, updatedAt: Date.now() });
  }, [user?.id, movie?.id, type]);

  // Always ensure watch page starts from top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id, season, episode]);

  if (loading || !movie) {
    return (
      <div className="px-6 lg:px-10 mt-4">
        <div className="h-6 w-32 skeleton mb-4" />
        <div className="aspect-video w-full skeleton rounded-2xl" />
      </div>
    );
  }

  const embedUrl = SERVERS[activeServer].getUrl(type, numericId, season, episode);

  return (
    <div className="mt-0 animate-fade-in pb-20">
      <div className="mx-4 sm:mx-6 lg:mx-10 pt-20 sm:pt-6 flex items-center justify-between">
        <Link
          to={`/title/${mediaType}-${rawId}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs sm:text-sm text-white/80 hover:text-white transition-all shadow-md"
        >
          <ChevronLeft className="w-4 h-4" /> Back to details
        </Link>
      </div>

      <div className="relative left-1/2 mt-4 aspect-video w-screen -translate-x-1/2 overflow-hidden border-y border-white/[0.06] bg-black shadow-2xl">
        <iframe
          key={activeServer}
          src={embedUrl}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin"
          className="w-full h-full border-0"
          title="Movie/TV Player"
        />
      </div>

      {/* Streaming Server & Download Section */}
      <div className="mx-4 sm:mx-6 lg:mx-10 mt-6 space-y-6 sm:space-y-8">
        {/* Server Selection */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-6 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Streaming Servers ({SERVERS.length} Free Providers)</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Ad Streaming Active</span>
            </div>
          </div>

          <p className="text-xs text-white/50 mb-4 leading-relaxed">
            Switch servers anytime if a stream is buffering. Servers tagged with <strong>4K UHD</strong> provide highest definition. <strong>Server 1 & 2</strong> have clean, zero-popup streams on mobile.
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] touch-pan-x sm:flex-wrap -mx-1 px-1">
            {SERVERS.map((server, index) => (
              <button
                key={server.id}
                onClick={() => setActiveServer(index)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  activeServer === index
                    ? "bg-white text-black border-white font-semibold shadow-lg shadow-white/10"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{server.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    activeServer === index
                      ? "bg-black text-white"
                      : server.badge.includes("4K")
                      ? "bg-amber-400 text-black"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {server.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 4K Torrents & Fast Downloads */}
        <DownloadManager
          title={movie.title || movie.name || "Movie"}
          year={getYear(movie)}
          imdbId={movie.external_ids?.imdb_id}
          type={type}
          season={season}
          episode={episode}
        />
      </div>
    </div>
  );
}

