"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const SECTIONS = [
  {
    id: "no-cash-refunds",
    title: "No Cash Refunds",
    text: "We do not offer cash or monetary refunds. For eligible issues, we may provide a replacement or store credit after verification.",
  },
  {
    id: "damaged-missing-incorrect",
    title: "Damaged, Missing or Incorrect Items",
    text: "If your order arrives damaged, incomplete or incorrect, contact us within 24 hours of delivery with your order number and clear photos/videos of the package and products.",
  },
  {
    id: "chocolate-melting",
    title: "Chocolate Melting",
    text: "Chocolate may soften or melt during transit due to Kerala's heat. We take reasonable precautions to minimise this risk, but minor melting or softening due to temperature is not eligible for replacement or store credit.",
  },
  {
    id: "returns-exchanges",
    title: "Returns & Exchanges",
    text: "As we sell food products, we do not accept returns or exchanges for change of mind, incorrect product selection or personal preference.",
  },
  {
    id: "cancellation",
    title: "Cancellation",
    text: "Orders can be cancelled only before dispatch. Once dispatched, cancellation is not possible.",
  },
];

const eyebrowCls = "font-sans font-semibold text-[11px] md:text-xs tracking-[0.3em] uppercase";

export default function RefundReplacementPolicyPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const fade = (delay: number) => ({
    opacity: heroVisible ? 1 : 0,
    transform: heroVisible ? "translateY(0)" : "translateY(1rem)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  return (
    <>
      <title>Refund &amp; Replacement Policy | Luxy Galleria</title>
      <meta
        name="description"
        content="Read the Refund & Replacement Policy for Luxy Galleria, including damaged items, missing items, chocolate melting, returns, exchanges and order cancellation."
      />

      <main id="top" className="bg-background">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section
          className="w-full px-5 pt-8 md:pt-12 lg:pt-14 pb-10 md:pb-14 lg:pb-16"
          style={{
            background:
              "linear-gradient(135deg, #2C1810 0%, #5A3A1E 40%, #8B5E34 100%)",
          }}
        >
          <div className="max-w-[60rem] mx-auto text-center">
            <div className="md:hidden flex justify-center mb-6" style={fade(50)}>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-xs font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20"
              >
                <ChevronLeft size={14} />
                Back to Home
              </Link>
            </div>

            <p className={`${eyebrowCls} text-[#E6D3B5] mb-4`} style={fade(150)}>
              Policy
            </p>
            <h1
              className="font-serif font-normal text-[32px] sm:text-5xl lg:text-6xl text-white leading-[1.1] text-balance mb-5"
              style={fade(200)}
            >
              Refund &amp; Replacement Policy
            </h1>
            <p
              className="text-white/75 text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-pretty"
              style={fade(300)}
            >
              At Luxy Galleria, we carefully pack every order to ensure your products reach you safely.
            </p>
          </div>
        </section>

        {/* ── Policy: section index (desktop) + open editorial sections ── */}
        <section className="max-w-[1100px] mx-auto px-5 md:px-10 py-10 md:py-14 lg:py-16">
          <div className="grid lg:grid-cols-12 lg:gap-16">
            <nav aria-label="Policy sections" className="hidden lg:block lg:col-span-4">
              <div className="sticky top-36">
                <p className={`${eyebrowCls} text-[#8B5E34] mb-5`}>In this policy</p>
                <ol className="border-l border-[#A68B5B]/25 space-y-1">
                  {SECTIONS.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="flex gap-3 -ml-px border-l border-transparent hover:border-[#8B5E34] pl-4 py-1.5 text-sm text-slate-500 hover:text-[#5A3A1E] transition-colors"
                      >
                        <span className="tabular-nums text-[#A68B5B]">{String(i + 1).padStart(2, "0")}</span>
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <div className="lg:col-span-8">
              {SECTIONS.map((s, i) => (
                <section
                  key={s.id}
                  id={s.id}
                  aria-labelledby={`${s.id}-heading`}
                  className="scroll-mt-36 py-7 md:py-7 border-b border-[#A68B5B]/20 first:pt-0"
                >
                  <p className="font-sans text-xs font-semibold tabular-nums tracking-[0.2em] text-[#A68B5B] mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2
                    id={`${s.id}-heading`}
                    className="font-serif font-medium text-[22px] md:text-[26px] text-[#3D2516] leading-snug mb-3"
                  >
                    {s.title}
                  </h2>
                  <p className="font-sans text-[15px] md:text-base leading-[1.7] text-slate-600 max-w-2xl">
                    {s.text}
                  </p>
                </section>
              ))}

              {/* Verification / jurisdiction note */}
              <div className="mt-8 border-l-2 border-[#8B5E34] bg-[#8B5E34]/[0.04] px-5 py-5 md:px-7 md:py-6">
                <p className="font-sans text-[15px] md:text-base leading-[1.7] text-slate-700">
                  All claims are subject to verification by Luxy Galleria.
                </p>
                <p className="font-sans text-[15px] md:text-base font-bold text-slate-900 mt-1">
                  Jurisdiction: Thalassery Courts, Kerala.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
