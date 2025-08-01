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
    path: '/simple-test',
    name: 'SimpleTest',
    component: () => import('@/views/SimpleTest.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 简单测试'
    }
  },
  {
    path: '/ai-test',
    name: 'AITest',
    component: () => import('@/views/AITestView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - GLM AI功能测试'
    }
  },
  {
    path: '/constraint-test',
    name: 'ConstraintTest',
    component: () => import('@/views/ConstraintTestView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 约束条件测试'
    }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/TestView.vue'),
    meta: {
      title: 'ChefMind 智食谱 - 调试页面'
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