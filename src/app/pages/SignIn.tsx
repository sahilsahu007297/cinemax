import { useEffect, useState } from "react";
import { LogIn, UserPlus, Eye, EyeOff, ShieldCheck, Database, KeyRound, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/auth";
import cinemaxLogo from "../../Cinemax Logo 1.png";

export default function SignIn() {
  const { user, signIn, signUp, isSupabaseActive, supabaseUrl, setSupabaseKeys } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Supabase Custom Config Drawer/Toggle
  const [showSupabaseSettings, setShowSupabaseSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState(supabaseUrl || "");
  const [customKey, setCustomKey] = useState("");
  const [configSaved, setConfigSaved] = useState(false);

  useEffect(() => {
    if (user) navigate("/profile", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result =
        mode === "signin"
          ? await signIn(email, password)
          : await signUp(name, email, password);

      if (result) {
        setError(result);
      } else {
        navigate("/profile");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSupabaseKeys(customUrl, customKey);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 pt-24 pb-24">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl -translate-x-20" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl glass-sheet p-7 sm:p-9 border border-white/20 shadow-2xl animate-fade-in z-10">
        {/* Cinemax Logo & Tag */}
        <div className="flex items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/15 p-2 shadow-inner">
            <img
              src={cinemaxLogo}
              alt="Cinemax"
              className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]"
            />
          </div>

          {/* Supabase Status Pill */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
              isSupabaseActive
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-white/[0.06] border-white/15 text-white/70"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isSupabaseActive ? "Supabase Cloud" : "Account Isolated"}</span>
          </div>
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-white tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-xs text-white/50 leading-relaxed">
          Your favorites, watchlist, and continue playing history are strictly preserved for your
          account.
        </p>

        {/* Tab Selector */}
        <div className="mt-6 flex p-1 rounded-2xl bg-white/[0.06] border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === "signin" ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
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
              mode === "signup" ? "bg-white text-black shadow-md" : "text-white/60 hover:text-white"
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="text-[11px] font-medium text-white/60 block mb-1">Your Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sahil"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs sm:text-sm text-white outline-none placeholder:text-white/35 focus:border-white/40 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="text-[11px] font-medium text-white/60 block mb-1">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-xs sm:text-sm text-white outline-none placeholder:text-white/35 focus:border-white/40 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-white/60 block mb-1">Password</label>
            <div className="relative">
              <input
                required
                minLength={6}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-xs sm:text-sm text-white outline-none placeholder:text-white/35 focus:border-white/40 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs sm:text-sm font-semibold text-black hover:bg-white/85 active:scale-[0.98] transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : mode === "signin" ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create account</span>
              </>
            )}
          </button>
        </form>

        {/* Supabase Custom Config Expandable Section */}
        <div className="mt-6 pt-5 border-t border-white/[0.08]">
          <button
            onClick={() => setShowSupabaseSettings(!showSupabaseSettings)}
            className="w-full flex items-center justify-between text-[11px] text-white/40 hover:text-white/80 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Supabase Cloud Integration</span>
            </div>
            <span>{showSupabaseSettings ? "▲" : "▼"}</span>
          </button>

          {showSupabaseSettings && (
            <form onSubmit={handleSaveSupabaseConfig} className="mt-3 space-y-2.5 animate-fade-in">
              <p className="text-[10px] text-white/45">
                Cinemax automatically connects via environment variables or you can paste your
                Supabase Project URL & Anon key below:
              </p>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] text-white outline-none placeholder:text-white/30"
              />
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="anon-public-key"
                className="h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] text-white outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3 h-3" />
                <span>Save Supabase Project</span>
              </button>
              {configSaved && (
                <span className="text-[10px] text-emerald-400">Settings saved successfully!</span>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}