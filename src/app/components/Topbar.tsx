import { Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "./auth";
import cinemaxLogo from "../../Cinemax Logo 1.png";

export function Topbar() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { user } = useAuth();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="fixed top-3.5 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] sm:w-max max-w-[95vw]">
      <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 rounded-full border border-white/20 bg-black/50 px-3 sm:px-6 py-2 sm:py-2.5 backdrop-blur-xl shadow-2xl w-full sm:w-auto">
        <NavLink
          to="/"
          className="flex items-center gap-2 select-none group shrink-0"
          title="Cinemax Home"
        >
          <img
            src={cinemaxLogo}
            alt="Cinemax"
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-black tracking-[0.2em] text-white text-xs hidden sm:inline">
            CINEMAX
          </span>
        </NavLink>

        <nav className="hidden sm:flex items-center gap-1">
          {[
            { to: "/", label: "Home" },
            { to: "/browse", label: "Movies" },
            { to: "/series", label: "Series" },
            { to: "/hindi", label: "Hindi" },
            { to: "/providers", label: "Providers" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? "bg-white text-black" : "text-white/70 hover:text-white"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <form
          onSubmit={submit}
          className="flex flex-1 sm:flex-initial w-auto sm:w-40 max-w-[170px] items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 h-8 rounded-full bg-white/10"
        >
          <Search className="w-3.5 h-3.5 text-white/50 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent outline-none text-xs text-white placeholder:text-white/50 min-w-0"
          />
        </form>

        <NavLink to={user ? "/profile" : "/signin"} className="w-7 h-7 shrink-0 overflow-hidden rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
          {user?.picture ? <img src={user.picture} alt="" className="h-full w-full object-cover" /> : user?.name?.charAt(0).toUpperCase() || "S"}
        </NavLink>
      </div>
    </header>
  );
}
