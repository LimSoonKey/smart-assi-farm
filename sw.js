// sw.js
const CACHE_NAME = 'assi-farm-v20260508-1'; // 오늘 날짜와 시간 등으로 버전을 표시

self.addEventListener('install', (event) => {
  // 새 버전이 올라오면 즉시 활성화되도록 설정
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 이전 버전의 캐시를 모두 삭제하여 새 파일을 받게 함
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

self.addEventListener('fetch', function(event) {
    // 설치 조건 충족을 위한 기본 fetch 이벤트
});