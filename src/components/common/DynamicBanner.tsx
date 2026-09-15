'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Settings {
  bannerText: string;
  isBannerActive: boolean;
}

const DEFAULT_BANNER = "✨ WELCOME TO LUXY GALLERIA — Premium Imported Snacks & Drinks | No minimum order value ✨";

// Rendered inside Navbar, which lives in the root layout — so this bar shows on every page.
export default function DynamicBanner() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${baseUrl}/settings`);
        if (res.data.success && res.data.data) {
          setSettings(res.data.data);
        }
      } catch {
        // Silently fail — use default banner
      }
    };
    fetchSettings();
  }, [baseUrl]);

  const rawBanner = settings?.bannerText?.trim() || DEFAULT_BANNER;
  const bannerLines = rawBanner
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const copy = (hidden: boolean) => (
    <div className="flex shrink-0" aria-hidden={hidden || undefined}>
      {bannerLines.map((line, index) => (
        <span key={index} className="inline-block whitespace-nowrap px-12 sm:px-24">
          {line}
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-slate-500 text-slate-100 text-[12px] sm:text-xs font-bold py-2.5 relative z-[60] tracking-widest overflow-hidden select-none border-b border-slate-600/20">
      <style>{`
        /* Two identical copies side by side; shifting by exactly one copy (-50%) loops seamlessly with no gap or jump */
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 25s linear infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
      <div className="marquee-track">
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
