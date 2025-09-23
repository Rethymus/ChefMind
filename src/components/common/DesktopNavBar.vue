<template>
  <nav class="desktop-nav" v-if="!isMobile">
    <div class="nav-container">
      <div class="nav-logo">
        <router-link to="/" class="logo-link">
          <span class="logo-icon">👨‍🍳</span>
          <span class="logo-text">ChefMind</span>
        </router-link>
      </div>

      <div class="nav-links">
        <router-link to="/" class="nav-link" active-class="active">首页</router-link>
        <router-link to="/search" class="nav-link" active-class="active">搜索食谱</router-link>
        <router-link to="/ai" class="nav-link" active-class="active">AI 助手</router-link>
        <router-link to="/favorites" class="nav-link" active-class="active">我的收藏</router-link>
        <router-link to="/shopping-list" class="nav-link" active-class="active"
          >购物清单</router-link
        >
        <router-link to="/analytics" class="nav-link" active-class="active">数据分析</router-link>
        <router-link to="/video-demo" class="nav-link" active-class="active">视频演示</router-link>
      </div>

      <div class="nav-actions">
        <EnhancedThemeToggle />
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import EnhancedThemeToggle from '@/components/common/EnhancedThemeToggle.vue'

  const isMobile = ref(false)

  const checkMobile = () => {
    isMobile.value = window.innerWidth <= 768
  }

  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })
</script>

<style lang="scss" scoped>
  .desktop-nav {
    background-color: var(--bg-color);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 70px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-logo {
    .logo-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--heading-color);
    }

    .logo-icon {
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.2rem;
      font-weight: 700;
    }
  }

  .nav-links {
    display: flex;
    gap: 2rem;

    .nav-link {
      text-decoration: none;
      color: var(--text-color);
      font-weight: 500;
      padding: 0.5rem 0;
      position: relative;
      transition: color 0.3s ease;

      &:hover {
        color: var(--primary-color);
      }

      &.active {
        color: var(--primary-color);

        &::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--primary-color);
          border-radius: 2px;
        }
      }
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
