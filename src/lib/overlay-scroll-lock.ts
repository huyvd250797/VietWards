"use client";

import { useEffect } from "react";

/** Shared, reference-counted lock for iOS Safari / standalone PWA overlays.
 * Fixed positioning prevents the underlying document from rubber-banding.
 * Nested map fullscreen -> detail / picker keeps the original scroll position. */
let activeLocks = 0;
let restoreScroll: (() => void) | null = null;

export function acquirePageScrollLock(): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") return () => {};
  if (activeLocks++ === 0) {
    const root = document.documentElement;
    const body = document.body;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const old = {
      rootOverflow: root.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };
    root.classList.add("vw-overlay-scroll-locked");
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = `-${scrollX}px`;
    body.style.right = "0";
    body.style.width = "100%";
    restoreScroll = () => {
      root.classList.remove("vw-overlay-scroll-locked");
      root.style.overflow = old.rootOverflow;
      body.style.overflow = old.bodyOverflow;
      body.style.position = old.bodyPosition;
      body.style.top = old.bodyTop;
      body.style.left = old.bodyLeft;
      body.style.right = old.bodyRight;
      body.style.width = old.bodyWidth;
      window.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeLocks = Math.max(0, activeLocks - 1);
    if (activeLocks === 0) {
      restoreScroll?.();
      restoreScroll = null;
    }
  };
}

export function useOverlayScrollLock(open: boolean) {
  useEffect(() => open ? acquirePageScrollLock() : undefined, [open]);
}
