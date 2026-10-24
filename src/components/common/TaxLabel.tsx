"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { getAPIURL } from "../../lib/apiClient";

type TaxDisplay = { enabled: boolean; pricesIncludeTax: boolean; showPriceLabel: boolean };

// One request per page load, shared by every label
let pending: Promise<TaxDisplay | null> | null = null;
const loadTax = () =>
  (pending ??= axios.get(`${getAPIURL()}/settings`)
    .then((r) => (r.data?.data?.checkout?.tax as TaxDisplay) ?? null)
    .catch(() => { pending = null; return null; }));

/** "Inclusive of GST" / "+ GST" next to a price, as configured in the admin. Renders nothing until known. */
export default function TaxLabel({ className = "" }: { className?: string }) {
  const [tax, setTax] = useState<TaxDisplay | null>(null);
  useEffect(() => { loadTax().then(setTax); }, []);
  if (!tax?.enabled || !tax.showPriceLabel) return null;
  return <span className={className}>{tax.pricesIncludeTax ? "Inclusive of GST" : "+ GST (added at checkout)"}</span>;
}
