// Suba a versão sempre que um arquivo do app shell mudar de conteúdo, para que
// o `activate` descarte o cache antigo e os usuários recebam o arquivo novo.
const CACHE_NAME = "gestaoflats-v6";
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/pwa-192.png",
  "/pwa-512.png",
  "/pwa-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) =>
        Promise.all(chaves.filter((chave) => chave !== CACHE_NAME).map((chave) => caches.delete(chave))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  // Dados da API nunca ficam em cache: um dado antigo em um painel
  // administrativo é pior do que uma falha de rede visível.
  if (url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copia = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copia));
          return response;
        })
        .catch(() => caches.match("/index.html").then((cache) => cache || caches.match("/"))),
    );
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then(
        (cache) =>
          cache ||
          fetch(request).then((response) => {
            const copia = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copia));
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cache) => {
      const rede = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copia = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copia));
          }
          return response;
        })
        .catch(() => cache);

      return cache || rede;
    }),
  );
});
