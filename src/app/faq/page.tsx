import type { Metadata } from "next";
import FAQSection from "../../components/landingPage/FAQSection";

export const metadata: Metadata = {
  title: "FAQ | Luxy Galleria",
  description: "Answers about Luxy Galleria, our imported chocolates and snacks, delivery, ordering, payment and product storage.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <FAQSection page />
    </main>
  );
}
