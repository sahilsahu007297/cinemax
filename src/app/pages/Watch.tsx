import { useParams, useSearchParams, Link } from "react-router";
import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  Server,
  ShieldCheck,
  Wifi,
  Download,
  ArrowDown,
  Sparkles,
  Subtitles,
  Airplay,
  Zap,
  Loader2,
} from "lucide-react";
import { useDetail } from "../components/useTMDB";
import { useAuth } from "../components/auth";
import { getYear, getTitle } from "../components/tmdb";
import { backdrop } from "../components/tmdb";
import { DownloadManager } from "../components/DownloadManager";
import { ExternalPlayerModal } from "../components/ExternalPlayerModal";
import { NativePlayer } from "../components/NativePlayer";
import { fetchDirectStream, type StreamSource } from "../components/streamSources";

// First entry is the native Cinejoy-style player (no iframe)
const NATIVE_SERVER = {
  id: "native",
  name: "⚡ Cinemax Ultra (No Ads)",
  badge: "NATIVE",
  isJioFriendly: true,
  isNative: true as const,
  getUrl: () => "", // unused — native player handles its own source
};

const IFRAME_SERVERS = [
  {
    id: "vidlink",
    name: "VidLink (4K Jio Ready)",
    badge: "4K UHD",
    isJioFriendly: true,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?primaryColor=f59e0b`
        : `https://vidlink.pro/movie/${id}?primaryColor=f59e0b`,
  },
  {
    id: "vidsrccc",
    name: "VidSrc CC (Unblocked)",
    badge: "4K Fast",
    isJioFriendly: true,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    id: "smashystream",
    name: "SmashyStream (VIP Ultra)",
    badge: "4K VIP",
    isJioFriendly: true,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://player.smashystream.com/tv/${id}?s=${season}&e=${episode}`
        : `https://player.smashystream.com/movie/${id}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed (Zero Ads)",
    badge: "4K UHD",
    isJioFriendly: true,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`
        : `https://autoembed.co/movie/tmdb/${id}`,
  },
  {
    id: "embedsu",
    name: "Embed.su (Multi-Subtitles)",
    badge: "1080p",
    isJioFriendly: true,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://embed.su/embed/tv/${id}/${season}/${episode}`
        : `https://embed.su/embed/movie/${id}`,
  },
  {
    id: "moviesapi",
    name: "MoviesAPI (Hindi & Multi-Audio)",
    badge: "Hindi Audio",
    isJioFriendly: true,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://moviesapi.club/tv/${id}-${season}-${episode}`
        : `https://moviesapi.club/movie/${id}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed Stream",
    badge: "HD",
    isJioFriendly: false,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: "twoembed",
    name: "2Embed (Backup)",
    badge: "HD",
    isJioFriendly: false,
    isNative: false as const,
    getUrl: (type: string, id: number, season: number, episode: number) =>
      type === "tv"
        ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
        : `https://www.2embed.cc/embed/${id}`,
  },
];

const SERVERS = [NATIVE_SERVER, ...IFRAME_SERVERS];

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
  const [showJioTips, setShowJioTips] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);

  // Native player state (Cinejoy-style direct streaming)
  const [nativeStream, setNativeStream] = useState<StreamSource | null>(null);
  const [nativeLoading, setNativeLoading] = useState(false);
  const [nativeError, setNativeError] = useState(false);

  // Fetch direct stream when native server is selected
  useEffect(() => {
    if (activeServer !== 0) {
      setNativeStream(null);
      setNativeError(false);
      return;
    }
    let cancelled = false;
    setNativeLoading(true);
    setNativeError(false);
    fetchDirectStream(numericId, type, season, episode)
      .then((result) => {
        if (cancelled) return;
        if (result) {
          setNativeStream(result);
        } else {
          setNativeError(true);
        }
        setNativeLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setNativeError(true);
          setNativeLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [activeServer, numericId, type, season, episode]);

  // Auto-fallback to iframe server if native fails
  const handleNativeError = useCallback(() => {
    setActiveServer(1); // Fall back to VidLink
  }, []);

  useEffect(() => {
    if (!user || !movie) return;
    saveProgress({ ...movie, media_type: type, progress: 25, updatedAt: Date.now() });
  }, [user?.id, movie?.id, type]);

  // Initial scroll to top on title change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id, season, episode]);

  const scrollToDownloads = () => {
    const el = document.getElementById("downloads-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: 700, behavior: "smooth" });
    }
  };

  const scrollToServers = () => {
    const el = document.getElementById("servers-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: 500, behavior: "smooth" });
    }
  };

  if (loading || !movie) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-24">
        <div className="h-6 w-36 skeleton mb-4" />
        <div className="aspect-video w-full skeleton rounded-3xl" />
      </div>
    );
  }

  const title = getTitle(movie);
  const currentServer = SERVERS[activeServer];
  const isNativeMode = currentServer.id === "native";
  const embedUrl = isNativeMode ? "" : (currentServer as typeof IFRAME_SERVERS[number]).getUrl(type, numericId, season, episode);
  const posterUrl = backdrop(movie.backdrop_path);

  return (
    <div className="w-full animate-fade-in pb-28 pt-20 sm:pt-6">
      {/* Top Header Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-3 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/title/${mediaType}-${rawId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs sm:text-sm text-white/80 hover:text-white transition-all shadow-md"
        >
          <ChevronLeft className="w-4 h-4" /> Back to details
        </Link>

        {/* Quick Action Jump Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* External Player & Subtitles Button */}
          <button
            onClick={() => setShowExternalModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full glass-pill text-white font-semibold text-xs hover:bg-white/20 active:scale-95 transition-all shadow-md"
          >
            <Airplay className="w-3.5 h-3.5 text-cyan-400" />
            <span>Apple / VLC Player & Subtitles</span>
          </button>

          {/* Jump to 4K Downloads Button */}
          <button
            onClick={scrollToDownloads}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>⚡ 4K Downloads & Torrents</span>
          </button>

          <button
            onClick={scrollToServers}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full glass-pill text-white text-xs font-semibold hover:bg-white/20 transition-all"
          >
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Servers ({SERVERS.length})</span>
          </button>

          <button
            onClick={() => setShowJioTips(!showJioTips)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Jio Unblock Active</span>
          </button>
        </div>
      </div>

      {/* Jio ISP Helper Banner */}
      {showJioTips && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4">
          <div className="p-4 rounded-2xl glass-sheet border border-emerald-500/30 text-xs text-white/80 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Universal Internet Optimization (Reliance Jio, Airtel, Vi)</span>
            </div>
            <p className="text-white/60 leading-relaxed">
              Servers 1, 2, 3, 4, 5, and 6 are configured with alternative routing that bypasses Indian ISP DNS restrictions. If any server buffers, switch to <strong>Server 1 (VidLink)</strong> or <strong>Server 2 (VidSrc CC)</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Contained Cinema Video Player */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="relative aspect-video max-h-[72vh] w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl">
          {isNativeMode ? (
            // Cinejoy-style Native HLS Player — no iframes, no ads
            nativeLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                  <Zap className="w-6 h-6 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">Finding best stream...</p>
                  <p className="text-xs text-white/50 mt-1">Scanning direct sources for ad-free playback</p>
                </div>
              </div>
            ) : nativeError ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black">
                <Zap className="w-10 h-10 text-amber-400/50" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/80">Direct stream not available</p>
                  <p className="text-xs text-white/50 mt-1 max-w-xs">No direct source found for this title. Switching to iframe servers...</p>
                </div>
                <button
                  onClick={handleNativeError}
                  className="mt-2 px-5 py-2 rounded-full bg-amber-400 text-black text-xs font-bold hover:brightness-110 transition-all"
                >
                  Use VidLink Server Instead
                </button>
              </div>
            ) : nativeStream ? (
              <NativePlayer
                streamUrl={nativeStream.url}
                poster={posterUrl}
                title={`${title} — ${nativeStream.source}`}
                onError={handleNativeError}
              />
            ) : null
          ) : (
            // Traditional iframe embed servers
            <iframe
              key={activeServer}
              src={embedUrl}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="origin"
              className="w-full h-full border-0"
              title="Movie/TV Player"
            />
          )}
        </div>

        {/* Downward Jump Prompt to guide users down */}
        <div className="mt-4 flex items-center justify-between px-2 text-xs text-white/60 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{title}</span>
            <span>·</span>
            <span className="text-amber-400 font-medium">{SERVERS[activeServer].name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExternalModal(true)}
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors cursor-pointer"
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>Get Subtitles (.SRT / .VTT)</span>
            </button>

            <button
              onClick={scrollToDownloads}
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors group cursor-pointer"
            >
              <span>Scroll down for 4K Downloads</span>
              <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Streaming Server & Download Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* Server Selection */}
        <div
          id="servers-section"
          className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 backdrop-blur-2xl scroll-mt-24 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2 text-sm text-white/90 font-bold">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Streaming Servers ({SERVERS.length} Free High-Speed Providers)</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Jio / Airtel Resilient Streams</span>
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  activeServer === index
                    ? server.id === "native"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-amber-400 font-bold shadow-lg shadow-amber-400/25 scale-[1.02]"
                      : "bg-white text-black border-white font-bold shadow-lg shadow-white/15 scale-[1.02]"
                    : server.id === "native"
                    ? "bg-amber-400/10 text-amber-300 border-amber-400/30 hover:bg-amber-400/20 hover:text-amber-200"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {server.id === "native" && <Zap className="w-3.5 h-3.5" />}
                <span>{server.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    activeServer === index
                      ? server.id === "native"
                        ? "bg-black text-amber-400"
                        : "bg-black text-white"
                      : server.badge === "NATIVE"
                      ? "bg-amber-400/20 text-amber-300"
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
        <div id="downloads-section" className="scroll-mt-24">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Fast 4K Downloads & High-Speed Torrents
            </h3>
          </div>

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

      {/* External Player & Subtitles Modal */}
      {showExternalModal && (
        <ExternalPlayerModal
          title={title}
          streamUrl={embedUrl}
          imdbId={movie.external_ids?.imdb_id}
          tmdbId={numericId}
          type={type}
          season={season}
          episode={episode}
          onClose={() => setShowExternalModal(false)}
        />
      )}
    </div>
  );
}
