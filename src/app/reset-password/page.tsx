"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { getAPIURL } from "../../lib/apiClient";
import { resetFormProblem, resetTokenFrom } from "../../lib/passwordReset";

function ResetPasswordForm() {
  const params = useSearchParams();
  const [token] = useState(() => resetTokenFrom(params.get("token")));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  // The one-time token stays in memory only: removed from the address bar and browser history right away
  useEffect(() => {
    if (window.location.search.includes("token=")) window.history.replaceState(null, "", "/reset-password");
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = resetFormProblem(password, confirm);
    if (problem) { setError(problem); return; }
    setError("");
    setBusy(true);
    try {
      const res = await axios.post(`${getAPIURL()}/auth/reset-password`, { token, password, confirmPassword: confirm });
      // Signed out on this browser too: the new password is used to sign in (never an automatic sign-in)
      localStorage.removeItem("luxygalleria_user");
      setPassword(""); setConfirm("");
      setDone(res.data?.message || "Your password has been reset. Please sign in with your new password.");
    } catch (err) {
      const e2 = err as { response?: { status?: number; data?: { message?: string } } };
      setError(e2.response?.data?.message || (e2.response?.status === 429
        ? "Too many attempts. Please try again in 15 minutes."
        : "Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3 bg-emerald-50 text-emerald-800 p-5 rounded-xl text-sm font-medium border border-emerald-100" role="status">
          <CheckCircle2 size={20} className="shrink-0" />
          <p>{done}</p>
        </div>
        <Link href="/sign-in" className="inline-flex items-center gap-2 bg-[#0A192F] text-white font-bold text-base rounded-xl px-6 py-4 hover:bg-slate-800">
          Sign In <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <p className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100" role="alert">
          This reset link is invalid or incomplete. Please request a new one.
        </p>
        <Link href="/forgot-password" className="inline-block font-bold text-sm text-slate-800 underline">Request a new reset link</Link>
      </div>
    );
  }

  const field = "w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors pr-14";
  return (
    <form onSubmit={onSubmit} className="space-y-7" noValidate>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100" role="alert">
          {error}
          {/invalid or has expired/.test(error) && (
            <Link href="/forgot-password" className="block mt-2 font-bold underline">Request a new reset link</Link>
          )}
        </div>
      )}
      <div>
        <label htmlFor="password" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">New Password</label>
        <div className="relative">
          <input id="password" type={show ? "text" : "password"} autoComplete="new-password" value={password}
            onChange={(e) => setPassword(e.target.value)} className={`${field} border-slate-100`} />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none">
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">At least 8 characters, with upper and lower case letters, a number and a symbol.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">Confirm New Password</label>
        <input id="confirm" type={show ? "text" : "password"} autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} className={`${field} border-slate-100`} />
      </div>
      <button type="submit" disabled={busy}
        className="w-full bg-[#0A192F] text-white font-bold text-base rounded-xl py-4 sm:py-5 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 disabled:opacity-70">
        {busy ? "Saving..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-6 py-16">
      <div className="max-w-lg w-full">
        <h1 className="font-sans font-bold text-4xl md:text-5xl text-slate-900 mb-3">Reset Password</h1>
        <p className="font-sans text-slate-500 text-base mb-10">Choose a new password for your Luxy Galleria account.</p>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
