import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Sparkles,
  Newspaper,
  Compass,
  Check,
  ChevronRight,
  Clock,
  Sliders,
} from "lucide-react";
import {
  CURATED_COLLECTIONS,
  ENTERTAINMENT_NEWS,
  AVAILABLE_INTERESTS,
  type CuratedCollection,
  type EntertainmentNewsItem,
} from "../lib/imdbData";
import { useAuth } from "./auth";

export function CuratedSection() {
  const navigate = useNavigate();
  const { user, interests, toggleInterest } = useAuth();
  const [showInterestsDrawer, setShowInterestsDrawer] = useState(false);
  const [selectedNews, setSelectedNews] = useState<EntertainmentNewsItem | null>(null);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-8 space-y-12 animate-fade-in">
      {/* 1. CURATED COLLECTIONS ROW (Screenshot / IMDb feature) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Curated Collections & Editorial Picks
            </h2>
          </div>
          <Link to="/browse" className="text-xs text-white/40 hover:text-white">
            Explore all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CURATED_COLLECTIONS.map((col) => (
            <button
              key={col.id}
              onClick={() => navigate(`/browse?collection=${col.id}`)}
              className="group p-5 rounded-3xl glass-sheet border border-white/10 hover:border-white/30 text-left transition-all duration-300 flex flex-col justify-between h-44 shadow-lg hover:shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{col.icon}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/90 border border-white/15">
                    {col.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-3 group-hover:text-amber-300 transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-semibold text-white/70 group-hover:text-white pt-2">
                <span>View Collection</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. PERSONALIZED "INTERESTS" CUSTOMIZATION BANNER */}
      <div className="relative overflow-hidden rounded-3xl glass-sheet p-6 sm:p-8 border border-white/15 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized For You</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Customize Your Entertainment Interests
            </h3>
            <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-xl">
              Select themes, genres, and styles to tailor recommendations across the home feed and alerts.
            </p>
          </div>

          <button
            onClick={() => setShowInterestsDrawer(!showInterestsDrawer)}
            className="self-start sm:self-auto px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/85 transition-all shadow-md flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showInterestsDrawer ? "Hide Interests" : "Configure Interests"}</span>
          </button>
        </div>

        {/* Expandable Interests Badges */}
        {showInterestsDrawer && (
          <div className="mt-6 pt-5 border-t border-white/10 animate-fade-in">
            <div className="text-xs text-white/50 mb-3">
              {user
                ? "Your selected interests are saved to your account:"
                : "Sign in to permanently save your custom interests:"}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_INTERESTS.map((item) => {
                const isSelected = interests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20 scale-105"
                        : "glass-pill text-white/70 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. ENTERTAINMENT NEWS & CELEBRITY UPDATES */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Entertainment News & Celebrity Updates
            </h2>
          </div>
          <span className="text-xs text-white/40 font-medium">Daily Editorial</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENTERTAINMENT_NEWS.map((news) => (
            <button
              key={news.id}
              onClick={() => setSelectedNews(news)}
              className="group p-3 rounded-2xl glass-card border border-white/10 hover:border-white/25 text-left transition-all block"
            >
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 relative bg-white/5">
                <img
                  src={news.imageUrl}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                  {news.category}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-white/40 mb-1">
                <span>{news.source}</span>
                <span>·</span>
                <span>{news.date}</span>
              </div>

              <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                {news.title}
              </h4>

              <p className="text-[11px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
                {news.summary}
              </p>

              <div className="flex items-center gap-1 text-[10px] text-white/40 mt-3 pt-2 border-t border-white/[0.06]">
                <Clock className="w-3 h-3" />
                <span>{news.readTime}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* News Article Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl glass-sheet p-6 sm:p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black">
                {selectedNews.category}
              </span>
              <button
                onClick={() => setSelectedNews(null)}
                className="w-8 h-8 rounded-full glass-circle text-white"
              >
                ✕
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white">{selectedNews.title}</h3>
            <div className="text-xs text-white/40 mt-1">
              {selectedNews.source} · {selectedNews.date} · {selectedNews.readTime}
            </div>

            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden my-4">
              <img src={selectedNews.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>

            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              {selectedNews.summary}
            </p>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-3">
              Industry sources report that production will integrate cutting-edge visual technologies and real location filming to deliver an unforgettable cinematic experience.
            </p>

            <button
              onClick={() => setSelectedNews(null)}
              className="mt-6 w-full h-10 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/80"
            >
              Close Article
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
