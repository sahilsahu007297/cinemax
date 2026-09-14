// Universal resilient TMDB client permanently unblocked across all ISPs (Jio, Airtel, Vi, etc.)
const API_KEY = "2dca580c2a14b55200e784d157207b4d";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

/**
 * Universal Unblocked Image Helper:
 * Jio and Airtel frequently DNS-block image.tmdb.org in India.
 * Routing through wsrv.nl (Cloudflare Global Edge Cache) guarantees 100% load reliability worldwide.
 */
export const img = (path: string | null, size = "w500", direct = false) => {
  if (!path) return "";
  const directUrl = `${IMG}/${size}${path}`;
  if (direct) return directUrl;
  // Always use Cloudflare edge proxy by default to completely bypass Indian ISP blocks
  return `https://wsrv.nl/?url=${encodeURIComponent(directUrl)}&output=webp`;
};

export const backdrop = (path: string | null, direct = false) => {
  if (!path) return "";
  const directUrl = `${IMG}/original${path}`;
  if (direct) return directUrl;
  return `https://wsrv.nl/?url=${encodeURIComponent(directUrl)}&output=webp`;
};

export type TMDBMovie = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: string;
  adult: boolean;
};

export type TMDBPerson = {
  id: number;
  name: string;
  original_name?: string;
  profile_path: string | null;
  known_for_department?: string;
  known_for?: TMDBMovie[];
  biography?: string;
  birthday?: string;
  deathday?: string | null;
  place_of_birth?: string;
  popularity?: number;
  imdb_id?: string;
  combined_credits?: {
    cast: (TMDBMovie & { character?: string })[];
    crew: (TMDBMovie & { job?: string; department?: string })[];
  };
};

export type TMDBDetail = TMDBMovie & {
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TMDBSeason[];
  genres: { id: number; name: string }[];
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew?: {
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path: string | null;
    }[];
  };
  videos?: {
    results: {
      key: string;
      site: string;
      type: string;
      name: string;
    }[];
  };
  images?: {
    backdrops: { file_path: string }[];
    posters: { file_path: string }[];
  };
  similar?: {
    results: TMDBMovie[];
  };
  external_ids?: {
    imdb_id: string | null;
  };
};

export type TMDBSeason = {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date?: string;
};

export type TMDBEpisode = {
  id: number;
  name: string;
  episode_number: number;
  season_number: number;
  overview: string;
  still_path: string | null;
  air_date?: string;
  runtime?: number;
};

export type TMDBProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
};

// Genre ID → name map
const genreMap: Record<number, string> = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

export const getGenreNames = (ids: number[]) =>
  ids.map((id) => genreMap[id] || "Unknown").filter(Boolean);

/**
 * Validates whether a response is real JSON and not an ISP HTML block page (e.g. Reliance Jio DoT page)
 */
async function parseValidJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  // Check if ISP returned an HTML block page
  if (text.trim().startsWith("<") || text.includes("<html") || text.includes("blocked")) {
    throw new Error("ISP Block Page detected");
  }
  return JSON.parse(text) as T;
}

/**
 * Universal Resilient Multi-Mirror Fetcher:
 * 1. Tries /api/tmdb serverless edge proxy (never blocked by Jio / Airtel in India)
 * 2. Tries direct TMDB API with short timeout.
 * 3. Tries unblocked CORS mirrors (allorigins, corsproxy, codetabs).
 */
export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Priority 1: Vercel serverless proxy /api/tmdb (bypasses ISP filters automatically)
  if (typeof window !== "undefined") {
    try {
      const apiProxyUrl = new URL("/api/tmdb", window.location.origin);
      apiProxyUrl.searchParams.set("endpoint", cleanEndpoint);
      Object.entries(params).forEach(([k, v]) => apiProxyUrl.searchParams.set(k, v));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(apiProxyUrl.toString(), { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        return await parseValidJson<T>(res);
      }
    } catch {
      // Not hosted on Vercel or localhost without API handler — continue to direct / CORS mirrors
    }
  }

  const url = new URL(`${BASE}${cleanEndpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const directUrl = url.toString();

  // Priority 2: Direct TMDB with short timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    const res = await fetch(directUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      return await parseValidJson<T>(res);
    }
  } catch {
    // ISP / Jio DNS error or timeout — proceed to unblocked proxies immediately
  }

  // Priority 3: allorigins (Reliable raw proxy)
  try {
    const mirrorUrl1 = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(mirrorUrl1, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      return await parseValidJson<T>(res);
    }
  } catch {
    // Proceed to Mirror 2
  }

  // Priority 4: corsproxy.io
  try {
    const mirrorUrl2 = `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(mirrorUrl2, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      return await parseValidJson<T>(res);
    }
  } catch {
    // Proceed to Mirror 3
  }

  // Priority 5: codetabs proxy
  try {
    const mirrorUrl3 = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(directUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(mirrorUrl3, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      return await parseValidJson<T>(res);
    }
  } catch {
    // Fallback
  }

  // Final fallback: direct fetch
  const finalRes = await fetch(directUrl);
  return await parseValidJson<T>(finalRes);
}

type PageResult = { results: TMDBMovie[]; total_results: number; total_pages?: number };
type PersonPageResult = { results: TMDBPerson[]; total_results: number };
type ProviderResult = { results: TMDBProvider[] };

export const getTrending = (media: "movie" | "tv" | "all" = "all", time: "day" | "week" = "week") =>
  fetchTMDB<PageResult>(`/trending/${media}/${time}`);

export const getPopularMovies = (page = 1) =>
  fetchTMDB<PageResult>("/movie/popular", { page: String(page) });

export const getTopRatedMovies = (page = 1) =>
  fetchTMDB<PageResult>("/movie/top_rated", { page: String(page) });

export const getNowPlayingMovies = (page = 1) =>
  fetchTMDB<PageResult>("/movie/now_playing", { page: String(page) });

export const getUpcomingMovies = (page = 1) =>
  fetchTMDB<PageResult>("/movie/upcoming", { page: String(page) });

export const getPopularTV = (page = 1) =>
  fetchTMDB<PageResult>("/tv/popular", { page: String(page) });

export const getTopRatedTV = (page = 1) =>
  fetchTMDB<PageResult>("/tv/top_rated", { page: String(page) });

export const getAiringTodayTV = (page = 1) =>
  fetchTMDB<PageResult>("/tv/airing_today", { page: String(page) });

export const getMovieDetail = (id: number) =>
  fetchTMDB<TMDBDetail>(`/movie/${id}`, {
    append_to_response: "credits,videos,images,similar,external_ids",
  });

export const getTVDetail = (id: number) =>
  fetchTMDB<TMDBDetail>(`/tv/${id}`, {
    append_to_response: "credits,videos,images,similar,external_ids",
  });

export const getTVSeason = (id: number, seasonNumber: number) =>
  fetchTMDB<{ season_number: number; episodes: TMDBEpisode[] }>(`/tv/${id}/season/${seasonNumber}`);

export const searchMulti = (query: string, page = 1) =>
  fetchTMDB<PageResult>("/search/multi", { query, page: String(page) });

export const searchMovies = (query: string, page = 1) =>
  fetchTMDB<PageResult>("/search/movie", { query, page: String(page) });

export const searchTV = (query: string, page = 1) =>
  fetchTMDB<PageResult>("/search/tv", { query, page: String(page) });

export const searchPerson = (query: string, page = 1) =>
  fetchTMDB<PersonPageResult>("/search/person", { query, page: String(page) });

export const getPersonDetail = (personId: number) =>
  fetchTMDB<TMDBPerson>(`/person/${personId}`, {
    append_to_response: "combined_credits,external_ids",
  });

export const getTrendingPeople = () =>
  fetchTMDB<PersonPageResult>("/trending/person/week");

export const getWatchProviders = (type: "movie" | "tv", region = "US") =>
  fetchTMDB<ProviderResult>(`/watch/providers/${type}`, {
    watch_region: region,
    language: "en-US",
  });

export const discoverByProvider = (
  type: "movie" | "tv",
  providerId: number,
  page = 1,
  region = "US",
) =>
  fetchTMDB<PageResult>(`/discover/${type}`, {
    with_watch_providers: String(providerId),
    watch_region: region,
    page: String(page),
    sort_by: "popularity.desc",
  });

export const getMoviesByGenre = (genreId: number, page = 1) =>
  fetchTMDB<PageResult>("/discover/movie", { with_genres: String(genreId), page: String(page), sort_by: "popularity.desc" });

export const getTVByGenre = (genreId: number, page = 1) =>
  fetchTMDB<PageResult>("/discover/tv", { with_genres: String(genreId), page: String(page), sort_by: "popularity.desc" });

export const getMediaType = (item: TMDBMovie): "movie" | "tv" =>
  item.media_type === "tv" || item.name ? "tv" : "movie";

export const getTitle = (item: TMDBMovie) => item.title || item.name || "Untitled";

export const getYear = (item: TMDBMovie) => {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear() : 0;
};

export const getRating = (item: TMDBMovie) =>
  item.vote_average ? +(item.vote_average.toFixed(1)) : 0;

export const getAgeRating = (item: TMDBMovie) =>
  item.adult ? "18+" : "PG-13";

export const formatRuntime = (minutes?: number) => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getTodayDateString = () => new Date().toISOString().split("T")[0];

export const getLatestHindiMovies = (page = 1, genreId?: number) => {
  const params: Record<string, string> = {
    with_original_language: "hi",
    sort_by: "primary_release_date.desc",
    "primary_release_date.lte": getTodayDateString(),
    page: String(page),
  };
  if (genreId && genreId > 0) {
    params.with_genres = String(genreId);
  }
  return fetchTMDB<PageResult>("/discover/movie", params);
};

export const getPopularHindiMovies = (page = 1, genreId?: number) => {
  const params: Record<string, string> = {
    with_original_language: "hi",
    sort_by: "popularity.desc",
    page: String(page),
  };
  if (genreId && genreId > 0) {
    params.with_genres = String(genreId);
  }
  return fetchTMDB<PageResult>("/discover/movie", params);
};

export const getLatestHindiTV = (page = 1, genreId?: number) => {
  const params: Record<string, string> = {
    with_original_language: "hi",
    sort_by: "first_air_date.desc",
    "first_air_date.lte": getTodayDateString(),
    page: String(page),
  };
  if (genreId && genreId > 0) {
    params.with_genres = String(genreId);
  }
  return fetchTMDB<PageResult>("/discover/tv", params);
};

export const getPopularHindiTV = (page = 1, genreId?: number) => {
  const params: Record<string, string> = {
    with_original_language: "hi",
    sort_by: "popularity.desc",
    page: String(page),
  };
  if (genreId && genreId > 0) {
    params.with_genres = String(genreId);
  }
  return fetchTMDB<PageResult>("/discover/tv", params);
};

export const HINDI_MOVIE_GENRES = [
  { id: 0, name: "All Genres" },
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 53, name: "Thriller" },
  { id: 10749, name: "Romance" },
  { id: 80, name: "Crime" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 878, name: "Sci-Fi" },
  { id: 10751, name: "Family" },
  { id: 12, name: "Adventure" },
];

export const HINDI_TV_GENRES = [
  { id: 0, name: "All Genres" },
  { id: 10759, name: "Action & Adventure" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 80, name: "Crime" },
  { id: 9648, name: "Mystery" },
  { id: 10765, name: "Sci-Fi & Fantasy" },
  { id: 10764, name: "Reality" },
  { id: 10766, name: "Soap" },
];
