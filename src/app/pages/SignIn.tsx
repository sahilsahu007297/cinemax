import { useEffect, useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../components/auth";
import cinemaxLogo from "../../Cinemax Logo 1.png";

export default function SignIn() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) navigate("/profile", { replace: true });
  }, [user, navigate]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = mode === "signin" ? signIn(email, password) : signUp(name, email, password);
    if (result) setError(result);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 pt-24 sm:pt-16 pb-24 sm:pb-12">
      <div className="w-full max-w-md rounded-3xl glass-heavy p-6 sm:p-9">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/10 p-2 shadow-inner">
          <img src={cinemaxLogo} alt="Cinemax" className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-white">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="mt-2 text-sm text-white/45">Your watch history stays separate from every other account on this device.</p>

        <div className="mt-6 mb-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-white/25"><span className="h-px flex-1 bg-white/10" />email account<span className="h-px flex-1 bg-white/10" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35" />}
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35" />
          <input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35" />
          {error && <p className="text-xs text-red-300">{error}</p>}
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-medium text-black hover:bg-white/85"><LogIn className="w-4 h-4" />{mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }} className="mt-5 flex w-full items-center justify-center gap-2 text-xs text-white/55 hover:text-white">{mode === "signin" ? <UserPlus className="w-3.5 h-3.5" /> : <LogIn className="w-3.5 h-3.5" />}{mode === "signin" ? "Create a local account" : "I already have an account"}</button>
      </div>
    </div>
  );
}