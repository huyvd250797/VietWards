/* VietWards V1.0.2 — explicit update hand-off, offline fallback only.
 * Administrative responses are always network-driven; avoid stale legal data.
 */
const CACHE_PREFIX = "vietwards-shell-";
const CACHE_NAME = `${CACHE_PREFIX}v1.0.2`;
const PRE_CACHE = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png"];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE)));
  // Do not force skipWaiting: allow open tabs to finish safely.
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") void self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.cache === "only-if-cached") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(async () => (await caches.match("/offline.html")) ||
      new Response("VietWards đang ngoại tuyến.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })));
    return;
  }
  if (url.pathname === "/offline.html" || /^\/icons\/(icon-192|icon-512)\.png$/.test(url.pathname)) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request)));
  }
});
