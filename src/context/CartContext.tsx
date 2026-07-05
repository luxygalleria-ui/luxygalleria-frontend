"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  size?: string;
  quantity: number;
  weight?: number;
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

export interface ShippingDetails {
  subtotal: number;
  totalWeight: number;
  baseShipping: number;
  extraWeightCharge: number;
  shipping: number;
  grandTotal: number;
}

export const calculateLocalShipping = (cartItems: CartItem[]): ShippingDetails => {
  let subtotal = 0;
  let totalWeight = 0;

  for (const item of cartItems) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    
    let itemWeight = 0;
    if (item.size) {
      const parsed = parseWeightFromVolume(item.size);
      if (parsed !== null) {
        itemWeight = parsed;
      }
    }
    if (!itemWeight) {
      itemWeight = item.weight || 0;
    }
    
    subtotal += price * qty;
    totalWeight += itemWeight * qty;
  }

  let baseShipping = 0;
  let extraWeightCharge = 0;
  let shipping = 0;
  let grandTotal = 0;

  const roundedWeight = Math.round(totalWeight * 1000) / 1000;
  if (subtotal > 0) {
    if (roundedWeight <= 0.5) {
      baseShipping = 40;
    } else {
      baseShipping = 80;
    }

    const extraWeight = Math.max(roundedWeight - 1.0, 0);
    extraWeightCharge = Math.ceil(extraWeight) * 20;
    shipping = baseShipping + extraWeightCharge;
    grandTotal = subtotal + shipping;
  }

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalWeight: Math.round(totalWeight * 1000) / 1000,
    baseShipping,
    extraWeightCharge,
    shipping,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, qty: number, size?: string) => void;
  removeItem: (id: string, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  };

  const getToken = () => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("luxygalleria_user");
      if (userStr) {
        return JSON.parse(userStr).token;
      }
    }
    return null;
  };

  useEffect(() => {
    const initCart = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await axios.get(`${getApiUrl()}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.success && res.data.data?.items) {
            const items = res.data.data.items
              .filter((item: any) => item.product) // ensure product exists
              .map((item: any) => {
                const variant = item.product.variants?.find((v: any) => v.volume === item.size) || item.product.variants?.[0] || {};
                return {
                  id: item.product._id,
                  name: item.product.name,
                  image: item.product.images?.[0] || '',
                  price: variant.price || 0,
                  currency: '₹',
                  size: variant.volume || "Standard",
                  quantity: item.quantity,
                  weight: parseWeightFromVolume(variant.volume || '') || variant.weight || item.product.weight || 0,
                };
              });
            setCartItems(items);
            localStorage.setItem("luxygalleria_cart", JSON.stringify(items));
          }
        } catch (err: any) {
          // Silently handle 401 (unauthorized) - user just not logged in
          if (err?.response?.status !== 401) {
            console.error("Failed to fetch cart from backend", err);
          }
          // Load from local storage instead
          const localCart = localStorage.getItem("luxygalleria_cart");
          if (localCart) setCartItems(JSON.parse(localCart));
        }
      } else {
        const localCart = localStorage.getItem("luxygalleria_cart");
        if (localCart) setCartItems(JSON.parse(localCart));
      }
      setIsLoaded(true);
    };
    initCart();
  }, []);

  const addToCart = async (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.size === item.size);
      let newCart;
      if (existing) {
        const newQty = existing.quantity + item.quantity;
        newCart = prev.map(i => (i.id === item.id && i.size === item.size) ? { ...i, quantity: newQty } : i);
      } else {
        newCart = [...prev, item];
      }
      localStorage.setItem("luxygalleria_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      try {
        await axios.post(`${getApiUrl()}/cart`, {
          productId: item.id,
          quantity: item.quantity,
          size: item.size
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err: any) {
        // Silently handle 401 - user session might have expired
        if (err?.response?.status !== 401) {
          console.error("Failed to add to backend cart", err);
        }
      }
    }
  };

  const updateQuantity = async (id: string, qty: number, size?: string) => {
    if (qty < 1) return;
    setCartItems(prev => {
      const existing = prev.find(i => i.id === id && i.size === size);
      const validQty = qty;
      const newCart = prev.map(i => (i.id === id && i.size === size) ? { ...i, quantity: validQty } : i);
      localStorage.setItem("luxygalleria_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      try {
        await axios.put(`${getApiUrl()}/cart/item`, {
          productId: id,
          quantity: qty,
          size: size
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err: any) {
        // Silently handle 401 - user session might have expired
        if (err?.response?.status !== 401) {
          console.error("Failed to update backend cart", err);
        }
      }
    }
  };

  const removeItem = async (id: string, size?: string) => {
    setCartItems(prev => {
      const newCart = prev.filter(i => !(i.id === id && i.size === size));
      localStorage.setItem("luxygalleria_cart", JSON.stringify(newCart));
      return newCart;
    });

    const token = getToken();
    if (token) {
      try {
        await axios.delete(`${getApiUrl()}/cart/item`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId: id, size }
        });
      } catch (err: any) {
        // Silently handle 401 - user session might have expired
        if (err?.response?.status !== 401) {
          console.error("Failed to remove from backend cart", err);
        }
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    localStorage.removeItem("luxygalleria_cart");

    const token = getToken();
    if (token) {
      try {
        await axios.delete(`${getApiUrl()}/cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err: any) {
        // Silently handle 401 - user session might have expired
        if (err?.response?.status !== 401) {
          console.error("Failed to clear backend cart", err);
        }
      }
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart, cartCount }}>
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
