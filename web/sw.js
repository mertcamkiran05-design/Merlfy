// Merlfy service worker — uygulama kabuğunu önbellekler, veriler Firestore'un kendi
// çevrimdışı önbelleğinden gelir. Firebase API isteklerine (firestore/auth/storage) dokunmaz.
const VERSION = "merlfy-v2";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|www\.gstatic\.com\/firebasejs|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Sayfa: önce ağ (güncel sürüm), ağ yoksa önbellek
  if (req.mode === "navigate") {
    e.respondWith(fetch(req)
      .then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put("/", copy)); return res; })
      .catch(() => caches.match("/")));
    return;
  }
  // Kendi statik dosyalarımız + CDN kütüphaneleri: önbellekten hızlı ver, arkada yenile
  if (url.origin === location.origin || CDN.test(req.url)) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; })
        .catch(() => hit);
      return hit || net;
    }));
  }
});
