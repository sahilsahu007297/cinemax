import { useState } from "react";
import { Download, Copy, Check, ExternalLink, ShieldCheck, Sparkles, HardDrive, Wifi, Radio } from "lucide-react";
import { useMovieTorrents, type TorrentItem } from "./torrents";

interface DownloadManagerProps {
  title: string;
  year?: number;
  imdbId?: string | null;
  type?: "movie" | "tv";
  season?: number;
  episode?: number;
  onClose?: () => void;
  isModal?: boolean;
}

export function DownloadManager({
  title,
  year,
  imdbId,
  type = "movie",
  season,
  episode,
  onClose,
  isModal = false,
}: DownloadManagerProps) {
  const { torrents, loading } = useMovieTorrents(title, year, imdbId, type, season, episode);
  const [filter, setFilter] = useState<"all" | "4K" | "1080p" | "720p">("all");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filtered = torrents.filter((t) => {
    if (filter === "all") return true;
    return t.quality === filter;
  });

  const handleCopy = (hash: string, magnet: string) => {
    navigator.clipboard.writeText(magnet).then(() => {
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2500);
    });
  };

  const content = (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black">
              <Download className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-base font-semibold text-white">
              Fast 4K & Free Open-Source Torrents
            </h3>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Direct single-click magnet downloads and WebTorrent browser streaming for "{title}"
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Ads · Direct P2P / Web-Seeds</span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] touch-pan-x -mx-1 px-1">
        <span className="text-xs text-white/40 mr-1 shrink-0">Quality:</span>
        {(
          [
            { key: "all", label: "All Qualities" },
            { key: "4K", label: "⚡ 4K Ultra HD (2160p)" },
            { key: "1080p", label: "1080p Full HD" },
            { key: "720p", label: "720p HD" },
          ] as const
        ).map((q) => {
          const count =
            q.key === "all"
              ? torrents.length
              : torrents.filter((t) => t.quality === q.key).length;
          return (
            <button
              key={q.key}
              onClick={() => setFilter(q.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap shrink-0 transition-colors border ${
                filter === q.key
                  ? "bg-white text-black border-white font-medium shadow-md shadow-black/30"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{q.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filter === q.key ? "bg-black/15 text-black" : "bg-white/10 text-white/60"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="space-y-2 py-4">
          <div className="h-16 w-full skeleton rounded-2xl" />
          <div className="h-16 w-full skeleton rounded-2xl" />
          <div className="h-16 w-full skeleton rounded-2xl" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 [scrollbar-width:thin]">
          {filtered.map((item) => {
            const is4k = item.quality === "4K";
            const isCopied = copiedHash === item.infoHash;

            return (
              <div
                key={item.infoHash}
                className={`relative rounded-2xl border p-4 transition-all duration-200 ${
                  is4k
                    ? "border-amber-500/30 bg-gradient-to-r from-amber-500/[0.07] via-white/[0.02] to-transparent hover:border-amber-400/50"
                    : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide ${
                          is4k
                            ? "bg-amber-400 text-black shadow-sm"
                            : "bg-white/15 text-white border border-white/10"
                        }`}
                      >
                        {item.resolutionLabel}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-white/80 border border-white/5">
                        {item.audio}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-white/60 font-mono">
                        <HardDrive className="w-3 h-3 text-white/40" />
                        {item.size}
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <Wifi className="w-3 h-3" />
                        {item.seeders} seeds
                      </span>

                      {item.source && (
                        <span className="text-[10px] text-white/35">
                          · {item.source}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/90 font-medium truncate" title={item.name}>
                      {item.name}
                    </p>
                  </div>

                  {/* Actions: 1-Click Fast Download & Copy Magnet */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={item.magnet}
                      className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-md ${
                        is4k
                          ? "bg-amber-400 text-black hover:bg-amber-300 shadow-amber-500/20"
                          : "bg-white text-black hover:bg-white/90"
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>1-Click Download</span>
                    </a>

                    <button
                      onClick={() => handleCopy(item.infoHash, item.magnet)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-colors border ${
                        isCopied
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                          : "border-white/15 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"
                      }`}
                      title="Copy Magnet Link"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Magnet</span>
                        </>
                      )}
                    </button>

                    <a
                      href={item.webtorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                      title="Stream torrent in browser via WebTorrent without downloading"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Web Stream</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
          <p className="text-sm text-white/50">
            No {filter !== "all" ? filter : ""} torrent sources found currently.
          </p>
          <p className="mt-1 text-xs text-white/30">
            Try switching the quality filter to "All Qualities" or stream directly via the multi-server player above.
          </p>
        </div>
      )}

      {/* Helpful Tip */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-[11px] text-white/40 flex items-center justify-between gap-4">
        <span>
          💡 <strong>Tip:</strong> Clicking "1-Click Download" will launch your torrent client (qBittorrent, uTorrent, LibreTorrent, etc.) directly.
        </span>
        {onClose && isModal && (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-[#0f0f15] p-6 shadow-2xl overflow-hidden">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-xl">
      {content}
    </div>
  );
}
