"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CONTACT } from "../../lib/contact";

export default function PrivacyPolicyPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>Privacy Policy – LUXY GALLERIA</title>
      <meta
        name="description"
        content="Read the Privacy Policy of LUXY GALLERIA. Learn how we collect, use, and protect your data."
      />

      <main id="top" className="min-h-screen bg-slate-50">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="relative w-full pt-32 md:pt-40 pb-36 md:pb-48"
          style={{
            background:
              "linear-gradient(135deg, #2C1810 0%, #5A3A1E 40%, #8B5E34 100%)",
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

            {/* Headline */}
            <h1
              className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition:
                  "opacity 0.6s ease 200ms, transform 0.6s ease 200ms",
              }}
            >
              Privacy Policy
            </h1>

            {/* Subheadline */}
            <p
              className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
                transition:
                  "opacity 0.6s ease 300ms, transform 0.6s ease 300ms",
              }}
            >
              At LUXY GALLERIA, we value your privacy. This policy explains how we collect and use your data.
            </p>
          </div>
        </section>

        {/* ── Content ──────────────────────────────────────────────── */}
        <section
          className="relative z-10 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto -mt-20 md:-mt-24 mb-20"
        >
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 lg:p-16 border border-slate-100">
            <p className="text-slate-500 mb-8 font-medium">Last Updated: May 2, 2026</p>

            <div className="space-y-8 text-slate-700 leading-relaxed font-sans">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                <p>
                  LUXY GALLERIA is committed to protecting your privacy. This policy explains how we collect, use, and protect your personal information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                <p className="mb-4">We may collect the following information when you use our website:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and contact details</li>
                  <li>Shipping address and order details</li>
                  <li>Payment and transaction information (processed by secure payment gateways)</li>
                  <li>Device and browser information to improve our service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Data</h2>
                <p>
                  We use your information to process orders, manage deliveries, provide customer support, and improve your experience on our website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Cookies & Tracking</h2>
                <p>
                  We use cookies and similar technologies to remember preferences, analyze website traffic, and enhance user experience.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
                <p>
                  We take appropriate measures to protect your personal data, but no internet transmission is completely secure. Payment details are handled by trusted payment providers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Sharing Information</h2>
                <p>
                  We do not sell your personal data. We may share information with delivery partners and payment processors as needed to fulfill your orders.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
                <p>
                  You may request access to your data, ask for corrections, or request deletion by contacting us at the email below.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Policy Updates</h2>
                <p>
                  We may update this policy from time to time. The latest version will always be available on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact Us</h2>
                <p className="mb-2">Email: <a href={`mailto:${CONTACT.email}`} className="text-[#8B5E34] hover:text-[#5A3A1E] transition-colors">{CONTACT.email}</a></p>
                <p>Phone: <a href={`tel:${CONTACT.phone}`} className="text-[#8B5E34] hover:text-[#5A3A1E] transition-colors">{CONTACT.phoneDisplay}</a></p>
              </section>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}