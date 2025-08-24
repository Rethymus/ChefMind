<template>
  <div class="notification-container">
    <transition-group name="notification">
      <div 
        v-for="notification in notifications" 
        :key="notification.id" 
        :class="['notification', `notification-${notification.type}`]"
      >
        <div class="notification-icon">
          <span v-if="notification.type === 'success'">✅</span>
          <span v-else-if="notification.type === 'error'">❌</span>
          <span v-else-if="notification.type === 'warning'">⚠️</span>
          <span v-else>ℹ️</span>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div v-if="notification.message" class="notification-message">{{ notification.message }}</div>
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

const notifications = ref<Notification[]>([])
let nextId = 1

// 添加通知
const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = nextId++
  const newNotification = {
    ...notification,
    id,
    duration: notification.duration || 3000 // 默认3秒后自动关闭
  }
  
  notifications.value.push(newNotification)
  
  // 设置自动关闭
  if (newNotification.duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }
  
  return id
}

// 移除通知
const removeNotification = (id: number) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index !== -1) {
    notifications.value.splice(index, 1)
  }
}

// 全局事件总线
onMounted(() => {
  window.addEventListener('notification', (event: Event) => {
    const customEvent = event as CustomEvent
    addNotification(customEvent.detail)
  })
})

// 导出方法供其他组件使用
defineExpose({
  addNotification,
  removeNotification
})
</script>

<style lang="scss" scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 320px;
  max-width: calc(100vw - 40px);
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 10px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
  
  &-success {
    border-left: 4px solid #67c23a;
  }
  
  &-error {
    border-left: 4px solid #f56c6c;
  }
  
  &-warning {
    border-left: 4px solid #e6a23c;
  }
  
  &-info {
    border-left: 4px solid #909399;
  }
}

.notification-icon {
  margin-right: 12px;
  font-size: 20px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.notification-message {
  font-size: 14px;
  color: #606266;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #909399;
  padding: 0;
  margin-left: 10px;
  
  &:hover {
    color: #606266;
  }
}

// 动画效果
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>