"use client";

import { LazyMotion, domAnimation } from "framer-motion";

/**
 * Framer Motion's smaller feature set (animate, exit, hover/tap/focus): every animation on the site uses only these.
 * Components use `m.*` instead of `motion.*`, so the full bundle (layout, drag, ...) is never shipped.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
