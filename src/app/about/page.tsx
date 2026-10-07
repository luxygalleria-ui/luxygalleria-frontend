"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Globe, Gem, Heart, Store, Gift, Truck, MapPin, MessageCircle, Mail } from "lucide-react";
import { CONTACT } from "../../lib/contact";

const WHY = [
  { Icon: Globe, title: "A World of Flavours", text: "Discover chocolates, snacks, drinks and food products from different parts of the world." },
  { Icon: Gem, title: "Rare Finds", text: "We constantly look for interesting, unusual and hard-to-find international products." },
  { Icon: Heart, title: "Flavours With Memories", text: "Rediscover childhood favourites and products that remind you of travel, family and life abroad." },
  { Icon: Store, title: "Shop In-Store or Online", text: "Explore our physical store in Thalassery or order online from wherever you are in India." },
  { Icon: Gift, title: "Made for Gifting", text: "From premium chocolates to curated snack hampers, find something special to share." },
  { Icon: Truck, title: "Delivered Across Kerala", text: "Get your favourite imported snacks delivered to your doorstep." },
];

// Same official account as the footer.
const INSTAGRAM = "https://www.instagram.com/luxygalleria";
const linkCls = "font-semibold text-[#8B5E34] hover:text-[#5A3A1E] underline decoration-[#8B5E34]/30 underline-offset-4 transition-colors";
const wrapCls = "max-w-[1200px] mx-auto px-5 md:px-10";
const eyebrowCls = "font-sans font-semibold text-[11px] md:text-xs tracking-[0.3em] uppercase text-[#8B5E34]";
const h2Cls = "font-serif font-normal text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] text-slate-900 leading-[1.15]";
const bodyCls = "font-sans text-base md:text-[17px] leading-[1.75] text-slate-600";

// Eyebrow + serif heading + short gold rule, used for the editorial split sections.
function SectionHead({ eyebrow, title, center = false }: { eyebrow: string; title: ReactNode; center?: boolean }) {
  return (
    <div className={center ? "text-center" : undefined}>
      <p className={`${eyebrowCls} mb-3`}>{eyebrow}</p>
      <h2 className={h2Cls}>{title}</h2>
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
        {/* 1. Hero */}
        <section
          className="w-full pt-10 md:pt-16 lg:pt-20 pb-12 md:pb-16 lg:pb-20"
          style={{ background: "linear-gradient(135deg, #2C1A10 0%, #422812 50%, #6B5344 100%)" }}
        >
          <div className={wrapCls}>
            <div className="md:hidden mb-8" style={fade(50)}>
              <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-white/10 px-5 py-2.5 rounded-full border border-white/20">
                <ChevronLeft size={16} /> Back to Home
              </Link>
            </div>
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 lg:items-end">
              <div className="lg:col-span-7" style={fade(150)}>
                <p className={`${eyebrowCls} text-[#D9C2A0] mb-4`}>About Luxy Galleria</p>
                <h1 className="font-serif font-normal text-[34px] sm:text-5xl lg:text-6xl text-white leading-[1.05]">
                  About Luxy Galleria
                </h1>
              </div>
              <p
                className="lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-10 text-slate-300 text-base md:text-lg leading-relaxed max-w-xl"
                style={fade(300)}
              >
                Imported chocolates, snacks, drinks, and food products from around the world — in our store in Thalassery, Kerala, and online.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Who We Are — editorial split */}
        <section className="py-14 md:py-20 lg:py-24">
          <div className={`${wrapCls} grid lg:grid-cols-12 gap-8 lg:gap-16`}>
            <div className="lg:col-span-5">
              <SectionHead eyebrow="Who We Are" title="Who We Are" />
            </div>
            <div className={`lg:col-span-7 space-y-5 max-w-2xl ${bodyCls}`}>
              <p className="font-serif text-xl md:text-2xl leading-snug text-slate-900">
                Luxy Galleria is a premium <strong className="font-semibold text-[#5A3A1E]">online and offline store</strong>{" "}dedicated to bringing the world&apos;s finest imported snacks, beverages, and specialty food products directly to customers across India.
              </p>
              <p>
                We believe that great taste knows no borders, and everyone deserves access to quality global products.
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

        {/* 3. Our Story — editorial split with a vertical rule */}
        <section className="bg-white border-y border-[#A68B5B]/10 py-14 md:py-20 lg:py-24">
          <div className={`${wrapCls} grid lg:grid-cols-12 gap-8 lg:gap-0`}>
            <div className="lg:col-span-5 lg:pr-16">
              <div className="lg:sticky lg:top-36">
                <SectionHead eyebrow="Our Story" title="Our Story" />
              </div>
            </div>
            <div className={`lg:col-span-7 lg:border-l lg:border-[#A68B5B]/20 lg:pl-16 space-y-5 max-w-3xl ${bodyCls}`}>
              <p>
                Luxy Galleria started with two brothers and a love for the flavours we grew up with. We spent part of our lives in Saudi Arabia, where we were surrounded by snacks, chocolates and drinks from different parts of the world.
              </p>
              <p>
                After coming back to Kerala, we often found ourselves looking for those same products and flavours.{" "}
                <span className="font-serif italic text-slate-900">Sometimes we found them. Sometimes we didn&apos;t.</span>
              </p>
              <p>
                That is where the idea for Luxy Galleria began. In 2022, we started with a simple thought. We wanted to create a place where people in Kerala could find authentic treats from around the world, all in one place.
              </p>
              <p>
                What started between two brothers has slowly grown into something much bigger than we imagined. Today, we bring products from more than 18 countries to people across Kerala.
              </p>
              <p>But honestly, the products are only one part of what makes this place special to us.</p>
              <ul className="border-l-2 border-[#A68B5B]/40 pl-5 space-y-2 font-serif italic text-slate-800">
                <li>We love seeing someone find a chocolate they remember from years ago.</li>
                <li>We love watching people discover something they have never tried before.</li>
                <li>We love when customers come back and tell us about something they bought last time.</li>
                <li>And we especially love seeing people walk in with friends or family and introduce them to something they found here.</li>
              </ul>
              <p className="font-serif text-xl md:text-2xl leading-snug text-[#5A3A1E] pt-2">
                For us, Luxy Galleria is a place to discover something new, find an old favourite and sometimes take home a little memory.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Luxy Galleria? — phones: 1 col, icon beside text; 2 cols from sm; 3 cols from lg */}
        <section className="py-14 md:py-20 lg:py-24">
          <div className={wrapCls}>
            <div className="mb-8 md:mb-12">
              <SectionHead eyebrow="Why Luxy Galleria" title="Why Luxy Galleria?" center />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
              {WHY.map(({ Icon, title, text }) => (
                <div
                  key={title}
                  className="group flex sm:block gap-4 bg-white rounded-lg border border-[#A68B5B]/15 p-4 md:p-6 lg:p-7 transition-all duration-300 hover:border-[#A68B5B]/45 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(90,58,30,0.25)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#F5F1E8] text-[#8B5E34] flex items-center justify-center sm:mb-4 transition-colors group-hover:bg-[#8B5E34] group-hover:text-white">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg md:text-xl text-slate-900 leading-snug mb-1 md:mb-2">{title}</h3>
                    <p className="font-sans text-sm md:text-[15px] text-slate-500 leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Our Mission */}
        <section
          className="w-full px-5 py-14 md:py-20 lg:py-24 text-center"
          style={{ background: "linear-gradient(135deg, #2C1A10 0%, #422812 50%, #6B5344 100%)" }}
        >
          <div className="max-w-[56rem] mx-auto">
            <h2 className={`${eyebrowCls} text-[#D9C2A0] mb-6`}>Our Mission</h2>
            <p className="text-slate-300 text-sm md:text-base mb-3">Our mission is simple:</p>
            <p className="font-serif text-[26px] sm:text-3xl md:text-4xl lg:text-5xl text-white leading-[1.2] text-balance mb-8">
              To make discovering international food more exciting, accessible and memorable.
            </p>
            <span aria-hidden="true" className="block w-12 h-px bg-[#D9C2A0]/60 mx-auto mb-8" />
            <p className="text-slate-300 text-base md:text-lg leading-[1.75] max-w-3xl mx-auto mb-8 text-pretty">
              Whether you&apos;re looking for a childhood favourite, searching for a taste from abroad, hunting for a rare snack, looking for the perfect gift or simply curious to try something you&apos;ve never had before — Luxy Galleria is here to bring the world of snacks closer to you.
            </p>
            <p className="text-slate-300 text-base md:text-lg mb-1">Because sometimes, it&apos;s not just about what you&apos;re eating.</p>
            <p className="font-serif italic text-xl md:text-2xl text-[#D9C2A0] leading-snug">It&apos;s about where that flavour takes you.</p>
          </div>
        </section>

        {/* 6. Welcome — compact closing statement */}
        <section className="py-12 md:py-16 lg:py-20">
          <div className={`${wrapCls} text-center`}>
            <h2 className={`${eyebrowCls} mb-4`}>Welcome to Luxy Galleria</h2>
            <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-slate-900 leading-snug">
              Discover something new.{" "}
              <span className="block sm:inline">Rediscover something familiar.</span>{" "}
              <span className="block text-[#8B5E34]">Bring home a little taste of the world.</span>
            </p>

            <ul className="mt-8 md:mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-x-8 gap-y-3 text-sm md:text-base text-slate-600">
              <li className="flex items-center justify-center gap-2">
                <MapPin size={16} strokeWidth={1.5} className="text-[#8B5E34] shrink-0" aria-hidden="true" />
                Luxy Galleria — {CONTACT.location}
              </li>
              <li className="flex items-center justify-center gap-2">
                <MessageCircle size={16} strokeWidth={1.5} className="text-[#8B5E34] shrink-0" aria-hidden="true" />
                <span>
                  For Bulk Orders WhatsApp:{" "}
                  <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {CONTACT.phoneDisplay}
                  </a>
                </span>
              </li>
              <li className="flex items-center justify-center gap-2">
                <Mail size={16} strokeWidth={1.5} className="text-[#8B5E34] shrink-0" aria-hidden="true" />
                <span>
                  Email:{" "}
                  <a href={`mailto:${CONTACT.email}`} className={linkCls}>
                    {CONTACT.email}
                  </a>
                </span>
              </li>
            </ul>

            <p className="mt-6 pt-6 border-t border-[#A68B5B]/15 max-w-2xl mx-auto text-sm md:text-base text-slate-500 leading-relaxed text-pretty">
              Follow{" "}
              <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className={linkCls}>
                @luxygalleria
              </a>{" "}
              on Instagram for new arrivals, rare finds, unboxings, offers and the latest imported snacks.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
