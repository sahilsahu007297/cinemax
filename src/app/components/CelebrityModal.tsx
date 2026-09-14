import { useState, useEffect } from "react";
import { Link } from "react-router";
import { X, Star, Film, Calendar, MapPin, Award, Play } from "lucide-react";
import { getPersonDetail, img, getTitle, getYear, type TMDBPerson } from "./tmdb";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface CelebrityModalProps {
  personId: number | null;
  onClose: () => void;
}

export function CelebrityModal({ personId, onClose }: CelebrityModalProps) {
  const [person, setPerson] = useState<TMDBPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "acting" | "directing">("all");

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    setLoading(true);

    getPersonDetail(personId)
      .then((data) => {
        if (!cancelled) setPerson(data);
      })
      .catch(() => {
        if (!cancelled) setPerson(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [personId]);

  if (!personId) return null;

  const credits = person?.combined_credits?.cast || [];
  const crewCredits = person?.combined_credits?.crew || [];

  const filteredCredits =
    filter === "acting"
      ? credits
      : filter === "directing"
      ? crewCredits.filter((c) => c.job === "Director" || c.department === "Directing")
      : [...credits, ...crewCredits].filter(
          (item, index, self) => index === self.findIndex((t) => t.id === item.id)
        );

  // Sort credits by vote count / popularity
  const sortedCredits = filteredCredits
    .filter((c) => c.poster_path)
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 24);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-[32px] glass-sheet overflow-hidden flex flex-col border border-white/20 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3 min-h-[350px]">
            <div className="w-9 h-9 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-white/50">Loading celebrity biography...</span>
          </div>
        ) : person ? (
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6 [scrollbar-width:thin]">
            {/* Header: Profile photo & info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 shadow-2xl bg-white/5">
                <ImageWithFallback
                  src={img(person.profile_path, "w300")}
                  alt={person.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black uppercase tracking-wider">
                    {person.known_for_department || "Actor"}
                  </span>
                  {person.popularity && (
                    <span className="text-[11px] text-white/50">
                      ★ {Math.round(person.popularity)} Popularity Index
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {person.name}
                </h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-white/60">
                  {person.birthday && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <span>Born {new Date(person.birthday).getFullYear()}</span>
                    </span>
                  )}
                  {person.place_of_birth && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-white/40" />
                      <span className="truncate max-w-[200px]">{person.place_of_birth}</span>
                    </span>
                  )}
                </div>

                {person.biography && (
                  <p className="text-xs text-white/70 leading-relaxed line-clamp-4 pt-1">
                    {person.biography}
                  </p>
                )}
              </div>
            </div>

            {/* Filmography Section */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Known Filmography</span>
                </h3>

                <div className="flex p-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs">
                  {(["all", "acting", "directing"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilter(mode)}
                      className={`px-3 py-1 rounded-lg capitalize font-medium transition-all ${
                        filter === mode ? "bg-white text-black font-semibold" : "text-white/60 hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {sortedCredits.map((item) => {
                  const title = getTitle(item);
                  const year = getYear(item);
                  const mediaType = item.title ? "movie" : "tv";

                  return (
                    <Link
                      key={`${item.id}-${item.title}`}
                      to={`/title/${mediaType}-${item.id}`}
                      onClick={onClose}
                      className="group p-2.5 rounded-2xl glass-card border border-white/[0.08] hover:border-white/25 transition-all text-left block"
                    >
                      <div className="aspect-[2/3] w-full rounded-xl overflow-hidden mb-2 relative bg-white/5">
                        <ImageWithFallback
                          src={img(item.poster_path, "w300")}
                          alt={title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-0.5 font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{item.vote_average ? item.vote_average.toFixed(1) : "—"}</span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-white truncate">{title}</div>
                      <div className="text-[10px] text-white/45 truncate">
                        {year ? `${year} · ` : ""}
                        {(item as any).character || (item as any).job || "Featured"}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-white/50 text-xs">
            Celebrity information could not be retrieved.
          </div>
        )}
      </div>
    </div>
  );
}
