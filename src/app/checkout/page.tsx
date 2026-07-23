"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, MapPin, X, Lock, ArrowRight } from "lucide-react";
import { useCart, calculateLocalShipping } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { getAPIURL } from "../../lib/apiClient";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newAddressForm, setNewAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const [shippingDetails, setShippingDetails] = useState<{
    subtotal: number;
    totalWeight: number;
    baseShipping: number;
    extraWeightCharge: number;
    shipping: number;
    grandTotal: number;
  } | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  useEffect(() => {
    const fetchShippingDetails = async () => {
      if (cartItems.length === 0) {
        setShippingDetails(null);
        return;
      }
      setIsLoadingShipping(true);
      try {
        const apiURL = getAPIURL();
        const items = cartItems.map(item => ({
          product: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          size: item.size === "Standard" ? undefined : item.size
        }));
        const res = await axios.post(`${apiURL}/payments/calculate-shipping`, { items });
        if (res.data.success) {
          setShippingDetails(res.data.data);
        } else {
          setShippingDetails(calculateLocalShipping(cartItems));
        }
      } catch (err) {
        console.error("Failed to calculate shipping from backend, falling back to local calculation", err);
        setShippingDetails(calculateLocalShipping(cartItems));
      } finally {
        setIsLoadingShipping(false);
      }
    };
    fetchShippingDetails();
  }, [cartItems]);

  const subtotal = shippingDetails ? shippingDetails.subtotal : cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = shippingDetails ? shippingDetails.shipping : 0;
  const total = shippingDetails ? shippingDetails.grandTotal : subtotal;

  // Check login status on mount
  useEffect(() => {
    const userStr = localStorage.getItem("luxygalleria_user");
    if (!userStr) {
      showToast("Please login to proceed with checkout.", "warning");
      router.push("/sign-in");
      return;
    }
    setIsLoggedIn(true);
    setIsLoading(false);
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const userStr = localStorage.getItem("luxygalleria_user");
      if (!userStr) {
        console.log('No user token found');
        return;
      }
      
      const userData = JSON.parse(userStr);
      const token = userData.token;
      
      if (!token) {
        console.log('No token in user data');
        showToast("Please login again to continue.", "warning");
        router.push("/sign-in");
        return;
      }

      const apiURL = getAPIURL();
      console.log('Fetching addresses from:', `${apiURL}/users/addresses`);
      
      const res = await axios.get(`${apiURL}/users/addresses`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (res.data.success && res.data.data) {
        const mappedAddresses = res.data.data.map((addr: any) => ({
          id: addr._id,
          name: addr.city?.toLowerCase() || 'Address',
          line1: `${addr.street ? addr.street + ", " : ""}${addr.state?.toLowerCase() || ''}`,
          line2: addr.zipCode,
          fullAddress: addr
        }));
        setAddresses(mappedAddresses);
        if (mappedAddresses.length > 0) {
          setSelectedAddressId(mappedAddresses[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch addresses", err);
      if (err.response?.status === 401) {
        showToast("Session expired. Please login again.", "warning");
        localStorage.removeItem("luxygalleria_user");
        router.push("/sign-in");
      } else {
        showToast("Failed to load addresses. Please try again.", "error");
      }
    }
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!newAddressForm.city.trim()) errors.city = "City is required.";
    if (!newAddressForm.state.trim()) errors.state = "State is required.";
    if (!newAddressForm.zip.trim()) errors.zip = "ZIP code is required.";
    else if (!/^\d{5,6}$/.test(newAddressForm.zip.trim())) errors.zip = "Enter a valid 5-6 digit ZIP code.";
    if (newAddressForm.street.trim() && newAddressForm.street.trim().length < 3) errors.street = "Street must be at least 3 characters.";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;
    setIsSavingAddress(true);

    try {
      const userStr = localStorage.getItem("luxygalleria_user");
      
      // If logged in, save to backend
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          const token = userData.token;
          
          if (!token) {
            showToast("Please login again.", "warning");
            router.push("/sign-in");
            return;
          }
          
          const apiURL = getAPIURL();

          const payload = {
            street: newAddressForm.street.trim(),
            city: newAddressForm.city.trim(),
            state: newAddressForm.state.trim(),
            zipCode: newAddressForm.zip.trim(),
            country: newAddressForm.country
          };

          console.log('Saving address:', payload);

          const res = await axios.post(`${apiURL}/users/addresses`, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true
          });

          if (res.data.success) {
            const newAddrs = res.data.data;
            const mappedAddresses = newAddrs.map((addr: any) => ({
              id: addr._id,
              name: addr.city?.toLowerCase() || 'Address',
              line1: `${addr.street ? addr.street + ", " : ""}${addr.state?.toLowerCase() || ''}`,
              line2: addr.zipCode,
              fullAddress: addr
            }));
            setAddresses(mappedAddresses);
            if (mappedAddresses.length > 0) {
              setSelectedAddressId(mappedAddresses[mappedAddresses.length - 1].id);
            }
            showToast("Address saved successfully!", "success");
          } else {
            showToast(res.data.message || "Failed to save address", "error");
          }
        } catch (err: any) {
          console.error('Address save error:', err);
          if (err.response?.status === 401) {
            showToast("Session expired. Please login again.", "warning");
            localStorage.removeItem("luxygalleria_user");
            router.push("/sign-in");
          } else {
            showToast(err.response?.data?.message || "Error saving address", "error");
          }
        }
      } else {
        // Guest checkout: save address to sessionStorage temporarily
        const guestAddress = {
          street: newAddressForm.street.trim(),
          city: newAddressForm.city.trim(),
          state: newAddressForm.state.trim(),
          zipCode: newAddressForm.zip.trim(),
          country: newAddressForm.country,
          id: `guest_${Date.now()}`
        };
        
        const guestAddresses = JSON.parse(sessionStorage.getItem("guest_addresses") || "[]");
        guestAddresses.push(guestAddress);
        sessionStorage.setItem("guest_addresses", JSON.stringify(guestAddresses));
        
        const mappedAddress = {
          id: guestAddress.id,
          name: guestAddress.city?.toLowerCase() || 'Address',
          line1: `${guestAddress.street ? guestAddress.street + ", " : ""}${guestAddress.state?.toLowerCase() || ''}`,
          line2: guestAddress.zipCode,
        };
        
        setAddresses([...addresses, mappedAddress]);
        setSelectedAddressId(guestAddress.id);
        showToast("Address added for checkout (guest mode)", "info");
      }
      
      setIsAddressModalOpen(false);
      setNewAddressForm({ street: "", city: "", state: "", zip: "", country: "India" });
      setAddressErrors({});
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Calculation is resolved from backend shippingDetails state


  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      showToast("Please select a shipping address.", "warning");
      return;
    }

    if (cartItems.length === 0) {
      showToast("Your cart is empty.", "warning");
      return;
    }

    try {
      const userStr = localStorage.getItem("luxygalleria_user");
      if (!userStr) {
        showToast("Please login to proceed.", "warning");
        return;
      }
      const { token } = JSON.parse(userStr);

      const API_URL = getAPIURL();

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);

      // Format items for backend
      const orderItems = cartItems.map(item => ({
        product: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        image: item.image,
        subtotal: item.price * item.quantity,
      }));

      const orderShippingAddress = {
        street: selectedAddress?.line1.split(", ")[0] || '',
        city: selectedAddress?.name || '',
        state: selectedAddress?.line1.split(", ")[1] || '',
        zipCode: selectedAddress?.line2 || '',
        country: "India"
      };

      // Call backend to create Razorpay order only (no DB save yet)
      const createOrderRes = await axios.post(`${API_URL}/payments/create-order`, {
        total,
        items: orderItems,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!createOrderRes.data.success) {
        showToast("Failed to create order.", "error");
        return;
      }

      const { razorpayOrder, isMock, key_id } = createOrderRes.data.data;

      if (isMock) {
        setIsVerifyingPayment(true);
        const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
          razorpay_order_id: razorpayOrder.id,
          razorpay_payment_id: "mock_payment",
          razorpay_signature: "mock_signature",
          // Pass order details so backend saves to DB
          items: orderItems,
          shippingAddress: orderShippingAddress,
          subtotal,
          shippingFee: shipping,
          total,
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (verifyRes.data.success) {
          await clearCart();
          window.location.href = "/order-success";
        } else {
          setIsVerifyingPayment(false);
          window.location.href = "/order-failure";
        }
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        showToast("Razorpay SDK failed to load. Are you online?", "error");
        return;
      }

      const options = {
        key: key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKey", // Use backend key first to guarantee match
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Luxy Galleria",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          setIsVerifyingPayment(true);
          try {
            // Verify payment
            const verifyRes = await axios.post(`${API_URL}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              // Pass order details so backend saves to DB
              items: orderItems,
              shippingAddress: orderShippingAddress,
              subtotal,
              shippingFee: shipping,
              total,
            }, {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (verifyRes.data.success) {
              await clearCart();
              window.location.href = "/order-success";
            } else {
              setIsVerifyingPayment(false);
              window.location.href = "/order-failure";
            }
          } catch (err) {
            console.error(err);
            setIsVerifyingPayment(false);
            window.location.href = "/order-failure";
          }
        },
        prefill: {
          name: "Customer",
          email: "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#0A192F"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        window.location.href = "/order-failure";
      });
      rzp.open();

    } catch (err: any) {
      setIsVerifyingPayment(false);
      const status = err.response?.status;
      if (status === 401) {
        // Token expired or invalid - redirect to sign-in
        localStorage.removeItem("luxygalleria_user");
        showToast("Your session expired. Please sign in again.", "warning");
        router.push("/sign-in");
      } else {
        console.error("Checkout error:", err);
        showToast(err.response?.data?.message || "An error occurred during checkout.", "error");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center pt-24">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#0A192F] to-[#A68B5B] rounded-full flex items-center justify-center animate-pulse">
            <Lock className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Secure Checkout</h2>
            <p className="text-slate-500 mt-2">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifyingPayment) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#0A192F] rounded-full animate-spin mb-6"></div>
        <h2 className="font-sans font-bold text-2xl text-slate-900 mb-2">Verifying Payment</h2>
        <p className="text-slate-500">Please wait while we confirm your order. Do not close this window.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-8">

        {/* Main Title */}
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-slate-900 mb-12">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* ── Left Column (Steps) ── */}
          <div className="lg:col-span-8 flex flex-col gap-12">

            {/* Step 1: SHIPPING DESTINATION */}
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  1
                </div>
                <h2 className="font-sans font-black text-4xl lg:text-5xl text-[#0A192F] uppercase tracking-tight text-left w-full leading-[1.1]">
                  Shipping<br />Destination
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-6 ml-0 sm:ml-12 mt-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`relative border rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 w-full max-w-sm bg-white text-left transition-colors ${isSelected ? "border-slate-300" : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {isSelected && (
                        <div className="absolute -top-3 right-8 w-6 h-6 bg-[#0A192F] text-white rounded-full flex items-center justify-center border-4 border-white box-content">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="text-slate-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-sans font-bold text-slate-900 mb-2">{addr.name}</p>
                          <p className="font-sans text-slate-500 leading-relaxed text-sm">
                            {addr.line1}<br />
                            {addr.line2}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* New Address Button */}
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="border border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 w-full sm:w-40 flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 transition-colors text-slate-900 font-bold text-sm"
                >
                  <span className="text-xl font-normal">+</span>
                  <span className="text-center">New<br />Address</span>
                </button>
              </div>
            </div>

            <div className="h-px bg-slate-200 w-full ml-0 sm:ml-12" />

          </div>

          {/* ── Right Column (Order Bag) ── */}
          <div className="lg:col-span-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-32">
            <h2 className="font-sans font-bold text-xl text-slate-900 mb-8">Order Bag</h2>

            {/* Cart Items List */}
            <div className="flex flex-col gap-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {cartItems.length === 0 ? (
                <p className="text-slate-500 font-sans text-sm">Your order bag is empty.</p>
              ) : (
                cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.size || 'default'}-${index}`} className="flex gap-4">
                    <div className="relative w-16 h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <div className="absolute top-0 right-0 bg-[#0A192F] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-bl-lg">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="font-sans font-bold text-sm text-slate-900 leading-snug line-clamp-2 pr-4">
                        {item.name}
                      </h3>
                      {item.size && (
                        <p className="font-sans text-xs text-slate-500 mt-1">
                          {item.size}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-sans font-bold text-sm text-slate-900">
                        {item.currency}{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                <span>Subtotal</span>
                <span className="text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-bold tracking-wide">Free</span>
                  ) : (
                    <span>₹{shipping}</span>
                  )}
                </span>
              </div>
              {shippingDetails && shippingDetails.totalWeight > 0 && (
                <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                  <span>Total Weight</span>
                  <span>{shippingDetails.totalWeight.toFixed(2)} kg</span>
                </div>
              )}
              {shippingDetails && shippingDetails.extraWeightCharge > 0 && (
                <>
                  <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                    <span>Base Shipping (first 1kg)</span>
                    <span>₹{shippingDetails.baseShipping}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                    <span>Extra Weight Charge</span>
                    <span>₹{shippingDetails.extraWeightCharge}</span>
                  </div>
                </>
              )}
            </div>

            <div className="h-px border-t border-dashed border-slate-200 mb-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="font-sans font-bold text-lg text-slate-900">Total</span>
              <span className="font-sans font-black text-2xl text-slate-900">₹{total}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-[#111] text-white font-bold text-base py-4 sm:py-5 rounded-xl hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 mb-4"
            >
              Secure Checkout
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-400">
              <ShieldCheck size={14} />
              <p className="font-sans text-[10px] uppercase tracking-widest">
                256-bit SSL Secured Connection
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── New Address Modal ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100">
              <h2 className="font-sans font-black text-2xl text-slate-900 tracking-tight">
                New Shipping Address
              </h2>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 sm:p-8 flex flex-col gap-5">
              <div>
                <label className="block font-sans font-bold text-sm text-slate-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={newAddressForm.street}
                  onChange={(e) => { setNewAddressForm({ ...newAddressForm, street: e.target.value }); setAddressErrors(prev => ({ ...prev, street: '' })); }}
                  className={`w-full border rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-[#0A192F] placeholder:text-slate-400 ${addressErrors.street ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}
                />
                {addressErrors.street && <p className="text-red-500 text-xs mt-1.5 font-medium">{addressErrors.street}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans font-bold text-sm text-slate-700 mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.city}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, city: e.target.value }); setAddressErrors(prev => ({ ...prev, city: '' })); }}
                    className={`w-full border rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-[#0A192F] placeholder:text-slate-400 ${addressErrors.city ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}
                  />
                  {addressErrors.city && <p className="text-red-500 text-xs mt-1.5 font-medium">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="block font-sans font-bold text-sm text-slate-700 mb-2">State <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.state}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, state: e.target.value }); setAddressErrors(prev => ({ ...prev, state: '' })); }}
                    className={`w-full border rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-[#0A192F] placeholder:text-slate-400 ${addressErrors.state ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}
                  />
                  {addressErrors.state && <p className="text-red-500 text-xs mt-1.5 font-medium">{addressErrors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-sans font-bold text-sm text-slate-700 mb-2">ZIP Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.zip}
                    onChange={(e) => { setNewAddressForm({ ...newAddressForm, zip: e.target.value }); setAddressErrors(prev => ({ ...prev, zip: '' })); }}
                    className={`w-full border rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-[#0A192F] placeholder:text-slate-400 ${addressErrors.zip ? 'border-red-400 ring-1 ring-red-400' : 'border-slate-200'}`}
                  />
                  {addressErrors.zip && <p className="text-red-500 text-xs mt-1.5 font-medium">{addressErrors.zip}</p>}
                </div>
                <div>
                  <label className="block font-sans font-bold text-sm text-slate-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={newAddressForm.country}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, country: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base text-slate-900 focus:outline-none focus:border-[#0A192F] placeholder:text-slate-400"
                  />
                </div>
              </div>

              {!isLoggedIn && (
                <p className="text-sm text-blue-600 mb-3">💡 Guest checkout: Address will be saved temporarily for this order.</p>
              )}
              <button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                className="w-full bg-[#111] text-white font-bold text-base py-4 rounded-xl mt-4 hover:bg-black transition-colors focus:outline-none disabled:opacity-50"
              >
                {isSavingAddress ? "Saving..." : "Save & Deliver Here"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
