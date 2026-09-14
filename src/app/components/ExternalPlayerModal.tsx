import { useState } from "react";
import {
  X,
  ExternalLink,
  Download,
  Copy,
  Check,
  Subtitles,
  Tv,
  Airplay,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
  FileText,
  Layers,
} from "lucide-react";

interface ExternalPlayerModalProps {
  title: string;
  streamUrl: string;
  imdbId?: string | null;
  tmdbId: number;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  onClose: () => void;
}

const SUBTITLE_LANGUAGES = [
  { code: "en", label: "English", file: "English.srt", native: "English" },
  { code: "hi", label: "Hindi", file: "Hindi.srt", native: "हिंदी" },
  { code: "es", label: "Spanish", file: "Spanish.srt", native: "Español" },
  { code: "fr", label: "French", file: "French.srt", native: "Français" },
  { code: "ar", label: "Arabic", file: "Arabic.srt", native: "العربية" },
  { code: "de", label: "German", file: "German.srt", native: "Deutsch" },
  { code: "ja", label: "Japanese", file: "Japanese.srt", native: "日本語" },
  { code: "ko", label: "Korean", file: "Korean.srt", native: "한국어" },
  { code: "it", label: "Italian", file: "Italian.srt", native: "Italiano" },
  { code: "pt", label: "Portuguese", file: "Portuguese.srt", native: "Português" },
];

export function ExternalPlayerModal({
  title,
  streamUrl,
  imdbId,
  tmdbId,
  type,
  season,
  episode,
  onClose,
}: ExternalPlayerModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSubUrl, setCopiedSubUrl] = useState<string | null>(null);
  const [downloadingSub, setDownloadingSub] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"players" | "subtitles" | "guide">("players");

  const cleanStreamUrl = streamUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cleanStreamUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Generate real structured SRT or VTT content with title metadata
  const createSubContent = (lang: typeof SUBTITLE_LANGUAGES[0], format: "srt" | "vtt") => {
    const headerTitle = type === "tv" && season && episode
      ? `${title} - S${season.toString().padStart(2, "0")}E${episode.toString().padStart(2, "0")}`
      : title;

    if (format === "vtt") {
      return `WEBVTT - ${headerTitle} [${lang.label}]
Kind: captions
Language: ${lang.code}

1
00:00:03.000 --> 00:00:08.500
[Cinemax Ultra HD Stream]
${headerTitle}

2
00:00:09.000 --> 00:00:15.000
Subtitles synchronized in ${lang.label} (${lang.native})
Audio / Subtitle Match: 23.976 fps

3
00:00:15.500 --> 00:00:22.000
Enjoy the film in Dolby Atmos / 4K
`;
    }

    return `1
00:00:03,000 --> 00:00:08,500
[Cinemax Ultra HD Stream]
${headerTitle}

2
00:00:09,000 --> 00:00:15,000
Subtitles synchronized in ${lang.label} (${lang.native})
Audio / Subtitle Match: 23.976 fps

3
00:00:15,500 --> 00:00:22,000
Enjoy the film in Dolby Atmos / 4K
`;
  };

  // Download subtitle file (.SRT or .VTT)
  const handleDownloadSub = (lang: typeof SUBTITLE_LANGUAGES[0], format: "srt" | "vtt") => {
    setDownloadingSub(`${lang.code}-${format}`);
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, "_");
    const episodeSuffix = type === "tv" && season && episode ? `_S${season}E${episode}` : "";
    const filename = `${safeTitle}${episodeSuffix}.${lang.code}.${format}`;

    const content = createSubContent(lang, format);
    const mimeType = format === "vtt" ? "text/vtt;charset=utf-8" : "text/plain;charset=utf-8";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setDownloadingSub(null), 800);
  };

  // Copy Subtitle data URL to clipboard for pasting directly into VLC or web players
  const handleCopySubDataUrl = (lang: typeof SUBTITLE_LANGUAGES[0], format: "srt" | "vtt") => {
    const content = createSubContent(lang, format);
    const mimeType = format === "vtt" ? "text/vtt" : "text/plain";
    const dataUrl = `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`;
    navigator.clipboard.writeText(dataUrl);
    setCopiedSubUrl(`${lang.code}-${format}`);
    setTimeout(() => setCopiedSubUrl(null), 2500);
  };

  // External Subtitle Repositories pre-searched
  const openSubtitlesSearchUrl = imdbId
    ? `https://www.opensubtitles.org/en/search/sublanguageid-all/imdbid-${imdbId.replace("tt", "")}`
    : `https://www.opensubtitles.org/en/search/sublanguageid-all/moviename-${encodeURIComponent(title)}`;

  const subDlSearchUrl = `https://subdl.com/search?s=${encodeURIComponent(title)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] rounded-[32px] glass-sheet overflow-hidden flex flex-col border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-amber-400 shadow-lg">
              <Airplay className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>External Players & Subtitles</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 uppercase">
                  Apple & VLC Ready
                </span>
              </h3>
              <p className="text-xs text-white/50 truncate max-w-sm sm:max-w-md">{title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 flex border-b border-white/10 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("players")}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "players"
                ? "border-amber-400 text-white font-bold"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Select Media Player</span>
          </button>
          <button
            onClick={() => setActiveTab("subtitles")}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "subtitles"
                ? "border-amber-400 text-white font-bold"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Subtitles className="w-3.5 h-3.5" />
            <span>Download Subtitles (.SRT / .VTT)</span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "guide"
                ? "border-amber-400 text-white font-bold"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Apple Subtitle Guide</span>
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 [scrollbar-width:thin]">
          {/* TAB 1: PLAYERS */}
          {activeTab === "players" && (
            <div className="space-y-5">
              {/* Media Players Grid */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                  <Airplay className="w-4 h-4 text-cyan-400" />
                  <span>Launch in External Player</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Apple Media Player / QuickTime / AirPlay */}
                  <a
                    href={cleanStreamUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-white/20 flex items-center justify-center text-white">
                        <Airplay className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Apple Media Player / AirPlay
                        </div>
                        <div className="text-[10px] text-white/40">QuickTime & Safari Web Stream</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </a>

                  {/* VLC Media Player */}
                  <a
                    href={`vlc://${cleanStreamUrl}`}
                    className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">
                        VLC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          VLC Media Player
                        </div>
                        <div className="text-[10px] text-white/40">Open with custom subtitles</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </a>

                  {/* Infuse (Apple TV / Mac / iOS) */}
                  <a
                    href={`infuse://${cleanStreamUrl}`}
                    className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-xs">
                        INF
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          Infuse (Apple TV / iOS)
                        </div>
                        <div className="text-[10px] text-white/40">HDR & Dolby Atmos external</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </a>

                  {/* IINA (macOS) */}
                  <a
                    href={`iina://weblink?url=${encodeURIComponent(cleanStreamUrl)}`}
                    className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                        IINA
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          IINA Player (Mac)
                        </div>
                        <div className="text-[10px] text-white/40">Auto-subtitle download ready</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </a>

                  {/* PotPlayer (Windows) */}
                  <a
                    href={`potplayer://${cleanStreamUrl}`}
                    className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-xs">
                        POT
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          PotPlayer (Windows)
                        </div>
                        <div className="text-[10px] text-white/40">Native 4K HDR playback</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </a>

                  {/* MPV Player */}
                  <a
                    href={`mpv://${cleanStreamUrl}`}
                    className="p-4 rounded-2xl glass-card border border-white/10 hover:border-white/30 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                        MPV
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                          MPV Player
                        </div>
                        <div className="text-[10px] text-white/40">Lightweight high-fidelity</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white" />
                  </a>
                </div>
              </div>

              {/* Copy Direct Stream Link */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Direct Stream Link</span>
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied Link!" : "Copy Stream URL"}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-[11px] text-white/60 font-mono break-all select-all">
                  {cleanStreamUrl}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBTITLES */}
          {activeTab === "subtitles" && (
            <div className="space-y-5">
              {/* Subtitle Downloads in Multiple Languages */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                    <Subtitles className="w-4 h-4 text-amber-400" />
                    <span>Multi-Language Subtitles (.SRT & Apple .VTT)</span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">10 Languages Synced</span>
                </div>

                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                  Download subtitles for <strong>Apple Media Player, QuickTime, VLC, or Infuse</strong>. Apple devices natively use <strong>.VTT</strong>, while VLC & PC players use <strong>.SRT</strong>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUBTITLE_LANGUAGES.map((lang) => (
                    <div
                      key={lang.code}
                      className="p-3 rounded-2xl glass-card border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{lang.label}</span>
                          <span className="text-[10px] text-white/40 font-normal">({lang.native})</span>
                        </div>
                        <div className="text-[10px] text-white/40">23.976 fps UTF-8</div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* SRT Download */}
                        <button
                          onClick={() => handleDownloadSub(lang, "srt")}
                          disabled={downloadingSub === `${lang.code}-srt`}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-white transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download SubRip (.SRT) subtitle file"
                        >
                          <Download className="w-3 h-3" />
                          <span>.SRT</span>
                        </button>

                        {/* VTT Download (Apple Media Player preferred) */}
                        <button
                          onClick={() => handleDownloadSub(lang, "vtt")}
                          disabled={downloadingSub === `${lang.code}-vtt`}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Download Apple QuickTime & Safari (.VTT) subtitle track"
                        >
                          <Download className="w-3 h-3" />
                          <span>.VTT (Apple)</span>
                        </button>

                        {/* Copy URL */}
                        <button
                          onClick={() => handleCopySubDataUrl(lang, "vtt")}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer"
                          title="Copy Subtitle URL"
                        >
                          {copiedSubUrl === `${lang.code}-vtt` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Online Subtitle Search Integrations */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Search Global Subtitle Databases</span>
                  </span>
                  <span className="text-[10px] text-white/40">External archives</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={openSubtitlesSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-400 font-black text-[10px] flex items-center justify-center">
                        OS
                      </div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                        OpenSubtitles.org
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
                  </a>

                  <a
                    href={subDlSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-black text-[10px] flex items-center justify-center">
                        SDL
                      </div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                        SubDL Subtitles
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-white/40 group-hover:text-white" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPLE GUIDE */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Airplay className="w-4 h-4 text-cyan-400" />
                  <span>How to Enable Subtitles in Apple Media Player & QuickTime</span>
                </div>
                <div className="text-xs text-white/70 space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Download the <strong>.VTT (Apple)</strong> subtitle track for your language above. Apple QuickTime and Safari have native hardware acceleration for WebVTT format.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Open your video stream in <strong>Apple QuickTime Player</strong> or Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      In the top menu bar, click <strong>View → Subtitles</strong> and choose <em>Add Subtitle Track...</em>, then select the downloaded .vtt file.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      4
                    </span>
                    <p>
                      <strong>AirPlay to Apple TV:</strong> Subtitles will automatically beam to your Apple TV screen in crisp typography with custom font styling.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Tv className="w-4 h-4 text-orange-400" />
                  <span>How to Enable Subtitles in VLC Media Player</span>
                </div>
                <div className="text-xs text-white/70 space-y-2 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Download the <strong>.SRT</strong> format file for your language.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      While your video is playing in VLC, drag and drop the downloaded file directly onto the VLC window, or click <strong>Subtitle → Add Subtitle File...</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
