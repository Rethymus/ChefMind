<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="currentTheme === 'light' ? '切换到暗色模式' : '切换到亮色模式'"
  >
    <div class="icon-container">
      <div class="sun-moon">
        <div v-if="currentTheme === 'light'" class="sun">
          <div class="sun-inner"></div>
        </div>
        <div v-else class="moon">
          <div class="moon-crater"></div>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useThemeStore } from '@/stores/theme'

  const themeStore = useThemeStore()
  const currentTheme = computed(() => themeStore.currentTheme)

  const toggleTheme = () => {
    themeStore.toggleTheme()
  }
</script>

<style lang="scss" scoped>
  .theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--bg-color-light);
    border: 2px solid var(--border-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px var(--shadow-color);

    &:hover {
      transform: scale(1.1);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.3);
    }
  }

  .icon-container {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .sun-moon {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sun {
    width: 20px;
    height: 20px;
    background: #f39c12;
    border-radius: 50%;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 6px;
      background: #f39c12;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 6px;
      background: #f39c12;
    }

    &-inner {
      &::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 2px;
        background: #f39c12;
      }

      &::after {
        content: '';
        position: absolute;
        right: -6px;
        top: 50%;
        transform: translateY(-50%);
        width: 6px;
        height: 2px;
        background: #f39c12;
      }
    }
  }

  .moon {
    width: 18px;
    height: 18px;
    background: #f1c40f;
    border-radius: 50%;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: -4px;
      width: 18px;
      height: 18px;
      background: var(--bg-color-light);
      border-radius: 50%;
    }

    &-crater {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 4px;
      height: 4px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 50%;

      &::before {
        content: '';
        position: absolute;
        top: 6px;
        left: 2px;
        width: 3px;
        height: 3px;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 50%;
      }

      &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 8px;
        width: 2px;
        height: 2px;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 50%;
      }
    }
  }
</style>
