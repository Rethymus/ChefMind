// ChefMind 智食谱 - 路由配置

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 首页'
    }
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/SearchView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 搜索食谱'
    }
  },
  {
    path: '/ai',
    name: 'AI',
    component: () => import('@/views/AIView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - AI 智能助手'
    }
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 我的收藏'
    }
  },
  {
    path: '/shopping-list',
    name: 'ShoppingList',
    component: () => import('@/views/ShoppingListView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 购物清单'
    }
  },
  {
    path: '/cooking-guide',
    name: 'CookingGuide',
    component: () => import('@/views/CookingGuideView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 烹饪指导'
    }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/views/AnalyticsView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 数据分析'
    }
  },
  {
    path: '/recipe-detail',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetailView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 食谱详情'
    }
  }
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
  }
})

// 路由守卫
router.beforeEach((_to, _from, next) => {
  // 设置页面标题
  if (_to.meta?.title) {
    document.title = _to.meta.title as string
  }
  next()
})

export default router