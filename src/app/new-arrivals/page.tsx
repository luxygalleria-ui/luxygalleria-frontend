"use client";

import { ProductCatalog } from "../../components/products/ProductCatalog";

export default function NewArrivalsPage() {
  // Title/subtitle are fallbacks; the catalog loads the admin-managed heading
  return (
    <ProductCatalog
      collection="newArrival"
      title="New Arrivals"
      subtitle="The latest additions to the collection."
    />
  );
}
