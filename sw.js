/* Service Worker — Banco de Horas */
const CACHE = 'banco-horas-v9';
const FICHEIROS = [
  './',
  './index.html',
  './tabela-irs.json',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Instalação — guarda os ficheiros em cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting())
  );
});

// Ativação — remove caches antigas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — serve da cache, atualiza em segundo plano
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});