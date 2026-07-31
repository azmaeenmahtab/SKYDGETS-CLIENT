"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, LogIn } from "lucide-react";

const DEMO_EMAIL = "admin@gmail.com";
const DEMO_PASS = "111111Aa";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (result?.error) {
        setError(result.error.message || "Invalid email or password.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setError("");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 pt-28 sm:pt-32 pb-12 sm:pb-16 text-zinc-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-zinc-900 via-indigo-500 to-violet-500" />

          <div className="px-8 py-8">
            {/* Logo + Heading */}
            <div className="text-center mb-7">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-xl font-black tracking-tight text-zinc-950 mb-4"
              >
                <span className="bg-zinc-950 text-white px-2 py-1 rounded-lg text-xs font-black tracking-widest">
                  SD
                </span>
                SKYDGETS
              </Link>
              <h1 className="text-2xl font-extrabold text-zinc-950">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Sign in to your account to continue
              </p>
            </div>

            {/* Demo credentials banner */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full flex items-center gap-3 bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200 rounded-xl px-4 py-3 mb-6 transition-all group text-left cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </span>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-extrabold text-zinc-950 uppercase tracking-wider">
                  Demo Admin Account
                </p>
                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                  {DEMO_EMAIL} · {DEMO_PASS}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-950 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 outline-none focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 text-white font-extrabold py-3 rounded-xl text-sm transition-all shadow-md mt-1 cursor-pointer"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {isLoading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-zinc-950 hover:underline font-extrabold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <p className="mt-4 text-center text-xs text-zinc-400">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Back to SKYDGETS
          </Link>
        </p>
      </div>
    </div>
  );
}