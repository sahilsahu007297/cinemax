import { Hero } from "../components/Hero";
import { Row } from "../components/Row";
import { useHomeData } from "../components/useTMDB";
import { useAuth } from "../components/auth";

export default function Home() {
  const { data, loading } = useHomeData();
  const { user, continueWatching } = useAuth();

  return (
    <>
      <Hero movie={data?.featured || null} />
      {user && <Row title="Continue Watching" movies={continueWatching} loading={false} />}
      <Row
        title="🔥 Trending This Week"
        movies={data?.trending || []}
        loading={loading}
      />
      <Row
        title="🇮🇳 Latest Hindi Releases (Same-Day & In Theaters)"
        movies={data?.latestHindi || []}
        loading={loading}
        seeAllLink="/hindi?type=movies"
      />
      <Row
        title="🎬 Popular Bollywood Blockbusters"
        movies={data?.popularHindi || []}
        loading={loading}
        seeAllLink="/hindi?type=movies"
      />
      <Row
        title="📺 Top Hindi Web Series & Shows"
        movies={data?.hindiTV || []}
        loading={loading}
        seeAllLink="/hindi?type=shows"
      />
      <Row
        title="💥 Action & Adventure"
        movies={data?.action || []}
        loading={loading}
      />
      <Row
        title="🎬 Now Playing in Theaters"
        movies={data?.nowPlaying || []}
        loading={loading}
      />
      <Row
        title="😂 Blockbuster Comedies"
        movies={data?.comedy || []}
        loading={loading}
      />
      <Row
        title="⭐ Top Rated Movies"
        movies={data?.topRated || []}
        loading={loading}
      />
      <Row
        title="🔪 Gripping Thrillers"
        movies={data?.thriller || []}
        loading={loading}
      />
      <Row
        title="📺 Popular TV Shows"
        movies={data?.popularTV || []}
        loading={loading}
      />
      <Row
        title="🏆 Top Rated TV Shows"
        movies={data?.topRatedTV || []}
        loading={loading}
      />
    </>
  );
}

