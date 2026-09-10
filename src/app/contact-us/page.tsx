"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";
import axios from "axios";

// ─── Validation Schema ────────────────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactCardData {
  id: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  primary: string;
  secondary?: string;
  additional?: string[];
  href?: string;
  ariaLabel: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CONTACT_CARDS: ContactCardData[] = [
  {
    id: "call",
    Icon: Phone,
    title: "Call Us",
    primary: "+91 907 4881 551",
    // secondary: "Mon – Sat: 9AM – 7PM",
    href: "tel:+919074881551",
    ariaLabel: "Call us at +91 907 4881 551",
  },
  {
    id: "email",
    Icon: Mail,
    title: "Email Us",
    primary: "infoluxygalleria@gmail.com",
    href: "mailto:infoluxygalleria@gmail.com",
    ariaLabel: "Email us at infoluxygalleria@gmail.com",
  },
  {
    id: "hours",
    Icon: Clock,
    title: "Working Hours",
    primary: "Monday – Friday: 9AM – 8PM",
    additional: ["Saturday: 10AM – 6PM", "Sunday: Closed"],
    ariaLabel: "Working hours: Monday to Friday 9AM to 8PM",
  },
];

// ─── Animated visibility hook ─────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Contact Card ─────────────────────────────────────────────────────────────

function ContactCard({
  card,
  delay,
}: {
  card: ContactCardData;
  delay: number;
}) {
  const { ref, visible } = useInView();

  return (
    <div
      ref={ref}
      className="h-full group"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(2rem)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-100 p-8 md:p-10 text-center shadow-sm
                   md:group-hover:shadow-xl md:group-hover:-translate-y-1.5 transition-all duration-400 ease-out h-full"
        aria-label={`${card.title} contact information`}
      >
        <div
          className="icon-box w-16 h-16 rounded-2xl bg-[#8B5E34] flex items-center justify-center mx-auto mb-6 transition-all duration-400 ease-out md:group-hover:scale-110 md:group-hover:bg-[#6B4423] md:group-hover:shadow-md"
        >
          <card.Icon size={28} className="text-white" />
        </div>

        <h3 className="font-sans font-bold text-xl md:text-2xl text-slate-900 mb-3 transition-colors duration-400 md:group-hover:text-[#5A3A1E]">
          {card.title}
        </h3>

        {card.href ? (
          <a
            href={card.href}
            aria-label={card.ariaLabel}
            className="font-semibold text-base md:text-lg text-[#5A3A1E] hover:text-[#8B5E34] transition-colors mb-2 block break-all"
          >
            {card.primary}
          </a>
        ) : (
          <p className="font-semibold text-base md:text-lg text-[#5A3A1E] mb-2">
            {card.primary}
          </p>
        )}

        {card.secondary && (
          <p className="text-slate-500 text-sm md:text-base">{card.secondary}</p>
        )}

        {card.additional?.map((line) => (
          <p key={line} className="text-slate-500 text-sm md:text-base">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder:text-slate-400 text-sm font-sans focus:outline-none focus:border-[#A68B5B]/50 focus:ring-2 focus:ring-[#A68B5B]/50/20 focus:bg-white transition-all duration-200 autofill:bg-slate-50";

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <label className="font-sans font-semibold text-sm text-slate-900 mb-2">
        {label}
        {required && (
          <span className="text-red-500 ml-0.5" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-red-500 text-xs mt-1.5 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const { ref, visible } = useInView(0.1);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
  });

  const [submitError, setSubmitError] = useState("");

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitError("");
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const response = await axios.post(`${apiURL}/contacts`, data);
      if (response.data.success) {
        setSubmitted(true);
      }
    } catch (error: any) {
      console.error("Failed to submit form:", error);
      setSubmitError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    reset();
  };

  return (
    <section
      className="w-full bg-slate-100 py-12 md:py-16 lg:py-20"
      aria-label="Contact form section"
    >
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <div
          ref={ref}
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(1.5rem)",
            transition: "opacity 0.6s ease 100ms, transform 0.6s ease 100ms",
          }}
        >
          {/* Blue top accent */}
          <div
            className="h-1 bg-[#A68B5B]/50 w-full"
            style={{
              transform: visible ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "center",
              transition: "transform 0.5s ease 300ms",
            }}
          />

          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8 md:mb-10">
              <h2 className="font-sans font-bold text-3xl md:text-4xl text-slate-900 mb-4">
                Send us a Message
              </h2>
              <p className="font-sans text-slate-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>
            </div>

            {submitted ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center justify-center py-14 gap-5 text-center">
                <div className="w-20 h-20 rounded-full bg-[#A68B5B]/5 flex items-center justify-center">
                  <CheckCircle2 size={42} className="text-[#8B5E34]" />
                </div>
                <h3 className="font-bold text-2xl text-slate-900">
                  Message Sent!
                </h3>
                <p className="text-slate-500 max-w-sm leading-relaxed">
                  Thank you for reaching out. Our team will get back to you
                  within 24 hours.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-2 px-8 py-3 bg-[#8B5E34] text-white font-bold text-sm uppercase tracking-[0.15em] rounded-full hover:bg-[#6B4423] transition-colors duration-300 shadow-lg shadow-[#A68B5B]/50/30 focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2"
                >
                  Send Another
                </button>
              </div>
            ) : (
              /* ── Form ── */
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                aria-label="Contact form"
                className="space-y-6 md:space-y-8"
              >
                {/* Row 1: Name + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <FieldWrapper
                    label="Your Name"
                    required
                    error={errors.name?.message}
                  >
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      aria-required="true"
                      aria-describedby={
                        errors.name ? "name-error" : undefined
                      }
                      {...register("name")}
                      className={`${inputCls} ${errors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                        }`}
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Email Address"
                    required
                    error={errors.email?.message}
                  >
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      aria-required="true"
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                      {...register("email")}
                      className={`${inputCls} ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                        }`}
                    />
                  </FieldWrapper>
                </div>

                {/* Row 2: Phone + Subject */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <FieldWrapper label="Phone Number" error={errors.phone?.message}>
                    <input
                      id="contact-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      {...register("phone")}
                      className={inputCls}
                    />
                  </FieldWrapper>

                  <FieldWrapper label="Subject" error={errors.subject?.message}>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="How can we help?"
                      {...register("subject")}
                      className={inputCls}
                    />
                  </FieldWrapper>
                </div>

                {/* Row 3: Message (full width) */}
                <FieldWrapper
                  label="Your Message"
                  required
                  error={errors.message?.message}
                >
                  <textarea
                    id="contact-message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    aria-required="true"
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                    {...register("message")}
                    className={`${inputCls} resize-y min-h-[160px] ${errors.message ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""
                      }`}
                  />
                </FieldWrapper>

                <div className="pt-2">
                  {submitError && (
                    <p className="text-red-500 text-sm font-medium mb-4 text-center">
                      {submitError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-label="Send message"
                    className="w-full mt-6 md:mt-8 flex items-center justify-center gap-3
                             bg-[#8B5E34] text-white py-4 md:py-5 rounded-full
                             font-bold text-sm tracking-[0.15em] uppercase
                             hover:bg-[#6B4423] active:scale-[0.98]
                             transition-all duration-300
                             shadow-lg shadow-[#A68B5B]/50/30
                             disabled:opacity-60 disabled:cursor-not-allowed
                             focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2
                             motion-reduce:transition-none"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactUsPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>Contact Us – LUXY GALLERIA | We&apos;d Love to Hear From You</title>
      <meta
        name="description"
        content="Get in touch with the LUXY GALLERIA team. Call, email, or send us a message — we're here to help with all your skincare needs."
      />

      <main id="top" className="min-h-screen bg-slate-50">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative w-full pt-32 md:pt-40 pb-36 md:pb-48"
          style={{
            background:
              "linear-gradient(135deg, #2C1A10 0%, #422812 50%, #6B5344 100%)",
          }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* Mobile Back to Home */}
            <div
              className="md:hidden flex justify-center mb-8"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition: "opacity 0.5s ease 50ms, transform 0.5s ease 50ms",
              }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm font-semibold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/20 backdrop-blur-sm shadow-sm"
              >
                <ChevronLeft size={16} />
                Back to Home
              </Link>
            </div>

            {/* Pill */}
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#A68B5B]/30/30
                         text-[#A68B5B]/30 mb-7 hover:border-[#A68B5B]/30/60 hover:bg-[#A68B5B]/60/10 transition-all duration-300"
              aria-label="Get in touch with our team"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition: "opacity 0.5s ease 100ms, transform 0.5s ease 100ms",
              }}
            >
              <MessageCircle size={16} />
              <span className="font-semibold text-xs tracking-[0.15em] uppercase">
                GET IN TOUCH
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition: "opacity 0.6s ease 200ms, transform 0.6s ease 200ms",
              }}
            >
              We&apos;d Love to Hear From You
            </h1>

            {/* Subheadline */}
            <p
              className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition: "opacity 0.6s ease 300ms, transform 0.6s ease 300ms",
              }}
            >
              Have questions about our products or your order? Our team is here
              to help you with everything skincare.
            </p>
          </div>
        </section>

        {/* ── Info Cards (overlapping) ──────────────────────────────── */}
        <section
          className="relative z-10 px-6 md:px-12 lg:px-20 max-w-6xl mx-auto -mt-20 md:-mt-24 mb-0"
          aria-label="Contact information cards"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {CONTACT_CARDS.map((card, i) => (
              <ContactCard key={card.id} card={card} delay={400 + i * 100} />
            ))}
          </div>
        </section>

        {/* ── Contact Form ──────────────────────────────────────────── */}
        <ContactForm />

      </main>
    </>
  );
}
