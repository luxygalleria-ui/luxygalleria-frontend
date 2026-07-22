import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship smaller production bundles (SWC minification is on by default in prod builds)
  productionBrowserSourceMaps: false,
  compress: true,
  images: {
    dangerouslyAllowLocalIP: true,
    // Serve modern, better-compressed formats (AVIF preferred, WebP fallback)
    // to any image rendered through next/image.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imgs.search.brave.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Allow images served from the local backend during development
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "/products",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
