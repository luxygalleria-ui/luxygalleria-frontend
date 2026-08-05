'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Settings {
  bannerText: string;
  isBannerActive: boolean;
}

const DEFAULT_BANNER = "✨ WELCOME TO LUXY GALLERIA — Premium Imported Snacks & Drinks | No minimum order value ✨";

export default function DynamicBanner() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loaded, setLoaded] = useState(false);
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
      } finally {
        setLoaded(true);
      }
    };
    fetchSettings();
  }, [baseUrl]);

  // While loading or if banner inactive, fallback to default banner
  const rawBanner = settings?.bannerText?.trim() || DEFAULT_BANNER;
  // Split banner text by lines and clean them up
  const bannerLines = rawBanner
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return (
    <div className="bg-slate-500 text-slate-100 text-[12px] sm:text-xs font-bold py-2.5 relative z-[60] tracking-widest overflow-hidden select-none border-b border-slate-600/20 flex justify-center items-center">
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee-scroll 25s linear infinite;
        }
        .marquee:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee px-4">
        {bannerLines.map((line, index) => (
          <span key={index} className="inline-block mx-24">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
