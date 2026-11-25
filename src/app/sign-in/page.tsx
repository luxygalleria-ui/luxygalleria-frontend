"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { useCart } from "../../context/CartContext";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
// Google sign-in script only on pages that use it (not on checkout: its popup polling logs COOP warnings)
import GoogleOAuthWrapper from "../../components/auth/GoogleOAuthWrapper";
import { getAPIURL } from "../../lib/apiClient";
import { authErrorMessage } from "../../lib/authErrors";

const ADMIN_PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.luxygalleria.com";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  const router = useRouter();
  const { syncCartAfterLogin } = useCart();
  const { showToast } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isStaffAccount, setIsStaffAccount] = useState(false);

  // Reason left by apiClient when an expired session redirected here
  useEffect(() => {
    const notice = sessionStorage.getItem("luxygalleria_auth_notice");
    if (notice) { sessionStorage.removeItem("luxygalleria_auth_notice"); setApiError(notice); }
  }, []);

  const onSubmit = async (data: SignInValues) => {
    try {
      setApiError(null);
      setIsStaffAccount(false);
      const apiURL = getAPIURL();
      const res = await axios.post(`${apiURL}/auth/customer-login`, {
        email: data.email,
        password: data.password,
      });

      // Success! Save user and redirect to home page
      if (res.data.data) {
        localStorage.setItem('luxygalleria_user', JSON.stringify(res.data.data));
        await syncCartAfterLogin(); // carry the signed-out cart into the account
      }
      showToast("Signed in successfully!", "success");
      router.push("/");
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 403) setIsStaffAccount(err.response?.data?.errors?.code === "USE_ADMIN_PORTAL");
      else if (status !== 401 && status !== 400) console.error("Sign in error:", status, err.message);
      const msg = status === 403
        ? err.response?.data?.message || "Your account cannot be accessed. Please contact support."
        : authErrorMessage(err, "signin");
      setApiError(msg);
      showToast(msg, "error");
    }
  };

  const clearApiError = () => { if (apiError) { setApiError(null); setIsStaffAccount(false); } };

  return (
    <div className="min-h-screen flex flex-col md:flex-row pt-0">
      {/* ── Left Panel: Brand Context ── */}
      <div className="bg-[#F5F0EB] md:w-1/2 flex flex-col justify-center px-6 py-0 md:p-16 lg:p-24 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#e8ddd4]/60 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#d4c5b5]/40 to-transparent rounded-full blur-2xl" />

        <div className="max-w-lg mx-auto relative z-10 w-full">
          <p className="font-sans font-bold text-xs uppercase tracking-[0.25em] text-[#A68B5B] mb-6 md:mb-8">
            LUXY GALLERIA LUXURY COMMERCE
          </p>

          <h1 className="font-serif font-normal text-4xl md:text-5xl lg:text-6xl text-[#0A192F] leading-tight mb-6">
            Discover Premium Imported Collections
          </h1>

          <p className="font-sans text-slate-600 text-base leading-relaxed mb-12 max-w-sm">
            Access exclusive imported beverages, gourmet snacks, premium chocolates, and international delicacies from Luxy Galleria. Sign in to manage your orders, wishlist, and enjoy a seamless shopping experience.
          </p>

          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck size={20} className="text-slate-900" />
            <span className="font-sans font-medium text-sm">Premium Imported Products</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Sign In Form ── */}
      <div className="bg-white md:w-1/2 flex flex-col justify-center px-6 py-10 md:p-16 lg:p-24">
        <div className="max-w-lg mx-auto w-full">
          <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-3">
            Sign In
          </h2>
          <p className="font-sans text-slate-500 text-base mb-10">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {apiError && (
              <div role="alert" aria-live="assertive" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 break-words">
                {apiError}
                {isStaffAccount && (
                  <a href={ADMIN_PORTAL_URL} className="block mt-2 font-bold underline">Go to the admin portal</a>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register("email", { onChange: clearApiError })}
                className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                  }`}
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-500" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { onChange: clearApiError })}
                  className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors pr-14 ${errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                    }`}
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-500" role="alert">
                  {errors.password.message}
                </p>
              )}

              <div className="mt-3 text-right">
                <Link href="/forgot-password" className="inline-flex items-center min-h-[44px] font-sans text-sm text-slate-500 hover:text-slate-800 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0A192F] text-white font-bold text-base rounded-xl py-4 sm:py-5 flex items-center justify-center gap-2 group hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:transform-none" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 font-sans text-xs uppercase tracking-widest text-slate-400 font-bold">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Google SSO */}
          <div className="mb-10">
            <GoogleOAuthWrapper><GoogleAuthButton mode="signin" /></GoogleOAuthWrapper>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex flex-wrap items-center justify-center gap-1.5 min-h-[44px] font-sans text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              New to Luxy Galleria? <span className="font-bold text-slate-800">Create Account</span> <UserPlus size={16} className="text-slate-800" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
