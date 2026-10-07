import Link from "next/link";

export default function BrandIntroSection() {
  return (
    <section className="bg-background pt-10 md:pt-14 w-full">
      <div className="text-center px-5 sm:px-6 max-w-[1200px] mx-auto">
        <p className="font-sans font-semibold text-xs tracking-[0.3em] uppercase text-[#5A3A1E] mb-5">
          Welcome to Luxy Galleria
        </p>
        <h2 className="font-serif font-normal text-3xl md:text-[clamp(1.875rem,4vw,3rem)] text-slate-900 leading-[1.15] text-balance max-w-[46rem] mx-auto mb-5">
          Bringing the World of Snacks Closer to You
        </h2>
        <p className="max-w-[44rem] mx-auto font-sans text-base md:text-lg text-slate-600 leading-[1.75] text-pretty">
          Welcome to Luxy Galleria, a destination for imported chocolates, snacks, drinks and food products from around the world.
        </p>
        <Link
          href="/about"
          className="inline-block mt-7 font-sans font-bold text-xs tracking-[0.2em] uppercase text-[#8B5E34] hover:text-[#5A3A1E] border-b border-[#8B5E34]/40 hover:border-[#5A3A1E] pb-1 transition-colors"
        >
          Discover Our Story
        </Link>
      </div>
    </section>
  );
}
