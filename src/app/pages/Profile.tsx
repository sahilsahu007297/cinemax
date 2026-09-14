import { Link } from "react-router";
import { LogOut, Play, Heart, Clock, ShieldCheck, Database, Film } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { useAuth } from "../components/auth";

export default function Profile() {
  const { user, continueWatching, favorites, isSupabaseActive, signOut } = useAuth();

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 pt-28 pb-24 text-center max-w-md mx-auto animate-fade-in">
        <div className="w-16 h-16 rounded-3xl glass-circle mx-auto mb-4 flex items-center justify-center">
          <Film className="w-8 h-8 text-white/40" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Sign in to your account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-white/50 leading-relaxed">
          Access your personalized favorites list, continue watching across devices, and manage your
          preferences.
        </p>
        <Link
          to="/signin"
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-xs sm:text-sm font-semibold text-black hover:bg-white/85 transition-all shadow-lg"
        >
          <Play className="h-4 w-4 fill-black" />
          <span>Sign In / Create Account</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 lg:px-12 pt-20 sm:pt-24 animate-fade-in pb-24 max-w-7xl mx-auto">
      {/* Profile Banner */}
      <div className="relative overflow-hidden rounded-[32px] glass-sheet p-6 sm:p-9 border border-white/15 shadow-2xl">
        <div className="flex flex-wrap items-center gap-5">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-2xl sm:text-3xl font-black text-white ring-4 ring-white/10 shrink-0 shadow-xl">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
                {user.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isSupabaseActive
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-white/10 border-white/15 text-white/70"
                }`}
              >
                {isSupabaseActive ? "Supabase Sync" : "Account Active"}
              </span>
            </div>
            <div className="text-white/40 text-xs sm:text-sm mt-0.5 truncate">{user.email}</div>
          </div>

          <button
            onClick={signOut}
            className="w-full sm:w-auto sm:ml-auto h-11 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all flex items-center justify-center text-xs font-semibold"
          >
            <LogOut className="mr-2 inline h-4 w-4" /> Sign out
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {[
            { label: "Favorites Saved", val: String(favorites.length), icon: Heart },
            { label: "In Progress", val: String(continueWatching.length), icon: Clock },
            {
              label: "Database",
              val: isSupabaseActive ? "Supabase" : "Isolated",
              icon: Database,
            },
            { label: "Privacy Status", val: "Private", icon: ShieldCheck },
          ].map(({ label, val, icon: Icon }) => (
            <div key={label} className="p-4 rounded-2xl glass-card border border-white/10">
              <div className="flex items-center gap-1.5 text-white/40 text-xs">
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
              <div className="text-white mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Watching List */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Continue Watching
            </h2>
          </div>
          <Link to="/watchlist?tab=recent" className="text-xs text-white/40 hover:text-white">
            View all
          </Link>
        </div>

        {continueWatching.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {continueWatching.slice(0, 5).map((m) => (
              <MovieCard key={`${m.media_type}-${m.id}`} movie={m} size="fluid" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl glass-card p-6 text-center text-xs text-white/40">
            No active continue watching items for this account.
          </div>
        )}
      </div>

      {/* Favorites List */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Your Saved Favorites
            </h2>
          </div>
          <Link to="/watchlist?tab=favorites" className="text-xs text-white/40 hover:text-white">
            View all
          </Link>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {favorites.slice(0, 5).map((m) => (
              <MovieCard key={`${m.media_type}-${m.id}`} movie={m} size="fluid" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl glass-card p-6 text-center text-xs text-white/40">
            No favorites added yet. Click the heart icon on any title to save it.
          </div>
        )}
      </div>
    </div>
  );
}
