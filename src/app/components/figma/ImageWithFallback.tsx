import React, { useState, useEffect } from "react";
import { Film } from "lucide-react";

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, style, className, ...rest } = props;
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [didError, setDidError] = useState(false);

  // Extract raw TMDB image path if possible
  const getRawTmdbUrl = (url?: string): string | null => {
    if (!url) return null;
    if (url.includes("image.tmdb.org")) {
      const match = url.match(/https?:\/\/image\.tmdb\.org\/[^\s&"']+/);
      if (match) return match[0];
      const encodedMatch = url.match(/url=([^&]+)/);
      if (encodedMatch) {
        try {
          return decodeURIComponent(encodedMatch[1]);
        } catch {
          // ignore
        }
      }
      return "https://image.tmdb.org" + url.substring(url.indexOf("/t/p/"));
    }
    return null;
  };

  const rawUrl = getRawTmdbUrl(src);

  // Define resilient multi-CDN mirrors across global and edge networks
  const candidateUrls = React.useMemo(() => {
    if (!src) return [];
    if (!rawUrl) return [src];

    const tmdbPathMatch = rawUrl.match(/\/t\/p\/([^/]+)(\/.+)$/);
    const size = tmdbPathMatch ? tmdbPathMatch[1] : "w500";
    const path = tmdbPathMatch ? tmdbPathMatch[2] : "";

    return [
      src, // Default passed (usually wsrv.nl)
      `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&output=webp`,
      `https://images.weserv.nl/?url=${encodeURIComponent(rawUrl)}&output=webp`,
      path ? `https://cdn.statically.io/img/image.tmdb.org/t/p/${size}${path}` : "",
      path ? `/api/img?path=${encodeURIComponent(path)}&size=${size}` : "",
      rawUrl, // Direct TMDB
    ].filter(Boolean) as string[];
  }, [src, rawUrl]);

  useEffect(() => {
    setAttemptIndex(0);
    setDidError(false);
  }, [src]);

  const handleError = () => {
    if (attemptIndex + 1 < candidateUrls.length) {
      setAttemptIndex((prev) => prev + 1);
    } else {
      setDidError(true);
    }
  };

  const activeSrc = candidateUrls[attemptIndex] || src;

  if (didError || !activeSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#12131a] text-center align-middle border border-white/[0.06] ${className ?? ""}`}
        style={style}
      >
        <Film className="w-8 h-8 text-white/20 mb-1" />
        <span className="text-[10px] text-white/30 truncate max-w-[90%] px-2">
          {alt || "Cinemax"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      crossOrigin="anonymous"
      {...rest}
      onError={handleError}
    />
  );
}
