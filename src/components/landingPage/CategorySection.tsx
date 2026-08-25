"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getImageUrl, handleImageError } from "../../lib/imageUtils";

const DEFAULT_CATEGORIES = [
  {
    id: 'skin-care',
    label: 'Skin Care',
    image: '/images/skin-care.jpg',
    alt: 'Skin Care category featuring moisturizing brightening sunscreen'
  },
  {
    id: 'lip-care',
    label: 'Lip Care',
    image: '/images/lip-care.jpg',
    alt: 'Lip Care category featuring nourished glossy lips'
  },
  {
    id: 'body-care',
    label: 'Body Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop',
    alt: 'Body Care category featuring luxurious body cream application'
  }
];

export default function CategorySection() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await axios.get(`${apiURL}/categories`);
        if (res.data.success && res.data.data) {
          const activeCats = res.data.data.filter((c: any) => c.status === 'ACTIVE').slice(0, 6);

          if (activeCats.length > 0) {
            const formatted = activeCats.map((c: any, index: number) => ({
              id: c.name.toLowerCase().replace(/\s+/g, '-'),
              label: c.name,
              image: c.image ? getImageUrl(c.image) : DEFAULT_CATEGORIES[index % 3].image,
              alt: `${c.name} category`
            }));
            setCategories(formatted);
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (categories.length === 0) return;

      const container = scrollRef.current;
      if (container) {
        const firstChild = container.children[0] as HTMLElement;
        const gap = window.innerWidth >= 768 ? 24 : 16; // md:gap-6 or gap-4
        const itemWidth = firstChild ? firstChild.clientWidth + gap : 300;

        let nextIndex = currentIndexRef.current + 1;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScrollLeft - 10) {
          nextIndex = 0;
        }

        currentIndexRef.current = nextIndex;
        setActiveIndex(nextIndex % categories.length);

        if (nextIndex === 0) {
          container.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          container.scrollBy({ left: itemWidth, behavior: 'smooth' });
        }
      }
    }, 3000);

    const handleScroll = () => {
      if (scrollRef.current) {
        const firstChild = scrollRef.current.children[0] as HTMLElement;
        if (firstChild) {
          const gap = window.innerWidth >= 768 ? 24 : 16;
          const itemWidth = firstChild.clientWidth + gap;
          const index = Math.round(scrollRef.current.scrollLeft / itemWidth);
          setActiveIndex(index % categories.length);
        }
      }
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      clearInterval(interval);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [categories]);

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

  return (
    <section ref={sectionRef} className="bg-background pt-8 md:pt-12 w-full">
      {/* Section Header */}
      <div className="text-center px-6 md:px-12 max-w-4xl mx-auto mb-6 md:mb-8">
        <p
          className={`font-sans font-semibold text-xs tracking-[0.3em] uppercase text-[#5A3A1E] mb-4 transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          THE CURATED SELECTION
        </p>
        <h2
          className={`font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-tight mb-4 transition-all duration-700 delay-100 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          A World of Premium Treats
        </h2>
        <p
          className={`font-sans font-normal text-lg md:text-xl text-slate-500 leading-relaxed max-w-3xl mx-auto transition-all duration-700 delay-200 ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          Explore our curated selection of premium imported drinks, gourmet snacks, and luxury delicacies.
        </p>
      </div>

      {/* Category Slider */}
      <div
        ref={scrollRef}
        className="w-full flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 px-6 pb-8 border-b border-gray-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => (
          <div key={category.id} className="w-[85vw] md:w-[350px] flex-shrink-0 snap-center flex flex-col">
            {/* Mobile Card Layout (New Style) */}
            <Link
              href={`/products?category=${category.id}`}
              aria-label={`Browse ${category.label}`}
              className={`md:hidden group relative overflow-hidden rounded-[2.5rem] aspect-[4/5] block focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none shadow-xl shadow-black/10 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Image
                src={category.image}
                alt={category.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                onError={(e) => handleImageError(e as any)}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 motion-reduce:transition-none" />

              {/* Content Box */}
              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center justify-end gap-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h3 className="font-serif font-normal text-4xl text-white tracking-wide text-center drop-shadow-sm">
                  {category.label}
                </h3>

                <span className="px-6 py-2.5 rounded-full bg-white/25 backdrop-blur-md border border-white/40 text-white text-xs font-sans tracking-[0.15em] uppercase font-bold shadow-lg transition-colors group-hover:bg-white/35">
                  Explore Collection
                </span>
              </div>
            </Link>

            {/* Desktop Card Layout (Original Style) */}
            <Link
              href={`/products?category=${category.id}`}
              aria-label={`Browse ${category.label}`}
              className={`hidden md:block group relative overflow-hidden aspect-[4/5] focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2 transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none rounded-[2rem] shadow-md ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Image
                src={category.image}
                alt={category.alt}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-110"
                onError={(e) => handleImageError(e as any)}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 motion-reduce:transition-none" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative overflow-hidden py-2">
                  <h3 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-white tracking-wide">
                    {category.label}
                  </h3>
                  <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-white transition-all duration-500 ease-out group-hover:w-full group-hover:left-0" />
                </div>
              </div>
            </Link>

            <div
              className={`hidden md:flex py-6 md:py-8 justify-center items-center transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <Link href={`/products?category=${category.id}`} className="font-sans font-bold text-xs tracking-[0.2em] uppercase text-slate-400 hover:text-[#8B5E34] transition-colors duration-300">
                {category.label}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Dots (Mobile Only) */}
      <div className="flex justify-center items-center gap-2 mt-2 pb-2 md:hidden">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: index * scrollRef.current.clientWidth,
                  behavior: 'smooth'
                });
                setActiveIndex(index);
                currentIndexRef.current = index;
              }
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-[#A68B5B]/30 w-4' : 'bg-[#A68B5B]/10/80'
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
