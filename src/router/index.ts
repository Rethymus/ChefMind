// ChefMind 智食谱 - 路由配置

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 错误处理组件
const loadView = (view: string) => {
  return () =>
    import(`@/views/${view}.vue`).catch(error => {
      console.error(`Failed to load view: ${view}`, error)
      // 返回一个简单的错误组件对象而不是动态导入
      return {
        default: {
          template: `
          <div class="view-load-error">
            <h2>页面加载失败</h2>
            <p>抱歉，无法加载 ${view} 页面。</p>
            <button @click="goHome">返回首页</button>
          </div>
        `,
          methods: {
            goHome() {
              window.location.hash = '#/'
            },
          },
        },
      }
    })
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: loadView('HomeView'),
    meta: {
      title: 'ChefMind 智食谱 - 首页',
    },
  },
  {
    path: '/search',
    name: 'Search',
    component: loadView('SearchView'),
    meta: {
      title: 'ChefMind 智食谱 - 搜索食谱',
    },
  },
  {
    path: '/ai',
    name: 'AI',
    component: loadView('AIView'),
    meta: {
      title: 'ChefMind 智食谱 - AI 智能助手',
    },
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: loadView('FavoritesPageComplete'),
    meta: {
      title: 'ChefMind 智食谱 - 我的收藏',
    },
  },
  {
    path: '/test-favorites',
    name: 'TestFavorites',
    component: loadView('SimpleFavoritesTest'),
    meta: {
      title: 'ChefMind 智食谱 - 收藏测试页面',
    },
  },
  {
    path: '/new-favorites',
    name: 'NewFavorites',
    component: loadView('NewFavoritesView'),
    meta: {
      title: 'ChefMind 智食谱 - 新版收藏页面',
    },
  },
  {
    path: '/button-test',
    name: 'ButtonTest',
    component: loadView('ButtonTestView'),
    meta: {
      title: 'ChefMind 智食谱 - 按钮测试页面',
    },
  },
  {
    path: '/shopping-list',
    name: 'ShoppingList',
    component: loadView('ShoppingListView'),
    meta: {
      title: 'ChefMind 智食谱 - 购物清单',
    },
  },
  {
    path: '/cooking-guide',
    name: 'CookingGuide',
    component: loadView('CookingGuideView'),
    meta: {
      title: 'ChefMind 智食谱 - 烹饪指导',
    },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: loadView('AnalyticsView'),
    meta: {
      title: 'ChefMind 智食谱 - 数据分析',
    },
  },
  {
    path: '/svg-generator',
    name: 'SvgGenerator',
    component: loadView('SvgGeneratorView'),
    meta: {
      title: 'ChefMind 智食谱 - SVG封面生成器',
    },
  },
  {
    path: '/recipe-detail',
    name: 'RecipeDetail',
    component: loadView('RecipeDetailView'),
    meta: {
      title: 'ChefMind 智食谱 - 食谱详情',
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  next()
})

// 全局错误处理
router.onError(error => {
  console.error('Router error:', error)
})

export default router
