"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useOverlayScrollLock } from "./overlay-scroll-lock";

/** CSS-fixed fullscreen supports iPhone standalone PWA without Fullscreen API.
 * Observe the viewport and container, preserve focus, and resize MapLibre. */
export function useMapFullscreen(mapRef: RefObject<MapLibreMap | null>, containerRef: RefObject<HTMLDivElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  useOverlayScrollLock(fullscreen);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let frame = 0;
    const resizeMap = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => mapRef.current?.resize());
    };
    const viewport = window.visualViewport;
    const syncViewport = () => {
      if (viewport) document.documentElement.style.setProperty("--vw-visual-height", `${Math.round(viewport.height)}px`);
      resizeMap();
    };
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resizeMap) : null;
    observer?.observe(el);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("orientationchange", syncViewport);
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport);
    syncViewport();
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
      document.documentElement.style.removeProperty("--vw-visual-height");
    };
  }, [containerRef, mapRef]);

  useEffect(() => {
    let first = 0, second = 0;
    first = requestAnimationFrame(() => {
      mapRef.current?.resize();
      second = requestAnimationFrame(() => mapRef.current?.resize());
    });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, [fullscreen, mapRef]);

  useEffect(() => {
    if (fullscreen) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      const frame = requestAnimationFrame(() => {
        containerRef.current?.closest(".gis-map-column")?.querySelector<HTMLElement>(".gis-map-fullscreen-head button")?.focus({ preventScroll: true });
      });
      const onEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape" && !document.querySelector('[role="dialog"][aria-modal="true"]')) setFullscreen(false);
      };
      window.addEventListener("keydown", onEscape);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("keydown", onEscape);
        const focus = returnFocus.current;
        if (focus?.isConnected) requestAnimationFrame(() => focus.focus({ preventScroll: true }));
      };
    }
  }, [fullscreen, containerRef]);

  return { fullscreen, setFullscreen };
}
