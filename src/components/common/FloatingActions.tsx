"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle } from "lucide-react";
import axios from "axios";
import { CONTACT } from "../../lib/contact";
import { getAPIURL } from "../../lib/apiClient";

/**
 * WhatsApp + back-to-top. Shown only while the footer's empty bottom dock (data-fab-dock, 80px) is fully on screen,
 * side by side inside it, so they never sit on cards, text or buttons at any width. WhatsApp is also in the mobile menu.
 */
export default function FloatingActions() {
  const pathname = usePathname();
  const [footerVisible, setFooterVisible] = useState(false);
  // Admin "settings" can override this; see CONTACT for the default.
  const [whatsappNumber, setWhatsappNumber] = useState(CONTACT.whatsapp);

  useEffect(() => {
    const dock = document.querySelector("[data-fab-dock]");
    if (!dock || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setFooterVisible(e.intersectionRatio >= 0.99), { threshold: [0, 0.99, 1] });
    io.observe(dock);
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    axios.get(`${getAPIURL()}/settings`)
      .then((res) => {
        if (res.data.success && res.data.data?.whatsappNumber) setWhatsappNumber(String(res.data.data.whatsappNumber).replace(/\D/g, ""));
      })
      .catch(() => { /* the default number stays */ });
  }, []);

  const btn = "w-11 h-11 md:w-12 md:h-12 rounded-full text-white shadow-lg transition-colors flex items-center justify-center";
  return (
    <div
      aria-hidden={!footerVisible}
      className={`fixed right-4 bottom-4 md:right-6 z-40 flex flex-row gap-3 transition-opacity duration-300 motion-reduce:transition-none ${footerVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={footerVisible ? 0 : -1}
        className={`${btn} bg-green-500 hover:bg-green-600`}
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle size={20} />
      </a>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        tabIndex={footerVisible ? 0 : -1}
        className={`${btn} bg-[#8B5E34] hover:bg-[#6B4423]`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
