<template>
  <div class="theme-toggle-container">
    <button 
      class="theme-toggle-button" 
      @click="toggleTheme" 
      :title="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'"
      :class="{ 'dark': isDarkMode }"
    >
      <div class="toggle-track">
        <div class="toggle-indicator" :class="{ 'translate': isDarkMode }">
          <span class="toggle-icon sun" v-if="!isDarkMode">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </span>
          <span class="toggle-icon moon" v-else>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </span>
        </div>
      </div>
    </button>
    
    <div class="theme-selector" v-if="showThemeSelector">
      <div class="theme-selector-header">
        <h3>选择主题</h3>
        <button class="close-button" @click="showThemeSelector = false">×</button>
      </div>
      
      <div class="theme-options">
        <button 
          class="theme-option" 
          :class="{ active: currentTheme === 'light' }"
          @click="selectTheme('light')"
        >
          <div class="theme-preview light"></div>
          <span class="theme-name">亮色</span>
        </button>
        
        <button 
          class="theme-option" 
          :class="{ active: currentTheme === 'dark' }"
          @click="selectTheme('dark')"
        >
          <div class="theme-preview dark"></div>
          <span class="theme-name">暗色</span>
        </button>
      </div>
      
      <div class="theme-selector-footer">
        <button class="apply-button" @click="showThemeSelector = false">应用</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const currentTheme = computed(() => themeStore.currentTheme)
const isDarkMode = computed(() => currentTheme.value === 'dark')
const showThemeSelector = ref(false)

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const selectTheme = (theme: 'light' | 'dark') => {
  themeStore.setTheme(theme)
}
</script>

<style lang="scss" scoped>
.theme-toggle-container {
  position: relative;
}

.theme-toggle-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:focus {
    outline: none;
  }
}

.toggle-track {
  width: 50px;
  height: 24px;
  background-color: var(--bg-color-secondary);
  border-radius: 30px;
  display: flex;
  align-items: center;
  padding: 0 4px;
  position: relative;
  transition: background-color 0.3s ease;
  border: 1px solid var(--border-color);
  
  .dark & {
    background-color: var(--bg-color-dark);
  }
}

.toggle-indicator {
  width: 18px;
  height: 18px;
  background-color: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  position: relative;
  
  &.translate {
    transform: translateX(24px);
  }
}

.toggle-icon {
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 12px;
    height: 12px;
  }
}

.theme-selector {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background-color: var(--bg-color);
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.theme-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--heading-color);
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    
    &:hover {
      background-color: var(--hover-color);
      color: var(--text-color);
    }
  }
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.theme-option {
  background: none;
  border: 2px solid transparent;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.active {
    border-color: var(--primary-color);
  }
}

.theme-preview {
  width: 100%;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  
  &.light {
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    
    &::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      height: 10px;
      background-color: #f0f0f0;
      border-radius: 5px;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      background-color: #f8f8f8;
      border-radius: 5px;
    }
  }
  
  &.dark {
    background-color: #1a1a1a;
    border: 1px solid #333333;
    
    &::before {
      content: '';
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      height: 10px;
      background-color: #333333;
      border-radius: 5px;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 30px;
      left: 10px;
      right: 10px;
      bottom: 10px;
      background-color: #2a2a2a;
      border-radius: 5px;
    }
  }
}

.theme-name {
  font-size: 0.9rem;
  color: var(--text-color);
}

.theme-selector-footer {
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
}

.apply-button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
}
</style>