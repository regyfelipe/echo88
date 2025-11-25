"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GoogleAdProps {
  adSlot?: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function GoogleAd({
  adSlot = "1234567890",
  adFormat = "auto",
  className,
  style,
}: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const adClient = "ca-pub-3354164597487551";
  const adInitialized = useRef(false);

  useEffect(() => {
    try {
      // Inicializa o anúncio do Google AdSense
      if (
        adRef.current &&
        typeof window !== "undefined" &&
        window.adsbygoogle &&
        !adInitialized.current
      ) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adInitialized.current = true;
      }
    } catch (err) {
      console.error("Erro ao carregar anúncio do Google AdSense:", err);
    }
  }, []);

  return (
    <div
      ref={adRef}
      className={cn(
        "w-full rounded-xl overflow-hidden animate-in fade-in duration-500",
        className
      )}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          minHeight: adFormat === "horizontal" ? "100px" : "250px",
          ...style,
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Componente para anúncio inline entre postagens
export function InlineAd() {
  return (
    <div className="my-4">
      <GoogleAd
        adSlot="feed-inline-001"
        adFormat="auto"
        className="max-w-2xl mx-auto"
      />
    </div>
  );
}

// Componente para anúncio banner
export function BannerAd() {
  return (
    <div className="my-6">
      <GoogleAd
        adSlot="feed-banner-001"
        adFormat="horizontal"
        className="max-w-4xl mx-auto"
      />
    </div>
  );
}
