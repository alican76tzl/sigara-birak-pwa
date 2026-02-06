const CACHE_NAME = 'sigara-birak-v3';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/dashboard.html',
    '/progress.html',
    '/savings.html',
    '/community.html',
    '/profile.html',
    '/settings.html',
    '/css/style.css',
    '/css/dashboard.css',
    '/css/landing.css',
    '/js/config.js',
    '/js/errorHandler.js',
    '/js/validation.js',
    '/js/storage.js',
    '/js/supabase.js',
    '/js/main.js',
    '/js/landing.js',
    '/js/pwa.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => console.error('[SW] Cache failed:', err))
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip cross-origin requests (except Google Fonts)
    const url = new URL(request.url);
    if (url.origin !== self.location.origin && !url.hostname.includes('google')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(cached => {
                // Return cached version or fetch from network
                const fetchPromise = fetch(request)
                    .then(response => {
                        // Cache new responses
                        if (response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(request, clone));
                        }
                        return response;
                    })
                    .catch(() => cached);

                return cached || fetchPromise;
            })
    );
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'sigara-birak-notification',
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'Aç' },
            { action: 'dismiss', title: 'Kapat' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Sigara Bırak', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Background sync for offline form submissions (future feature)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Implement data sync logic here
    console.log('[SW] Background sync executed');
}
