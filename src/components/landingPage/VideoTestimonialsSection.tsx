"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import axios from "axios";
import VideoModal from "./VideoModal";

interface VideoTestimonial {
  _id: string;
  clientName: string;
  role: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  displayOrder: number;
  isActive: boolean;
}

interface VideoCardProps extends VideoTestimonial {
  onPlayClick: () => void;
}

// Autoplay Video Thumbnail Component
function AutoplayVideoThumbnail({ youtubeId, clientName }: { youtubeId: string; clientName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/5 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* YouTube Thumbnail as Background */}
      <img
        src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
        alt={`${clientName} Video Thumbnail`}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />

      {/* Muted Autoplay Video Overlay (shows on hover with smooth transition) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"
          }`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&rel=0&showinfo=0&modestbranding=1&loop=1&playlist=${youtubeId}`}
          title={`${clientName} Video Testimonial`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: isHovered ? "auto" : "none" }}
        />
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 transition-all duration-300 group-hover:bg-black/20" />
    </div>
  );
}

export default function VideoTestimonialsSection() {
  const [testimonials, setTestimonials] = useState<VideoTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDot, setActiveDot] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  // Modal state
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await axios.get(`${apiURL}/video-testimonials/active`);
        if (res.data.success && res.data.data) {
          setTestimonials(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch video testimonials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Scroll listener to update pagination dots
  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft } = carouselRef.current;
      const card = carouselRef.current.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24; // gap-6 (24px)
        const index = Math.round(scrollLeft / (cardWidth + gap));
        setActiveDot(index);
      }
    }
  };

  const scrollPrev = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24;
        carouselRef.current.scrollBy({ left: -(cardWidth + gap), behavior: "smooth" });
      }
    }
  };

  const scrollNext = () => {
    if (carouselRef.current) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24;
        carouselRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
      }
    }
  };

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const card = carouselRef.current.firstElementChild as HTMLElement;
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24;
        carouselRef.current.scrollTo({ left: index * (cardWidth + gap), behavior: "smooth" });
      }
    }
  };

  // Autoplay functionality
  useEffect(() => {
    if (testimonials.length <= 1 || !autoplay || selectedVideo) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 15;

        if (isAtEnd) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          const card = carouselRef.current.firstElementChild as HTMLElement;
          if (card) {
            const cardWidth = card.getBoundingClientRect().width;
            const gap = 24;
            carouselRef.current.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
          }
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [testimonials, autoplay, selectedVideo]);

  if (!loading && testimonials.length === 0) return null;

  return (
    <section
      className="bg-gradient-to-b from-[#2A1F15] to-[#3D2F22] w-full py-10 md:py-12 overflow-hidden border-t border-b border-[#A68B5B]/20"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="bg-gradient-to-r from-[#2C1A10] via-[#422812] to-[#6B5344] rounded-2xl px-8 md:px-10 py-6 md:py-7 -ml-6 md:-ml-10 pl-8 md:pl-10">
            <p className="font-sans font-semibold text-xs md:text-sm text-[#C9A961] mb-2">
              Watch, unbox, and experience Luxy Galleria.
            </p>
            <h2 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-white leading-tight">
              Luxy Snack Station
            </h2>
          </div>

          {/* Navigation Controls */}
          {testimonials.length > 0 && !loading && (
            <div className="flex items-center gap-3">
              <button
                onClick={scrollPrev}
                className="w-12 h-12 rounded-full border border-[#A68B5B]/30 bg-[#A68B5B]/5 text-[#A68B5B] hover:border-[#A68B5B] hover:bg-[#A68B5B]/15 hover:text-[#A68B5B] flex items-center justify-center transition-all duration-300 active:scale-95"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollNext}
                className="w-12 h-12 rounded-full border border-[#A68B5B]/30 bg-[#A68B5B]/5 text-[#A68B5B] hover:border-[#A68B5B] hover:bg-[#A68B5B]/15 hover:text-[#A68B5B] flex items-center justify-center transition-all duration-300 active:scale-95"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {loading ? (
            /* Skeleton Loader */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-3xl border border-[#A68B5B]/20 bg-white p-5 md:p-6 space-y-4 animate-pulse">
                  <div className="aspect-[3/4] w-full rounded-2xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Carousel Scroll List */
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar pb-4"
            >
              {testimonials.map((t) => (
                <div
                  key={t._id}
                  className="snap-start shrink-0 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-21px)]"
                >
                  <article
                    className="group relative rounded-3xl border border-[#A68B5B]/20 bg-white hover:bg-[#FFFBF7] backdrop-blur-sm p-5 md:p-6 flex flex-col justify-between transition-all duration-500 hover:border-[#A68B5B]/50 hover:shadow-2xl hover:-translate-y-2 shadow-lg shadow-[#A68B5B]/15 h-full cursor-pointer"
                    onClick={() => setSelectedVideo(t)}
                  >
                    {/* Video Thumbnail Wrapper with Autoplay - Larger */}
                    <div
                      className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-[#A68B5B]/20 group-hover:border-[#A68B5B]/40 transition-all duration-500"
                    >
                      <AutoplayVideoThumbnail
                        youtubeId={t.youtubeId}
                        clientName={t.clientName}
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-300 group-hover:bg-black/10">
                        <div className="w-16 h-16 rounded-full bg-[#A68B5B] text-white flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-125 group-hover:bg-[#C9A961] shadow-[#A68B5B]/40">
                          <Play className="w-7 h-7 fill-current translate-x-[2px]" />
                        </div>
                      </div>
                    </div>

                    {/* Client Info Block - Enhanced */}
                    <div className="mt-5">
                      <h3 className="font-sans font-bold text-base md:text-lg tracking-[0.05em] uppercase text-[#140C05] leading-tight group-hover:text-[#A68B5B] transition-colors">
                        {t.clientName}
                      </h3>
                      <p className="font-sans font-semibold text-xs md:text-sm tracking-[0.1em] uppercase text-[#A68B5B]/70 mt-2">
                        {t.role}
                      </p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Indicator Dots */}
        {testimonials.length > 1 && !loading && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {testimonials.map((_, idx) => {
              // Hide trailing dots for larger screens to avoid empty scrolls
              // (e.g. on 3-col desktop, activeDot reaches up to testimonials.length - 3)
              const maxDots = testimonials.length;
              if (idx >= maxDots) return null;

              const isSelected = activeDot === idx;
              return (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`h-2 rounded-full transition-all duration-350 ${isSelected
                    ? "w-8 bg-[#A68B5B]"
                    : "w-2 bg-[#A68B5B]/30 hover:bg-[#A68B5B]/60"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal Lightbox */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          youtubeId={selectedVideo.youtubeId}
          clientName={selectedVideo.clientName}
        />
      )}
    </section>
  );
}
