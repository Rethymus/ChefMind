// PWA 功能管理器
export class PWAManager {
  private sw: ServiceWorkerRegistration | null = null;
  private deferredPrompt: any = null;
  private isOnline = navigator.onLine;
  private callbacks: { [key: string]: Function[] } = {};

  constructor() {
    this.init();
  }

  // 初始化PWA功能
  private async init() {
    // 注册Service Worker
    await this.registerServiceWorker();
    
    // 监听网络状态变化
    this.setupNetworkListeners();
    
    // 监听安装提示
    this.setupInstallPrompt();
    
    // 监听应用更新
    this.setupUpdateListener();
  }

  // 注册Service Worker
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.sw = await navigator.serviceWorker.register('/sw.js');
        console.log('[PWA] Service Worker 注册成功:', this.sw.scope);
        
        // 监听Service Worker状态变化
        this.sw.addEventListener('updatefound', () => {
          const newWorker = this.sw!.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.emit('update-available');
              }
            });
          }
        });
        
        // 监听Service Worker消息
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });
        
      } catch (error) {
        console.error('[PWA] Service Worker 注册失败:', error);
      }
    }
  }

  // 处理Service Worker消息
  private handleServiceWorkerMessage(data: any) {
    switch (data.type) {
      case 'CACHE_UPDATED':
        this.emit('cache-updated', data.payload);
        break;
      case 'OFFLINE_READY':
        this.emit('offline-ready');
        break;
    }
  }

  // 设置网络状态监听
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.emit('online');
      this.showNetworkStatus('网络已连接', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.emit('offline');
      this.showNetworkStatus('网络已断开，应用将在离线模式下运行', 'warning');
    });
  }

  // 设置安装提示监听
  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.emit('install-available');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.emit('app-installed');
      this.showNetworkStatus('应用已成功安装到设备', 'success');
    });
  }

  // 设置更新监听
  private setupUpdateListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  // 显示安装提示
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] 安装提示失败:', error);
      return false;
    }
  }

  // 检查是否可以安装
  public canInstall(): boolean {
    return !!this.deferredPrompt;
  }

  // 检查是否已安装
  public isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // 更新应用
  public async updateApp() {
    if (this.sw && this.sw.waiting) {
      this.sw.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // 获取网络状态
  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // 缓存重要数据
  public async cacheImportantData(data: any) {
    try {
      // 存储到localStorage作为备份
      localStorage.setItem('chefmind-offline-data', JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));

      // 通知Service Worker缓存数据
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_DATA',
          payload: data
        });
      }
    } catch (error) {
      console.error('[PWA] 缓存数据失败:', error);
    }
  }

  // 获取离线数据
  public getOfflineData(): any {
    try {
      const cached = localStorage.getItem('chefmind-offline-data');
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        // 检查数据是否过期（7天）
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          return data;
        }
      }
    } catch (error) {
      console.error('[PWA] 获取离线数据失败:', error);
    }
    return null;
  }

  // 添加待同步数据
  public addPendingSync(data: any) {
    try {
      const pending = this.getPendingSync();
      pending.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: data
      });
      localStorage.setItem('chefmind-pending-sync', JSON.stringify(pending));

      // 注册后台同步
      if (this.sw && 'sync' in window.ServiceWorkerRegistration.prototype) {
        // 注册后台同步（如果支持）
        if ('sync' in this.sw) {
          (this.sw as any).sync.register('background-sync');
        }
      }
    } catch (error) {
      console.error('[PWA] 添加待同步数据失败:', error);
    }
  }

  // 获取待同步数据
  public getPendingSync(): any[] {
    try {
      const pending = localStorage.getItem('chefmind-pending-sync');
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('[PWA] 获取待同步数据失败:', error);
      return [];
    }
  }

  // 清除待同步数据
  public clearPendingSync() {
    localStorage.removeItem('chefmind-pending-sync');
  }

  // 事件监听器管理
  public on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  public off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // 显示网络状态提示
  private showNetworkStatus(message: string, type: 'success' | 'warning' | 'error') {
    // 创建状态提示元素
    const statusEl = document.createElement('div');
    statusEl.className = `network-status network-status-${type}`;
    statusEl.textContent = message;
    statusEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#dc3545'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(statusEl);

    // 3秒后自动移除
    setTimeout(() => {
      statusEl.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (statusEl.parentNode) {
          statusEl.parentNode.removeChild(statusEl);
        }
      }, 300);
    }, 3000);
  }

  // 获取应用信息
  public getAppInfo() {
    return {
      isOnline: this.isOnline,
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      hasServiceWorker: !!this.sw,
      pendingSyncCount: this.getPendingSync().length
    };
  }

  // 预缓存重要资源
  public async precacheResources(urls: string[]) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls: urls
      });
    }
  }

  // 清除所有缓存
  public async clearAllCaches() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    localStorage.clear();
    sessionStorage.clear();
  }
}

// 创建全局PWA管理器实例
export const pwaManager = new PWAManager();

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);