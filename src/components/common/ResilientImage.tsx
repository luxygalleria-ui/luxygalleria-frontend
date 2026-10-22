"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { getPlaceholderUrl } from "../../lib/imageUtils";

const IMAGE_TIMEOUT_MS = 12000;

export default function ResilientImage(props: ImageProps) {
  const sourceKey = typeof props.src === "string" ? props.src : JSON.stringify(props.src);
  return <ImageWithFallback key={sourceKey} {...props} />;
}

function ImageWithFallback({ onError, onLoad, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fallback = getPlaceholderUrl("Image unavailable");

  useEffect(() => {
    if (failed || loaded) return;
    const timer = setTimeout(() => setFailed(true), IMAGE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [failed, loaded]);

  const isDataUri = typeof props.src === "string" && props.src.startsWith("data:");

  return (
    <Image
      {...props}
      alt={props.alt || "Product image"}
      src={failed ? fallback : props.src}
      unoptimized={failed || isDataUri || props.unoptimized}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      onError={(event) => {
        onError?.(event);
        if (!failed) setFailed(true);
      }}
    />
  );
}