import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TMDBMovie } from "../components/tmdb";

export type ContinueItem = TMDBMovie & {
  media_type: "movie" | "tv";
  progress: number; // 0 to 100
  durationMinutes?: number;
  timeLeftMinutes?: number;
  season?: number;
  episode?: number;
  updatedAt: number;
};

export type FavoriteItem = TMDBMovie & {
  media_type: "movie" | "tv";
  addedAt: number;
};

const STORAGE_CONFIG_KEY = "cinemax_supabase_config";

// Read from env or local override
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  try {
    const local = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.url && parsed.key) return { url: parsed.url, key: parsed.key, isCustom: true };
    }
  } catch {
    // Ignore
  }

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, isCustom: false };
  }

  return { url: "", key: "", isCustom: false };
}

let supabaseInstance: SupabaseClient | null = null;
let lastUrl = "";
let lastKey = "";

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) return null;

  if (!supabaseInstance || lastUrl !== url || lastKey !== key) {
    lastUrl = url;
    lastKey = key;
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseInstance;
}

export function saveCustomSupabaseConfig(url: string, key: string) {
  if (!url.trim() || !key.trim()) {
    localStorage.removeItem(STORAGE_CONFIG_KEY);
  } else {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify({ url: url.trim(), key: key.trim() }));
  }
  supabaseInstance = null;
}

// Local persistent storage scoped strictly by User ID
export function getLocalFavorites(userId: string): FavoriteItem[] {
  try {
    return JSON.parse(localStorage.getItem(`cinemax_favs_${userId}`) || "[]");
  } catch {
    return [];
  }
}

export function setLocalFavorites(userId: string, items: FavoriteItem[]) {
  try {
    localStorage.setItem(`cinemax_favs_${userId}`, JSON.stringify(items));
  } catch {
    // Ignore
  }
}

export function getLocalContinue(userId: string): ContinueItem[] {
  try {
    return JSON.parse(localStorage.getItem(`cinemax_continue_${userId}`) || "[]");
  } catch {
    return [];
  }
}

export function setLocalContinue(userId: string, items: ContinueItem[]) {
  try {
    localStorage.setItem(`cinemax_continue_${userId}`, JSON.stringify(items));
  } catch {
    // Ignore
  }
}

/**
 * Sync user favorites with Supabase
 * Tries Supabase table 'favorites' first; falls back to user_metadata or local user-scoped storage
 */
export async function syncFavorites(
  userId: string,
  client: SupabaseClient | null,
  current: FavoriteItem[]
): Promise<FavoriteItem[]> {
  if (!client || !userId) return current;

  try {
    // Try table query
    const { data, error } = await client
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const merged = data.map((row: any) => ({
        id: row.movie_id || row.id,
        title: row.title,
        name: row.name || row.title,
        poster_path: row.poster_path,
        backdrop_path: row.backdrop_path,
        vote_average: row.vote_average ?? 8.0,
        release_date: row.release_date,
        first_air_date: row.first_air_date,
        genre_ids: row.genre_ids || [],
        overview: row.overview || "",
        media_type: row.media_type || "movie",
        addedAt: new Date(row.created_at).getTime(),
      }));
      setLocalFavorites(userId, merged);
      return merged;
    }

    // Try reading from user metadata
    const { data: userData } = await client.auth.getUser();
    const metaFavs = userData?.user?.user_metadata?.favorites;
    if (Array.isArray(metaFavs) && metaFavs.length > 0) {
      setLocalFavorites(userId, metaFavs);
      return metaFavs;
    }
  } catch (err) {
    console.warn("Supabase favorites sync note:", err);
  }

  return current;
}

/**
 * Persist favorite update to Supabase
 */
export async function persistFavoriteChange(
  userId: string,
  client: SupabaseClient | null,
  item: FavoriteItem,
  action: "add" | "remove",
  allList: FavoriteItem[]
) {
  setLocalFavorites(userId, allList);

  if (!client || !userId) return;

  try {
    if (action === "add") {
      await client.from("favorites").upsert({
        user_id: userId,
        movie_id: item.id,
        title: item.title || item.name || "Untitled",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date,
        media_type: item.media_type,
        overview: item.overview,
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id,movie_id" }).catch(() => null);
    } else {
      await client.from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("movie_id", item.id)
        .catch(() => null);
    }

    // Also backup in user metadata so it requires zero SQL migrations
    await client.auth.updateUser({
      data: { favorites: allList.slice(0, 50) },
    }).catch(() => null);
  } catch (err) {
    console.warn("Favorite persist error:", err);
  }
}

/**
 * Sync Continue Watching with Supabase
 */
export async function syncContinueWatching(
  userId: string,
  client: SupabaseClient | null,
  current: ContinueItem[]
): Promise<ContinueItem[]> {
  if (!client || !userId) return current;

  try {
    // Try table query
    const { data, error } = await client
      .from("continue_watching")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && data && data.length > 0) {
      const merged = data.map((row: any) => ({
        id: row.movie_id || row.id,
        title: row.title,
        name: row.name || row.title,
        poster_path: row.poster_path,
        backdrop_path: row.backdrop_path,
        vote_average: row.vote_average ?? 8.0,
        release_date: row.release_date,
        first_air_date: row.first_air_date,
        genre_ids: row.genre_ids || [],
        overview: row.overview || "",
        media_type: row.media_type || "movie",
        progress: row.progress ?? 0,
        durationMinutes: row.duration_minutes || 120,
        timeLeftMinutes: row.time_left_minutes || 45,
        season: row.season,
        episode: row.episode,
        updatedAt: new Date(row.updated_at).getTime(),
      }));
      setLocalContinue(userId, merged);
      return merged;
    }

    // Try reading from user metadata
    const { data: userData } = await client.auth.getUser();
    const metaContinue = userData?.user?.user_metadata?.continue_watching;
    if (Array.isArray(metaContinue) && metaContinue.length > 0) {
      setLocalContinue(userId, metaContinue);
      return metaContinue;
    }
  } catch (err) {
    console.warn("Supabase continue sync note:", err);
  }

  return current;
}

/**
 * Persist Continue Watching update to Supabase
 */
export async function persistContinueChange(
  userId: string,
  client: SupabaseClient | null,
  item: ContinueItem,
  allList: ContinueItem[]
) {
  setLocalContinue(userId, allList);

  if (!client || !userId) return;

  try {
    await client.from("continue_watching").upsert({
      user_id: userId,
      movie_id: item.id,
      title: item.title || item.name || "Untitled",
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      vote_average: item.vote_average,
      media_type: item.media_type,
      progress: item.progress,
      duration_minutes: item.durationMinutes || 120,
      time_left_minutes: item.timeLeftMinutes || 45,
      season: item.season,
      episode: item.episode,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,movie_id" }).catch(() => null);

    // Also store in user metadata for zero-setup portability
    await client.auth.updateUser({
      data: { continue_watching: allList.slice(0, 30) },
    }).catch(() => null);
  } catch (err) {
    console.warn("Continue watching persist error:", err);
  }
}
