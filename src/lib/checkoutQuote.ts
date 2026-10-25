import { useEffect, useState } from "react";
import axios from "axios";
import { getAPIURL } from "./apiClient";
import type { CartItem } from "../context/CartContext";

/** Every charge comes from the backend; the storefront never prices an order itself. */

export type Fulfillment = { method: "delivery" | "pickup"; shippingMethod?: "land" | "air" };

export interface CheckoutOption {
  fulfillment: "delivery" | "pickup";
  shippingMethod: "land" | "air" | null;
  offered: boolean;
  allowed: boolean;
  reason: string;
  eta: string;
}

export interface Quote {
  fulfillmentMethod: "delivery" | "pickup";
  shippingMethod: "land" | "air" | null;
  zone: "kerala" | "outsideKerala" | null;
  zoneAssumed: boolean;
  eta: string;
  subtotal: number;
  discount: number;
  totalWeight: number;
  baseShipping: number;
  extraWeightCharge: number;
  shipping: number;
  freeShippingApplied: boolean;
  specialPackagingFee: number;
  specialPackaging: {
    applied: boolean; weightG: number; steps: number; fee: number; note: string;
    /** Cart items the saved chocolate rule covers; empty while the feature is off or its fee unconfirmed. */
    items: string[];
    rule: { basis: "per_weight_step" | "flat_per_order"; feeAmount: number; unitGrams: number } | null;
  };
  pickupFee: number;
  pickupDetails: { storeName: string; address: string; openingHours: string; phone: string; instructions: string } | null;
  tax: { enabled: boolean; pricesIncludeTax: boolean; taxableValue: number; taxAmount: number; addedToTotal: number; missingRates: string[] };
  grandTotal: number;
  options: CheckoutOption[];
  /** Server-priced lines, in the same order as the cart items sent (price and weight from the product records). */
  lines: { product: string; variantId: string; name: string; price: number; weight: number; quantity: number; stock: number }[];
}

export const quoteItems = (cartItems: CartItem[]) =>
  cartItems.map((item) => ({
    product: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    size: item.size === "Standard" ? undefined : item.size,
  }));

export class QuoteError extends Error {
  constructor(message: string, public options: CheckoutOption[] | null) { super(message); }
}

/** Server quote for the cart. Throws QuoteError (with the available options when the server sent them). */
export const fetchQuote = async (cartItems: CartItem[], fulfillment?: Fulfillment, state?: string, country?: string): Promise<Quote> => {
  try {
    const res = await axios.post(`${getAPIURL()}/payments/calculate-shipping`, {
      items: quoteItems(cartItems),
      ...(fulfillment ? { fulfillment } : {}),
      ...(state ? { shippingAddress: { state, ...(country ? { country } : {}) } } : {}),
    });
    if (!res.data?.success) throw new QuoteError(res.data?.message || "Could not calculate charges", null);
    return res.data.data as Quote;
  } catch (err) {
    if (err instanceof QuoteError) throw err;
    const data = axios.isAxiosError(err) ? (err.response?.data as { message?: string; data?: { options?: CheckoutOption[] } } | undefined) : undefined;
    throw new QuoteError(data?.message || "Could not calculate delivery charges. Please try again.", data?.data?.options ?? null);
  }
};

export const METHOD_LABEL: Record<"land" | "air", string> = { land: "Standard (road)", air: "Express (air)" };

/** Money rounded to paise, so e.g. 19.99 × 3 shows 59.97, not 59.970000000000006. */
export const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Unit price, line total and stock for cart line i: the server's figures when the quote is current (it always
 * describes the cart in this order), else the price stored with the item until the quote arrives.
 */
export const pricedLine = (quote: Quote | null, item: CartItem, i: number) => {
  const line = quote?.lines?.[i];
  const server = line && line.variantId === (item.variantId || line.variantId) ? line : null;
  const unitPrice = server ? server.price : item.price;
  return { unitPrice, lineTotal: money(unitPrice * item.quantity), stock: server ? server.stock : null };
};

/** "₹40" or "Free". */
export const rupees = (n: number) => (n > 0 ? `₹${n}` : "Free");

type QuoteResult = { key: string; quote: Quote | null; error: string; options: CheckoutOption[] | null };

/**
 * Server quote for the cart and choice, refetched when either changes. "Loading" is derived (the last result
 * belongs to an older request), so no state is set synchronously inside the effect.
 */
export const useQuote = (cartItems: CartItem[], fulfillment?: Fulfillment, state?: string, country?: string, enabled = true) => {
  // Retry bumps the attempt so the same request is sent again; results of older requests are never shown
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([quoteItems(cartItems), fulfillment ?? null, state ?? null, country ?? null, attempt]);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const active = enabled && cartItems.length > 0;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    fetchQuote(cartItems, fulfillment, state, country)
      .then((quote) => { if (!cancelled) setResult({ key, quote, error: "", options: null }); })
      // No local fallback: a wrong charge is worse than asking the customer to retry
      .catch((err: QuoteError) => { if (!cancelled) setResult({ key, quote: null, error: err.message, options: err.options }); });
    return () => { cancelled = true; };
    // key captures cartItems, fulfillment, state, country and the retry attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  const current = active && result?.key === key ? result : null;
  return {
    quote: current?.quote ?? null,
    quoteError: current?.error ?? "",
    errorOptions: current?.options ?? null,
    isLoading: active && !current,
    retry: () => setAttempt((a) => a + 1),
  };
};

/** How the server worked out the chocolate packaging charge, in words. Uses only figures from the quote; never recalculates. */
export const packagingSummary = (q: Quote): string => {
  const p = q.specialPackaging;
  if (!p.rule || p.items.length === 0) return "";
  if (q.fulfillmentMethod === "pickup") return "Store pickup: no delivery packaging charge.";
  if (!p.applied) return "";
  return p.rule.basis === "flat_per_order"
    ? `Packaging charge ₹${p.fee}: a flat fee, charged once per eligible delivery order.`
    : `Packaging charge ₹${p.fee}: ${p.weightG} g combined = ${p.steps} × ₹${p.rule.feeAmount} per started ${p.rule.unitGrams} g, charged once per order.`;
};
