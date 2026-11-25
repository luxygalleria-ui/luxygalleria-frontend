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
  /** Store pickup only, while offered: the configured pickup charge (0 = free). */
  fee?: number;
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
  /** Server: online payment goes to ICICI UAT (test money), so the order will not be a real purchase. */
  testPayment?: boolean;
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
    }, { timeout: 20_000 }); // never leave "Calculating…" spinning on a hung connection
    if (!res.data?.success) throw new QuoteError(res.data?.message || "Could not calculate charges", null);
    return res.data.data as Quote;
  } catch (err) {
    if (err instanceof QuoteError) throw err;
    const data = axios.isAxiosError(err) ? (err.response?.data as { message?: string; code?: string; data?: { options?: CheckoutOption[] } } | undefined) : undefined;
    // A coded refusal (WEIGHT_MISSING, OPTION_UNAVAILABLE, ...) is a checkout rule the page shows the customer: not a fault to log.
    // Anything else (network, 5xx, uncoded 400) is recorded, since the network log shows only the status.
    if (!data?.code || data.code === "SETTINGS_UNAVAILABLE") console.warn(`[checkout] quote refused (HTTP ${axios.isAxiosError(err) ? err.response?.status ?? "no response" : "?"})`, data?.code ? `${data.code}: ${data.message}` : data?.message ?? (err instanceof Error ? err.message : String(err)));
    const timedOut = axios.isAxiosError(err) && err.code === "ECONNABORTED";
    throw new QuoteError(data?.message || (timedOut ? "Calculating delivery charges is taking too long. Please try again." : "Could not calculate delivery charges. Please try again."), data?.data?.options ?? null);
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

/**
 * A refusal that every refused delivery option shares (e.g. "no weight is set for …", which the server attaches to Road
 * and Air alike) is shown once for the group instead of under each option. Returns "" when the reasons differ or only
 * one option is refused, so per-option reasons stay where they are.
 */
export const sharedRefusal = (options: Pick<CheckoutOption, "allowed" | "reason">[]): string => {
  const reasons = options.filter((o) => !o.allowed && o.reason).map((o) => o.reason as string);
  return reasons.length > 1 && reasons.every((r) => r === reasons[0]) ? reasons[0] : "";
};

/**
 * One payment start at a time (double click, Enter + click). Takes the lock on a useRef object and returns true, or
 * returns false while a start is already in flight. Release it (lock.current = false) only when the start failed.
 */
export const takePayLock = (lock: { current: boolean }) => {
  if (lock.current) return false;
  lock.current = true;
  return true;
};

/** ICICI Bank's own domains: the payment page may be on any of their hosts (UAT, live, or a new one ICICI moves to). */
const ICICI_DOMAINS = ["icicibank.com", "icici.com"];
const iciciHost = (h: string) => ICICI_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`));
const LOOPBACK = new Set(["localhost", "127.0.0.1"]);

/**
 * Checks the payment page from the initiate reply. Accepted (normalised URL, reason ""): https without credentials on
 * icicibank.com / icici.com or any subdomain; or the local ICICI mock, a loopback page (http or https), only while this
 * storefront is itself open on loopback, so a deployed site is never sent to localhost. Anything else: url "" and a
 * reason naming the host (never the full URL: its tranCtx is a payment token).
 */
export const checkPaymentPage = (reply: unknown): { url: string; reason: string } => {
  const raw = (reply as { data?: { redirectUrl?: unknown } } | null)?.data?.redirectUrl;
  if (typeof raw !== "string" || !raw) return { url: "", reason: "the server sent no payment page address" };
  let u: URL;
  try { u = new URL(raw); } catch { return { url: "", reason: "the payment page address is not a valid URL" }; }
  if (u.username || u.password) return { url: "", reason: `the payment page address on ${u.hostname} contains credentials` };
  const here = typeof window === "undefined" ? "" : window.location.hostname;
  if (LOOPBACK.has(u.hostname)) {
    return LOOPBACK.has(here) && (u.protocol === "http:" || u.protocol === "https:")
      ? { url: u.toString(), reason: "" }
      : { url: "", reason: `the server sent a local test payment page (${u.host}); it is only allowed while the shop runs on localhost. The server is pointed at the local ICICI mock` };
  }
  if (!iciciHost(u.hostname)) return { url: "", reason: `${u.host} is not an ICICI Bank payment host` };
  if (u.protocol !== "https:") return { url: "", reason: `the ICICI payment page on ${u.host} is not https` };
  return { url: u.toString(), reason: "" };
};

/** The accepted payment page URL, or "" (see checkPaymentPage for why). */
export const paymentPageUrl = (reply: unknown): string => checkPaymentPage(reply).url;

/** Shown when the server answered but its payment page address is not one the browser may be sent to. */
export const PAGE_URL_REFUSED = "The payment page address from the server was not accepted. You have not been charged; please try again.";

export type PayStage = "" | "connecting" | "redirecting";

/**
 * Starts the ICICI payment once per click burst: lock -> "connecting" while the server opens it -> "redirecting" and
 * navigate. Every failure (no reply, timeout, refusal, bad URL, a navigation that throws) releases the lock and clears
 * the stage before onError. A navigation that never leaves the page (cancelled, blocked, ICICI not answering) is
 * caught by the watchdog: after stuckAfterMs the lock and stage are released and onStuck runs. Unloading the page
 * stops the timer with it; the page clears it on a back-navigation restore.
 */
export const startPayment = async (o: {
  lock: { current: boolean };
  watchdog: { current: ReturnType<typeof setTimeout> | undefined };
  setStage: (s: PayStage) => void;
  initiate: () => Promise<unknown>;
  navigate: (url: string) => void;
  onError: (err: unknown) => void;
  onStuck: () => void;
  stuckAfterMs?: number;
}) => {
  if (!takePayLock(o.lock)) return;
  o.setStage("connecting");
  try {
    const { url, reason } = checkPaymentPage(await o.initiate());
    if (!url) {
      console.error(`[checkout] payment page refused: ${reason}`);
      throw new Error(`${PAGE_URL_REFUSED} (${reason})`);
    }
    o.setStage("redirecting");
    o.navigate(url);
    o.watchdog.current = setTimeout(() => { o.lock.current = false; o.setStage(""); o.onStuck(); }, o.stuckAfterMs ?? 20_000);
  } catch (err) {
    o.lock.current = false;
    o.setStage("");
    o.onError(err);
  }
};
