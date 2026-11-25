"use client";

import dynamic from "next/dynamic";

// Below-the-fold, JS-heavy (video modal + animations). Defer its bundle so it
// doesn't block the initial page load / mobile performance. (ssr: false needs a Client Component.)
export default dynamic(() => import("./VideoTestimonialsSection"), {
  ssr: false,
  loading: () => <div className="min-h-[40vh]" />,
});
