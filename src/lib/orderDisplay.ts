/**
 * Customer order history: the payment / refund state shown NEXT TO the order status, so "Cancelled" (the order) and
 * "Refunded" (the money) are never confused. Uses only what /payments/myorders returns: paymentStatus and the safe
 * refund summary { state: "in_progress" | "refunded", amount, refundedAt } (or null).
 */
export type CustomerRefund = { state: "in_progress" | "refunded"; amount: number; refundedAt: string | null } | null | undefined;
type OrderLike = { paymentStatus?: string; refund?: CustomerRefund };
export type Tone = "green" | "amber" | "red" | "slate";

const day = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

/** The payment badge: what happened to the money. */
export const paymentBadge = (o: OrderLike): { label: string; tone: Tone } => {
  if (o.refund?.state === "refunded" || o.paymentStatus === "refunded") {
    return { label: o.refund ? `Refunded ₹${o.refund.amount}` : "Refunded", tone: "green" };
  }
  if (o.refund?.state === "in_progress") return { label: "Refund in progress", tone: "amber" };
  if (o.paymentStatus === "completed") return { label: "Paid", tone: "green" };
  if (o.paymentStatus === "failed") return { label: "Payment failed", tone: "red" };
  return { label: "Payment pending", tone: "amber" };
};

/** One sentence about the refund for the order card, or "" when there is no refund. */
export const refundNote = (o: OrderLike): string => {
  const r = o.refund;
  if (!r) return o.paymentStatus === "refunded" ? "This payment has been refunded." : "";
  if (r.state === "refunded") {
    const when = r.refundedAt ? day(r.refundedAt) : "";
    return `₹${r.amount} was refunded to your original payment method${when ? ` on ${when}` : ""}. Banks usually show it within 5–7 working days.`;
  }
  return `A refund of ₹${r.amount} is being processed to your original payment method.`;
};

/** Tailwind classes per tone (kept here so the two badges look consistent). */
export const toneClass: Record<Tone, string> = {
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  slate: "bg-slate-100 text-slate-700",
};
