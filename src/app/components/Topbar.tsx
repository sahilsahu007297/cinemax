import { Search, SlidersHorizontal, X } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "./auth";
import cinemaxLogo from "../../Cinemax Logo 1.png";

export function Topbar() {
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const nav = useNavigate();
  const { user } = useAuth();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <header className="fixed top-4 md:top-6 right-4 sm:right-6 lg:right-10 z-50 flex items-center gap-3">
      {/* Mobile Logo Only (Desktop has Sidebar) */}
      <NavLink
        to="/"
        className="md:hidden flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/15"
      >
        <img
          src={cinemaxLogo}
          alt="Cinemax"
          className="h-6 w-6 object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
        />
      </NavLink>

      {/* Frosted Capsule Search Bar matching Screenshot 1 */}
      <div className="relative">
        <form
          onSubmit={submit}
          className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-pill w-[240px] sm:w-[320px] md:w-[360px] shadow-2xl transition-all duration-300 focus-within:w-[280px] sm:focus-within:w-[380px] focus-within:border-white/35"
        >
          <Search className="w-4 h-4 text-white/50 shrink-0" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for Movie"
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-white placeholder:text-white/45 min-w-0"
          />

          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            title="Filter by Genre / Type"
            className={`shrink-0 p-1 rounded-full transition-colors ${
              showFilters ? "text-white bg-white/20" : "text-white/50 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Filter Flyout */}
        {showFilters && (
          <div className="absolute right-0 top-14 w-64 p-3 rounded-2xl glass-frost z-50 animate-fade-in flex flex-col gap-2">
            <div className="text-[11px] font-semibold text-white/50 uppercase tracking-wider px-1">
              Quick Filter
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Action", to: "/browse?genre=28" },
                { label: "Sci-Fi", to: "/browse?genre=878" },
                { label: "Thriller", to: "/browse?genre=53" },
                { label: "Comedy", to: "/browse?genre=35" },
                { label: "Hindi", to: "/hindi" },
                { label: "TV Series", to: "/series" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setShowFilters(false);
                    nav(item.to);
                  }}
                  className="px-2.5 py-1 rounded-full text-xs bg-white/[0.06] hover:bg-white/20 text-white/80 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User / Sign In Pill for Mobile/Quick Access */}
      <NavLink
        to={user ? "/profile" : "/signin"}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/15 text-xs text-white"
      >
        {user ? user.name.charAt(0).toUpperCase() : "Sign in"}
      </NavLink>
    </header>
  );
}
