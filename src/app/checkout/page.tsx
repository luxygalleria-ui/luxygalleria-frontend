"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ResilientImage from "../../components/common/ResilientImage";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check, ShieldCheck, MapPin, X, Lock, Store, Truck } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useQuote, Fulfillment, METHOD_LABEL, rupees, money, pricedLine, packagingSummary, startPayment, PayStage, sharedRefusal, PAGE_URL_REFUSED } from "../../lib/checkoutQuote";
import { inr } from "../../lib/orderDisplay";
import { TEST_PAYMENT_NOTICE } from "../../lib/testPayment";
import { useToast } from "../../context/ToastContext";
import { getAPIURL } from "../../lib/apiClient";
import { pinStateProblem } from "../../lib/addressRules";
import { fixCloudinaryCloud, getImageUrl } from '../../lib/imageUtils';

/** Saved address (server shape) -> checkout card. */
type SavedAddress = { _id: string; street?: string; city?: string; state?: string; zipCode?: string; country?: string };
const toCard = (addr: SavedAddress) => ({
  id: addr._id,
  name: addr.city?.toLowerCase() || 'Address',
  line1: `${addr.street ? addr.street + ", " : ""}${addr.state?.toLowerCase() || ''}`,
  line2: addr.zipCode,
  fullAddress: addr,
});

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  // Which choice the New Address modal fills: the delivery destination or the billing address
  const [modalFor, setModalFor] = useState<"shipping" | "billing">("shipping");
  const openAddressModal = (forWhat: "shipping" | "billing") => { setModalFor(forWhat); setIsAddressModalOpen(true); };
  const [addresses, setAddresses] = useState<ReturnType<typeof toCard>[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
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
  // "" | waiting for the server to open the ICICI payment | ICICI's URL received, browser leaving
  const [payStage, setPayStage] = useState<PayStage>("");
  // Last payment failure, shown beside the pay button (the toast fades; this stays until the next attempt)
  const [payError, setPayError] = useState<string | null>(null);
  const isRedirecting = payStage !== "";
  // Set synchronously on the first click: a second click in the same moment (before React re-renders the disabled
  // button) is ignored instead of starting a second ICICI payment
  const payLock = useRef(false);
  // Fires if the browser is still on this page well after being sent to ICICI (see startPayment)
  const leaveWatchdog = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Back from ICICI's page restores this page from the browser cache: re-enable the pay button
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) { clearTimeout(leaveWatchdog.current); payLock.current = false; setPayStage(""); } };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // Delivery or store pickup; the server prices the choice and says which options this cart allows
  const [fulfillment, setFulfillment] = useState<Fulfillment>({ method: "delivery" });
  // A road/air choice belongs to one destination: a new address starts from what the server allows there
  const selectAddress = (id: string) => {
    setSelectedAddressId(id);
    setFulfillment((f) => (f.method === "delivery" ? { method: "delivery" } : f));
  };
  const selectedAddress = addresses.find(a => a.id === selectedAddressId)?.fullAddress;
  const [confirmDeleteId, setConfirmDeleteId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  // Billing: the delivery address by default, or one of the saved addresses (checked again on the server)
  const [billingSame, setBillingSame] = useState(true);
  const [billingAddressId, setBillingAddressId] = useState("");
  const billingAddress = addresses.find(a => a.id === billingAddressId)?.fullAddress;
  const billingMissing = (["city", "state", "zipCode"] as const).filter((f) => !String(billingAddress?.[f] ?? "").trim());
  const billingProblem = fulfillment.method !== "delivery" || billingSame ? ""
    : !billingAddress ? "Choose a billing address or add a new one."
    : billingMissing.length ? `Your billing address is missing its ${billingMissing.map((f) => (f === "zipCode" ? "PIN code" : f)).join(" and ")}. Choose or add a complete address.`
    : "";
  // Delivery is priced by destination: without a complete address there is no correct charge to show
  const missingFields = (["city", "state", "zipCode"] as const).filter((f) => !String(selectedAddress?.[f] ?? "").trim());
  const addressProblem = fulfillment.method !== "delivery" ? ""
    : !selectedAddress ? "Add or select a delivery address to see the delivery charge."
    : missingFields.length ? `Your selected address is missing its ${missingFields.map((f) => (f === "zipCode" ? "PIN code" : f)).join(" and ")}. Add a complete address to continue.`
    // An older saved address can contradict itself (e.g. a Kerala PIN with another state): say so before payment
    : pinStateProblem(selectedAddress) ? `This saved address needs a correction: ${pinStateProblem(selectedAddress)} Delete it and add the corrected address.`
    : "";
  const { quote, quoteError, errorOptions, isLoading: isLoadingShipping, retry: retryQuote } =
    useQuote(cartItems, fulfillment, fulfillment.method === "delivery" ? selectedAddress?.state : undefined,
      fulfillment.method === "delivery" ? selectedAddress?.country : undefined, !addressProblem);

  const options = quote?.options ?? errorOptions ?? [];
  const deliveryOptions = options.filter(o => o.fulfillment === "delivery" && (o.offered || o.reason));
  const sharedDeliveryRefusal = sharedRefusal(deliveryOptions);
  // Shown whenever the server lists it: selectable only while offered, otherwise greyed with the server's reason
  const pickupOption = options.find(o => o.fulfillment === "pickup");
  const isPickup = fulfillment.method === "pickup";
  const subtotal = quote ? quote.subtotal : money(cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0));
  const total = quote ? quote.grandTotal : null;

  const fetchAddresses = async () => {
    try {
      const userStr = localStorage.getItem("luxygalleria_user");
      if (!userStr) return;
      
      const userData = JSON.parse(userStr);
      const token = userData.token;
      
      if (!token) {
        showToast("Please login again to continue.", "warning");
        router.push("/sign-in");
        return;
      }

      const apiURL = getAPIURL();
      const res = await axios.get(`${apiURL}/users/addresses`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (res.data.success && res.data.data) {
        const mappedAddresses = res.data.data.map(toCard);
        setAddresses(mappedAddresses);
        if (mappedAddresses.length > 0) {
          setSelectedAddressId(mappedAddresses[0].id);
        }
      }
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
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

  // Check login status on mount
  useEffect(() => {
    const userStr = localStorage.getItem("luxygalleria_user");
    if (!userStr) {
      showToast("Please login to proceed with checkout.", "warning");
      router.push("/sign-in");
      return;
    }
    // Client-only sign-in gate: localStorage cannot be read during server render, so the page is revealed here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(false);
    fetchAddresses();
    // Runs once on mount by design: re-running on every render would refetch the addresses each time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteAddress = async (id: string) => {
    const token = JSON.parse(localStorage.getItem("luxygalleria_user") || "{}").token;
    if (!token) { router.push("/sign-in"); return; }
    setDeletingId(id);
    try {
      const res = await axios.delete(`${getAPIURL()}/users/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const cards = (res.data?.data ?? []).map(toCard);
      setAddresses(cards);
      // The deleted one was in use: move to the first remaining address (re-prices), or none
      if (id === selectedAddressId) selectAddress(cards[0]?.id ?? "");
      // A deleted billing address is never kept: the customer chooses again
      if (id === billingAddressId) setBillingAddressId("");
      showToast("Address deleted.", "success");
    } catch (e) {
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      if (err.response?.status === 401) {
        localStorage.removeItem("luxygalleria_user");
        showToast("Session expired. Please login again.", "warning");
        router.push("/sign-in");
      } else {
        showToast(err.response?.data?.message || "Could not delete the address. Please try again.", "error");
      }
    } finally {
      setDeletingId("");
      setConfirmDeleteId("");
    }
  };

  const validateAddressForm = () => {
    const errors: Record<string, string> = {};
    if (!newAddressForm.city.trim()) errors.city = "City is required.";
    if (!newAddressForm.state.trim()) errors.state = "State is required.";
    if (!newAddressForm.zip.trim()) errors.zip = "PIN code is required.";
    else {
      // Same rule as the server: 6 digits, and the PIN must agree with the state at the Kerala boundary
      const pinProblem = pinStateProblem({ state: newAddressForm.state, zipCode: newAddressForm.zip, country: newAddressForm.country });
      if (pinProblem) errors.zip = pinProblem;
    }
    if (newAddressForm.street.trim() && newAddressForm.street.trim().length < 3) errors.street = "Street must be at least 3 characters.";
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;
    setIsSavingAddress(true);

    try {
      const token = JSON.parse(localStorage.getItem("luxygalleria_user") || "{}").token;
      if (!token) {
        showToast("Please login again.", "warning");
        router.push("/sign-in");
        return;
      }
      const payload = {
        street: newAddressForm.street.trim(),
        city: newAddressForm.city.trim(),
        state: newAddressForm.state.trim(),
        zipCode: newAddressForm.zip.trim(),
        country: newAddressForm.country.trim() || "India",
      };
      try {
        const res = await axios.post(`${getAPIURL()}/users/addresses`, payload, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          withCredentials: true
        });
        if (!res.data.success) {
          showToast(res.data.message || "Failed to save address", "error");
          return;
        }
        const mappedAddresses = res.data.data.map(toCard);
        setAddresses(mappedAddresses);
        const added = mappedAddresses[mappedAddresses.length - 1]?.id;
        if (added && modalFor === "billing") setBillingAddressId(added);
        else if (added) selectAddress(added);
        showToast("Address saved successfully!", "success");
      } catch (e) {
        const err = e as { response?: { status?: number; data?: { message?: string } } };
        if (err.response?.status === 401) {
          showToast("Session expired. Please login again.", "warning");
          localStorage.removeItem("luxygalleria_user");
          router.push("/sign-in");
        } else {
          showToast(err.response?.data?.message || "Error saving address", "error");
        }
        return; // keep the modal open with what was typed
      }

      setIsAddressModalOpen(false);
      setNewAddressForm({ street: "", city: "", state: "", zip: "", country: "India" });
      setAddressErrors({});
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Calculation is resolved from backend shippingDetails state


  const handleCheckout = async () => {
    setPayError(null);
    // Home delivery must resolve to a real address with the fields the order needs, before any payment call
    const selectedAddress = addresses.find(a => a.id === selectedAddressId);
    const addr = selectedAddress?.fullAddress;
    if (!isPickup && (!addr?.city?.trim() || !addr?.state?.trim() || !addr?.zipCode?.trim())) {
      showToast("Please select or add a shipping address", "warning");
      return;
    }
    if (!quote || isLoadingShipping) {
      showToast(quoteError || "Please wait while we calculate your charges.", "warning");
      return;
    }
    // Exactly what the server priced: the payment amount and saved order use the same choice
    const orderFulfillment: Fulfillment = { method: quote.fulfillmentMethod, ...(quote.shippingMethod ? { shippingMethod: quote.shippingMethod } : {}) };

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

      // Format items for backend
      const orderItems = cartItems.map(item => ({
        product: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        image: fixCloudinaryCloud(item.image),
        subtotal: item.price * item.quantity,
      }));

      // Use the stored fields directly (splitting the display string broke when street was empty or had commas)
      // (delivery without a complete address already returned above, so addr is set whenever it is used)
      const orderShippingAddress = isPickup || !addr ? undefined : {
        street: addr.street || '',
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country || "India"
      };

      // ICICI Orange PG is the only gateway: the server prices the cart, reserves stock and opens the payment; the
      // customer pays on ICICI's page and comes back through the backend's return URL to /order-success or /order-failure
      if (billingProblem) { showToast(billingProblem, "warning"); return; }
      await startPayment({
        lock: payLock, watchdog: leaveWatchdog, setStage: setPayStage,
        // The server gives ICICI 20 s; never leave the button spinning if the connection itself hangs.
        // Saved addresses go by id too: the server uses its own copy and refuses one deleted since this page loaded.
        initiate: async () => (await axios.post(`${API_URL}/payments/icici/initiate`, {
          total, items: orderItems, shippingAddress: orderShippingAddress, fulfillment: orderFulfillment,
          ...(isPickup ? {} : { shippingAddressId: selectedAddressId }),
          ...(!isPickup && !billingSame ? { billingAddressId } : {}),
        }, { headers: { Authorization: `Bearer ${token}` }, timeout: 45_000 })).data,
        navigate: (url) => window.location.assign(url),
        onError: (err) => showPayError(err),
        // Still on this page long after being sent to ICICI: the navigation was cancelled or ICICI's page is not answering
        onStuck: () => {
          const msg = "The ICICI payment page did not open. No payment was taken here; please try again.";
          setPayError(msg);
          showToast(msg, "error");
        },
      });
    } catch (err) {
      showPayError(err);
    }
  };

  const showPayError = (e: unknown) => {
      const err = e as { response?: { status?: number; data?: { message?: string; code?: string } }; code?: string; message?: string; isAxiosError?: boolean };
      const status = err.response?.status;
      // Gateway unreachable / proxy timeout / our own timeout: nothing was charged at this step. A plain Error (e.g. the
      // payment page address refused here) is not a network failure and shows its own message.
      const gatewayDown = [502, 503, 504].includes(status ?? 0) || err.code === "ECONNABORTED" || (!!err.isAxiosError && !err.response);
      if (status === 401) {
        // Token expired or invalid - redirect to sign-in
        localStorage.removeItem("luxygalleria_user");
        showToast("Your session expired. Please sign in again.", "warning");
        router.push("/sign-in");
      } else {
        // The server's error code too (e.g. ICICI_LOCAL_MOCK_DOWN in local development): never the payload or a token
        console.error("Checkout error:", status ?? err.code ?? err.message, err.response?.data?.code ?? "");
        // The server's own message when it answered (e.g. ICICI refused the start, out of stock); a proxy error page or
        // no reply at all gets the not-charged message
        const msg = err.response?.data?.message || (gatewayDown
          ? "The ICICI payment page is not responding right now. You have not been charged. Please try again in a few minutes."
          : err.message?.startsWith(PAGE_URL_REFUSED) ? err.message : "An error occurred during checkout. Please try again.");
        setPayError(msg);
        showToast(msg, "error");
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-8">

        {/* Main Title */}
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-slate-900 mb-8 md:mb-12">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">

          {/* ── Left Column (Steps) ── */}
          <div className="lg:col-span-8 flex flex-col gap-12">

            {/* Step 1: HOW TO RECEIVE THE ORDER */}
            <div className="flex flex-col gap-4">
              <h2 className="font-sans font-bold text-xl text-[#0A192F]">How would you like to receive your order?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`border rounded-2xl p-5 bg-white ${!isPickup ? "border-[#0A192F] ring-1 ring-[#0A192F]" : "border-slate-200"}`}>
                  <button type="button" onClick={() => setFulfillment({ method: "delivery" })} className="w-full min-h-[44px] flex items-center gap-3 text-left">
                    <Truck size={20} className="text-slate-600" />
                    <span className="font-bold text-slate-900">Home delivery</span>
                  </button>
                  {!isPickup && deliveryOptions.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Delivery method">
                      {/* The same refusal for every method (e.g. a product without a weight) is said once, not per method */}
                      {sharedDeliveryRefusal && <p className="text-sm text-amber-700" role="alert">{sharedDeliveryRefusal}</p>}
                      {deliveryOptions.map((o) => {
                        const checked = quote?.fulfillmentMethod === "delivery" ? quote.shippingMethod === o.shippingMethod : fulfillment.shippingMethod === o.shippingMethod;
                        return (
                          <label key={o.shippingMethod} className={`flex items-start gap-3 p-3 rounded-xl border ${o.allowed ? "cursor-pointer border-slate-200" : "opacity-60 cursor-not-allowed border-slate-100"}`}>
                            <input type="radio" name="shippingMethod" className="mt-1" disabled={!o.allowed} checked={checked}
                              onChange={() => setFulfillment({ method: "delivery", shippingMethod: o.shippingMethod! })} />
                            <span className="text-sm">
                              <span className="block font-semibold text-slate-900">{METHOD_LABEL[o.shippingMethod!]}</span>
                              {o.eta && <span className="block text-slate-500">{o.eta}</span>}
                              {!o.allowed && o.reason !== sharedDeliveryRefusal && <span className="block text-amber-700">{o.reason}</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                {pickupOption && (
                  <button type="button" disabled={!pickupOption.allowed} onClick={() => setFulfillment({ method: "pickup" })}
                    className={`text-left border rounded-2xl p-5 bg-white disabled:opacity-60 ${isPickup ? "border-[#0A192F] ring-1 ring-[#0A192F]" : "border-slate-200"}`}>
                    <span className="flex items-center gap-3">
                      <Store size={20} className="text-slate-600" />
                      <span className="font-bold text-slate-900">Store pickup</span>
                    </span>
                    {pickupOption.offered ? (
                      <>
                        <span className="block text-sm text-slate-500 mt-2">Collect in store. Pay now online; no delivery fee.</span>
                        {pickupOption.eta && <span className="block text-sm text-slate-500">{pickupOption.eta}</span>}
                        {typeof pickupOption.fee === "number" && (
                          <span className="block text-sm font-semibold text-slate-700 mt-1">Pickup charge: {pickupOption.fee === 0 ? <span className="text-green-600">Free</span> : rupees(pickupOption.fee)}</span>
                        )}
                      </>
                    ) : (
                      <span className="block text-sm text-amber-700 mt-2">{pickupOption.reason || "Store pickup is not available right now"}</span>
                    )}
                  </button>
                )}
              </div>
              {isPickup && quote?.pickupDetails && (
                <div className="border border-slate-200 rounded-2xl p-5 bg-white text-sm text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">{quote.pickupDetails.storeName}</p>
                  <p className="whitespace-pre-line">{quote.pickupDetails.address}</p>
                  {quote.pickupDetails.openingHours && <p>Hours: {quote.pickupDetails.openingHours}</p>}
                  {quote.pickupDetails.phone && <p>Phone: {quote.pickupDetails.phone}</p>}
                  {quote.pickupDetails.instructions && <p className="text-slate-500">{quote.pickupDetails.instructions}</p>}
                </div>
              )}
              {quoteError && !isLoadingShipping && !(errorOptions && !isPickup && deliveryOptions.some((o) => o.reason === quoteError)) && (
                <p className="text-sm text-red-600" role="alert">{quoteError}</p>
              )}
            </div>

            {/* Step 2: SHIPPING DESTINATION (home delivery only) */}
            {!isPickup && (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#0A192F] text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                  2
                </div>
                <h2 className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl text-[#0A192F] uppercase tracking-tight break-words text-left w-full leading-[1.1]">
                  Shipping<br />Destination
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-6 ml-0 sm:ml-12 mt-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div key={addr.id} className="relative w-full max-w-sm">
                    <button
                      onClick={() => selectAddress(addr.id)}
                      className={`relative border rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 pb-12 sm:pb-12 w-full bg-white text-left transition-colors ${isSelected ? "border-slate-300" : "border-slate-200 hover:border-slate-300"
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
                    {/* Beside the card, not inside it: a button cannot contain another button */}
                    <div className="absolute bottom-3 right-6 flex items-center gap-3 text-xs font-bold">
                      {confirmDeleteId === addr.id ? (
                        <>
                          <span className="text-slate-600 font-semibold">Delete this address?</span>
                          <button type="button" onClick={() => handleDeleteAddress(addr.id)} disabled={deletingId === addr.id}
                            className="text-red-600 hover:underline disabled:opacity-50">{deletingId === addr.id ? "Deleting…" : "Yes, delete"}</button>
                          <button type="button" onClick={() => setConfirmDeleteId("")} className="text-slate-500 hover:underline">Cancel</button>
                        </>
                      ) : (
                        <button type="button" onClick={() => setConfirmDeleteId(addr.id)} aria-label={`Delete address ${addr.name}`}
                          className="min-h-[44px] px-2 -mr-2 text-slate-400 hover:text-red-600 uppercase tracking-wider">Delete</button>
                      )}
                    </div>
                    </div>
                  );
                })}

                {/* New Address Button */}
                <button
                  onClick={() => openAddressModal("shipping")}
                  className="border border-slate-200 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 w-full sm:w-40 flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 transition-colors text-slate-900 font-bold text-sm"
                >
                  <span className="text-xl font-normal">+</span>
                  <span className="text-center">New<br />Address</span>
                </button>
              </div>
            </div>

            )}

            {/* Step 3: BILLING ADDRESS (home delivery only; pickup orders are unchanged) */}
            {!isPickup && (
            <div className="flex flex-col gap-4 ml-0 sm:ml-12">
              <h2 className="font-sans font-bold text-xl text-[#0A192F]">Billing Address</h2>
              <div className="flex flex-col gap-2" role="radiogroup" aria-label="Billing address">
                <label className="flex items-center gap-3 text-sm text-slate-800 cursor-pointer">
                  <input type="radio" name="billingChoice" checked={billingSame} onChange={() => setBillingSame(true)} />
                  Same as delivery address
                </label>
                <label className="flex items-center gap-3 text-sm text-slate-800 cursor-pointer">
                  <input type="radio" name="billingChoice" checked={!billingSame} onChange={() => setBillingSame(false)} />
                  Use another billing address
                </label>
              </div>
              {!billingSame && (
                <div className="flex flex-col gap-2">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border bg-white cursor-pointer text-sm ${billingAddressId === addr.id ? "border-[#0A192F] ring-1 ring-[#0A192F]" : "border-slate-200"}`}>
                      <input type="radio" name="billingAddress" className="mt-1" checked={billingAddressId === addr.id} onChange={() => setBillingAddressId(addr.id)} />
                      <span>
                        <span className="block font-semibold text-slate-900 capitalize">{addr.name}</span>
                        <span className="block text-slate-500">{addr.line1}{addr.line2 ? ` ${addr.line2}` : ""}</span>
                      </span>
                    </label>
                  ))}
                  <button type="button" onClick={() => openAddressModal("billing")}
                    className="self-start text-sm font-bold text-[#0A192F] underline underline-offset-4 py-2">+ New billing address</button>
                  {billingProblem && <p className="text-sm text-amber-700" role="alert">{billingProblem}</p>}
                </div>
              )}
            </div>
            )}

            <div className="h-px bg-slate-200 w-full ml-0 sm:ml-12" />

          </div>

          {/* ── Right Column (Order Bag) ── */}
          <div className="lg:col-span-4 bg-white p-5 sm:p-8 rounded-3xl shadow-sm border border-slate-100 sticky top-32">
            <h2 className="font-sans font-bold text-xl text-slate-900 mb-8">Order Bag</h2>

            {/* Cart Items List */}
            <div className="flex flex-col gap-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {cartItems.length === 0 ? (
                <p className="text-slate-500 font-sans text-sm">Your order bag is empty.</p>
              ) : (
                cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.size || 'default'}-${index}`} className="flex gap-4">
                    <div className="relative w-16 h-20 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                      <ResilientImage
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain"
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
                        {inr(pricedLine(quote, item, index).lineTotal)}
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
              {quote && quote.discount > 0 && (
                <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                  <span>Discount</span>
                  <span className="text-green-600">-₹{quote.discount}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                <span>{isPickup ? "Store pickup" : "Shipping"}{quote?.fulfillmentMethod === "delivery" && quote.shippingMethod ? ` · ${METHOD_LABEL[quote.shippingMethod]}` : ""}</span>
                <span>
                  {!quote ? <span className="text-slate-400">{isLoadingShipping ? "Calculating…" : "Not available"}</span>
                    : (isPickup ? quote.pickupFee : quote.shipping) === 0 ? <span className="text-green-600 font-bold tracking-wide">Free</span>
                    : <span>{rupees(isPickup ? quote.pickupFee : quote.shipping)}</span>}
                </span>
              </div>
              {/* A refusal that lists the options is shown once, beside the methods; this box is for address problems and failed requests (Retry) */}
              {!quote && (addressProblem || (quoteError && !isLoadingShipping && !errorOptions)) && (
                <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 space-y-2" role="alert">
                  <p>{addressProblem || quoteError}</p>
                  {!addressProblem && (
                    <button type="button" onClick={retryQuote} className="min-h-[44px] min-w-[44px] text-xs font-bold uppercase tracking-wider underline">Retry</button>
                  )}
                </div>
              )}
              {quote && quote.specialPackagingFee > 0 && (
                <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                  <span>Chocolate &amp; temperature-sensitive packaging</span>
                  <span>₹{quote.specialPackagingFee}</span>
                </div>
              )}
              {quote?.tax.enabled && (
                <div className="flex justify-between items-center text-slate-500 font-sans text-sm">
                  <span>{quote.tax.pricesIncludeTax ? "GST (included in prices)" : "GST"}</span>
                  <span>₹{quote.tax.taxAmount}</span>
                </div>
              )}
              {quote?.tax.enabled && quote.tax.missingRates.length > 0 && (
                <p className="text-xs text-slate-500">GST breakdown not available for: {quote.tax.missingRates.join(", ")} (included in the price).</p>
              )}
              {quote?.tax.enabled && (
                <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                  <span>Taxable value</span>
                  <span>₹{quote.tax.taxableValue}</span>
                </div>
              )}
              {quote && quote.totalWeight > 0 && (
                <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                  <span>Total Weight</span>
                  <span>{quote.totalWeight.toFixed(2)} kg</span>
                </div>
              )}
              {quote && quote.extraWeightCharge > 0 && (
                <>
                  <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                    <span>Base Shipping</span>
                    <span>₹{quote.baseShipping}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 font-sans text-xs">
                    <span>Extra Weight Charge</span>
                    <span>₹{quote.extraWeightCharge}</span>
                  </div>
                </>
              )}
              {quote && quote.specialPackaging.items.length > 0 && (
                <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1" role="note">
                  <p className="font-semibold">Chocolate &amp; Temperature-Sensitive Packaging</p>
                  <p>Items: {quote.specialPackaging.items.join(", ")}{quote.specialPackaging.applied ? ` (${quote.specialPackaging.weightG} g combined)` : ""}</p>
                  {packagingSummary(quote) && <p>{packagingSummary(quote)}</p>}
                  {quote.specialPackaging.note && <p>{quote.specialPackaging.note}</p>}
                  <p>
                    See our <Link href="/refund-replacement-policy" className="underline">Refund &amp; Replacement Policy</Link> for how chocolate is handled in transit.
                  </p>
                </div>
              )}
            </div>

            <div className="h-px border-t border-dashed border-slate-200 mb-6" />

            <div className="flex justify-between items-end mb-8">
              <span className="font-sans font-bold text-lg text-slate-900">Total</span>
              <span className="font-sans font-black text-2xl text-slate-900">{total === null ? <span className="text-base font-semibold text-slate-400">{isLoadingShipping ? "Calculating…" : "Not available"}</span> : `₹${total}`}</span>
            </div>

            <fieldset className="mb-4">
              <legend className="font-sans font-bold text-sm text-slate-900 mb-2">Pay with</legend>
              <label className="flex items-center gap-3 py-2 text-sm text-slate-700">
                <input type="radio" name="gateway" value="icici" checked readOnly />
                ICICI Bank secure payment (cards, net banking, UPI)
              </label>
            </fieldset>

            {quote?.testPayment && (
              <p role="alert" data-testid="uat-test-notice" className="mb-4 rounded-xl border-2 border-red-600 bg-red-50 p-3 text-center text-xs font-bold uppercase tracking-wide text-red-800">
                {TEST_PAYMENT_NOTICE}
              </p>
            )}

            {payError && (
              <div role="alert" aria-live="assertive" data-testid="pay-error" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 break-words">
                {payError}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={!quote || isLoadingShipping || !!addressProblem || !!billingProblem || isRedirecting}
              className="w-full bg-[#111] text-white font-bold text-base py-4 sm:py-5 rounded-xl hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 mb-4 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {payStage === "connecting" ? "Connecting to ICICI Bank…" : payStage === "redirecting" ? "Redirecting to ICICI Bank…" : isPickup ? "Pay Now & Collect in Store" : "Secure Checkout"}
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
                {modalFor === "billing" ? "New Billing Address" : "New Shipping Address"}
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
                  <label className="block font-sans font-bold text-sm text-slate-700 mb-2">PIN Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={newAddressForm.zip}
                    placeholder="6-digit PIN Code"
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

              <button
                onClick={handleSaveAddress}
                disabled={isSavingAddress}
                className="w-full bg-[#111] text-white font-bold text-base py-4 rounded-xl mt-4 hover:bg-black transition-colors focus:outline-none disabled:opacity-50"
              >
                {isSavingAddress ? "Saving..." : modalFor === "billing" ? "Save & Use for Billing" : "Save & Deliver Here"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
