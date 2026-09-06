import { useState, useEffect } from "react";
import {
  getTrending,
  getPopularMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getPopularTV,
  getTopRatedTV,
  getAiringTodayTV,
  getTopRatedMovies,
  searchMulti,
  getMovieDetail,
  getTVDetail,
  type TMDBMovie,
  type TMDBDetail,
} from "./tmdb";

// Generic fetcher hook
function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

// Home page data
export function useHomeData() {
  const [data, setData] = useState<{
    trending: TMDBMovie[];
    nowPlaying: TMDBMovie[];
    popular: TMDBMovie[];
    topRated: TMDBMovie[];
    popularTV: TMDBMovie[];
    topRatedTV: TMDBMovie[];
    action: TMDBMovie[];
    comedy: TMDBMovie[];
    thriller: TMDBMovie[];
    latestHindi: TMDBMovie[];
    popularHindi: TMDBMovie[];
    hindiTV: TMDBMovie[];
    featured: TMDBMovie | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getTrending("all", "week"),
      getNowPlayingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
      getPopularTV(),
      getTopRatedTV(),
      import("./tmdb").then(m => m.getMoviesByGenre(28)), // Action
      import("./tmdb").then(m => m.getMoviesByGenre(35)), // Comedy
      import("./tmdb").then(m => m.getMoviesByGenre(53)), // Thriller
      import("./tmdb").then(m => m.getLatestHindiMovies(1)),
      import("./tmdb").then(m => m.getPopularHindiMovies(1)),
      import("./tmdb").then(m => m.getPopularHindiTV(1)),
    ])
      .then(([trending, nowPlaying, popular, topRated, popularTV, topRatedTV, action, comedy, thriller, latestHindi, popularHindi, hindiTV]) => {
        if (cancelled) return;
        const trendingResults = trending.results.filter((m) => m.poster_path && m.backdrop_path);
        setData({
          trending: trendingResults.slice(0, 20),
          nowPlaying: nowPlaying.results.filter((m) => m.poster_path).slice(0, 20),
          popular: popular.results.filter((m) => m.poster_path).slice(0, 20),
          topRated: topRated.results.filter((m) => m.poster_path).slice(0, 20),
          popularTV: popularTV.results.filter((m) => m.poster_path).slice(0, 20),
          topRatedTV: topRatedTV.results.filter((m) => m.poster_path).slice(0, 20),
          action: action.results.filter((m) => m.poster_path).slice(0, 20),
          comedy: comedy.results.filter((m) => m.poster_path).slice(0, 20),
          thriller: thriller.results.filter((m) => m.poster_path).slice(0, 20),
          latestHindi: latestHindi.results.filter((m) => m.poster_path).slice(0, 20),
          popularHindi: popularHindi.results.filter((m) => m.poster_path).slice(0, 20),
          hindiTV: hindiTV.results.filter((m) => m.poster_path).slice(0, 20),
          featured: trendingResults[0] || null,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { data, loading };
}

// Browse movies
export function useBrowseMovies(page = 1) {
  return useFetch(
    () => getPopularMovies(page).then((r) => r.results.filter((m) => m.poster_path)),
    [page]
  );
}

// Browse TV
export function useBrowseTV(page = 1) {
  return useFetch(
    () => getPopularTV(page).then((r) => r.results.filter((m) => m.poster_path)),
    [page]
  );
}

// Upcoming movies
export function useUpcomingMovies() {
  return useFetch(
    () => getUpcomingMovies().then((r) => r.results.filter((m) => m.poster_path)),
    []
  );
}

// Airing today TV
export function useAiringTodayTV() {
  return useFetch(
    () => getAiringTodayTV().then((r) => r.results.filter((m) => m.poster_path)),
    []
  );
}

// Search
export function useSearch(query: string) {
  return useFetch(
    () => query.length > 1
      ? searchMulti(query).then((r) => r.results.filter((m) => m.poster_path && (m.media_type === "movie" || m.media_type === "tv")))
      : Promise.resolve([]),
    [query]
  );
}

// Detail (movie or TV)
export function useDetail(id: number, type: "movie" | "tv") {
  return useFetch<TMDBDetail>(
    () => (Number.isFinite(id) && id > 0 ? (type === "tv" ? getTVDetail(id) : getMovieDetail(id)) : Promise.resolve(null as unknown as TMDBDetail)),
    [id, type]
  );
}
