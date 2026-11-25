"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle } from "lucide-react";
import axios from "axios";
import { CONTACT } from "../../lib/contact";
import { getAPIURL } from "../../lib/apiClient";

// Pages whose own controls sit at the bottom of a phone screen (pay, quantity, forms): no floating buttons there below md
const BUSY_PAGES = ["/cart", "/checkout", "/sign-in", "/register", "/forgot-password", "/reset-password"];

export default function FloatingActions() {
  const pathname = usePathname();
  const hideOnPhone = BUSY_PAGES.some((p) => pathname === p || pathname?.startsWith(`${p}/`));
  const [showScrollTop, setShowScrollTop] = useState(false);
  // Admin "settings" can override this; see CONTACT for the default.
  const [whatsappNumber, setWhatsappNumber] = useState(CONTACT.whatsapp);

  const baseUrl = getAPIURL();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Fetch WhatsApp Number
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${baseUrl}/settings`);
        if (res.data.success && res.data.data?.whatsappNumber) {
          setWhatsappNumber(String(res.data.data.whatsappNumber).replace(/\D/g, ""));
        }
      } catch (error) {
        console.error('Error fetching settings for floating actions:', error);
      }
    };
    fetchSettings();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [baseUrl]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`fixed right-3 bottom-[max(1rem,env(safe-area-inset-bottom))] md:right-6 md:bottom-6 z-40 flex-col gap-2 md:gap-3 ${hideOnPhone ? "hidden md:flex" : "flex"}`}>
      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className={`w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#8B5E34] text-white shadow-lg hover:bg-[#6B4423] hover:scale-110 transition-all duration-300 flex items-center justify-center ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        } motion-reduce:transition-none motion-reduce:transform-none`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-200 flex items-center justify-center motion-reduce:transition-none motion-reduce:transform-none"
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={20} />
      </a>


    </div>
  );
}
