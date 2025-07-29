import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: {
      title: 'ChefMind 智食谱'
    }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetailView.vue'),
    meta: {
      title: '菜谱详情'
    }
  },
  {
    path: '/my-recipes',
    name: 'MyRecipes',
    component: () => import('@/views/MyRecipesView.vue'),
    meta: {
      title: '我的菜谱'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      title: '关于我们'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router