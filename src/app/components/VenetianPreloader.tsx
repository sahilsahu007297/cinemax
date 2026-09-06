import { useState, useEffect } from "react";
import cinemaxLogo from "../../Cinemax Logo 1.png";

const SLAT_COUNT = 10;

export function VenetianPreloader() {
  const [progress, setProgress] = useState(0);
  const [isOpening, setIsOpening] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Smooth progress counter
    const start = Date.now();
    const duration = 1600; // 1.6 seconds to reach 100%

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        // Begin the Venetian blinds reveal transition
        setTimeout(() => {
          setIsOpening(true);
        }, 150);

        // Remove from DOM after transition completes
        setTimeout(() => {
          setIsDestroyed(true);
        }, 1200);
      }
    }, 25);

    return () => clearInterval(interval);
  }, []);

  if (isDestroyed) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] pointer-events-none transition-opacity duration-700 ${
        isOpening ? "opacity-0" : "opacity-100"
      }`}
      style={{ perspective: "1200px" }}
      aria-hidden="true"
    >
      {/* 10 Venetian Blinds Horizontal Slats */}
      <div className="absolute inset-0 flex flex-col pointer-events-auto">
        {Array.from({ length: SLAT_COUNT }).map((_, index) => {
          // Staggered delay from top to bottom (or center out)
          const delay = index * 45;
          return (
            <div
              key={index}
              className="relative flex-1 w-full bg-[#08090d] border-b border-white/[0.03] shadow-2xl"
              style={{
                transformOrigin: index % 2 === 0 ? "top center" : "bottom center",
                transform: isOpening
                  ? "rotateX(90deg) scaleY(0.1) translateY(-20px)"
                  : "rotateX(0deg) scaleY(1) translateY(0px)",
                opacity: isOpening ? 0 : 1,
                transition: `transform 0.75s cubic-bezier(0.65, 0, 0.35, 1) ${delay}ms, opacity 0.6s ease ${delay}ms`,
                backfaceVisibility: "hidden",
              }}
            >
              {/* Subtle metallic reflection line on each slat */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Central Minimalist Luxury Cinema Loader */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center p-6 z-20 pointer-events-none transition-all duration-500 ease-out ${
          isOpening ? "opacity-0 scale-95 -translate-y-4" : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        {/* Ambient Neon Glow Aura */}
        <div className="absolute w-72 h-72 rounded-full bg-cyan-500/15 blur-[90px] pointer-events-none animate-pulse" />

        {/* 3D Cinemax Logo */}
        <div className="relative mb-6">
          <img
            src={cinemaxLogo}
            alt="Cinemax"
            className="w-36 h-36 sm:w-44 sm:h-44 object-contain drop-shadow-[0_0_35px_rgba(56,189,248,0.35)] select-none transition-transform duration-700 hover:scale-105"
          />
        </div>

        {/* Minimalist Progress Line */}
        <div className="w-48 sm:w-56 h-[2px] bg-white/[0.08] rounded-full overflow-hidden relative shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-white rounded-full transition-all duration-75 ease-out shadow-[0_0_12px_rgba(56,189,248,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text & percentage */}
        <div className="mt-4 flex items-center justify-between w-48 sm:w-56 text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">
          <span className="text-cyan-400/90 font-medium">
            {progress < 100 ? "Cinemax 4K" : "Welcome"}
          </span>
          <span className="text-white/70 font-semibold">{progress}%</span>
        </div>

        <p className="mt-2 text-[9px] tracking-[0.3em] uppercase text-white/30">
          Movies Beyond Borders
        </p>
      </div>
    </div>
  );
}
