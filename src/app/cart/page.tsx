"use client";

import ResilientImage from "../../components/common/ResilientImage";
import Link from "next/link";
import { ChevronRight, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

import { useCart } from "../../context/CartContext";
import { useQuote, rupees, money, pricedLine } from "../../lib/checkoutQuote";
import { getImageUrl } from '../../lib/imageUtils';

// ─── Page Component ───────────────────────────────────────────────────────────

export default function CartPage() {
  const { cartItems, updateQuantity, removeItem } = useCart();
  // Estimate from the server (destination not known yet); never a locally computed charge
  const { quote, quoteError, isLoading: isLoadingShipping } = useQuote(cartItems);

  const subtotal = quote ? quote.subtotal : money(cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0));
  const MAX_QTY_PER_LINE = 100; // the server's per-line limit
  const total = quote ? quote.grandTotal : subtotal;

  return (
    <div className="bg-white pt-24 pb-16">
      {/* ── Breadcrumb ── */}
      <nav
        className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-4 flex items-center gap-2 text-xs font-sans text-slate-400"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-slate-700 transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-slate-700 font-semibold">Shopping Cart</span>
      </nav>

      {/* ── Main Layout ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-8">
        <h1 className="font-serif font-normal text-4xl md:text-5xl text-slate-900 mb-10">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-slate-100 rounded-3xl bg-slate-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
              <ShoppingBag size={40} className="text-slate-300" />
            </div>
            <h2 className="font-sans font-bold text-2xl text-slate-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-500 mb-8 max-w-md font-sans">
              Looks like you haven&apos;t added anything to your cart yet. Browse our products and find something you love.
            </p>
            <Link
              href="/products"
              className="bg-slate-900 text-white font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-full hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            
            {/* ── Cart Items List (Left Column) ── */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.id}-${item.variantId || item.size || 'default'}-${index}`}
                  className="flex flex-col sm:flex-row gap-6 p-8 sm:p-6 border border-slate-100 rounded-2xl bg-white relative group transition-shadow hover:shadow-md"
                >
                  <button
                    onClick={() => removeItem(item.id, item.variantId, item.size)}
                    aria-label="Remove item"
                    className="absolute top-2 right-4 sm:top-6 sm:right-6 text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
                  >
                    <Trash2 size={20} />
                  </button>

                  {/* Image */}
                  <div className="relative w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100">
                    <ResilientImage
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="object-contain"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="font-sans font-bold text-lg text-slate-900 pr-8 leading-tight mb-2">
                        {item.name}
                      </h3>
                      {item.unavailable && (
                        <p className="font-sans text-sm font-semibold text-red-600 mb-4">
                          This option is no longer available. Please remove it from your cart.
                        </p>
                      )}
                      {item.size && !item.unavailable && (
                        <p className="font-sans text-sm text-slate-500 mb-4 uppercase tracking-wider">
                          Size: <span className="font-semibold text-slate-700">{item.size}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Price & Subtotal */}
                      <div className="flex flex-col gap-0.5">
                        <p className="font-sans font-bold text-xl text-slate-900">
                          {item.currency}{pricedLine(quote, item, index).lineTotal}
                        </p>
                        <p className="text-[12px] text-slate-400 font-sans">
                          {item.currency}{pricedLine(quote, item, index).unitPrice} each
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="inline-flex items-center border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.size)}
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm text-slate-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.size)}
                          aria-label="Increase quantity"
                          // Stop at the server's stock figure (from the quote) and per-line limit instead of failing later
                          disabled={item.quantity >= Math.min(pricedLine(quote, item, index).stock ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE)}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary (Right Column) ── */}
            <div className="lg:col-span-4 bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 sticky top-24">
              <h2 className="font-sans font-bold text-xl text-slate-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-slate-600 font-sans">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal}</span>
                </div>
                {quote ? (
                  <>
                    <div className="flex justify-between items-center text-slate-600 font-sans">
                      <span>{quote.fulfillmentMethod === "pickup" ? "Store pickup" : "Shipping (estimate)"}</span>
                      <span className="font-semibold text-slate-900">
                        {(quote.fulfillmentMethod === "pickup" ? quote.pickupFee : quote.shipping) === 0
                          ? <span className="text-green-600 uppercase text-xs font-bold tracking-wider">Free</span>
                          : <span>{rupees(quote.fulfillmentMethod === "pickup" ? quote.pickupFee : quote.shipping)}</span>}
                      </span>
                    </div>
                    {quote.specialPackagingFee > 0 && (
                      <div className="flex justify-between items-center text-slate-600 font-sans">
                        <span>Special packaging</span>
                        <span className="font-semibold text-slate-900">₹{quote.specialPackagingFee}</span>
                      </div>
                    )}
                    {quote.specialPackaging.items.length > 0 && (
                      <p className="text-xs text-amber-800">
                        Temperature-sensitive items: {quote.specialPackaging.items.join(", ")}. Special packaging and delivery options are confirmed at checkout.
                      </p>
                    )}
                    {quote.tax.enabled && quote.tax.taxAmount > 0 && (
                      <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                        <span>{quote.tax.pricesIncludeTax ? "GST (included)" : "GST"}</span>
                        <span>₹{quote.tax.taxAmount}</span>
                      </div>
                    )}
                    {quote.totalWeight > 0 && (
                      <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                        <span>Total Weight</span>
                        <span>{quote.totalWeight.toFixed(2)} kg</span>
                      </div>
                    )}
                    {quote.fulfillmentMethod === "delivery" && (
                      <p className="text-xs text-slate-400">Final delivery charge depends on your address and delivery option at checkout.</p>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between items-center text-slate-600 font-sans">
                    <span>Shipping</span>
                    <span className="text-sm text-slate-500">{isLoadingShipping ? "Calculating…" : "Calculated at checkout"}</span>
                  </div>
                )}
                {quoteError && !isLoadingShipping && <p className="text-xs text-amber-700">{quoteError}</p>}
              </div>

              <div className="h-px bg-slate-200 mb-6" />

              <div className="flex justify-between items-end mb-8">
                <span className="font-sans font-bold text-lg text-slate-900">{quote ? "Estimated total" : "Subtotal"}</span>
                <span className="font-sans font-bold text-3xl text-slate-900">₹{total}</span>
              </div>

              <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest py-4 rounded-full hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A68B5B]/50 focus:ring-offset-2">
                Proceed to Checkout
              </Link>
              
              <p className="text-center text-xs text-slate-400 mt-4">
                Secure checkout. 100% genuine products.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
