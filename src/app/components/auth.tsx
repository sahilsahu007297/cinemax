import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { TMDBMovie } from "./tmdb";

export type User = {
  id: string;
  name: string;
  email: string;
  picture?: string;
};

export type ContinueItem = TMDBMovie & {
  media_type: "movie" | "tv";
  progress: number;
  updatedAt: number;
};

type StoredUser = User & { password?: string };
type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => string | null;
  signUp: (name: string, email: string, password: string) => string | null;
  signOut: () => void;
  continueWatching: ContinueItem[];
  saveProgress: (item: ContinueItem) => void;
};

const USERS_KEY = "cinemax-users-v1";
const SESSION_KEY = "cinemax-session-v1";

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as StoredUser[];
  } catch {
    return [];
  }
}

function readContinue(userId: string | null): ContinueItem[] {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(`cinemax-continue-${userId}`) || "[]") as ContinueItem[];
  } catch {
    return [];
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const sessionId = localStorage.getItem(SESSION_KEY);
    return readUsers().find((candidate) => candidate.id === sessionId) || null;
  });
  const [continueWatching, setContinueWatching] = useState<ContinueItem[]>(() => readContinue(user?.id || null));

  useEffect(() => {
    setContinueWatching(readContinue(user?.id || null));
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    signIn(email, password) {
      const account = readUsers().find((candidate) => candidate.email === normalizeEmail(email));
      if (!account || account.password !== password) return "Email or password is incorrect.";
      localStorage.setItem(SESSION_KEY, account.id);
      setUser(account);
      return null;
    },
    signUp(name, email, password) {
      const normalizedEmail = normalizeEmail(email);
      const users = readUsers();
      if (!name.trim() || !normalizedEmail || password.length < 6) return "Use a name, email, and password of at least 6 characters.";
      if (users.some((candidate) => candidate.email === normalizedEmail)) return "An account with this email already exists.";
      const account: StoredUser = { id: `local:${normalizedEmail}`, name: name.trim(), email: normalizedEmail, password };
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, account]));
      localStorage.setItem(SESSION_KEY, account.id);
      setUser(account);
      return null;
    },
    signOut() {
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
    },
    saveProgress(item) {
      if (!user) return;
      const next = [item, ...readContinue(user.id).filter((entry) => !(entry.id === item.id && entry.media_type === item.media_type))].slice(0, 12);
      localStorage.setItem(`cinemax-continue-${user.id}`, JSON.stringify(next));
      setContinueWatching(next);
    },
  }), [user, continueWatching]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}