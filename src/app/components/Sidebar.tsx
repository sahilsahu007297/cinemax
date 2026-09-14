import { NavLink } from "react-router";
import {
  LayoutGrid,
  Home,
  Film,
  Tv,
  Trophy,
  Star,
  Layers,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { useAuth } from "./auth";

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col items-center justify-between py-6 px-3 w-[76px] shrink-0 glass-rail z-40 fixed left-0 top-0 bottom-0 h-screen">
      {/* Top Grid / App icon */}
      <div className="flex flex-col items-center gap-4">
        <NavLink
          to="/browse"
          className="w-11 h-11 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center transition-all duration-300 group hover:scale-105"
          title="App Grid & Categories"
        >
          <LayoutGrid className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
        </NavLink>

        <div className="w-6 h-[1px] bg-white/10 my-1" />

        {/* Primary Circular Navigation Rail */}
        <nav className="flex flex-col items-center gap-3">
          {/* Home */}
          <NavLink
            to="/"
            end
            title="Home"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Home
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>

          {/* Movies / Watch */}
          <NavLink
            to="/browse"
            title="Movies"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Film
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>

          {/* TV Series */}
          <NavLink
            to="/series"
            title="TV Series"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Tv
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>

          {/* Hindi Cinema */}
          <NavLink
            to="/hindi"
            title="Hindi Cinema Hub"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Sparkles
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>

          {/* Top Rated / Trophy */}
          <NavLink
            to="/browse?sort=top_rated"
            title="Top Rated & Awards"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Trophy
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>

          {/* Star / Favorites / Library */}
          <NavLink
            to="/watchlist"
            title="Library & Favorites"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Star
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>

          {/* Layers / Streaming Providers */}
          <NavLink
            to="/providers"
            title="Streaming Platforms"
            className={({ isActive }) =>
              `glass-circle group ${isActive ? "active" : "text-white/60 hover:text-white"}`
            }
          >
            {({ isActive }) => (
              <Layers
                className="w-5 h-5 transition-transform group-hover:scale-110"
                strokeWidth={isActive ? 2.2 : 1.75}
              />
            )}
          </NavLink>
        </nav>
      </div>

      {/* Bottom Profile / Account Avatar */}
      <div className="flex flex-col items-center gap-2">
        <NavLink
          to={user ? "/profile" : "/signin"}
          title={user ? `Signed in as ${user.name}` : "Sign In / Register"}
          className="relative group p-0.5 rounded-full"
        >
          {user ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 group-hover:border-white transition-colors bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.18] border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-all">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
        </NavLink>
      </div>
    </aside>
  );
}
