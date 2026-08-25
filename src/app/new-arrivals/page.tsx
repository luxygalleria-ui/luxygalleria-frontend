"use client";

import { ProductCatalog } from "../../components/products/ProductCatalog";

export default function NewArrivalsPage() {
  return (
    <ProductCatalog
      collection="newArrival"
      title="New Arrivals"
      subtitle="The latest additions to the collection."
    />
  );
}
