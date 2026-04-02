/**
 * Service Worker - PWAオフライン対応
 */

const CACHE_NAME = 'mp-logmanager-gas-v2-2-5';
const urlsToCache = [
    './',
    'index.html',
    'css/style.css',
    'js/app.js',
    'js/api.js',
    'js/tasks.js',
    'js/journal.js',
    'manifest.json'
];


// インストール時
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting()) // 即座に反映
    );
});

// アクティベーション時（古いキャッシュ削除）
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// フェッチ時（ネットワーク優先、オフライン時はキャッシュ）
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // 成功したらキャッシュを更新
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // オフライン時はキャッシュから返す
                return caches.match(event.request);
            })
    );
});
