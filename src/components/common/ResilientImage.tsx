"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { getPlaceholderUrl, reportImageError } from "../../lib/imageUtils";

const IMAGE_TIMEOUT_MS = 12000;

export default function ResilientImage(props: ImageProps) {
  const sourceKey = typeof props.src === "string" ? props.src : JSON.stringify(props.src);
  return <ImageWithFallback key={sourceKey} {...props} />;
}

function ImageWithFallback({ onError, onLoad, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // The hung-load timeout runs only once the image is near the viewport: a lazy image below the fold has not even
  // started loading, and timing it from mount swapped real images for the placeholder (brand logos, cards).
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fallback = getPlaceholderUrl("Image unavailable");

  useEffect(() => {
    const el = imgRef.current;
    if (!el || inView || typeof IntersectionObserver === "undefined") { if (!el) setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setInView(true); io.disconnect(); }
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    if (failed || loaded || !inView) return;
    // Already finished before hydration (cached): never time it out
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) { setLoaded(true); return; }
    const timer = setTimeout(() => setFailed(true), IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [failed, loaded, inView]);

  const isDataUri = typeof props.src === "string" && props.src.startsWith("data:");

  return (
    <Image
      {...props}
      ref={imgRef}
      alt={props.alt || "Product image"}
      src={failed ? fallback : props.src}
      unoptimized={failed || isDataUri || props.unoptimized}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      onError={(event) => {
        onError?.(event);
        if (!failed) reportImageError(props.src);
        if (!failed) setFailed(true);
      }}
    />
  );
}