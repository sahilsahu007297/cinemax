import { useNavigate } from "react-router";
import { Sparkles } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  badge: string;
  color: string;
  textColor: string;
  providerId?: number;
}

const PLATFORMS: Platform[] = [
  {
    id: "apple",
    name: "Apple TV+",
    badge: "tv+",
    color: "from-zinc-800 to-zinc-900 border-white/20",
    textColor: "text-white",
    providerId: 350,
  },
  {
    id: "netflix",
    name: "Netflix",
    badge: "NETFLIX",
    color: "from-red-950/40 to-black border-red-500/30",
    textColor: "text-red-500 font-black tracking-widest",
    providerId: 8,
  },
  {
    id: "prime",
    name: "Prime Video",
    badge: "prime video",
    color: "from-sky-950/40 to-black border-sky-500/30",
    textColor: "text-sky-400 font-bold",
    providerId: 9,
  },
  {
    id: "hbo",
    name: "HBO Max",
    badge: "HBO max",
    color: "from-purple-950/40 to-black border-purple-500/30",
    textColor: "text-purple-300 font-extrabold",
    providerId: 384,
  },
  {
    id: "disney",
    name: "Disney+",
    badge: "Disney+",
    color: "from-blue-950/40 to-black border-blue-500/30",
    textColor: "text-blue-300 font-bold",
    providerId: 337,
  },
];

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
    <div className="w-full px-4 sm:px-6 lg:px-12 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Playlist & Networks</span>
        </div>
        <button
          onClick={() => navigate("/providers")}
          className="text-xs text-white/40 hover:text-white transition-colors"
        >
          View all
        </button>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none]">
        {PLATFORMS.map((platform) => {
          const isSelected = selected === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => handleSelect(platform)}
              className={`h-11 px-5 rounded-2xl flex items-center justify-center border text-xs sm:text-sm whitespace-nowrap transition-all duration-300 transform active:scale-95 bg-gradient-to-r ${
                platform.color
              } ${
                isSelected
                  ? "ring-2 ring-white scale-105 shadow-lg shadow-white/10"
                  : "hover:scale-[1.02] hover:border-white/40"
              }`}
            >
              <span className={platform.textColor}>{platform.badge}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
