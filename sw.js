// Nombre de la versión del caché para el App Shell
const CACHE_NAME = 'newsapp-shell-v3';

// Recursos estáticos indispensables que conforman el App Shell multi-página
const APP_SHELL_ASSETS = [
  './',
  './index.html',
  './secciones/api.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icons/noticias-192.png',
  './icons/noticias-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

/**
 * 1. Evento INSTALL: Pre-cacheo de recursos del App Shell
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Evento Install: Guardando App Shell en caché...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-cacheando recursos estáticos...');
        return cache.addAll(APP_SHELL_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error al cachear el App Shell:', error);
      })
  );
});

/**
 * 2. Evento ACTIVATE: Limpieza de versiones de caché obsoletas
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Evento Activate: Limpiando versiones obsoletas...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[Service Worker] Eliminando caché antigua:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/**
 * 3. Evento FETCH: Intercepta cada solicitud HTTP
 * Estrategia: Cache First para recursos estáticos del App Shell
 */
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Excluir llamadas dinámicas a la API de Mediastack de la estrategia Cache First
  if (requestUrl.hostname.includes('mediastack.com')) {
    event.respondWith(
      fetch(event.request).catch((err) => {
        console.warn('[Service Worker] Error de red consultando API externa (modo offline):', err);
        return new Response(
          JSON.stringify({
            data: [],
            error: { code: 'OFFLINE', message: 'Estás sin conexión y la API no puede responder en vivo.' }
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // ESTRATEGIA: CACHE FIRST (para recursos del App Shell)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch((fetchError) => {
            console.error('[Service Worker] Error de red y recurso no cacheado:', event.request.url);
            if (event.request.mode === 'navigate') {
              if (event.request.url.includes('secciones/api.html')) {
                return caches.match('./secciones/api.html');
              }
              return caches.match('./index.html');
            }
          });
      })
  );
});

/**
 * 4. Evento NOTIFICATIONCLICK: Interacción con la notificación nativa
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./secciones/api.html');
      }
    })
  );
});
