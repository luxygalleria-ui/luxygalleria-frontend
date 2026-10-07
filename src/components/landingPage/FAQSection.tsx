"use client";

import { Fragment, useState, type ReactNode } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

// Answer markup: blank line = new paragraph, "- " lines = bullet list,
// **text** = bold, [[wa:number]] = WhatsApp link, [[tel:number]] = call link.
type FAQ = { q: string; a: string };
type Category = { id: string; label: string; faqs: FAQ[] };

const FAQ_CATEGORIES: Category[] = [
  {
    id: "about",
    label: "About Luxy Galleria",
    faqs: [
      {
        q: "What is Luxy Galleria?",
        a: "Luxy Galleria is an imported food and snacks store based in Thalassery, Kerala. We bring chocolates, snacks, chips, ramen, biscuits, wafers, candies, drinks, coffee, spreads and other popular food products from around the world to customers across Kerala and India.",
      },
      {
        q: "Where is Luxy Galleria located?",
        a: "Luxy Galleria is located in Thalassery, Kerala. Visit our physical store to explore our range of imported chocolates, snacks, drinks, ramen and more.",
      },
      {
        q: "What products do you sell?",
        a: "We stock a wide range of imported food and beverages, including imported chocolates, Korean ramen, chips, biscuits, wafers, candies, chewing gum, mints, instant coffee, soft drinks, energy drinks, spreads and seasonal or limited-edition snacks.",
      },
      {
        q: "Which countries do your products come from?",
        a: "Our products are sourced from different countries around the world, depending on the brand and product. Product pages provide the relevant country-of-origin information wherever applicable.",
      },
    ],
  },
  {
    id: "chocolates-snacks",
    label: "Imported Chocolates & Snacks",
    faqs: [
      {
        q: "Where can I buy imported chocolates in Kerala?",
        a: "You can shop original imported chocolates from Luxy Galleria, based in Thalassery, Kerala. We offer a wide selection of international chocolate brands and flavours, with delivery available across Kerala.",
      },
      {
        q: "Where can I buy imported snacks online in Kerala?",
        a: "You can order imported snacks online from Luxy Galleria. Our range includes international chocolates, chips, biscuits, wafers, candies, ramen, drinks and other snacks, with delivery across Kerala.",
      },
      {
        q: "Do you sell Korean ramen?",
        a: "Yes. Luxy Galleria stocks a variety of Korean ramen and noodles, including different flavours and spice levels. Availability changes as new products and flavours arrive.",
      },
      {
        q: "Do you sell international soft drinks and energy drinks?",
        a: "Yes. We regularly stock imported and international soft drinks, energy drinks and other beverages. Availability varies depending on current stock.",
      },
      {
        q: "Do you sell rare or hard-to-find snacks?",
        a: "Yes. We regularly bring in unusual, limited-edition and hard-to-find international snacks and flavours. Follow our social media pages or check the website for new arrivals and restocks.",
      },
    ],
  },
  {
    id: "authenticity",
    label: "Authenticity & Quality",
    faqs: [
      {
        q: "Are the products at Luxy Galleria genuine?",
        a: "Yes. Luxy Galleria specialises in genuine imported food products. Having grown up around the Gulf’s diverse food and snack culture, we have always had a strong connection with international brands and flavours. We carefully select the products we bring to Kerala and provide relevant product information such as brand, flavour, size and country of origin wherever applicable.",
      },
      {
        q: "Are Luxy Galleria products imported?",
        a: "Our store specialises in imported food products. Individual product listings specify relevant product and country-of-origin information.",
      },
      {
        q: "What is the expiry date of your products?",
        a: "The expiry or best-before date varies by product and batch. We recommend checking the product listing or packaging for the most accurate date before consumption.",
      },
      {
        q: "How are chocolates handled during delivery?",
        a: "Chocolate products can be affected by heat during transportation. Where appropriate, we take additional precautions for chocolate deliveries, including suitable packaging and cooling solutions depending on the order and delivery conditions.",
      },
      {
        q: "Can I order products as gifts?",
        a: "Absolutely. Our imported chocolates, snacks and curated hampers are popular for birthdays, anniversaries, celebrations and other special occasions. We offer gifting options across different budgets and can help you choose products based on the occasion.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    faqs: [
      {
        q: "Does Luxy Galleria deliver across Kerala?",
        a: "Yes. We offer delivery across Kerala, subject to courier service availability at the destination.",
      },
      {
        q: "Do you deliver outside Kerala?",
        a: "Delivery availability outside Kerala depends on the destination, product type and courier service. Check the available delivery options during checkout or contact us before placing your order.\n\n**Contact:**\n\n- [[tel:9847978098]]",
      },
      {
        q: "How long does delivery take?",
        a: "Delivery time depends on your location, courier service and the type of order. The estimated delivery time will be communicated during the ordering process.\n\nMost locations in Kerala get delivery within **2–3 days**.\n\nRest of India: **4–8 working days**.",
      },
      {
        q: "How much is delivery?",
        a: "Delivery charges depend on the destination, parcel weight and courier service. The applicable shipping charge will be shown or communicated before your order is confirmed.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Where tracking is available through the courier service, tracking details will be shared with you after dispatch.",
      },
    ],
  },
  {
    id: "ordering",
    label: "Ordering & Payment",
    faqs: [
      {
        q: "How can I order from Luxy Galleria?",
        a: "You can shop through our website or contact Luxy Galleria through WhatsApp for assistance with your order.\n\n**WhatsApp:** [[wa:9847978098]]",
      },
      {
        q: "Can I order imported snacks through WhatsApp?",
        a: "Yes. Customers can contact Luxy Galleria through WhatsApp to enquire about products, availability and orders.\n\n**WhatsApp:**\n\n- [[wa:9847978098]]",
      },
      {
        q: "Can I request a product that is currently out of stock?",
        a: "Yes. Contact us with the product name or a photo of the product. If possible, we can let you know when it is restocked or consider it for a future shipment.",
      },
      {
        q: "Can I request a specific flavour?",
        a: "You can contact us with the brand and flavour you are looking for. Availability depends on current stock and import availability.",
      },
    ],
  },
  {
    id: "storage",
    label: "Product Storage",
    faqs: [
      {
        q: "How should I store my products after delivery?",
        a: "**Chocolates:** Store in a cool, dry place away from direct sunlight and heat. During hot weather, refrigeration may be recommended depending on the product. Allow refrigerated chocolates to return to room temperature before opening to reduce condensation.\n\n**Chips & snacks:** Keep sealed and store in a cool, dry place. Once opened, consume promptly to maintain freshness.\n\n**Ramen, biscuits, wafers & candies:** Store in a cool, dry place and keep the packaging tightly sealed after opening.\n\n**Drinks:** Follow the storage instructions printed on the product packaging. Refrigerate after opening where indicated.\n\nAlways follow the product's own storage instructions and expiry/best-before date, as requirements can vary between products.\n\n**Important:** Avoid storing food products in direct sunlight, near heat sources or in hot/humid areas.",
      },
    ],
  },
];

const INLINE = /(\*\*[^*]+\*\*|\[\[(?:wa|tel):\d+\]\])/;
const linkCls =
  "font-semibold text-[#8B5E34] hover:text-[#5A3A1E] underline decoration-[#8B5E34]/30 underline-offset-4 hover:decoration-[#5A3A1E] transition-colors";

function renderInline(text: string): ReactNode {
  return text.split(INLINE).map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    if (bold) return <strong key={i} className="font-semibold text-slate-900">{bold[1]}</strong>;
    const link = part.match(/^\[\[(wa|tel):(\d+)\]\]$/);
    if (link) {
      const [, kind, num] = link;
      return kind === "wa" ? (
        <a key={i} href={`https://wa.me/91${num}`} target="_blank" rel="noopener noreferrer" aria-label={`Chat on WhatsApp at ${num}`} className={linkCls}>
          {num}
        </a>
      ) : (
        <a key={i} href={`tel:+91${num}`} aria-label={`Call ${num}`} className={linkCls}>
          {num}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function renderAnswer(text: string): ReactNode {
  return text.split("\n\n").map((block, i) => {
    const lines = block.split("\n");
    if (lines.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1 marker:text-[#8B5E34]">
          {lines.map((l) => <li key={l}>{renderInline(l.slice(2))}</li>)}
        </ul>
      );
    }
    return <p key={i}>{renderInline(block)}</p>;
  });
}

const toPlainText = (text: string) =>
  text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[\[(?:wa|tel):(\d+)\]\]/g, "$1");

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_CATEGORIES.flatMap((c) =>
    c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: toPlainText(f.a) },
    }))
  ),
};

export default function FAQSection() {
  const [activeId, setActiveId] = useState(FAQ_CATEGORIES[0].id);
  const active = FAQ_CATEGORIES.find((c) => c.id === activeId)!;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-background py-12 md:py-20 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="text-center mb-8 md:mb-12">
          <p className="font-sans font-semibold text-xs tracking-[0.3em] uppercase text-[#5A3A1E] mb-4">
            FAQ
          </p>
          <h2 id="faq-heading" className="font-serif font-normal text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-sans text-base md:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about Luxy Galleria, our imported products, delivery, ordering and policies.
          </p>
        </div>

        {/* Category filter: scrolls horizontally on small screens, wraps on desktop */}
        <div
          role="group"
          aria-label="FAQ categories"
          className="hide-scrollbar flex gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:justify-center mb-6 md:mb-10"
        >
          {FAQ_CATEGORIES.map((c) => {
            const selected = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveId(c.id)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs md:text-sm font-semibold font-sans transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A68B5B]/50 focus-visible:ring-offset-2 ${
                  selected
                    ? "bg-[#8B5E34] border-[#8B5E34] text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-[#8B5E34]/40 hover:text-[#5A3A1E]"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* key resets the open item when switching categories */}
        <Accordion.Root key={active.id} type="single" collapsible className="border-t border-slate-200">
          {active.faqs.map((f, i) => (
            <Accordion.Item key={f.q} value={`${active.id}-${i}`} className="border-b border-slate-200">
              <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 md:py-6 text-left font-sans font-semibold text-base md:text-lg text-slate-900 hover:text-[#5A3A1E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A68B5B]/50 focus-visible:ring-offset-2 rounded-sm">
                    <span>{f.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-[#8B5E34] transition-colors duration-300 group-hover:border-[#8B5E34]/40 group-data-[state=open]:bg-[#8B5E34] group-data-[state=open]:border-[#8B5E34] group-data-[state=open]:text-white">
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="transition-transform duration-300 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
                      />
                    </span>
                  </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="accordion-content overflow-hidden">
                <div className="pb-6 pr-0 md:pr-12 space-y-3 font-sans text-sm md:text-base text-slate-500 leading-relaxed">
                  {renderAnswer(f.a)}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
