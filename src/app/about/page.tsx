"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>About Us – LUXY GALLERIA</title>
      <meta name="description" content="Learn about Luxy Galleria — India's premium destination for imported chocolates, drinks & global treats." />

      <main className="min-h-screen bg-slate-50">
        {/* Hero */}
        <section
          className="relative w-full pt-32 md:pt-40 pb-36 md:pb-48"
          style={{ background: "linear-gradient(135deg, #2C1A10 0%, #422812 50%, #6B5344 100%)" }}
        >
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div
              className="md:hidden flex justify-center mb-8"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(1rem)", transition: "opacity 0.5s ease 50ms, transform 0.5s ease 50ms" }}
            >
              <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-white/10 px-5 py-2.5 rounded-full border border-white/20">
                <ChevronLeft size={16} /> Back to Home
              </Link>
            </div>
            <h1
              className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(1rem)", transition: "opacity 0.6s ease 200ms, transform 0.6s ease 200ms" }}
            >
              About Us
            </h1>
            <p
              className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(1rem)", transition: "opacity 0.6s ease 300ms, transform 0.6s ease 300ms" }}
            >
              India's premium destination for imported chocolates, drinks & global treats.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="relative z-10 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto -mt-20 md:-mt-24 mb-20">
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 lg:p-16 border border-slate-100 space-y-10 text-slate-700 leading-relaxed font-sans">

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Who We Are</h2>
              <p>
                Luxy Galleria is a premium online store dedicated to bringing the world's finest imported snacks, beverages, and specialty food products directly to your doorstep across India. We believe that great taste knows no borders, and everyone deserves access to quality global products.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Story</h2>
              <p>
                Founded with a passion for global flavours, Luxy Galleria started as a small curated collection of hard-to-find international products. Today, we serve thousands of happy customers across India, offering a carefully selected range of imported chips, chocolates, energy drinks, exotic snacks, and more — all sourced from trusted international suppliers.
              </p>
            </section>

            <section className="bg-[#8B5E34]/10 p-6 md:p-8 rounded-2xl text-center">
              <h2 className="text-2xl font-bold text-[#8B5E34] mb-3">Luxy Snack Station</h2>
              <p className="text-lg text-slate-800 font-medium italic">
                Watch, unbox, and experience<br/>
                Luxy Galleria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Offer</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Premium imported snacks from across the globe</li>
                <li>International beverages and energy drinks</li>
                <li>Exotic chocolates and confectioneries</li>
                <li>Specialty food products unavailable locally</li>
                <li>Fast, reliable delivery across India</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Promise</h2>
              <p>
                Every product on Luxy Galleria is handpicked for quality and authenticity. We are committed to providing a seamless shopping experience — from browsing to delivery — with transparent pricing, secure payments, and responsive customer support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Find Us On Social Media</h2>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                <a href="https://www.facebook.com/share/1BLZJWnKyP/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-[#8B5E34] hover:text-[#5A3A1E] font-medium transition-colors">
                  Facebook
                </a>
                <span className="text-slate-300">|</span>
                <a href="https://www.instagram.com/luxygalleria?igsh=aDhpM2Zoc3FvejQw" target="_blank" rel="noopener noreferrer" className="text-[#8B5E34] hover:text-[#5A3A1E] font-medium transition-colors">
                  Instagram (@luxygalleria)
                </a>
                <span className="text-slate-300">|</span>
                <a href="https://www.instagram.com/luxysnackstation?igsh=MXAyNWQwZmZtaHoydQ==" target="_blank" rel="noopener noreferrer" className="text-[#8B5E34] hover:text-[#5A3A1E] font-medium transition-colors">
                  Instagram (@luxysnackstation)
                </a>
                <span className="text-slate-300">|</span>
                <a href="https://www.snapchat.com/add/luxygalleria" target="_blank" rel="noopener noreferrer" className="text-[#8B5E34] hover:text-[#5A3A1E] font-medium transition-colors">
                  Snapchat
                </a>
                <span className="text-slate-300">|</span>
                <a href="https://youtube.com/@luxysnackstation?si=oqzX6swsa1f5hYBz" target="_blank" rel="noopener noreferrer" className="text-[#8B5E34] hover:text-[#5A3A1E] font-medium transition-colors">
                  YouTube
                </a>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
              <p className="mb-2">Email: <a href="mailto:infoluxygalleria@gmail.com" className="text-[#8B5E34] hover:text-[#5A3A1E] transition-colors">infoluxygalleria@gmail.com</a></p>
              <p>Phone: <a href="tel:+919074881551" className="text-[#8B5E34] hover:text-[#5A3A1E] transition-colors">+91 9074881551</a></p>
            </section>

          </div>
        </section>
      </main>
    </>
  );
}
