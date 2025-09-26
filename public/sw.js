// ChefMind Service Worker

const CACHE_NAME = 'chefmind-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-32x32.svg',
  '/icons/icon-16x16.svg'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求并缓存响应
self.addEventListener('fetch', (event) => {
  // 过滤掉不支持的协议请求
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果找到了缓存的响应，则返回缓存的版本
        if (response) {
          return response;
        }
        
        // 否则，获取请求
        return fetch(event.request).then(
          (response) => {
            // 检查是否收到了有效的响应
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 检查请求协议是否支持缓存
            if (!event.request.url.startsWith('http')) {
              return response;
            }

            // 克隆响应
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // 如果网络请求失败，返回离线页面或默认响应
          return new Response('离线状态', {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'text/html'
            })
          });
        });
      })
  );
});
