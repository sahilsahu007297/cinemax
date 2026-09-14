// TMDB API integration with universal resilient multi-mirror support for all ISPs (Jio, Airtel, Vi, etc.)
const API_KEY = "2dca580c2a14b55200e784d157207b4d";
const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p";

// Unblockable image CDN proxy helper for Indian ISPs where image.tmdb.org is blocked
export const img = (path: string | null, size = "w500", useProxy = false) => {
  if (!path) return "";
  const direct = `${IMG}/${size}${path}`;
  if (useProxy) {
    return `https://wsrv.nl/?url=${encodeURIComponent(direct)}&output=webp`;
  }
  return direct;
};

export const backdrop = (path: string | null, useProxy = false) => {
  if (!path) return "";
  const direct = `${IMG}/original${path}`;
  if (useProxy) {
    return `https://wsrv.nl/?url=${encodeURIComponent(direct)}&output=webp`;
  }
  return direct;
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
  // TV genres
  10759: "Action & Adventure", 10762: "Kids", 10763: "News",
  10764: "Reality", 10765: "Sci-Fi & Fantasy", 10766: "Soap",
  10767: "Talk", 10768: "War & Politics",
};

export const getGenreNames = (ids: number[]) =>
  ids.map((id) => genreMap[id] || "Unknown").filter(Boolean);

/**
 * Universal Resilient TMDB Fetcher:
 * 1. Tries direct TMDB API with a 3.5s timeout.
 * 2. If blocked by ISP (e.g. Jio / Airtel DNS filtering), automatically retries via fast unblocked mirrors.
 */
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const directUrl = url.toString();

  // 1. Direct attempt
  try {
    const res = await fetchWithTimeout(directUrl, 3200);
    if (res.ok) return res.json();
  } catch {
    // ISP / Jio DNS error or timeout — fallback to resilient unblocked proxies
  }

  // 2. Unblocked Mirror 1 (corsproxy.io)
  try {
    const mirrorUrl1 = `https://corsproxy.io/?url=${encodeURIComponent(directUrl)}`;
    const res = await fetchWithTimeout(mirrorUrl1, 4000);
    if (res.ok) return res.json();
  } catch {
    // Try next mirror
  }

  // 3. Unblocked Mirror 2 (allorigins)
  try {
    const mirrorUrl2 = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
    const res = await fetchWithTimeout(mirrorUrl2, 4500);
    if (res.ok) return res.json();
  } catch {
    // Continue
  }

  // 4. Final attempt direct fallback
  const fallbackRes = await fetch(directUrl);
  if (!fallbackRes.ok) throw new Error(`TMDB ${fallbackRes.status}`);
  return fallbackRes.json();
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

// Search APIs
export const searchMulti = (query: string, page = 1) =>
  fetchTMDB<PageResult>("/search/multi", { query, page: String(page) });

export const searchMovies = (query: string, page = 1) =>
  fetchTMDB<PageResult>("/search/movie", { query, page: String(page) });

export const searchTV = (query: string, page = 1) =>
  fetchTMDB<PageResult>("/search/tv", { query, page: String(page) });

export const searchPerson = (query: string, page = 1) =>
  fetchTMDB<PersonPageResult>("/search/person", { query, page: String(page) });

// Celebrity / Cast Details & Filmographies
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

// Helper to determine media type
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

// Format runtime
export const formatRuntime = (minutes?: number) => {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Hindi Cinema & Shows API Fetchers
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
