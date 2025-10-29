const CACHE_NAME = 'gulf-gateway-v1';
// Only cache main pages, not payment pages
const urlsToCache = [
  '/',
  '/services',
  '/manifest.json'
];

// List of payment page patterns to exclude from caching
const PAYMENT_PAGE_PATTERNS = [
  '/pay/',
  '/r/',
  '/telegram-test'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // Don't cache payment pages
  const isPaymentPage = PAYMENT_PAGE_PATTERNS.some(pattern => pathname.includes(pattern));
  
  if (isPaymentPage) {
    // Always fetch payment pages from network, don't cache
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Cache main pages
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
