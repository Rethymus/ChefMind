<template>
  <nav class="mobile-nav" v-if="isMobile">
    <div class="nav-container">
      <router-link to="/" class="nav-item" :class="{ active: $route.name === 'Home' }">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </router-link>

      <router-link to="/search" class="nav-item" :class="{ active: $route.name === 'Search' }">
        <span class="nav-icon">🔍</span>
        <span class="nav-text">搜索</span>
      </router-link>

      <router-link to="/ai" class="nav-item" :class="{ active: $route.name === 'AI' }">
        <span class="nav-icon">🤖</span>
        <span class="nav-text">AI</span>
      </router-link>

      <router-link
        to="/favorites"
        class="nav-item"
        :class="{ active: $route.name === 'Favorites' }"
      >
        <span class="nav-icon">❤️</span>
        <span class="nav-text">收藏</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

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
  .mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: var(--bg-color);
    border-top: 1px solid var(--border-color);
    z-index: 100;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }

  .nav-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0.5rem 0;
    max-width: 100%;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem;
    text-decoration: none;
    color: var(--text-color-secondary);
    transition: all 0.3s ease;
    border-radius: 8px;
    min-width: 60px;

    &:hover {
      color: var(--primary-color);
      background-color: var(--hover-color);
    }

    &.active {
      color: var(--primary-color);
      background-color: var(--primary-color-light);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    .nav-text {
      font-size: 0.75rem;
      font-weight: 500;
    }
  }
</style>
