import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, style, className, ...rest } = props;
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);
  const [didError, setDidError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setHasTriedProxy(false);
    setDidError(false);
  }, [src]);

  const handleError = () => {
    // If TMDB image is blocked by ISP (like Jio/Airtel in India), seamlessly fallback to wsrv.nl proxy CDN
    if (!hasTriedProxy && currentSrc && currentSrc.includes('image.tmdb.org')) {
      setHasTriedProxy(true);
      // wsrv.nl provides a worldwide Cloudflare-backed proxy that is never blocked in India
      setCurrentSrc(`https://wsrv.nl/?url=${encodeURIComponent(currentSrc)}&output=webp`);
      return;
    }
    setDidError(true);
  };

  if (didError || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#12131a] text-center align-middle border border-white/[0.06] ${className ?? ''}`}
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
      src={currentSrc}
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
