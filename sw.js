const CACHE_NAME = 'janggu-cache-v3'; // 버전 올림
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './sounds/deong.mp3',
    './sounds/deok.mp3',
    './sounds/gideok.mp3',
    './sounds/deoreoreore.mp3',
    './sounds/kung.mp3'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // 모든 파일을 한 번에 addAll 하지 않고 개별적으로 저장하여 
            // 하나라도 실패해도 나머지는 저장되게 함
            return Promise.allSettled(
                ASSETS.map(url => cache.add(url).catch(err => console.error('Cache fail:', url, err)))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
