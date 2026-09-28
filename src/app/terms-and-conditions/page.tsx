"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CONTACT } from "../../lib/contact";

export default function TermsAndConditionsPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>Terms & Conditions – LUXY GALLERIA</title>
      <meta
        name="description"
        content="Read the Terms & Conditions of LUXY GALLERIA. Learn about the rules and regulations for using our website."
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
              Terms & Conditions
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
              Welcome to LUXY GALLERIA. By accessing or using our website, you agree to comply with these Terms & Conditions.
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
                  These Terms & Conditions govern your access to and use of the LUXY GALLERIA website and services. By using this site, you agree to comply with these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Product Information</h2>
                <p>
                  We make every effort to present accurate product information, pricing, and availability. However, LUXY GALLERIA does not guarantee that all information is error-free.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Orders & Payments</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Orders are confirmed only after successful payment.</li>
                  <li>Payments are processed through licensed payment gateways.</li>
                  <li>We may cancel orders for stock unavailability, pricing errors, or suspected fraudulent activity.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Shipping & Delivery</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Delivery timelines are estimates and depend on the destination and courier partner.</li>
                  <li>Shipping fees are displayed during checkout and depend on the order details.</li>
                  <li>LUXY GALLERIA is not responsible for delays caused by courier services or external disruptions.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Returns & Refunds</h2>
                <p>
                  Returns and refunds are subject to our return policy. Please inspect items on delivery and raise any concerns promptly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">6. User Conduct</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate account and shipping information.</li>
                  <li>Do not use the website for unlawful or unauthorized activities.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Intellectual Property</h2>
                <p>
                  All content on this site, including text, images, logos, and designs, is the property of LUXY GALLERIA and may not be used without permission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>
                <p>
                  LUXY GALLERIA is not liable for any indirect, incidental, or consequential losses, including allergic reactions, delays, or loss of income.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Governing Law</h2>
                <p>
                  These Terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of Indian courts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
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
