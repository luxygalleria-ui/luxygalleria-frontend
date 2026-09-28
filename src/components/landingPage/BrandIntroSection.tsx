import Link from "next/link";

export default function BrandIntroSection() {
  return (
    <section className="bg-background pt-12 md:pt-20 pb-4 md:pb-8 w-full">
      <div className="text-center px-6 md:px-12 max-w-3xl mx-auto">
        <p className="font-sans font-semibold text-xs tracking-[0.3em] uppercase text-[#5A3A1E] mb-4">
          Welcome to Luxy Galleria
        </p>
        <h2 className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-tight mb-6">
          Bringing the World of Snacks Closer to You
        </h2>
        <div className="space-y-4 font-sans text-base md:text-lg text-slate-500 leading-relaxed">
          <p>
            Your destination for imported chocolates, snacks, drinks, and food products from around the world.
          </p>
          <p>
            Based in Thalassery, Kerala, we bring together international flavours, rare finds, and familiar
            favourites under one roof, making it easier for snack lovers to discover something new or
            rediscover something they already love.
          </p>
          <p>
            From imported chocolates and Korean ramen to international chips, drinks, candies, gums, biscuits,
            coffee, spreads, and more, our collection continues to grow with exciting new products and discoveries.
          </p>
        </div>
        <Link
          href="/about"
          className="inline-block mt-8 font-sans font-bold text-xs tracking-[0.2em] uppercase text-[#8B5E34] hover:text-[#5A3A1E] border-b border-[#8B5E34]/40 hover:border-[#5A3A1E] pb-1 transition-colors"
        >
          More About Us
        </Link>
      </div>
    </section>
  );
}
