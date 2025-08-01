<template>
  <div class="notification-container">
    <!-- 加载遮罩 -->
    <LoadingSpinner
      v-if="loadingState.isLoading"
      :full-screen="loadingState.fullScreen"
      :message="loadingState.message"
      :size="loadingState.fullScreen ? 60 : 40"
    />
    
    <!-- 通知列表 -->
    <div class="notifications-list">
      <ErrorAlert
        v-for="notification in notifications"
        :key="notification.id"
        :show="true"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        :closable="notification.closable"
        :actions="notification.actions"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { globalNotification } from '@/composables/useNotification'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorAlert from './ErrorAlert.vue'

const { notifications, loadingState, removeNotification } = globalNotification
</script>

<style scoped>
.notification-container {
  position: relative;
  z-index: 1000;
}

.notifications-list {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 1001;
  pointer-events: none;
}

.notifications-list > * {
  pointer-events: auto;
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .notifications-list {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>