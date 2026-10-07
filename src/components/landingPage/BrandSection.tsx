"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getImageUrl, handleImageError } from "../../lib/imageUtils";

interface Brand {
  _id: string;
  name: string;
  logo: string;
  status: string;
}

export default function BrandSection() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await axios.get(`${apiURL}/brands`);
        if (res.data.success && res.data.data) {
          const activeBrands = res.data.data.filter((b: any) => b.status === 'ACTIVE' || !b.status);
          setBrands(activeBrands);
        }
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };
    fetchBrands();
  }, []);


  useEffect(() => {
    if (brands.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [brands]);

  if (brands.length === 0) return null;

  // Two rows: first half scrolls left, second half scrolls right.
  const half = Math.ceil(brands.length / 2);
  const rows = [brands.slice(0, half), brands.slice(half)].filter((r) => r.length > 0);
  // Repeat each row until one copy is wide enough to fill a large screen, then render it twice:
  // the CSS marquee shifts by exactly -50%, so the second copy makes the loop seamless.
  const MIN_ITEMS = 10;
  const fill = (row: Brand[]) => Array.from({ length: Math.ceil(MIN_ITEMS / row.length) }, () => row).flat();

  return (
    <section ref={sectionRef} className="bg-background py-8 md:py-12 w-full overflow-hidden">
      <div className="text-center px-6 mb-6 md:mb-8">
        <h2
          className={`font-sans font-black text-2xl md:text-3xl tracking-[0.15em] uppercase text-slate-900 mb-3 transition-all duration-600 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          OUR BRANDS
        </h2>
        <div
          className={`w-12 h-1 bg-[#A68B5B] mx-auto transition-transform duration-500 delay-200 origin-center motion-reduce:transition-none motion-reduce:transform-none ${
            isVisible ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </div>

      {/* Edge fade so logos enter/leave softly */}
      <div className="flex flex-col gap-4 md:gap-6 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        {rows.map((row, r) => {
          const copy = fill(row);
          return (
            <div key={r} className="overflow-hidden">
              <ul
                className={`flex w-max ${r === 0 ? "animate-marquee-left" : "animate-marquee-right"} hover:[animation-play-state:paused] motion-reduce:animate-none`}
                style={{ animationDuration: `${copy.length * 3.5}s` }}
              >
                {[...copy, ...copy].map((brand, i) => (
                  // padding (not gap) keeps both halves exactly equal width for the -50% loop
                  <li key={`${brand._id}-${i}`} aria-hidden={i >= row.length} className="shrink-0 pr-4 md:pr-6">
                    <div
                      className={`w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-32 lg:w-52 lg:h-36 flex items-center justify-center bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none hover:shadow-md hover:border-[#A68B5B]/30 ${
                        isVisible ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <div className="relative w-[75%] h-[70%]">
                        <Image
                          src={getImageUrl(brand.logo)}
                          alt={i >= row.length ? "" : brand.name}
                          fill
                          sizes="(max-width: 767px) 128px, 208px"
                          className="object-contain"
                          onError={(e) => handleImageError(e as any)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
