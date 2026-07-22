"use client";

import dynamic from "next/dynamic";
import HeroSection from "../components/landingPage/HeroSection";
import CategorySection from "../components/landingPage/CategorySection";
import ProductSection from "../components/landingPage/ProductSection";

// Below-the-fold, JS-heavy (video modal + animations). Defer its bundle so it
// doesn't block the initial page load / mobile performance.
const VideoTestimonialsSection = dynamic(
  () => import("../components/landingPage/VideoTestimonialsSection"),
  { ssr: false, loading: () => <div className="min-h-[40vh]" /> }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <CategorySection />
      <ProductSection />
      <VideoTestimonialsSection />
    </main>
  );
}