import { useNavigate } from "react-router";
import { Sparkles, ChevronRight } from "lucide-react";

export interface Platform {
  id: string;
  name: string;
  providerId: number;
  bgGradient: string;
  borderColor: string;
}

export const ALL_PLATFORMS: Platform[] = [
  {
    id: "apple",
    name: "Apple TV+",
    providerId: 350,
    bgGradient: "from-zinc-800/90 to-zinc-950",
    borderColor: "border-white/25",
  },
  {
    id: "netflix",
    name: "Netflix",
    providerId: 8,
    bgGradient: "from-red-950/60 to-black",
    borderColor: "border-red-500/40",
  },
  {
    id: "prime",
    name: "Prime Video",
    providerId: 9,
    bgGradient: "from-sky-950/60 to-black",
    borderColor: "border-sky-500/40",
  },
  {
    id: "hbo",
    name: "Max / HBO",
    providerId: 384,
    bgGradient: "from-purple-950/60 to-black",
    borderColor: "border-purple-500/40",
  },
  {
    id: "disney",
    name: "Disney+",
    providerId: 337,
    bgGradient: "from-blue-950/60 to-black",
    borderColor: "border-blue-500/40",
  },
  {
    id: "paramount",
    name: "Paramount+",
    providerId: 531,
    bgGradient: "from-blue-900/40 to-black",
    borderColor: "border-blue-400/30",
  },
  {
    id: "hulu",
    name: "Hulu",
    providerId: 15,
    bgGradient: "from-emerald-950/60 to-black",
    borderColor: "border-emerald-500/40",
  },
  {
    id: "peacock",
    name: "Peacock",
    providerId: 386,
    bgGradient: "from-teal-950/50 to-black",
    borderColor: "border-teal-500/30",
  },
  {
    id: "jiocinema",
    name: "JioCinema",
    providerId: 220,
    bgGradient: "from-pink-950/60 to-black",
    borderColor: "border-pink-500/40",
  },
  {
    id: "hotstar",
    name: "Hotstar",
    providerId: 122,
    bgGradient: "from-blue-950/80 to-black",
    borderColor: "border-amber-400/40",
  },
  {
    id: "sonyliv",
    name: "Sony LIV",
    providerId: 237,
    bgGradient: "from-amber-950/50 to-black",
    borderColor: "border-amber-500/30",
  },
  {
    id: "zee5",
    name: "Zee5",
    providerId: 232,
    bgGradient: "from-fuchsia-950/50 to-black",
    borderColor: "border-fuchsia-500/30",
  },
];

// Vector SVG Logos for each platform (crisp, never broken unicode!)
export function PlatformLogo({ id }: { id: string }) {
  switch (id) {
    case "apple":
      return (
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.72-7.89-12.09-14.43-6.53-9.79-11.64-20.73-15.34-32.82-3.7-12.09-5.55-23.46-5.55-34.12 0-14.34 3.7-26.23 11.09-35.65 7.39-9.43 16.64-14.24 27.75-14.43 4.8 0 10.13 1.25 15.98 3.75 5.86 2.5 9.74 3.79 11.66 3.86 1.48 0 5.49-1.37 12.03-4.11 6.54-2.74 12.09-3.95 16.64-3.64 12.44.65 22.39 5.09 29.86 13.33-10.99 6.64-16.37 15.79-16.14 27.46.24 9.14 3.83 16.89 10.77 23.25 6.94 6.36 15.08 9.94 24.42 10.73-2.18 6.74-4.8 13.41-7.87 20.02zm-35.39-106.84c0-6.75 2.45-13.14 7.36-19.17 4.9-6.03 11.08-9.87 18.52-11.53.54 1.74.82 3.53.82 5.37 0 6.63-2.61 13.2-7.84 19.7-5.23 6.51-11.64 10.36-19.23 11.55-.33-1.85-.5-3.52-.5-5.92z" />
          </svg>
          <span className="text-xs sm:text-sm font-semibold">tv+</span>
        </div>
      );

    case "netflix":
      return (
        <div className="flex items-center gap-1">
          <span className="font-black text-xs sm:text-sm tracking-widest text-[#E50914] drop-shadow-[0_0_8px_rgba(229,9,20,0.4)]">
            NETFLIX
          </span>
        </div>
      );

    case "prime":
      return (
        <div className="flex items-center gap-1 text-[#00A8E1] font-bold text-xs sm:text-sm">
          <span>prime video</span>
          <svg className="w-3.5 h-3 fill-[#00A8E1]" viewBox="0 0 24 24">
            <path d="M21 16.5c-4.5 3-10.5 4.5-16 1.5-1-.5-2-1.5-2.5-1 0 0 .5 1.5 2 2.5 5 3 11.5 2.5 16.5-1.5.5-.5.5-1.5 0-1.5z" />
          </svg>
        </div>
      );

    case "hbo":
      return (
        <div className="flex items-center gap-1 font-extrabold text-xs sm:text-sm tracking-wider text-purple-300">
          <span className="text-white">MAX</span>
          <span className="text-[10px] text-purple-400 font-bold">HBO</span>
        </div>
      );

    case "disney":
      return (
        <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-blue-300">
          <span className="font-serif italic font-black text-white">Disney</span>
          <span className="text-blue-400 text-base leading-none font-black">+</span>
        </div>
      );

    case "paramount":
      return (
        <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-blue-400">
          <span>Paramount</span>
          <span className="text-white text-base font-black">+</span>
        </div>
      );

    case "hulu":
      return (
        <span className="font-black text-xs sm:text-sm tracking-tight text-[#1CE783] drop-shadow-[0_0_8px_rgba(28,231,131,0.4)]">
          hulu
        </span>
      );

    case "peacock":
      return (
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white">
          <div className="flex -space-x-1">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="w-2 h-2 rounded-full bg-purple-400" />
          </div>
          <span>peacock</span>
        </div>
      );

    case "jiocinema":
      return (
        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-pink-400">
          <span className="w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] font-black">
            J
          </span>
          <span className="text-white font-extrabold">JioCinema</span>
        </div>
      );

    case "hotstar":
      return (
        <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-amber-400">
          <span className="text-white font-black">hotstar</span>
          <span className="text-amber-400">★</span>
        </div>
      );

    case "sonyliv":
      return (
        <div className="flex items-center gap-1 font-extrabold text-xs sm:text-sm">
          <span className="text-white">SONY</span>
          <span className="text-amber-400 font-bold">LIV</span>
        </div>
      );

    case "zee5":
      return (
        <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-fuchsia-400">
          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center text-[9px] font-black">
            Z
          </span>
          <span className="text-white font-extrabold">ZEE5</span>
        </div>
      );

    default:
      return <span className="text-xs font-bold text-white">{id}</span>;
  }
}

interface PlatformBarProps {
  selected?: string;
  onSelect?: (id: string) => void;
}

export function PlatformBar({ selected, onSelect }: PlatformBarProps) {
  const navigate = useNavigate();

  const handleSelect = (platform: Platform) => {
    if (onSelect) {
      onSelect(platform.id);
    } else {
      navigate(`/providers`);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-3 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Playlist & Networks ({ALL_PLATFORMS.length} Platforms)</span>
        </div>
        <button
          onClick={() => navigate("/providers")}
          className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1 font-medium"
        >
          <span>All Providers</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 [scrollbar-width:none] touch-pan-x">
        {ALL_PLATFORMS.map((platform) => {
          const isSelected = selected === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => handleSelect(platform)}
              title={`Browse ${platform.name} Titles`}
              className={`h-11 px-5 rounded-2xl flex items-center justify-center border text-xs sm:text-sm whitespace-nowrap transition-all duration-300 transform active:scale-95 bg-gradient-to-r shrink-0 shadow-md ${
                platform.bgGradient
              } ${platform.borderColor} ${
                isSelected
                  ? "ring-2 ring-white scale-105 shadow-xl shadow-white/20"
                  : "hover:scale-[1.03] hover:border-white/50 hover:brightness-110"
              }`}
            >
              <PlatformLogo id={platform.id} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
