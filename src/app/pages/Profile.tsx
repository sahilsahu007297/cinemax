import { Link } from "react-router";
import { LogOut, Play } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { useAuth } from "../components/auth";

export default function Profile() {
  const { user, continueWatching, signOut } = useAuth();

  if (!user) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 pt-24 sm:pt-20 text-center">
        <h1 className="text-2xl font-semibold text-white">Sign in to see your profile</h1>
        <Link to="/signin" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm text-black">
          <Play className="h-4 w-4" /> Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-20 sm:pt-16 animate-fade-in pb-24 sm:pb-20">
      <div className="relative overflow-hidden rounded-3xl glass-heavy p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center text-xl sm:text-2xl font-bold text-black ring-2 ring-white/10 shrink-0">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <h1
              className="text-white truncate"
              style={{
                fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              {user.name}
            </h1>
            <div className="text-white/40 text-xs sm:text-sm mt-0.5 truncate">
              {user.email}
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full sm:w-auto sm:ml-auto h-10 px-5 rounded-full bg-white text-black hover:bg-white/85 transition-all duration-300 flex items-center justify-center text-xs sm:text-sm font-semibold"
          >
            <LogOut className="mr-2 inline h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Continue watching", String(continueWatching.length)],
            ["Account", "Local"],
            ["Privacy", "Private"],
            ["Region", "US"],
          ].map(([label, val]) => (
            <div key={label} className="p-4 rounded-2xl glass-card">
              <div className="text-white/40 text-xs">{label}</div>
              <div
                className="text-white mt-1"
                style={{ fontSize: "1.5rem", fontWeight: 600 }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-white/90 mt-10" style={{ fontWeight: 600 }}>
        Continue Watching
      </h2>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {continueWatching.map((m) => (
          <MovieCard key={`${m.media_type}-${m.id}`} movie={m} />
        ))}
      </div>
      {continueWatching.length === 0 && <p className="mt-5 text-sm text-white/35">Start watching a title and it will appear here for this account only.</p>}
    </div>
  );
}
