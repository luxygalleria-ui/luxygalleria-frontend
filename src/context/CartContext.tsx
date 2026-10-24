"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { fixCloudinaryCloud } from '../lib/imageUtils';
import { getAPIURL } from '../lib/apiClient';
import { useToast } from './ToastContext';

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  size?: string;
  quantity: number;
  weight?: number;
  variantId?: string;
}

export const parseWeightFromVolume = (volume: string): number | null => {
  if (!volume) return null;
  const match = volume.match(/(\d+(?:\.\d+)?)\s*(kg|g|gm|gms|l|ltr|liter|liters|litre|litres|ml)/i);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 'kg' || unit === 'l' || unit === 'ltr' || unit === 'liter' || unit === 'liters' || unit === 'litre' || unit === 'litres') {
      return value;
    } else if (unit === 'g' || unit === 'gm' || unit === 'gms' || unit === 'ml') {
      return value / 1000;
    }
  }
  return null;
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, qty: number, variantId?: string, size?: string) => void;
  removeItem: (id: string, variantId?: string, size?: string) => void;
  clearCart: () => Promise<void>;
  /** Call right after sign-in/registration: moves the signed-out cart to the account, then loads the server cart. */
  syncCartAfterLogin: () => Promise<void>;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/** Server cart lines -> cart items. Prices and names come from the server's product data. */
const fromServerCart = (lines: any[]): CartItem[] =>
  lines
    .filter((item: any) => item.product) // ensure product exists
    .map((item: any) => {
      const variant = item.product.variants?.find((v: any) => v._id.toString() === item.variantId?.toString()) || item.product.variants?.[0] || {};
      return {
        id: item.product._id,
        name: item.product.name,
        image: fixCloudinaryCloud(variant.image || item.product.images?.[0] || ''),
        price: variant.offerPrice || variant.price || 0,
        currency: '₹',
        size: variant.volume || "Standard",
        quantity: item.quantity,
        weight: variant.weight || parseWeightFromVolume(variant.volume || '') || item.product.weight || 0,
        variantId: item.variantId || variant._id?.toString() || '',
      };
    });

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();
  // Cart writes run one at a time, in click order: rapid +/- taps can't race or arrive out of order
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const enqueue = <T,>(job: () => Promise<T>) => {
    const run = queue.current.then(job, job);
    queue.current = run.catch(() => undefined);
    return run;
  };

  const getToken = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("luxygalleria_user");
      if (userStr) {
        try { return JSON.parse(userStr).token; } catch { return null; }
      }
    }
    return null;
  };

  const save = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem("luxygalleria_cart", JSON.stringify(items));
  };

  /** Replaces the cart with the server's copy (the source of truth when signed in). */
  const loadServerCart = useCallback(async (token: string) => {
    const res = await axios.get(`${getAPIURL()}/cart`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.data.success && res.data.data?.items) save(fromServerCart(res.data.data.items));
  }, []);

  /**
   * A cart write failed: say why (e.g. "Only 2 left in stock") and resync from the server, so the next tap
   * doesn't repeat a request the server already refused. A rejected session is dropped once, silently.
   */
  const handleWriteError = async (err: any, token: string) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("luxygalleria_user");
      return;
    }
    console.error("Cart update failed", err?.response?.status, err?.response?.data?.message || err?.message);
    showToast(err?.response?.data?.message || "Could not update your cart. Please try again.", "error");
    try { await loadServerCart(token); } catch { /* keep the current view; the next action retries */ }
  };

  useEffect(() => {
    const initCart = async () => {
      const token = getToken();
      const localCart = localStorage.getItem("luxygalleria_cart");
      if (token) {
        try {
          await loadServerCart(token);
          return;
        } catch (err: any) {
          if (err?.response?.status === 401) {
            // The stored token was rejected (expired, or its user no longer exists): drop it once, as apiClient does,
            // instead of re-sending it on every page load. The browser cart below keeps working as a guest cart.
            localStorage.removeItem("luxygalleria_user");
          } else {
            console.error("Failed to fetch cart from backend", err);
          }
        }
      }
      // Signed out, or the server cart could not be loaded: use the browser cart
      if (localCart) setCartItems(JSON.parse(localCart));
    };
    initCart();
  }, [loadServerCart]);

  const syncCartAfterLogin = async () => {
    const token = getToken();
    if (!token) return;
    const guestItems: CartItem[] = JSON.parse(localStorage.getItem("luxygalleria_cart") || "[]");
    await enqueue(async () => {
      // "Set quantity" (not "add"), so a repeated sync never doubles a line
      for (const item of guestItems) {
        try {
          await axios.put(`${getAPIURL()}/cart/item`, { productId: item.id, variantId: item.variantId, quantity: item.quantity, size: item.size },
            { headers: { Authorization: `Bearer ${token}` } });
        } catch (err: any) {
          if (err?.response?.status === 401) return;
          // e.g. out of stock or discontinued since it was added: tell the customer, keep going with the rest
          showToast(`${item.name}: ${err?.response?.data?.message || "could not be added to your account cart"}`, "warning");
        }
      }
      try { await loadServerCart(token); } catch (err) { console.error("Failed to load cart after sign-in", err); }
    });
  };

  const sameLine = (i: CartItem, id: string, variantId?: string, size?: string) =>
    i.id === id && (variantId ? i.variantId === variantId : i.size === size);

  const addToCart = async (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => sameLine(i, item.id, item.variantId, item.size));
      const newCart = existing
        ? prev.map(i => sameLine(i, item.id, item.variantId, item.size) ? { ...i, quantity: existing.quantity + item.quantity } : i)
        : [...prev, item];
      localStorage.setItem("luxygalleria_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      await enqueue(async () => {
        try {
          await axios.post(`${getAPIURL()}/cart`, { productId: item.id, variantId: item.variantId, quantity: item.quantity, size: item.size },
            { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
          await handleWriteError(err, token);
        }
      });
    }
  };

  const updateQuantity = async (id: string, qty: number, variantId?: string, size?: string) => {
    if (qty < 1) return;
    setCartItems(prev => {
      const newCart = prev.map(i => sameLine(i, id, variantId, size) ? { ...i, quantity: qty } : i);
      localStorage.setItem("luxygalleria_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      await enqueue(async () => {
        try {
          await axios.put(`${getAPIURL()}/cart/item`, { productId: id, variantId, quantity: qty, size },
            { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
          await handleWriteError(err, token);
        }
      });
    }
  };

  const removeItem = async (id: string, variantId?: string, size?: string) => {
    setCartItems(prev => {
      const newCart = prev.filter(i => !sameLine(i, id, variantId, size));
      localStorage.setItem("luxygalleria_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      await enqueue(async () => {
        try {
          await axios.delete(`${getAPIURL()}/cart/item`, { headers: { Authorization: `Bearer ${token}` }, data: { productId: id, variantId, size } });
        } catch (err) {
          await handleWriteError(err, token);
        }
      });
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("luxygalleria_cart");

    const token = getToken();
    if (token) {
      await enqueue(async () => {
        try {
          await axios.delete(`${getAPIURL()}/cart`, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err: any) {
          // Silently handle 401 - user session might have expired
          if (err?.response?.status !== 401) console.error("Failed to clear backend cart", err);
        }
      });
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart, syncCartAfterLogin, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
