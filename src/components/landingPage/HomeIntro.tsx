import Link from "next/link";

// Short brand intro between the hero and the category cards; the full story lives on /about.
export default function HomeIntro() {
  return (
    <section className="bg-background px-5 sm:px-6 pt-10 md:pt-14 pb-2 md:pb-4 text-center">
      <div className="max-w-[900px] mx-auto">
        <p className="font-sans font-semibold text-[11px] md:text-xs tracking-[0.3em] uppercase text-[#8B5E34] mb-3 md:mb-4">
          Welcome to Luxy Galleria
        </p>
        <h2 className="font-serif font-medium text-[26px] sm:text-3xl md:text-4xl text-slate-900 leading-[1.2] text-balance">
          Bringing the World of Snacks Closer to You
        </h2>
        <span aria-hidden="true" className="block w-12 h-px bg-[#A68B5B] mx-auto my-4 md:my-5" />
        <p className="max-w-[36rem] mx-auto font-sans text-[15px] md:text-[17px] text-slate-600 leading-relaxed text-pretty">
          Your destination for imported chocolates, snacks, drinks and food products from around the world.
        </p>
        <Link
          href="/about"
          className="inline-block mt-5 md:mt-6 font-sans font-semibold text-[11px] md:text-xs tracking-[0.2em] uppercase text-[#8B5E34] hover:text-[#5A3A1E] border-b border-[#8B5E34]/40 hover:border-[#5A3A1E] pb-1 transition-colors"
        >
          Discover Our Story <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
