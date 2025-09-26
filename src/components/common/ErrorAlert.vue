<template>
  <div v-if="show" class="error-alert" :class="{ 'full-width': fullWidth }">
    <div class="alert-container" :class="typeClass">
      <div class="alert-icon">
        <component :is="alertIcon" class="w-5 h-5" />
      </div>

      <div class="alert-content">
        <h4 v-if="title" class="alert-title">{{ title }}</h4>
        <p class="alert-message">{{ message }}</p>

        <div v-if="details" class="alert-details">
          <button @click="showDetails = !showDetails" class="details-toggle">
            {{ showDetails ? '隐藏详情' : '查看详情' }}
            <ChevronDown
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': showDetails }"
            />
          </button>

          <div v-show="showDetails" class="details-content">
            <pre>{{ details }}</pre>
          </div>
        </div>
      </div>

      <button v-if="closable" @click="handleClose" class="close-btn">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- 操作按钮 -->
    <div v-if="actions && actions.length > 0" class="alert-actions">
      <button
        v-for="action in actions"
        :key="action.label"
        @click="action.handler"
        class="action-btn"
        :class="action.type || 'secondary'"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { AlertCircle, CheckCircle, Info, AlertTriangle, X, ChevronDown } from 'lucide-vue-next'

  interface AlertAction {
    label: string
    handler: () => void
    type?: 'primary' | 'secondary' | 'danger'
  }

  interface Props {
    show?: boolean
    type?: 'error' | 'success' | 'warning' | 'info'
    title?: string
    message: string
    details?: string
    closable?: boolean
    fullWidth?: boolean
    actions?: AlertAction[]
  }

  const props = withDefaults(defineProps<Props>(), {
    show: true,
    type: 'error',
    closable: true,
    fullWidth: false,
  })

  const emit = defineEmits<{
    close: []
  }>()

  const showDetails = ref(false)

  const typeClass = computed(() => {
    const classes = {
      error: 'alert-error',
      success: 'alert-success',
      warning: 'alert-warning',
      info: 'alert-info',
    }
    return classes[props.type]
  })

  const alertIcon = computed(() => {
    const icons = {
      error: AlertCircle,
      success: CheckCircle,
      warning: AlertTriangle,
      info: Info,
    }
    return icons[props.type]
  })

  const handleClose = () => {
    emit('close')
  }
</script>

<style scoped>
  .error-alert {
    margin: 1rem 0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  }

  .error-alert.full-width {
    margin: 0;
    border-radius: 0;
  }

  .alert-container {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-left: 4px solid;
  }

  .alert-error {
    background: #fef2f2;
    border-left-color: #ef4444;
    color: #991b1b;
  }

  .alert-success {
    background: #f0fdf4;
    border-left-color: #22c55e;
    color: #166534;
  }

  .alert-warning {
    background: #fffbeb;
    border-left-color: #f59e0b;
    color: #92400e;
  }

  .alert-info {
    background: #eff6ff;
    border-left-color: #3b82f6;
    color: #1e40af;
  }

  .alert-icon {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  .alert-content {
    flex: 1;
    min-width: 0;
  }

  .alert-title {
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0 0 0.25rem 0;
  }

  .alert-message {
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.5;
  }

  .alert-details {
    margin-top: 0.75rem;
  }

  .details-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: none;
    border: none;
    color: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0.25rem 0;
    text-decoration: underline;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .details-toggle:hover {
    opacity: 1;
  }

  .details-content {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
  }

  .details-content pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .close-btn {
    flex-shrink: 0;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    opacity: 0.6;
    transition: all 0.2s;
  }

  .close-btn:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }

  .alert-actions {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(0, 0, 0, 0.02);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }

  .action-btn {
    padding: 0.5rem 1rem;
    border: 1px solid;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn.primary {
    background: #3b82f6;
    border-color: #3b82f6;
    color: white;
  }

  .action-btn.primary:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  .action-btn.secondary {
    background: white;
    border-color: #d1d5db;
    color: #374151;
  }

  .action-btn.secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .action-btn.danger {
    background: #ef4444;
    border-color: #ef4444;
    color: white;
  }

  .action-btn.danger:hover {
    background: #dc2626;
    border-color: #dc2626;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 暗色主题 */
  :global(.dark) .alert-error {
    background: #7f1d1d;
    color: #fecaca;
  }

  :global(.dark) .alert-success {
    background: #14532d;
    color: #bbf7d0;
  }

  :global(.dark) .alert-warning {
    background: #78350f;
    color: #fed7aa;
  }

  :global(.dark) .alert-info {
    background: #1e3a8a;
    color: #bfdbfe;
  }

  :global(.dark) .details-content {
    background: rgba(255, 255, 255, 0.1);
  }

  :global(.dark) .alert-actions {
    background: rgba(255, 255, 255, 0.05);
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  :global(.dark) .action-btn.secondary {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  :global(.dark) .action-btn.secondary:hover {
    background: #4b5563;
    border-color: #6b7280;
  }
</style>
