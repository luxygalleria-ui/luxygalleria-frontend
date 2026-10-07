"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Next's built-in scroll-to-top skips pages whose first element is a hoisted <title>/<meta>
// (they end up in <head>), so those pages kept the previous scroll position. This resets it on
// every pathname change, except Back/Forward (browser restores the position) and #hash links.
let fromHistory = false;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    fromHistory = true;
  });
}

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (fromHistory) {
      fromHistory = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
