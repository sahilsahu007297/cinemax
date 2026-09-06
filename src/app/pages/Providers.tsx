import { useEffect, useState } from "react";
import { Film, Tv } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import {
  discoverByProvider,
  getWatchProviders,
  img,
  type TMDBMovie,
  type TMDBProvider,
} from "../components/tmdb";

export default function Providers() {
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [providers, setProviders] = useState<TMDBProvider[]>([]);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [items, setItems] = useState<TMDBMovie[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoadingProviders(true);
    setProviderId(null);
    getWatchProviders(type)
      .then((data) => {
        if (cancelled) return;
        const available = data.results
          .filter((provider) => provider.logo_path)
          .sort((a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999));
        setProviders(available);
        setProviderId(available[0]?.provider_id ?? null);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingProviders(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (!providerId) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoadingItems(true);
    discoverByProvider(type, providerId, page)
      .then((data) => {
        if (!cancelled) setItems(data.results.filter((item) => item.poster_path));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, providerId, page]);

  const activeProvider = providers.find((provider) => provider.provider_id === providerId);

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-20 sm:pt-16 animate-fade-in pb-20">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-white" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)", fontWeight: 700, letterSpacing: "-0.03em" }}>
            Browse by provider
          </h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">
            Availability is based on TMDB streaming data for the United States.
          </p>
        </div>
        <div className="flex gap-2">
          {(["movie", "tv"] as const).map((value) => (
            <button
              key={value}
              onClick={() => { setType(value); setPage(1); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors ${type === value ? "bg-white text-black" : "glass-button text-white/60 hover:text-white"}`}
            >
              {value === "movie" ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
              {value === "movie" ? "Movies" : "Series"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] touch-pan-x -mx-1 px-1 [&::-webkit-scrollbar]:hidden">
        {loadingProviders ? (
          Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-20 w-28 shrink-0 skeleton rounded-xl" />)
        ) : providers.map((provider) => (
          <button
            key={provider.provider_id}
            onClick={() => { setProviderId(provider.provider_id); setPage(1); }}
            title={provider.provider_name}
            className={`flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border transition-colors ${providerId === provider.provider_id ? "border-white bg-white text-black font-semibold" : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/30 hover:text-white"}`}
          >
            <img src={img(provider.logo_path, "w92")} alt="" className="h-9 w-9 rounded-lg" />
            <span className="max-w-[6.5rem] truncate px-1 text-[10px]">{provider.provider_name}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-white">{activeProvider?.provider_name ?? "Select a provider"}</h2>
        {activeProvider && <span className="text-xs text-white/40">{loadingItems ? "Loading..." : `${items.length} titles`}</span>}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {loadingItems ? (
          Array.from({ length: 15 }).map((_, index) => <div key={index} className="aspect-[2/3] w-full skeleton rounded-2xl" />)
        ) : (
          items.map((movie) => <MovieCard key={movie.id} movie={movie} size="fluid" />)
        )}
      </div>

      {!loadingItems && activeProvider && (
        <div className="mt-10 flex justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-5 py-2 rounded-full glass-button text-sm text-white/70 disabled:opacity-30">Previous</button>
          <span className="px-4 py-2 text-sm text-white/50">Page {page}</span>
          <button onClick={() => setPage((current) => current + 1)} className="px-5 py-2 rounded-full glass-button text-sm text-white/70">Next</button>
        </div>
      )}
    </div>
  );
}
