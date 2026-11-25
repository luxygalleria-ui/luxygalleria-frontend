import HeroSection from "../components/landingPage/HeroSection";
import HomeIntro from "../components/landingPage/HomeIntro";
import CategorySection from "../components/landingPage/CategorySection";
import BrandSection from "../components/landingPage/BrandSection";
import ProductSection from "../components/landingPage/ProductSection";
import FAQSection from "../components/landingPage/FAQSection";
import VideoTestimonialsSection from "../components/landingPage/LazyVideoTestimonials";
import { getAPIURL } from "../lib/apiClient";
import { toSlides, type ISlide } from "../lib/banners";

/**
 * Banners fetched on the server (cached 5 min), so the first banner — the LCP image — is in the HTML instead of
 * waiting for JS + an API call. undefined when the API is unreachable: the hero then fetches them in the browser.
 */
async function getSlides(): Promise<ISlide[] | undefined> {
  try {
    const res = await fetch(`${getAPIURL()}/banners`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return undefined;
    return toSlides((await res.json())?.data);
  } catch {
    return undefined;
  }
}

export default async function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection initialSlides={await getSlides()} />
      <HomeIntro />
      <CategorySection />
      <BrandSection />
      <ProductSection />
      <VideoTestimonialsSection />
      <FAQSection />
    </main>
  );
}
