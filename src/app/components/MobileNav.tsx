import { NavLink } from "react-router";
import { Home, Film, Tv, Sparkles, Bookmark } from "lucide-react";

export function MobileNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Home", end: true },
    { to: "/browse", icon: Film, label: "Movies" },
    { to: "/series", icon: Tv, label: "Series" },
    { to: "/hindi", icon: Sparkles, label: "Hindi", highlight: true },
    { to: "/watchlist", icon: Bookmark, label: "Watchlist" },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#08090c]/90 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ to, icon: Icon, label, end, highlight }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 min-w-[58px] ${
                isActive
                  ? highlight
                    ? "text-orange-400 font-semibold"
                    : "text-cyan-400 font-semibold"
                  : "text-white/45 hover:text-white/80"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`relative p-1 rounded-xl transition-all duration-200 ${
                    isActive
                      ? highlight
                        ? "bg-orange-500/15"
                        : "bg-cyan-500/15"
                      : "bg-transparent"
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.75} />
                  {highlight && !isActive && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">
                  {highlight ? "🇮🇳 " + label : label}
                </span>
                {isActive && (
                  <span
                    className={`absolute bottom-0.5 w-4 h-[2.5px] rounded-full shadow-sm ${
                      highlight
                        ? "bg-orange-400 shadow-orange-500/50"
                        : "bg-cyan-400 shadow-cyan-500/50"
                    }`}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
