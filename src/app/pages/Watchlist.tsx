import { MovieCard } from "../components/MovieCard";
import { Heart } from "lucide-react";
import { useHomeData } from "../components/useTMDB";

export default function Watchlist({ heading = "My Watchlist" }: { heading?: string }) {
  const { data, loading } = useHomeData();
  // Use top rated as a mock watchlist
  const list = data?.topRated?.slice(0, 6) || [];

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-20 sm:pt-16 animate-fade-in pb-20">
      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 text-white/80" />
        <h1
          className="text-white"
          style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.03em" }}
        >
          {heading}
        </h1>
      </div>
      <p className="text-white/40 text-xs sm:text-sm mt-1">
        {loading ? "Loading..." : `${list.length} saved titles`}
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full aspect-[2/3] skeleton rounded-2xl" />
            ))
          : list.map((m) => <MovieCard key={m.id} movie={m} size="fluid" />)}
      </div>
    </div>
  );
}
