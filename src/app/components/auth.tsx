import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TMDBMovie } from "./tmdb";
import {
  getSupabase,
  getSupabaseCredentials,
  saveCustomSupabaseConfig,
  syncFavorites,
  persistFavoriteChange,
  syncContinueWatching,
  persistContinueChange,
  getLocalFavorites,
  setLocalFavorites,
  getLocalContinue,
  setLocalContinue,
  type ContinueItem,
  type FavoriteItem,
} from "../lib/supabase";

export type { ContinueItem, FavoriteItem };

export type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

type StoredLocalUser = User & { password?: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isSupabaseActive: boolean;
  supabaseUrl: string;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  continueWatching: ContinueItem[];
  saveProgress: (item: ContinueItem) => void;
  removeContinue: (id: number, mediaType?: "movie" | "tv") => void;
  favorites: FavoriteItem[];
  isFavorite: (id: number, mediaType?: "movie" | "tv") => boolean;
  toggleFavorite: (movie: TMDBMovie, mediaType?: "movie" | "tv") => Promise<boolean>;
  ratings: Record<string, number>;
  rateTitle: (id: number, rating: number, mediaType?: "movie" | "tv") => Promise<void>;
  getUserRating: (id: number, mediaType?: "movie" | "tv") => number | undefined;
  interests: string[];
  toggleInterest: (interestId: string) => void;
  setSupabaseKeys: (url: string, key: string) => void;
};

const USERS_KEY = "cinemax-users-v1";
const SESSION_KEY = "cinemax-session-v1";

function readLocalUsers(): StoredLocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredLocalUser[];
  } catch {
    return [];
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getLocalRatings(userId: string): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(`cinemax_ratings_${userId}`) || "{}");
  } catch {
    return {};
  }
}

function setLocalRatings(userId: string, ratings: Record<string, number>) {
  try {
    localStorage.setItem(`cinemax_ratings_${userId}`, JSON.stringify(ratings));
  } catch {
    // Ignore
  }
}

function getLocalInterests(userId: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`cinemax_interests_${userId}`) || "[]");
  } catch {
    return [];
  }
}

function setLocalInterests(userId: string, interests: string[]) {
  try {
    localStorage.setItem(`cinemax_interests_${userId}`, JSON.stringify(interests));
  } catch {
    // Ignore
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [credentials, setCredentials] = useState(() => getSupabaseCredentials());

  const supabase = useMemo(() => getSupabase(), [credentials.url, credentials.key]);
  const isSupabaseActive = Boolean(supabase && credentials.url);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const u: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
              email: session.user.email || "",
              picture: session.user.user_metadata?.avatar_url,
            };
            setUser(u);
            const favs = await syncFavorites(u.id, supabase, getLocalFavorites(u.id));
            const cont = await syncContinueWatching(u.id, supabase, getLocalContinue(u.id));
            const r = session.user.user_metadata?.ratings || getLocalRatings(u.id);
            const i = session.user.user_metadata?.interests || getLocalInterests(u.id);
            if (mounted) {
              setFavorites(favs);
              setContinueWatching(cont);
              setRatings(r);
              setInterests(i);
            }
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase session restore note:", err);
        }
      }

      // Local fallback session
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        const localUser = readLocalUsers().find((candidate) => candidate.id === sessionId) || null;
        if (localUser && mounted) {
          setUser(localUser);
          setFavorites(getLocalFavorites(localUser.id));
          setContinueWatching(getLocalContinue(localUser.id));
          setRatings(getLocalRatings(localUser.id));
          setInterests(getLocalInterests(localUser.id));
        }
      }

      if (mounted) setLoading(false);
    }

    initAuth();

    // Listen to Supabase auth events
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const u: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            picture: session.user.user_metadata?.avatar_url,
          };
          setUser(u);
          const favs = await syncFavorites(u.id, supabase, getLocalFavorites(u.id));
          const cont = await syncContinueWatching(u.id, supabase, getLocalContinue(u.id));
          setFavorites(favs);
          setContinueWatching(cont);
          setRatings(session.user.user_metadata?.ratings || getLocalRatings(u.id));
          setInterests(session.user.user_metadata?.interests || getLocalInterests(u.id));
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setFavorites([]);
          setContinueWatching([]);
          setRatings({});
          setInterests([]);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [supabase]);

  // Handle updates when user changes
  useEffect(() => {
    if (user?.id) {
      setFavorites(getLocalFavorites(user.id));
      setContinueWatching(getLocalContinue(user.id));
      setRatings(getLocalRatings(user.id));
      setInterests(getLocalInterests(user.id));
      if (supabase) {
        syncFavorites(user.id, supabase, getLocalFavorites(user.id)).then(setFavorites);
        syncContinueWatching(user.id, supabase, getLocalContinue(user.id)).then(setContinueWatching);
      }
    } else {
      setFavorites([]);
      setContinueWatching([]);
      setRatings({});
      setInterests([]);
    }
  }, [user?.id, supabase]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isSupabaseActive,
    supabaseUrl: credentials.url,

    async signIn(email, password) {
      const normEmail = normalizeEmail(email);
      if (!normEmail || !password) return "Please enter both email and password.";

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normEmail,
            password,
          });
          if (error) return error.message;

          if (data.user) {
            const u: User = {
              id: data.user.id,
              name: data.user.user_metadata?.name || normEmail.split("@")[0],
              email: normEmail,
              picture: data.user.user_metadata?.avatar_url,
            };
            setUser(u);
            const favs = await syncFavorites(u.id, supabase, getLocalFavorites(u.id));
            const cont = await syncContinueWatching(u.id, supabase, getLocalContinue(u.id));
            setFavorites(favs);
            setContinueWatching(cont);
            setRatings(data.user.user_metadata?.ratings || getLocalRatings(u.id));
            setInterests(data.user.user_metadata?.interests || getLocalInterests(u.id));
            return null;
          }
        } catch (err: any) {
          return err?.message || "Failed to sign in via Supabase.";
        }
      }

      // Local storage fallback
      const accounts = readLocalUsers();
      const account = accounts.find((a) => a.email === normEmail);
      if (!account || account.password !== password) {
        return "Email or password is incorrect.";
      }
      localStorage.setItem(SESSION_KEY, account.id);
      setUser(account);
      setFavorites(getLocalFavorites(account.id));
      setContinueWatching(getLocalContinue(account.id));
      setRatings(getLocalRatings(account.id));
      setInterests(getLocalInterests(account.id));
      return null;
    },

    async signUp(name, email, password) {
      const normEmail = normalizeEmail(email);
      const trimmedName = name.trim();
      if (!trimmedName || !normEmail || password.length < 6) {
        return "Please enter a valid name, email, and password of at least 6 characters.";
      }

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: normEmail,
            password,
            options: {
              data: {
                name: trimmedName,
              },
            },
          });
          if (error) return error.message;

          if (data.user) {
            const u: User = {
              id: data.user.id,
              name: trimmedName,
              email: normEmail,
            };
            setUser(u);
            setFavorites([]);
            setContinueWatching([]);
            setRatings({});
            setInterests([]);
            return null;
          }
        } catch (err: any) {
          return err?.message || "Failed to sign up via Supabase.";
        }
      }

      // Local storage fallback
      const accounts = readLocalUsers();
      if (accounts.some((a) => a.email === normEmail)) {
        return "An account with this email already exists.";
      }
      const newAccount: StoredLocalUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        email: normEmail,
        password,
      };
      localStorage.setItem(USERS_KEY, JSON.stringify([...accounts, newAccount]));
      localStorage.setItem(SESSION_KEY, newAccount.id);
      setUser(newAccount);
      setFavorites([]);
      setContinueWatching([]);
      setRatings({});
      setInterests([]);
      return null;
    },

    async signOut() {
      if (supabase) {
        try {
          await supabase.auth.signOut();
        } catch {
          // Ignore
        }
      }
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setFavorites([]);
      setContinueWatching([]);
      setRatings({});
      setInterests([]);
    },

    continueWatching,

    saveProgress(item: ContinueItem) {
      if (!user) return;
      const mediaType = item.media_type || (item.title ? "movie" : "tv");
      const normalizedItem: ContinueItem = {
        ...item,
        media_type: mediaType,
        updatedAt: Date.now(),
        timeLeftMinutes: item.timeLeftMinutes ?? Math.max(10, Math.round((100 - (item.progress || 10)) * 1.2)),
      };

      const existingIndex = continueWatching.findIndex(
        (c) => c.id === item.id && c.media_type === mediaType
      );

      let next: ContinueItem[];
      if (existingIndex >= 0) {
        next = [
          normalizedItem,
          ...continueWatching.filter((_, idx) => idx !== existingIndex),
        ];
      } else {
        next = [normalizedItem, ...continueWatching].slice(0, 20);
      }

      setContinueWatching(next);
      persistContinueChange(user.id, supabase, normalizedItem, next);
    },

    removeContinue(id: number, mediaType?: "movie" | "tv") {
      if (!user) return;
      const next = continueWatching.filter((c) => !(c.id === id && (!mediaType || c.media_type === mediaType)));
      setContinueWatching(next);
      setLocalContinue(user.id, next);
      if (supabase) {
        supabase.from("continue_watching").delete().eq("user_id", user.id).eq("movie_id", id).catch(() => null);
        supabase.auth.updateUser({ data: { continue_watching: next } }).catch(() => null);
      }
    },

    favorites,

    isFavorite(id: number, mediaType?: "movie" | "tv") {
      return favorites.some((f) => f.id === id && (!mediaType || f.media_type === mediaType));
    },

    async toggleFavorite(movie: TMDBMovie, mediaType?: "movie" | "tv") {
      if (!user) return false;
      const type = mediaType || (movie.title ? "movie" : "tv");
      const isAlready = favorites.some((f) => f.id === movie.id && f.media_type === type);

      let nextList: FavoriteItem[];
      const favItem: FavoriteItem = {
        ...movie,
        media_type: type,
        addedAt: Date.now(),
      };

      if (isAlready) {
        nextList = favorites.filter((f) => !(f.id === movie.id && f.media_type === type));
        setFavorites(nextList);
        await persistFavoriteChange(user.id, supabase, favItem, "remove", nextList);
        return false;
      } else {
        nextList = [favItem, ...favorites];
        setFavorites(nextList);
        await persistFavoriteChange(user.id, supabase, favItem, "add", nextList);
        return true;
      }
    },

    ratings,

    async rateTitle(id: number, score: number, mediaType?: "movie" | "tv") {
      if (!user) return;
      const key = `${mediaType || "movie"}-${id}`;
      const nextRatings = { ...ratings, [key]: score };
      setRatings(nextRatings);
      setLocalRatings(user.id, nextRatings);
      if (supabase) {
        await supabase.auth.updateUser({
          data: { ratings: nextRatings },
        }).catch(() => null);
      }
    },

    getUserRating(id: number, mediaType?: "movie" | "tv") {
      const key = `${mediaType || "movie"}-${id}`;
      return ratings[key];
    },

    interests,

    toggleInterest(interestId: string) {
      if (!user) return;
      const next = interests.includes(interestId)
        ? interests.filter((i) => i !== interestId)
        : [...interests, interestId];
      setInterests(next);
      setLocalInterests(user.id, next);
      if (supabase) {
        supabase.auth.updateUser({
          data: { interests: next },
        }).catch(() => null);
      }
    },

    setSupabaseKeys(url: string, key: string) {
      saveCustomSupabaseConfig(url, key);
      setCredentials(getSupabaseCredentials());
    },
  }), [user, loading, isSupabaseActive, credentials.url, supabase, continueWatching, favorites, ratings, interests]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}