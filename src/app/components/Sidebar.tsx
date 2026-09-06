import { NavLink } from "react-router";
import { Home, LayoutGrid, Tv, Clock, Heart, User, Settings, Sparkles } from "lucide-react";
import cinemaxLogo from "../../Cinemax Logo 1.png";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/browse", icon: LayoutGrid, label: "Browse" },
  { to: "/series", icon: Tv, label: "Series" },
  { to: "/hindi", icon: Sparkles, label: "Hindi Cinema" },
  { to: "/watch-later", icon: Clock, label: "Watch Later" },
  { to: "/watchlist", icon: Heart, label: "Watchlist" },
];

const bottom = [
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col items-center justify-between py-6 w-[68px] shrink-0 glass-sidebar z-20">
      {/* Logo */}
      <div className="mb-6">
        <NavLink
          to="/"
          className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-lg shadow-black/40 hover:bg-white/[0.12] transition-colors p-1"
          title="Cinemax"
        >
          <img
            src={cinemaxLogo}
            alt="Cinemax"
            className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
          />
        </NavLink>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            title={label}
            className={({ isActive }) =>
              `group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.10] text-white shadow-lg shadow-black/30"
                  : "text-white/35 hover:text-white/80 hover:bg-white/[0.04]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -left-[14px] top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-white" />
                )}
                <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <nav className="flex flex-col gap-1.5">
        {bottom.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.10] text-white"
                  : "text-white/35 hover:text-white/80 hover:bg-white/[0.04]"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
