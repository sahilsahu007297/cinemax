import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Play, Radio } from "lucide-react";
import { getArchiveCatalog, type ArchiveCatalogItem } from "./archive";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function ArchiveRow({ type = "movie" }: { type?: "movie" | "tv" }) {
  const [items, setItems] = useState<ArchiveCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getArchiveCatalog(type)
      .then((results) => {
        if (!cancelled) setItems(results);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="mt-10 px-6 lg:px-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white/95" style={{ fontWeight: 600 }}>
            Free to Stream
          </h2>
          <p className="mt-1 text-xs text-white/40">
            Public Internet Archive {type === "tv" ? "TV" : "movie"} sources
          </p>
        </div>
        <Radio className="h-4 w-4 text-white/70" />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-60 w-40 shrink-0 rounded-2xl skeleton" />
            ))
          : items.map((item) => (
              <Link
                key={item.identifier}
                to={`/watch/archive-${encodeURIComponent(item.identifier)}`}
                className="group relative h-60 w-40 shrink-0 overflow-hidden rounded-2xl glass-card"
              >
                <ImageWithFallback
                  src={item.posterUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-90" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-xl shadow-black/50">
                    <Play className="ml-0.5 h-4 w-4 fill-black" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="truncate text-sm text-white/95" style={{ fontWeight: 500 }}>
                    {item.title}
                  </div>
                  {item.year && <div className="mt-0.5 text-[11px] text-white/45">{item.year}</div>}
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
