"use client";

import { ProductCatalog } from "../../components/products/ProductCatalog";

export default function GiftingPage() {
  // Title/subtitle are fallbacks; the catalog loads the admin-managed heading
  return (
    <ProductCatalog
      collection="gifting"
      title="Gifting"
      subtitle="Curated picks, ready to be wrapped."
    />
  );
}
