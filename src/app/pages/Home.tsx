import { Hero } from "../components/Hero";
import { Row } from "../components/Row";
import { PlatformBar } from "../components/PlatformBar";
import { ContinueWatchingRow } from "../components/ContinueWatchingRow";
import { useHomeData } from "../components/useTMDB";
import { useAuth, type ContinueItem } from "../components/auth";

export default function Home() {
  const { data, loading } = useHomeData();
  const { continueWatching } = useAuth();

  // If user has no continue watching history yet, generate a high-quality sample prompt
  // using trending data so the user immediately experiences the feature!
  const displayContinue: ContinueItem[] =
    continueWatching.length > 0
      ? continueWatching
      : (data?.trending?.slice(0, 3) || []).map((m, idx) => ({
          ...m,
          media_type: (m.title ? "movie" : "tv") as "movie" | "tv",
          progress: [65, 40, 85][idx] || 50,
          timeLeftMinutes: [50, 35, 18][idx] || 45,
          updatedAt: Date.now() - idx * 3600000,
        }));

  return (
    <div className="animate-fade-in pb-12">
      {/* Cinematic Hero with thumbnail switcher row & floating actions */}
      <Hero
        movie={data?.featured || null}
        featuredList={data?.trending?.slice(0, 6) || []}
      />

      {/* Streaming Platform & Network Pills (Screenshot 2) */}
      <PlatformBar />

      {/* Continue Watching Row with Progress & Time Remaining (Screenshot 2) */}
      <ContinueWatchingRow items={displayContinue} />

      {/* Top Trending Movies (Screenshot 2) */}
      <Row
        title="Top trending movies"
        movies={data?.trending || []}
        loading={loading}
        seeAllLink="/browse?sort=trending"
      />

      {/* New Released (Screenshot 2) */}
      <Row
        title="New released"
        movies={data?.nowPlaying || []}
        loading={loading}
        seeAllLink="/browse?sort=new"
      />

      {/* Latest Hindi Releases (Same-Day & In Theaters) */}
      <Row
        title="🇮🇳 Latest Hindi Releases (Same-Day & In Theaters)"
        movies={data?.latestHindi || []}
        loading={loading}
        seeAllLink="/hindi?type=movies"
      />

      {/* Popular Bollywood Blockbusters */}
      <Row
        title="🎬 Popular Bollywood Blockbusters"
        movies={data?.popularHindi || []}
        loading={loading}
        seeAllLink="/hindi?type=movies"
      />

      {/* Top Hindi Web Series */}
      <Row
        title="📺 Top Hindi Web Series & Shows"
        movies={data?.hindiTV || []}
        loading={loading}
        seeAllLink="/hindi?type=shows"
      />

      {/* Action & Thriller */}
      <Row
        title="💥 Action & Adventure"
        movies={data?.action || []}
        loading={loading}
      />

      {/* Top Rated */}
      <Row
        title="⭐ Top Rated Movies & Classics"
        movies={data?.topRated || []}
        loading={loading}
      />

      {/* TV Series */}
      <Row
        title="📺 Popular TV Shows"
        movies={data?.popularTV || []}
        loading={loading}
        seeAllLink="/series"
      />
    </div>
  );
}
