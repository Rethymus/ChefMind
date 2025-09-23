// ChefMind 智食谱 - 路由配置

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

// 静态导入视图组件
import HomeView from '@/views/HomeView.vue'
import SearchView from '@/views/SearchView.vue'
import AIView from '@/views/AIView.vue'
import FavoritesPageComplete from '@/views/FavoritesPageComplete.vue'
import ShoppingListView from '@/views/ShoppingListView.vue'
import CookingGuideView from '@/views/CookingGuideView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'
import RecipeDetailView from '@/views/RecipeDetailView.vue'
import VideoDemoView from '@/views/VideoDemoView.vue'

// 组件映射
const viewComponents = {
  HomeView,
  SearchView,
  AIView,
  FavoritesPageComplete,
  ShoppingListView,
  CookingGuideView,
  AnalyticsView,
  RecipeDetailView,
  VideoDemoView
}

// 简单的组件加载函数
const loadView = (view: string) => {
  return viewComponents[view] || viewComponents.HomeView
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
    path: '/recipe-detail',
    name: 'RecipeDetail',
    component: loadView('RecipeDetailView'),
    meta: {
      title: 'ChefMind 智食谱 - 食谱详情',
    },
  },
  {
    path: '/video-demo',
    name: 'VideoDemo',
    component: loadView('VideoDemoView'),
    meta: {
      title: 'ChefMind 智食谱 - 视频演示',
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