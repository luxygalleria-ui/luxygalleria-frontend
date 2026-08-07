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
    // Autoplay slider for brands
    const interval = setInterval(() => {
      if (brands.length === 0) return;
      const container = scrollRef.current;
      if (container) {
        let nextIndex = currentIndexRef.current + 1;
        // Approximation of how many items fit in view, so we reset properly
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScrollLeft - 10) {
          nextIndex = 0;
        }

        currentIndexRef.current = nextIndex;
        if (nextIndex === 0) {
          container.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          // scroll by roughly one item width (around 150px + gap)
          container.scrollBy({ left: 160, behavior: 'smooth' });
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [brands]);

  useEffect(() => {
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
  }, []);

  if (brands.length === 0) return null;

  return (
    <section ref={sectionRef} className="bg-background pt-10 pb-6 w-full">
      <div className="text-center px-6 mb-8">
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

      <div
        ref={scrollRef}
        className="w-full flex items-center overflow-x-auto gap-6 md:gap-10 px-6 md:px-12 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand, index) => (
          <div
            key={brand._id}
            className={`w-[120px] md:w-[150px] h-[120px] md:h-[150px] flex-shrink-0 flex items-center justify-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none hover:shadow-md ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${(index % 5) * 100}ms` }}
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
    </section>
  );
}
