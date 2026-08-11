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
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);

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

  // Split the exact brands into two rows without ANY duplicates
  const row1Brands = brands.filter((_, index) => index % 2 === 0);
  const row2Brands = brands.filter((_, index) => index % 2 !== 0);

  // Only animate if there are enough brands to overflow the screen nicely
  const shouldAnimate = brands.length >= 8;

  return (
    <section ref={sectionRef} className="bg-background py-8 md:py-12 w-full overflow-hidden">
      <div className="text-center px-6 mb-8 md:mb-10">
        <h2
          className={`font-sans font-black text-2xl md:text-3xl tracking-[0.15em] uppercase text-slate-900 mb-2 transition-all duration-600 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
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

      <div className="w-full flex flex-col gap-6 md:gap-8 pb-4">
        {/* Row 1 - Moves Left */}
        {row1Brands.length > 0 && (
          <div className={`flex w-max gap-6 md:gap-8 px-6 ${shouldAnimate ? 'animate-marquee-left hover:[animation-play-state:paused]' : 'mx-auto justify-center'}`}>
            {row1Brands.map((brand, index) => (
              <div
                key={`${brand._id}-r1-${index}`}
                className={`w-[120px] md:w-[150px] h-[120px] md:h-[150px] flex-shrink-0 flex items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:shadow-md hover:-translate-y-1 hover:border-[#A68B5B]/30 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getImageUrl(brand.logo)}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    onError={(e) => handleImageError(e as any)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Row 2 - Moves Right */}
        {row2Brands.length > 0 && (
          <div className={`flex w-max gap-6 md:gap-8 px-6 ${shouldAnimate ? 'animate-marquee-right hover:[animation-play-state:paused] ml-[-100px]' : 'mx-auto justify-center'}`}>
            {row2Brands.map((brand, index) => (
              <div
                key={`${brand._id}-r2-${index}`}
                className={`w-[120px] md:w-[150px] h-[120px] md:h-[150px] flex-shrink-0 flex items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:shadow-md hover:-translate-y-1 hover:border-[#A68B5B]/30 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={getImageUrl(brand.logo)}
                    alt={brand.name}
                    fill
                    className="object-contain"
                    onError={(e) => handleImageError(e as any)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
