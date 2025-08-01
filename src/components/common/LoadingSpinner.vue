<template>
  <div class="loading-spinner" :class="{ 'full-screen': fullScreen }">
    <div class="spinner-container">
      <div class="spinner" :style="{ width: size + 'px', height: size + 'px' }">
        <div class="spinner-inner"></div>
      </div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  message?: string
  fullScreen?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 40,
  message: '',
  fullScreen: false
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  position: relative;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #4ecdc4, #44a08d, #4ecdc4);
  animation: spin 1.5s linear infinite;
}

.spinner-inner {
  position: absolute;
  top: 4px;
  left: 4px;
  right: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
}

.loading-message {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 暗色主题 */
:global(.dark) .loading-spinner.full-screen {
  background: rgba(31, 41, 55, 0.9);
}

:global(.dark) .spinner-inner {
  background: #1f2937;
}

:global(.dark) .loading-message {
  color: #d1d5db;
}
</style>