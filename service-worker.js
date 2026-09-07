const CACHE_NAME = "bg-rehamanager-suedwest-v4-6-r22-fahrschule-20260907";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./r22-patch.js",
  "./data-r22.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

function dedupeFacilities(base, extra) {
  const byId = new Map();
  [...base, ...extra].forEach(item => byId.set(String(item.id), item));
  return [...byId.values()];
}

function injectR22Patch(html) {
  if (html.includes("r22-patch.js")) return html;
  const tag = '<script src="./r22-patch.js?v=4.6-r22-20260907"></script>';
  return html.includes("</body>") ? html.replace("</body>", tag + "\n</body>") : html + tag;
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // R22: Basisbestand + geprüfte Fahrschul-Ergänzungen als ein Datenbestand ausliefern.
  if (url.pathname.endsWith("/data.json")) {
    event.respondWith((async () => {
      try {
        const [baseResponse, extraResponse] = await Promise.all([
          fetch(event.request, { cache: "no-store" }),
          fetch(new URL("./data-r22.json?v=4.6-r22-20260907", self.location.href), { cache: "no-store" })
        ]);
        if (!baseResponse.ok) throw new Error("Basisdaten nicht erreichbar");
        if (!extraResponse.ok) throw new Error("R22-Ergänzungsdaten nicht erreichbar");
        const [base, extra] = await Promise.all([baseResponse.json(), extraResponse.json()]);
        const merged = dedupeFacilities(Array.isArray(base) ? base : [], Array.isArray(extra) ? extra : []);
        const response = new Response(JSON.stringify(merged), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
        });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        throw error;
      }
    })());
    return;
  }

  // Navigation/index.html: Network-first und R22-Konfiguration direkt ergänzen.
  if (event.request.mode === "navigate" || url.pathname.endsWith("/index.html") || url.pathname.endsWith("/")) {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request, { cache: "no-store" });
        if (!network.ok) throw new Error("Navigation nicht erreichbar");
        const html = injectR22Patch(await network.text());
        const headers = new Headers(network.headers);
        headers.set("Content-Type", "text/html; charset=utf-8");
        headers.set("Cache-Control", "no-store");
        headers.delete("Content-Length");
        const response = new Response(html, { status: network.status, statusText: network.statusText, headers });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
        return response;
      } catch (error) {
        const cached = await caches.match(event.request) || await caches.match("./index.html");
        if (!cached) throw error;
        const html = injectR22Patch(await cached.text());
        return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })());
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
    )
  );
});
