import { useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Play,
  Film,
  Lock,
} from "lucide-react";
import cinemaxLogo from "../../Cinemax Logo 1.png";

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If user is already authenticated, grant access into the app immediately
  if (user) {
    return <>{children}</>;
  }

  // Loading state while restoring session
  if (loading) {
    return (
      <div className="dark min-h-screen w-full bg-[#08090c] text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 p-2 flex items-center justify-center animate-pulse shadow-2xl mb-4">
          <img src={cinemaxLogo} alt="Cinemax" className="h-full w-full object-contain" />
        </div>
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result =
        mode === "signin"
          ? await signIn(email, password)
          : await signUp(name, email, password);

      if (result) {
        setError(result);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate.");
    } finally {
      setSubmitting(false);
    }
  };

  // 1-Click Guest Pass for instant entry without typing
  const handleGuestEntry = async () => {
    setSubmitting(true);
    const guestEmail = `guest_${Math.random().toString(36).slice(2, 7)}@cinemax.live`;
    await signUp("Guest Explorer", guestEmail, "cinemax2026");
    setSubmitting(false);
  };

  return (
    <div className="dark min-h-screen w-full bg-[#08090c] text-white relative overflow-x-hidden flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Ambient background cinematic lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] -translate-y-12" />
        <div className="w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] translate-x-24" />
      </div>

      <div className="pointer-events-none fixed inset-0 cinema-grain z-10" />

      {/* Small, Elegant Frosted Glass Login Gateway */}
      <div className="relative z-20 w-full max-w-sm rounded-[32px] glass-sheet p-7 sm:p-8 border border-white/20 shadow-2xl animate-fade-in backdrop-blur-3xl">
        {/* Cinemax Logo Badge */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.08] border border-white/20 p-2.5 shadow-2xl flex items-center justify-center mb-3 group hover:scale-105 transition-transform">
            <img
              src={cinemaxLogo}
              alt="Cinemax"
              className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]"
            />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-[10px] font-bold tracking-widest uppercase text-white/80 border border-white/15 mb-2">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Secure Streaming Gateway</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            CINEMAX
          </h1>
          <p className="text-xs text-white/50 mt-1 max-w-xs">
            Sign in to access 4K movies, TV series, continue playing, and custom lists.
          </p>
        </div>

        {/* Tab Selector: Sign In / Register */}
        <div className="flex p-1 rounded-2xl bg-white/[0.06] border border-white/10 mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "signin"
                ? "bg-white text-black shadow-md font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "signup"
                ? "bg-white text-black shadow-md font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/40 transition-colors"
              />
            </div>
          )}

          <div>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/40 transition-colors"
            />
          </div>

          <div className="relative">
            <input
              required
              minLength={6}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-xs text-white outline-none placeholder:text-white/35 focus:border-white/40 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/85 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : mode === "signin" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter Cinemax</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create & Enter</span>
              </>
            )}
          </button>
        </form>

        {/* Instant Guest Entry Alternative */}
        <div className="mt-4 pt-4 border-t border-white/[0.08] text-center">
          <button
            type="button"
            onClick={handleGuestEntry}
            disabled={submitting}
            className="w-full py-2.5 rounded-xl glass-pill text-white/80 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-white/15 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Instant Guest Pass (Explore App)</span>
          </button>
          <span className="text-[10px] text-white/40 mt-1.5 block">
            No password required · Instant entry
          </span>
        </div>
      </div>
    </div>
  );
}
