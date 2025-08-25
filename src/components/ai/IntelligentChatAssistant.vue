<template>
  <div class="intelligent-chat-assistant">
    <div class="chat-header">
      <div class="header-content">
        <div class="assistant-avatar">
          <span class="avatar-icon">🤖</span>
        </div>
        <div class="header-info">
          <h3 class="assistant-name">ChefMind AI 助手</h3>
          <p class="assistant-status">
            <span class="status-dot" :class="{ online: isOnline }"></span>
            {{ isOnline ? '在线' : '离线' }}
          </p>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="clearChat" :icon="Delete" text type="danger">
            清空对话
          </el-button>
          <el-button
            size="small"
            @click="toggleAssistant"
            :icon="isMinimized ? ArrowUp : ArrowDown"
            text
          >
            {{ isMinimized ? '展开' : '收起' }}
          </el-button>
        </div>
      </div>
    </div>

    <div v-show="!isMinimized" class="chat-content">
      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message"
          :class="{
            'user-message': message.role === 'user',
            'assistant-message': message.role === 'assistant',
            'system-message': message.role === 'system',
          }"
        >
          <div class="message-avatar">
            <span v-if="message.role === 'user'">👤</span>
            <span v-else-if="message.role === 'assistant'">🤖</span>
            <span v-else>ℹ️</span>
          </div>
          <div class="message-content">
            <div class="message-text" v-html="formatMessage(message.content)"></div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>

            <!-- 助手消息的操作按钮 -->
            <div v-if="message.role === 'assistant'" class="message-actions">
              <el-button size="small" text @click="copyMessage(message.content)">
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
              <el-button
                size="small"
                text
                @click="rateMessage(message.id, !message.liked)"
                :type="message.liked ? 'primary' : 'default'"
              >
                <el-icon><Check /></el-icon>
                {{ message.liked ? '已赞' : '点赞' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="message assistant-message">
            <div class="message-avatar">
              <span>🤖</span>
            </div>
            <div class="message-content">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速操作按钮 -->
      <div class="quick-actions">
        <div class="action-buttons">
          <el-button
            v-for="action in quickActions"
            :key="action.id"
            size="small"
            round
            @click="sendQuickMessage(action.message)"
            :disabled="isTyping"
          >
            {{ action.emoji }} {{ action.label }}
          </el-button>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="2"
            placeholder="输入您的烹饪问题，我来帮您解答..."
            @keydown.enter.prevent="handleEnterPress"
            :disabled="isTyping"
            ref="inputRef"
          >
            <template #append>
              <el-button
                @click="sendMessage"
                :loading="isTyping"
                type="primary"
                :disabled="!inputMessage.trim()"
              >
                <el-icon><Promotion /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>

        <!-- 输入提示 -->
        <div class="input-hints">
          <div class="hint-text">💡 您可以询问：食谱制作、营养搭配、烹饪技巧、食材替换等问题</div>
        </div>
      </div>
    </div>

    <!-- 音频提示 -->
    <audio ref="audioNotification" preload="auto">
      <source src="/sounds/notification.mp3" type="audio/mpeg" />
    </audio>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, nextTick, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Delete,
    ArrowUp,
    ArrowDown,
    DocumentCopy,
    Check,
    Promotion,
  } from '@element-plus/icons-vue'
  import { useUserBehaviorAnalytics } from '@/composables/useUserBehaviorAnalytics'
  import { aiService } from '@/services/aiService'

  // 消息接口
  interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    liked?: boolean
    rating?: number
  }

  // 快速操作接口
  interface QuickAction {
    id: string
    label: string
    emoji: string
    message: string
  }

  // 响应式数据
  const isOnline = ref(true)
  const isMinimized = ref(false)
  const isTyping = ref(false)
  const inputMessage = ref('')
  const messages = ref<ChatMessage[]>([])
  const messagesContainer = ref<HTMLElement>()
  const inputRef = ref()
  const audioNotification = ref<HTMLAudioElement>()

  // 组合式函数
  const { trackEvent } = useUserBehaviorAnalytics()

  // 快速操作按钮
  const quickActions = ref<QuickAction[]>([
    {
      id: '1',
      label: '推荐食谱',
      emoji: '🍽️',
      message: '请为我推荐一些今天的食谱',
    },
    {
      id: '2',
      label: '营养搭配',
      emoji: '🥗',
      message: '这个菜品的营养搭配怎么样？',
    },
    {
      id: '3',
      label: '烹饪技巧',
      emoji: '👨‍🍳',
      message: '有什么烹饪技巧可以分享？',
    },
    {
      id: '4',
      label: '食材替换',
      emoji: '🔄',
      message: '这个食材可以用什么替换？',
    },
  ])

  // 计算属性
  const chatHistory = computed(() => messages.value.filter(msg => msg.role !== 'system'))

  // 生命周期
  onMounted(() => {
    initializeChat()
    loadChatHistory()
  })

  // 监听消息变化，自动滚动到底部
  watch(
    messages,
    () => {
      nextTick(() => {
        scrollToBottom()
      })
    },
    { deep: true }
  )

  // 方法定义
  function initializeChat() {
    // 添加欢迎消息
    addSystemMessage('👋 您好！我是ChefMind AI助手，很高兴为您服务！')
    addAssistantMessage(
      '我可以帮您解答烹饪相关的任何问题，包括：\n\n' +
        '🍽️ 个性化食谱推荐\n' +
        '🥗 营养搭配建议\n' +
        '👨‍🍳 烹饪技巧指导\n' +
        '🔄 食材替换方案\n' +
        '⏰ 时间和难度建议\n\n' +
        '请告诉我您想了解什么？'
    )
  }

  function loadChatHistory() {
    try {
      const savedHistory = localStorage.getItem('chefmind-chat-history')
      if (savedHistory) {
        const history = JSON.parse(savedHistory)
        messages.value = history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      }
    } catch (error) {
      console.error('加载聊天记录失败:', error)
    }
  }

  function saveChatHistory() {
    try {
      localStorage.setItem('chefmind-chat-history', JSON.stringify(messages.value))
    } catch (error) {
      console.error('保存聊天记录失败:', error)
    }
  }

  async function sendMessage() {
    if (!inputMessage.value.trim() || isTyping.value) return

    const userMessage = inputMessage.value.trim()
    inputMessage.value = ''

    // 添加用户消息
    addUserMessage(userMessage)

    // 记录用户行为
    trackEvent(
      'search',
      {
        query: userMessage,
        category: 'ai-assistant',
      },
      {
        page: 'ai-hub',
        component: 'intelligent-chat-assistant',
      }
    )

    // 显示正在输入
    isTyping.value = true

    try {
      // 调用AI服务获取回复
      const response = await aiService.getChatResponse(userMessage, chatHistory.value)

      // 添加助手回复
      addAssistantMessage(response.content)

      // 播放通知音效
      playNotificationSound()
    } catch (error) {
      console.error('AI回复生成失败:', error)
      addAssistantMessage(
        '抱歉，我现在遇到了一些技术问题。请稍后再试，或者您可以尝试重新表述您的问题。'
      )
      ElMessage.error('AI助手暂时无法响应，请稍后重试')
    } finally {
      isTyping.value = false
    }
  }

  function sendQuickMessage(message: string) {
    inputMessage.value = message
    sendMessage()
  }

  function addUserMessage(content: string) {
    const message: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    messages.value.push(message)
    saveChatHistory()
  }

  function addAssistantMessage(content: string) {
    const message: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }
    messages.value.push(message)
    saveChatHistory()
  }

  function addSystemMessage(content: string) {
    const message: ChatMessage = {
      id: generateId(),
      role: 'system',
      content,
      timestamp: new Date(),
    }
    messages.value.push(message)
  }

  function handleEnterPress(event: KeyboardEvent) {
    if (event.shiftKey) {
      // Shift+Enter 换行
      return
    }
    // Enter 发送消息
    event.preventDefault()
    sendMessage()
  }

  function formatMessage(content: string): string {
    // 格式化消息内容，支持基本的Markdown
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  }

  function formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function copyMessage(content: string) {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        ElMessage.success('消息已复制到剪贴板')
      })
      .catch(() => {
        ElMessage.error('复制失败，请手动复制')
      })
  }

  function rateMessage(messageId: string, liked: boolean) {
    const message = messages.value.find(msg => msg.id === messageId)
    if (message) {
      message.liked = liked
      saveChatHistory()

      // 记录用户反馈
      trackEvent(
        'rate',
        {
          rating: liked ? 1 : 0,
          category: 'ai-response',
        },
        {
          page: 'ai-hub',
          component: 'intelligent-chat-assistant',
        }
      )

      ElMessage.success(liked ? '感谢您的反馈！' : '已取消点赞')
    }
  }

  async function clearChat() {
    try {
      await ElMessageBox.confirm('确定要清空所有聊天记录吗？此操作不可撤销。', '确认清空', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      messages.value = []
      localStorage.removeItem('chefmind-chat-history')
      initializeChat()
      ElMessage.success('聊天记录已清空')
    } catch {
      // 用户取消了操作
    }
  }

  function toggleAssistant() {
    isMinimized.value = !isMinimized.value
  }

  function scrollToBottom() {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  function playNotificationSound() {
    if (audioNotification.value) {
      audioNotification.value.play().catch(() => {
        // 忽略音频播放失败
      })
    }
  }

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 导出方法供父组件使用
  defineExpose({
    sendMessage: (message: string) => {
      inputMessage.value = message
      sendMessage()
    },
    clearChat,
    addSystemMessage,
  })
</script>

<style scoped lang="scss">
  .intelligent-chat-assistant {
    background: var(--el-bg-color);
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;

        .assistant-avatar {
          .avatar-icon {
            font-size: 24px;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
          }
        }

        .header-info {
          flex: 1;

          .assistant-name {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .assistant-status {
            margin: 4px 0 0 0;
            font-size: 12px;
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 6px;

            .status-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #ff4d4f;

              &.online {
                background: #52c41a;
              }
            }
          }
        }
      }
    }

    .chat-content {
      display: flex;
      flex-direction: column;
      height: 500px;

      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;

          .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            flex-shrink: 0;
          }

          .message-content {
            flex: 1;

            .message-text {
              background: var(--el-fill-color-light);
              padding: 12px 16px;
              border-radius: 18px;
              line-height: 1.5;
              word-wrap: break-word;
            }

            .message-time {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              margin-top: 4px;
              padding-left: 16px;
            }

            .message-actions {
              margin-top: 8px;
              display: flex;
              gap: 8px;
            }
          }

          &.user-message {
            flex-direction: row-reverse;

            .message-content .message-text {
              background: var(--el-color-primary);
              color: white;
            }

            .message-content .message-time {
              text-align: right;
              padding-right: 16px;
              padding-left: 0;
            }

            .message-content .message-actions {
              justify-content: flex-end;
            }
          }

          &.system-message {
            justify-content: center;

            .message-content .message-text {
              background: var(--el-color-info-light-8);
              color: var(--el-color-info);
              text-align: center;
              border-radius: 12px;
              padding: 8px 12px;
              font-size: 14px;
            }
          }
        }

        .typing-indicator {
          .typing-dots {
            display: flex;
            gap: 4px;
            padding: 16px;

            span {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: var(--el-color-primary);
              animation: typing 1.4s infinite ease-in-out;

              &:nth-child(2) {
                animation-delay: 0.2s;
              }

              &:nth-child(3) {
                animation-delay: 0.4s;
              }
            }
          }
        }
      }

      .quick-actions {
        padding: 12px 16px;
        border-top: 1px solid var(--el-border-color-lighter);

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
      }

      .chat-input {
        padding: 16px;
        border-top: 1px solid var(--el-border-color-lighter);

        .input-container {
          margin-bottom: 8px;
        }

        .input-hints {
          .hint-text {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            text-align: center;
          }
        }
      }
    }
  }

  @keyframes typing {
    0%,
    60%,
    100% {
      transform: scale(1);
      opacity: 0.5;
    }
    30% {
      transform: scale(1.2);
      opacity: 1;
    }
  }

  /* 滚动条样式 */
  .chat-messages::-webkit-scrollbar {
    width: 6px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: var(--el-border-color-darker);
    border-radius: 3px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: var(--el-border-color-dark);
  }
</style>
