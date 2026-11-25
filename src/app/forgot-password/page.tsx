"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowRight, MailCheck } from "lucide-react";
import { getAPIURL } from "../../lib/apiClient";
import { emailProblem } from "../../lib/passwordReset";

// Shown for every valid address: the shop never says whether an account exists
const SENT = "If an account exists for that email address, we have sent a link to reset the password. The link expires in 30 minutes.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = emailProblem(email);
    if (problem) { setError(problem); return; }
    setError("");
    setBusy(true);
    try {
      const res = await axios.post(`${getAPIURL()}/auth/forgot-password`, { email: email.trim() });
      setSent(res.data?.message || SENT);
    } catch (err) {
      const e2 = err as { response?: { status?: number; data?: { message?: string } } };
      setError(e2.response?.data?.message || (e2.response?.status === 429
        ? "Too many password reset requests. Please try again in 15 minutes."
        : "Something went wrong. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-6 py-16">
      <div className="max-w-lg w-full">
        <h1 className="font-sans font-bold text-4xl md:text-5xl text-slate-900 mb-3">Forgot Password</h1>
        {sent ? (
          <div className="space-y-6">
            <div className="flex gap-3 bg-emerald-50 text-emerald-800 p-5 rounded-xl text-sm font-medium border border-emerald-100" role="status">
              <MailCheck size={20} className="shrink-0" />
              <p>{sent}</p>
            </div>
            <p className="font-sans text-sm text-slate-500">Did not get it? Check your spam folder, or try again in a minute.</p>
            <Link href="/sign-in" className="inline-flex items-center min-h-[44px] font-bold text-sm text-slate-800 underline">Back to Sign In</Link>
          </div>
        ) : (
          <>
            <p className="font-sans text-slate-500 text-base mb-10">Enter the email address of your account and we will send you a link to choose a new password.</p>
            <form onSubmit={onSubmit} className="space-y-7" noValidate>
              <div>
                <label htmlFor="email" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">Email Address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors ${error ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"}`}
                  aria-invalid={error ? "true" : "false"}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && <p id="email-error" className="mt-2 text-sm text-red-500" role="alert">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[#0A192F] text-white font-bold text-base rounded-xl py-4 sm:py-5 flex items-center justify-center gap-2 group hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 disabled:opacity-70"
              >
                {busy ? "Sending..." : "Send Reset Link"}
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:transform-none" />
              </button>
            </form>
            <div className="mt-8 text-center">
              <Link href="/sign-in" className="inline-flex items-center min-h-[44px] font-sans text-sm text-slate-500 hover:text-slate-900">Remembered it? <span className="font-bold text-slate-800">Sign In</span></Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
