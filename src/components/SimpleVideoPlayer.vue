<template>
  <div class="simple-video-player">
    <video
      ref="videoElement"
      class="video-element"
      :src="src"
      :type="type"
      :poster="poster"
      :controls="showControls"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :preload="preload"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @error="onError"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @canplay="onCanPlay"
      style="width: 100%; height: auto; max-width: 100%; border-radius: 8px;"
    ></video>

    <!-- 自定义控制栏 (可选) -->
    <div v-if="!showControls && showCustomControls" class="custom-controls">
      <button @click="togglePlay" class="control-btn">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <button @click="toggleMute" class="control-btn">
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
      <div class="progress-bar">
        <input
          type="range"
          :value="currentTime"
          :max="duration"
          @input="seekTo"
          class="progress-slider"
        />
      </div>
      <span class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="retryLoading" class="retry-btn">重试</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  src: string
  type?: string
  poster?: string
  controls?: boolean
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  preload?: 'auto' | 'metadata' | 'none'
  showCustomControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'video/mp4',
  controls: true,
  autoplay: false,
  muted: false,
  loop: false,
  preload: 'metadata',
  showCustomControls: false
})

const emit = defineEmits<{
  ready: [video: HTMLVideoElement]
  play: []
  pause: []
  ended: []
  error: [error: Event]
  timeupdate: [currentTime: number]
  loadedmetadata: [duration: number]
}>()

const videoElement = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const isMuted = ref(props.muted)
const currentTime = ref(0)
const duration = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// 计算属性
const showControls = computed(() => {
  // 在Tauri环境中，默认使用自定义控件
  const isTauri = !!(window as any).__TAURI__
  return props.controls && !props.showCustomControls && !isTauri
})

const showCustomControls = computed(() => {
  const isTauri = !!(window as any).__TAURI__
  return props.showCustomControls || (isTauri && !props.controls)
})

// 事件处理
const onPlay = () => {
  isPlaying.value = true
  loading.value = false
  emit('play')
}

const onPause = () => {
  isPlaying.value = false
  emit('pause')
}

const onEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const onError = (event: Event) => {
  loading.value = false
  error.value = '视频加载失败，请检查网络或文件路径'
  console.error('Video error:', event)
  emit('error', event)
}

const onTimeUpdate = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime
    emit('timeupdate', currentTime.value)
  }
}

const onLoadedMetadata = () => {
  if (videoElement.value) {
    duration.value = videoElement.value.duration
    emit('loadedmetadata', duration.value)
    emit('ready', videoElement.value)
  }
}

const onCanPlay = () => {
  loading.value = false
}

// 控制方法
const togglePlay = () => {
  if (!videoElement.value) return

  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play().catch(err => {
      console.error('Play failed:', err)
      error.value = '播放失败，请重试'
    })
  }
}

const toggleMute = () => {
  if (!videoElement.value) return

  isMuted.value = !isMuted.value
  videoElement.value.muted = isMuted.value
}

const seekTo = (event: Event) => {
  const target = event.target as HTMLInputElement
  const time = parseFloat(target.value)

  if (videoElement.value && !isNaN(time)) {
    videoElement.value.currentTime = time
    currentTime.value = time
  }
}

const retryLoading = () => {
  error.value = null
  loading.value = true

  if (videoElement.value) {
    videoElement.value.load()
    videoElement.value.play().catch(err => {
      error.value = '播放失败，请重试'
      loading.value = false
    })
  }
}

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 监听属性变化
watch(() => props.src, (newSrc) => {
  if (videoElement.value && newSrc) {
    loading.value = true
    error.value = null
    currentTime.value = 0
    videoElement.value.load()
  }
})

watch(() => props.muted, (newMuted) => {
  if (videoElement.value) {
    videoElement.value.muted = newMuted
    isMuted.value = newMuted
  }
})

// 生命周期
onMounted(() => {
  if (videoElement.value && props.src) {
    loading.value = true
  }
})

onUnmounted(() => {
  if (videoElement.value) {
    videoElement.value.pause()
    videoElement.value.src = ''
  }
})

// 暴露方法
defineExpose({
  play: () => videoElement.value?.play(),
  pause: () => videoElement.value?.pause(),
  togglePlay,
  toggleMute,
  seekTo,
  retryLoading,
  getVideoElement: () => videoElement.value
})
</script>

<style scoped>
.simple-video-player {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-element {
  display: block;
  width: 100%;
  height: auto;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 10;
}

.control-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.progress-bar {
  flex: 1;
  margin: 0 10px;
}

.progress-slider {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.time-display {
  color: white;
  font-size: 12px;
  font-family: monospace;
  min-width: 80px;
  text-align: center;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 20;
  text-align: center;
  padding: 20px;
}

.error-message p {
  margin-bottom: 15px;
  color: #ff6b6b;
}

.retry-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #369870;
}

/* Tauri环境特殊处理 */
@media (prefers-color-scheme: dark) {
  .custom-controls {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  }
}
</style>