import { useRef, useEffect, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
  Loader2,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface NativePlayerProps {
  streamUrl: string;
  poster?: string;
  title?: string;
  onError?: () => void;
}

export function NativePlayer({ streamUrl, poster, title, onError }: NativePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const [quality, setQuality] = useState<string>("Auto");
  const [availableQualities, setAvailableQualities] = useState<{ label: string; index: number }[]>([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Initialize HLS or native playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setError(null);
    setIsLoading(true);
    setIsPlaying(false);

    // Destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = /\.m3u8(\?|$)/i.test(streamUrl);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1, // auto quality
        capLevelToPlayerSize: true,
        progressive: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);
        // Build quality list
        const qualities = data.levels.map((level, idx) => ({
          label: level.height ? `${level.height}p` : `Level ${idx}`,
          index: idx,
        }));
        qualities.unshift({ label: "Auto", index: -1 });
        setAvailableQualities(qualities);
        setQuality("Auto");
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError("Stream failed to load. Try another server.");
              onError?.();
              break;
          }
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level];
        if (level) {
          setQuality(level.height ? `${level.height}p` : `Level ${data.level}`);
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (isHls && video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
      setAvailableQualities([{ label: "Auto", index: -1 }]);
    } else if (!isHls) {
      // Direct MP4/WebM
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
      setAvailableQualities([{ label: "Native", index: -1 }]);
    } else {
      setError("Your browser does not support this stream format.");
      setIsLoading(false);
    }
  }, [streamUrl]);

  // Track video state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onError = () => {
      setError("Playback error. Try another server.");
      setIsLoading(false);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("error", onError);
    };
  }, [streamUrl]);

  // Fullscreen tracking
  useEffect(() => {
    const handleFS = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFS);
    return () => document.removeEventListener("fullscreenchange", handleFS);
  }, []);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          setVolume(video.volume);
          break;
        case "ArrowDown":
          e.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          setVolume(video.volume);
          break;
      }
      resetControlsTimer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [resetControlsTimer]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play() : video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * duration;
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const v = Number(e.target.value);
    video.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const setQualityLevel = (index: number) => {
    const hls = hlsRef.current;
    if (hls) {
      hls.currentLevel = index; // -1 = auto
      setQuality(index === -1 ? "Auto" : availableQualities.find(q => q.index === index)?.label || "");
    }
    setShowQualityMenu(false);
  };

  const formatTime = (t: number) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/90 text-white">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <p className="text-sm text-white/70 text-center max-w-xs">{error}</p>
        <button
          onClick={onError}
          className="px-4 py-2 rounded-full bg-amber-400 text-black text-xs font-bold hover:brightness-110 transition-all"
        >
          Try Another Server
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={(e) => {
        // Don't toggle play if clicking controls
        if ((e.target as HTMLElement).closest(".player-controls")) return;
        togglePlay();
        resetControlsTimer();
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        preload="auto"
        className="w-full h-full object-contain"
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <span className="text-xs text-white/60">Loading stream...</span>
          </div>
        </div>
      )}

      {/* Big Center Play Button (when paused) */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
            <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`player-controls absolute inset-0 flex flex-col justify-end transition-opacity duration-300 z-20 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient + title */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        {title && (
          <div className="absolute top-3 left-4 right-4 flex items-center gap-2 pointer-events-none">
            <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-white truncate">{title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold flex-shrink-0">
              {quality}
            </span>
          </div>
        )}

        {/* Bottom controls */}
        <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-3 px-3 sm:px-5">
          {/* Progress Bar */}
          <div
            className="relative w-full h-1.5 bg-white/15 rounded-full cursor-pointer group/bar mb-3 hover:h-2.5 transition-all"
            onClick={seek}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-white/25 rounded-full"
              style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-amber-400 rounded-full transition-[width] duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="p-1.5 text-white hover:text-amber-400 transition-colors">
                {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
              </button>

              {/* Skip -10s / +10s */}
              <button
                onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.max(0, v.currentTime - 10); }}
                className="p-1.5 text-white/60 hover:text-white transition-colors hidden sm:block"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => { const v = videoRef.current; if (v) v.currentTime = Math.min(v.duration, v.currentTime + 10); }}
                className="p-1.5 text-white/60 hover:text-white transition-colors hidden sm:block"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5 group/vol">
                <button onClick={toggleMute} className="p-1.5 text-white/80 hover:text-white transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={changeVolume}
                  className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-amber-400 h-1 cursor-pointer opacity-0 group-hover/vol:opacity-100"
                />
              </div>

              {/* Time */}
              <span className="text-[11px] sm:text-xs text-white/60 font-mono tabular-nums ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Quality Selector */}
              {availableQualities.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{quality}</span>
                  </button>
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-xl border border-white/15 rounded-xl overflow-hidden shadow-2xl min-w-[120px]">
                      {availableQualities.map((q) => (
                        <button
                          key={q.index}
                          onClick={() => setQualityLevel(q.index)}
                          className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                            quality === q.label
                              ? "text-amber-400 bg-amber-400/10 font-semibold"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="p-1.5 text-white/80 hover:text-white transition-colors">
                {isFullscreen ? <Minimize className="w-4.5 h-4.5" /> : <Maximize className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
