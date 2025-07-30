// ChefMind 智食谱 - Service Worker
const CACHE_NAME = 'chefmind-v1.0.0';
const STATIC_CACHE = 'chefmind-static-v1';
const DYNAMIC_CACHE = 'chefmind-dynamic-v1';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
  console.log('Service Worker 安装中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('缓存静态资源...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('静态资源缓存完成');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('缓存静态资源失败:', error);
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker 激活完成');
        return self.clients.claim();
      })
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 只处理同源请求和字体/CSS资源
  if (url.origin === location.origin || 
      url.hostname === 'fonts.googleapis.com' || 
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'cdnjs.cloudflare.com') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // 如果缓存中有，直接返回
          if (cachedResponse) {
            console.log('从缓存返回:', request.url);
            return cachedResponse;
          }
          
          // 否则发起网络请求
          return fetch(request)
            .then((networkResponse) => {
              // 检查响应是否有效
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }
              
              // 克隆响应用于缓存
              const responseToCache = networkResponse.clone();
              
              // 动态缓存
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  console.log('缓存动态资源:', request.url);
                  cache.put(request, responseToCache);
                });
              
              return networkResponse;
            })
            .catch((error) => {
              console.error('网络请求失败:', request.url, error);
              
              // 如果是导航请求且离线，返回离线页面
              if (request.mode === 'navigate') {
                return caches.match('/index.html');
              }
              
              // 其他请求返回离线提示
              return new Response(
                JSON.stringify({
                  error: '网络连接失败，请检查网络设置',
                  offline: true
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
            });
        })
    );
  }
});

// 后台同步
self.addEventListener('sync', (event) => {
  console.log('后台同步事件:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // 这里可以处理离线时的数据同步
      syncOfflineData()
    );
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  console.log('收到推送消息:', event);
  
  const options = {
    body: event.data ? event.data.text() : '您有新的菜谱推荐！',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看详情',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: '关闭',
        icon: '/icon-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ChefMind 智食谱', options)
  );
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
  console.log('通知被点击:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // 打开应用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 同步离线数据
async function syncOfflineData() {
  try {
    // 获取离线存储的数据
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      // 尝试同步到服务器
      for (const data of offlineData) {
        try {
          await syncDataToServer(data);
          await removeOfflineData(data.id);
        } catch (error) {
          console.error('同步数据失败:', error);
        }
      }
    }
  } catch (error) {
    console.error('后台同步失败:', error);
  }
}

// 获取离线数据
async function getOfflineData() {
  // 这里应该从 IndexedDB 或其他存储中获取离线数据
  return [];
}

// 同步数据到服务器
async function syncDataToServer(data) {
  // 这里实现具体的数据同步逻辑
  console.log('同步数据:', data);
}

// 删除已同步的离线数据
async function removeOfflineData(id) {
  // 这里实现删除已同步数据的逻辑
  console.log('删除离线数据:', id);
}

// 缓存管理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.payload);
        })
    );
  }
});

console.log('Service Worker 已加载');