"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, Gem, Heart, Store, Gift, Truck } from "lucide-react";

const WHY = [
  { Icon: Globe, title: "A World of Flavours", text: "Discover chocolates, snacks, drinks and food products from different parts of the world." },
  { Icon: Gem, title: "Rare Finds", text: "We constantly look for interesting, unusual and hard-to-find international products." },
  { Icon: Heart, title: "Flavours With Memories", text: "Rediscover childhood favourites and products that remind you of travel, family and life abroad." },
  { Icon: Store, title: "Shop In-Store or Online", text: "Explore our physical store in Thalassery or order online from wherever you are in India." },
  { Icon: Gift, title: "Made for Gifting", text: "From premium chocolates to curated snack hampers, find something special to share." },
  { Icon: Truck, title: "Delivered Across Kerala", text: "Get your favourite imported snacks delivered to your doorstep." },
];

const FLAVOURS = [
  ["🍫", "Imported chocolates"],
  ["🍿", "International snacks and chips"],
  ["🍜", "Korean ramen and instant noodles"],
  ["🥤", "Imported soft drinks and beverages"],
  ["⚡", "Energy drinks"],
  ["🍬", "Candies, gummies, gums and mints"],
  ["🍪", "Imported biscuits and wafers"],
  ["☕", "International instant coffee"],
  ["🥜", "Spreads and speciality food products"],
  ["🎁", "Premium chocolate and snack hampers"],
  ["🌎", "Rare and hard-to-find international products"],
];

const DARK_BG = "linear-gradient(135deg, #2C1A10 0%, #422812 50%, #6B5344 100%)";
const wrapCls = "max-w-[1200px] mx-auto px-5 md:px-10";
const eyebrowCls = "font-sans font-semibold text-[11px] md:text-xs tracking-[0.3em] uppercase text-[#8B5E34]";
const h2Cls = "font-serif font-medium text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] text-slate-900 leading-[1.15]";
const bodyCls = "font-sans text-base md:text-[17px] leading-[1.85] text-slate-600";
// Long-form reading column: ~46rem (736px) on desktop, full width with page padding on mobile.
const proseCls = `w-full max-w-[46rem] space-y-5 md:space-y-6 ${bodyCls}`;

// Serif heading + optional subheading + short gold rule, used for the editorial split sections.
function SectionHead({ title, sub, center = false }: { title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : undefined}>
      <h2 className={h2Cls}>{title}</h2>
      {sub && <p className="font-serif italic text-lg md:text-xl text-[#8B5E34] mt-3">{sub}</p>}
      <span aria-hidden="true" className={`block w-12 h-px bg-[#A68B5B] mt-5 ${center ? "mx-auto" : ""}`} />
    </div>
  );
}

export default function AboutPage() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);
  const fade = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(1rem)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
  });

  return (
    <>
      <title>About Us – Luxy Galleria</title>
      <meta name="description" content="Luxy Galleria is an imported snacks, chocolates, and drinks store in Thalassery, Kerala. Discover flavours from around the world, in-store and online." />

      <main className="bg-background">
        {/* About Luxy Galleria — compact intro above the Our Story hero */}
        <section className="pt-6 md:pt-12 lg:pt-14 pb-10 md:pb-14 lg:pb-16">
          <div className={wrapCls}>
            <div className="md:hidden mb-5" style={fade(50)}>
              <Link href="/" className="inline-flex items-center gap-2 text-[#5A3A1E] hover:text-[#8B5E34] text-sm font-semibold bg-white px-4 py-2 rounded-full border border-[#A68B5B]/25">
                <ChevronLeft size={16} /> Back to Home
              </Link>
            </div>
            <div className="max-w-[46rem] mx-auto text-center" style={fade(150)}>
              <p className={`${eyebrowCls} mb-4`}>About Luxy Galleria</p>
              <h1 className={`${h2Cls} text-balance`}>Bringing the World of Snacks Closer to You</h1>
              <span aria-hidden="true" className="block w-12 h-px bg-[#A68B5B] mx-auto mt-4 mb-6 md:mt-5 md:mb-7" />
            </div>
            <div className={`${proseCls} space-y-4! md:space-y-5! mx-auto text-center text-pretty`} style={fade(300)}>
              <p className="font-serif text-xl md:text-2xl leading-snug text-slate-900">
                Welcome to Luxy Galleria, a destination for imported chocolates, snacks, drinks and food products from around the world.
              </p>
              <p>
                Based in Thalassery, Kerala, we bring together international flavours, rare finds and familiar favourites under one roof, making it easier for snack lovers to discover something new or rediscover something they already love.
              </p>
              <p>
                From imported chocolates and Korean ramen to international chips, drinks, candies, gums, biscuits, coffee, spreads and more, our collection is constantly evolving with new products and exciting discoveries.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story — dark editorial hero, story continues below */}
        <section className="w-full py-12 md:py-16 lg:py-20" style={{ background: DARK_BG }}>
          <div className={wrapCls}>
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 lg:items-end">
              <div className="lg:col-span-5" style={fade(150)}>
                <p className={`${eyebrowCls} text-[#D9C2A0] mb-4`}>Luxy Galleria</p>
                <h2 className="font-serif font-normal text-[34px] sm:text-5xl lg:text-6xl text-white leading-[1.05] uppercase tracking-wide">
                  Our Story
                </h2>
              </div>
              <p
                className="lg:col-span-7 lg:border-l lg:border-white/15 lg:pl-10 font-serif text-xl md:text-2xl text-[#F5F1E8] leading-snug max-w-2xl"
                style={fade(300)}
              >
                Luxy Galleria started with two brothers and a love for the flavours we grew up with.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-white border-b border-[#A68B5B]/10 py-12 md:py-20 lg:py-24">
          <div className={wrapCls}>
            <div className="max-w-[46rem] mx-auto space-y-8 md:space-y-12">
              <div className={proseCls}>
                <p>
                  We spent part of our lives in Saudi Arabia, where we were surrounded by snacks, chocolates and drinks from different parts of the world.
                </p>
                <p>After coming back to Kerala, we often found ourselves looking for those same products and flavours.</p>
                <p className="font-serif italic text-xl md:text-2xl text-slate-900">Sometimes we found them. Sometimes we didn&apos;t.</p>
              </div>
              <div className={proseCls}>
                <p>That is where the idea for Luxy Galleria began.</p>
                <p>In 2022, we started with a simple thought.</p>
                <p>
                  We wanted to create a place where people in Kerala could find authentic treats from around the world, all in one place.
                </p>
              </div>
              <div className={proseCls}>
                <p>What started between two brothers has slowly grown into something much bigger than we imagined.</p>
                <p>
                  Today, we bring products from{" "}
                  <strong className="font-semibold text-[#5A3A1E]">more than 18 countries</strong> to people across Kerala.
                </p>
                <p>But honestly, the products are only one part of what makes this place special to us.</p>
              </div>
              <ul className="border-l-2 border-[#A68B5B]/40 pl-5 md:pl-7 space-y-3 font-serif italic text-lg md:text-xl leading-snug text-slate-800">
                <li>We love seeing someone find a chocolate they remember from years ago.</li>
                <li>We love watching people discover something they have never tried before.</li>
                <li>We love when customers come back and tell us about something they bought last time.</li>
                <li>And we especially love seeing people walk in with friends or family and introduce them to something they found here.</li>
              </ul>
              <div>
                <span aria-hidden="true" className="block w-12 h-px bg-[#A68B5B] mb-6" />
                <p className="font-serif text-2xl md:text-3xl leading-snug text-[#5A3A1E] text-balance">
                  For us, Luxy Galleria is a place to discover something new, find an old favourite and sometimes take home a little memory.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. More Than Just Snacks — editorial split with a vertical rule */}
        <section className="bg-white border-y border-[#A68B5B]/10 py-14 md:py-20 lg:py-24">
          <div className={`${wrapCls} grid lg:grid-cols-12 gap-8 lg:gap-0`}>
            <div className="lg:col-span-5 lg:pr-16">
              <div className="lg:sticky lg:top-36">
                <SectionHead title="More Than Just Snacks" />
              </div>
            </div>
            <div className={`lg:col-span-7 lg:border-l lg:border-[#A68B5B]/20 lg:pl-16 ${proseCls}`}>
              <p className="font-serif text-xl md:text-2xl leading-snug text-slate-900">For us, snacks can carry memories.</p>
              <p>
                A particular chocolate can remind you of childhood. A drink can take you back to a holiday. A familiar snack can remind you of living abroad, family, friends or a place you once called home.
              </p>
              <p>
                For the Malayali and NRI community, imported products can be especially meaningful — sometimes they are simply something new to try, and sometimes they are a small taste of a familiar world.
              </p>
              <p>That is what makes Luxy Galleria different.</p>
              <div className="border-l-2 border-[#A68B5B]/40 pl-5 space-y-1 font-serif text-lg md:text-xl text-[#5A3A1E]">
                <p>We don&apos;t just want you to find a snack.</p>
                <p className="italic">We want you to find something you&apos;ll remember.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Discover Flavours — scannable pill list */}
        <section className="py-14 md:py-20 lg:py-24">
          <div className={wrapCls}>
            <SectionHead title="Discover Flavours From Around the World" center />
            <p className={`${bodyCls} text-center max-w-[42rem] mx-auto mt-6 md:mt-8 text-pretty`}>
              Our collection includes products from different countries and regions, giving you the chance to explore international flavours without having to travel thousands of kilometres.
            </p>
            <p className={`${eyebrowCls} text-center mt-8 md:mt-10 mb-4`}>You will find:</p>
            <ul className="flex flex-wrap justify-center gap-1.5 md:gap-3 max-w-4xl mx-auto">
              {FLAVOURS.map(([emoji, label]) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 bg-white border border-[#A68B5B]/20 rounded-full px-3 py-1 md:px-4 md:py-2 text-[14px] md:text-[15px] leading-snug text-slate-700"
                >
                  <span aria-hidden="true">{emoji}</span>
                  {label}
                </li>
              ))}
            </ul>
            <p className={`${bodyCls} text-center max-w-[46rem] mx-auto mt-8 md:mt-10 text-pretty`}>
              Whether you&apos;re searching for imported chocolates in Kannur, Calicut, Kochi, Thrissur, Trivandrum or anywhere in Kerala, whether you want to buy Korean ramen, international snacks, imported drinks or unique gift hampers, there&apos;s always something new to discover at Luxy Galleria.
            </p>
          </div>
        </section>

        {/* 5. Why Luxy Galleria? — phones: 1 col, icon beside text; 2 cols from sm; 3 cols from lg */}
        <section className="bg-white border-y border-[#A68B5B]/10 py-14 md:py-20 lg:py-24">
          <div className={wrapCls}>
            <div className="mb-8 md:mb-12">
              <SectionHead title="Why Luxy Galleria?" center />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {WHY.map(({ Icon, title, text }) => (
                <div
                  key={title}
                  className="group flex sm:block gap-4 bg-background rounded-lg border border-[#A68B5B]/15 p-4 md:p-6 lg:p-7 transition-all duration-300 hover:border-[#A68B5B]/45 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(90,58,30,0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white text-[#8B5E34] flex items-center justify-center sm:mb-4 transition-colors group-hover:bg-[#8B5E34] group-hover:text-white">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-slate-900 leading-snug mb-1 md:mb-2">{title}</h3>
                    <p className="font-sans text-[15px] text-slate-500 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
