<template>
  <div class="language-switcher">
    <button 
      class="language-button" 
      @click="toggleLanguageMenu"
      :aria-expanded="isOpen"
      aria-haspopup="true"
    >
      <span class="current-language">{{ currentLanguageDisplay }}</span>
      <span class="language-icon">🌐</span>
      <span class="arrow-icon" :class="{ 'open': isOpen }">▼</span>
    </button>
    
    <div v-if="isOpen" class="language-menu" @click.stop>
      <button 
        v-for="lang in availableLanguages" 
        :key="lang.code"
        :class="['language-option', { active: currentLanguage === lang.code }]"
        @click="changeLanguage(lang.code)"
      >
        <span class="language-flag">{{ lang.flag }}</span>
        <span class="language-name">{{ lang.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { currentLanguage, setLanguage } = useI18n()

const isOpen = ref(false)

const availableLanguages = [
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
]

const currentLanguageDisplay = computed(() => {
  const lang = availableLanguages.find(lang => lang.code === currentLanguage.value)
  return lang ? `${lang.flag} ${lang.name}` : '🌐 语言'
})

const toggleLanguageMenu = () => {
  isOpen.value = !isOpen.value
}

const changeLanguage = (langCode: string) => {
  setLanguage(langCode)
  isOpen.value = false
}

// 点击外部关闭菜单
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.language-switcher')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
.language-switcher {
  position: relative;
}

.language-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
}

.language-icon {
  font-size: 1.1rem;
}

.arrow-icon {
  font-size: 0.7rem;
  transition: transform 0.3s ease;
  
  &.open {
    transform: rotate(180deg);
  }
}

.language-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 100;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  background: none;
  text-align: left;
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.active {
    background-color: var(--primary-color-light);
    font-weight: 500;
  }
}

.language-flag {
  font-size: 1.2rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>