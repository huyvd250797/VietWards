"use client";

import { useEffect, useState, type RefObject } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

/** iOS PWA has inconsistent Fullscreen API support. A fixed, safe-area-aware
 * map overlay works consistently in Safari and installed standalone PWAs.
 * This affects only the map; it does not trigger browser/page zoom. */
export function useMapFullscreen(mapRef: RefObject<MapLibreMap | null>, containerRef: RefObject<HTMLDivElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapRef.current?.resize());
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, mapRef]);

  useEffect(() => {
    const first = requestAnimationFrame(() => {
      mapRef.current?.resize();
      const second = requestAnimationFrame(() => mapRef.current?.resize());
      secondFrame = second;
    });
    let secondFrame = 0;
    return () => { cancelAnimationFrame(first); if (secondFrame) cancelAnimationFrame(secondFrame); };
  }, [fullscreen, mapRef]);

  useEffect(() => {
    if (!fullscreen) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector('[role="dialog"][aria-modal="true"]')) setFullscreen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [fullscreen]);

  return { fullscreen, setFullscreen };
}
