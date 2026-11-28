"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
// Google sign-in script only on pages that use it (not on checkout: its popup polling logs COOP warnings)
import GoogleOAuthWrapper from "../../components/auth/GoogleOAuthWrapper";
import { getAPIURL } from "../../lib/apiClient";
import { authErrorMessage } from "../../lib/authErrors";
import { useToast } from "../../context/ToastContext";
import { pinStateProblem } from "../../lib/addressRules";

// ─── Form Validation Schema ───
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name must be at least 2 characters.").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces."),
    email: z.string().email("Please enter a valid email address."),
    phone: z.string().optional().refine((val) => !val || /^\d{10}$/.test(val), { message: "Phone number must be 10 digits." }),
    password: z.string().min(6, "Password must be at least 6 characters.").regex(/[A-Z]/, "Password must contain at least one uppercase letter.").regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  // The address is optional; once any part of it is filled in, it follows the same rules as the server
  .superRefine((data, ctx) => {
    if (![data.street, data.city, data.state, data.zipCode].some((v) => v?.trim())) return;
    if (!data.city?.trim()) ctx.addIssue({ code: "custom", path: ["city"], message: "City is required for the address." });
    if (!data.state?.trim()) ctx.addIssue({ code: "custom", path: ["state"], message: "State is required for the address." });
    const pin = pinStateProblem({ state: data.state, zipCode: data.zipCode, country: data.country });
    if (pin) ctx.addIssue({ code: "custom", path: ["zipCode"], message: pin });
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const router = useRouter();
  const { syncCartAfterLogin } = useCart();
  const [apiError, setApiError] = useState<string | null>(null);
  const { showToast } = useToast();

  const onSubmit = async (data: RegisterValues) => {
    try {
      setApiError(null);
      const apiURL = getAPIURL();
      
      const response = await axios.post(`${apiURL}/auth/register`, {
        name: data.fullName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        // Only an address the customer actually entered (a blank one is never saved)
        addresses: [data.street, data.city, data.state, data.zipCode].some((v) => v?.trim()) ? [{
          street: data.street,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country
        }] : []
      });

      // Direct signup — account is created and logged in immediately
      if (response.data.data) {
        localStorage.setItem("luxygalleria_user", JSON.stringify(response.data.data));
        await syncCartAfterLogin(); // carry the signed-out cart into the new account
      }
      router.push("/");
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (!status || status >= 500) console.error("Registration error:", status);
      const msg = authErrorMessage(err, "register");
      setApiError(msg);
      showToast(msg, "error");
    }
  };

  const clearApiError = () => { if (apiError) setApiError(null); };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row pt-0">
      {/* ── Left Panel: Brand Context ── */}
      <div className="bg-[#F5F0EB] lg:w-5/12 flex flex-col justify-center px-6 py-8 lg:p-16 xl:p-24 relative overflow-hidden">
        <div className="max-w-md mx-auto relative z-10 w-full">
          <p className="font-sans font-bold text-xs uppercase tracking-[0.25em] text-[#A68B5B] mb-3 lg:mb-8">
            LUXY GALLERIA MEMBERSHIP
          </p>
          
          <h1 className="font-serif font-normal text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#0A192F] leading-tight">
            Join the World of Premium Imports
          </h1>
          
        </div>
      </div>

      {/* ── Right Panel: Registration Form ── */}
      <div className="bg-white lg:w-7/12 flex flex-col justify-center px-6 py-10 lg:p-16 xl:p-24 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full">
          <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl text-slate-900 mb-3">
            Create Account
          </h2>
          <p className="font-sans text-slate-500 text-base mb-10">
            Join us today for a premium experience.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            {apiError && (
              <div role="alert" aria-live="assertive" className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 break-words">
                {apiError}
              </div>
            )}
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                {...register("fullName")}
                className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors ${
                  errors.fullName ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                }`}
                aria-invalid={errors.fullName ? "true" : "false"}
              />
              {errors.fullName && <p className="mt-2 text-sm text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div>
                <label htmlFor="email" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register("email", { onChange: clearApiError })}
                  className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors ${
                    errors.email ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                  }`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  {...register("phone")}
                  className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors ${
                    errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                  }`}
                />
                {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            {/* Password & Confirm Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div>
                <label htmlFor="password" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", { onChange: clearApiError })}
                    className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors pr-14 ${
                      errors.password ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword", { onChange: clearApiError })}
                    className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors pr-14 ${
                      errors.confirmPassword ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Address Divider */}
            <div className="relative pt-6 pb-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-sans text-xs uppercase tracking-widest text-slate-400 font-bold">
                  ADDRESS (OPTIONAL)
                </span>
              </div>
            </div>

            {/* Street & City Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <div>
                <label htmlFor="street" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  Street
                </label>
                <input
                  id="street"
                  type="text"
                  placeholder="House no, street"
                  {...register("street")}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="city" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  placeholder="City"
                  {...register("city")}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* State, Zip, Country Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              <div>
                <label htmlFor="state" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  placeholder="State"
                  {...register("state")}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  PIN Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  placeholder="6-digit PIN Code"
                  {...register("zipCode")}
                  className={`w-full bg-slate-50 border rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors ${
                    errors.zipCode ? "border-red-500 ring-1 ring-red-500" : "border-slate-100"
                  }`}
                />
                {errors.zipCode && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.zipCode.message}</p>}
              </div>
              <div>
                <label htmlFor="country" className="block font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2.5">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  placeholder="Country"
                  {...register("country")}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0A192F] text-white font-bold text-base rounded-xl py-4 sm:py-5 mt-6 flex items-center justify-center gap-2 group hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 disabled:opacity-70"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"} 
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
            <GoogleOAuthWrapper><GoogleAuthButton mode="register" /></GoogleOAuthWrapper>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link 
              href="/sign-in" 
              className="inline-flex items-center min-h-[44px] font-sans text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Already have an account? <span className="font-bold text-slate-800">Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
