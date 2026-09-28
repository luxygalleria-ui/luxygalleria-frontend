"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, Gem, Heart, Store, Gift, Truck } from "lucide-react";

const WHY = [
  { Icon: Globe, title: "A World of Flavours", text: "Discover chocolates, snacks, drinks, and food products from different parts of the world." },
  { Icon: Gem, title: "Rare Finds", text: "Explore interesting, unusual, and hard-to-find international products." },
  { Icon: Heart, title: "Flavours With Memories", text: "Rediscover childhood favourites and products that remind you of travel, family, and life abroad." },
  { Icon: Store, title: "Shop In-Store or Online", text: "Visit our physical store in Thalassery, Kerala, or shop online from wherever you are in India." },
  { Icon: Gift, title: "Made for Gifting", text: "Discover premium chocolates, curated snack hampers, and thoughtful gifts for special occasions." },
  { Icon: Truck, title: "Delivery Across Kerala", text: "Order your favourite imported snacks from anywhere in Kerala." },
];

const h2Cls = "font-serif font-normal text-3xl md:text-4xl text-slate-900 leading-tight mb-6";

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <title>About Us – Luxy Galleria</title>
      <meta name="description" content="Luxy Galleria is an imported snacks, chocolates, and drinks store in Thalassery, Kerala. Discover flavours from around the world, in-store and online." />

      <main className="min-h-screen bg-slate-50">
        {/* 1. About Luxy Galleria */}
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
              About Luxy Galleria
            </h1>
            <p
              className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
              style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(1rem)", transition: "opacity 0.6s ease 300ms, transform 0.6s ease 300ms" }}
            >
              Imported chocolates, snacks, drinks, and food products from around the world — in our store in Thalassery, Kerala, and online.
            </p>
          </div>
        </section>

        {/* 2 + 3. Story & philosophy */}
        <section className="relative z-10 px-6 md:px-12 max-w-4xl mx-auto -mt-20 md:-mt-24">
          <div className="bg-white rounded-3xl shadow-sm p-8 md:p-12 lg:p-16 border border-slate-100 space-y-14 text-slate-600 text-base md:text-lg leading-relaxed font-sans">
            <div>
              <h2 className={h2Cls}>It Started With a Love for Discovery</h2>
              <p className="mb-6">
                Long before Luxy Galleria became a store, there was simply the excitement of discovering something different.
              </p>
              <ul className="border-l-2 border-[#A68B5B]/40 pl-5 space-y-2 mb-6 font-serif italic text-slate-800">
                <li>A chocolate you had never seen before.</li>
                <li>A drink from another country.</li>
                <li>A snack you remembered from a trip abroad.</li>
                <li>A familiar flavour that instantly took you back to a different time.</li>
              </ul>
              <p className="mb-4">
                That feeling stayed with us as we missed many of the treats we grew up with while living in Saudi Arabia.
              </p>
              <p>
                Luxy Galleria was built around that same excitement: creating a place where people can discover international products, share them with the people they love, and experience flavours from around the world.
              </p>
            </div>

            <div className="bg-[#8B5E34]/5 rounded-2xl p-6 md:p-10">
              <h2 className={h2Cls}>More Than Just Snacks</h2>
              <p className="mb-4">For us, snacks can carry memories.</p>
              <p className="mb-4">
                A particular chocolate can remind you of childhood. A drink can take you back to a holiday. A familiar snack can remind you of living abroad, family, friends, or a place you once called home.
              </p>
              <p className="mb-4">
                For the Malayali and NRI community, imported products can be especially meaningful — sometimes they are simply something new to try, and sometimes they are a small taste of a familiar world.
              </p>
              <p className="mb-6">That is what makes Luxy Galleria different.</p>
              <p className="font-serif text-xl md:text-2xl text-[#5A3A1E]">
                We don&apos;t just want you to find a snack. We want you to find something you&apos;ll remember.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Luxy Galleria? */}
        <section className="px-6 md:px-12 max-w-6xl mx-auto py-16 md:py-24">
          <h2 className={`${h2Cls} text-center`}>Why Luxy Galleria?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {WHY.map(({ Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#8B5E34] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-sans font-bold text-lg text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Our Mission */}
        <section
          className="w-full px-6 py-16 md:py-24 text-center"
          style={{ background: "linear-gradient(135deg, #2C1A10 0%, #422812 50%, #6B5344 100%)" }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif font-normal text-3xl md:text-4xl text-white leading-tight mb-6">Our Mission</h2>
            <p className="text-slate-300 text-base md:text-lg mb-2">Our mission is simple:</p>
            <p className="font-serif text-xl md:text-2xl text-white leading-snug mb-6">
              To make discovering international food more exciting, accessible, and memorable.
            </p>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-10">
              Whether you&apos;re looking for a childhood favourite, searching for a taste from abroad, hunting for a rare snack, looking for the perfect gift, or simply curious to try something you&apos;ve never had before, Luxy Galleria is here to bring the world of snacks closer to you.
            </p>
            <p className="font-sans font-semibold text-sm md:text-base tracking-wide text-[#D9C2A0]">
              Discover something new. Rediscover something familiar. Bring home a little taste of the world.
            </p>
          </div>
        </section>

        {/* 6. Shop Online or Visit Us */}
        <section className="px-6 py-16 md:py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className={h2Cls}>Shop Online or Visit Us</h2>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8">
              Explore our collection online or visit our physical store in Thalassery, Kerala, to discover your favourite international snacks and treats.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="px-8 py-3.5 bg-[#8B5E34] text-white font-bold text-sm uppercase tracking-[0.15em] rounded-full hover:bg-[#6B4423] transition-colors"
              >
                Shop Now
              </Link>
              {/* ponytail: "Get Directions" omitted until a verified store address / Maps link exists */}
              <Link
                href="/contact-us"
                className="px-8 py-3.5 border border-[#8B5E34] text-[#8B5E34] font-bold text-sm uppercase tracking-[0.15em] rounded-full hover:bg-[#8B5E34] hover:text-white transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
