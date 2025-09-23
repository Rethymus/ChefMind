<template>
  <div class="video-demo-view">
    <header class="page-header">
      <h1>视频播放器演示</h1>
      <p>支持 Web 和 Tauri 应用的跨平台视频播放器</p>
    </header>

    <div class="demo-container">
      <!-- Main Video Player -->
      <section class="main-player-section">
        <h2>主要视频播放器</h2>
        <div class="video-wrapper">
          <SimpleVideoPlayer
            ref="mainPlayer"
            :src="currentVideo.src"
            :type="currentVideo.type"
            :poster="currentVideo.poster"
            :controls="!useCustomControls"
            :show-custom-controls="useCustomControls"
            @ready="onPlayerReady"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @error="onError"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
          />
        </div>

        <!-- Video Controls -->
        <div class="video-controls">
          <div class="control-group">
            <label>
              <input type="checkbox" v-model="useCustomControls" />
              使用自定义控件 (Tauri 优化)
            </label>
          </div>

          <div class="control-buttons">
            <button @click="togglePlay" :disabled="!currentPlayer">
              {{ isPlaying ? '暂停' : '播放' }}
            </button>
            <button @click="toggleMute" :disabled="!currentPlayer">
              {{ isMuted ? '取消静音' : '静音' }}
            </button>
            <button @click="toggleFullscreen" :disabled="!currentPlayer">
              {{ isFullscreen ? '退出全屏' : '全屏' }}
            </button>
            <button @click="restartVideo" :disabled="!currentPlayer">
              重播
            </button>
          </div>

          <div class="volume-control">
            <label>音量: {{ Math.round(volume * 100) }}%</label>
            <button @click="toggleMute" :disabled="!mainPlayer">
              {{ isMuted ? '取消静音' : '静音' }}
            </button>
          </div>

          <div class="progress-info">
            <span>当前时间: {{ formatTime(currentTime) }}</span>
            <span>总时长: {{ formatTime(duration) }}</span>
          </div>
        </div>
      </section>

      <!-- Video Selection -->
      <section class="video-selection">
        <h2>选择视频</h2>
        <div class="video-grid">
          <div
            v-for="video in videos"
            :key="video.id"
            class="video-card"
            :class="{ active: currentVideo.id === video.id }"
            @click="selectVideo(video)"
          >
            <div class="video-thumbnail">
              <img :src="video.poster || '/images/default-video-thumb.jpg'" :alt="video.title" />
              <div class="video-duration">{{ formatTime(video.duration || 0) }}</div>
            </div>
            <div class="video-info">
              <h3>{{ video.title }}</h3>
              <p>{{ video.description }}</p>
              <div class="video-tags">
                <span v-for="tag in video.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Video Information -->
      <section class="video-info">
        <h2>当前视频信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>标题:</label>
            <span>{{ currentVideo.title }}</span>
          </div>
          <div class="info-item">
            <label>分类:</label>
            <span>{{ currentVideo.category || '未分类' }}</span>
          </div>
          <div class="info-item">
            <label>格式:</label>
            <span>{{ currentVideo.type }}</span>
          </div>
          <div class="info-item">
            <label>时长:</label>
            <span>{{ formatTime(currentVideo.duration || 0) }}</span>
          </div>
          <div class="info-item">
            <label>源地址:</label>
            <span class="video-src">{{ currentVideo.src }}</span>
          </div>
          <div class="info-item">
            <label>平台支持:</label>
            <span>
              <span class="platform-badge web">Web</span>
              <span class="platform-badge tauri">Tauri</span>
            </span>
          </div>
        </div>
      </section>

      <!-- Platform Information -->
      <section class="platform-info">
        <h2>平台信息</h2>
        <div class="platform-details">
          <div class="platform-item">
            <label>当前平台:</label>
            <span>{{ isTauri ? 'Tauri 应用' : 'Web 浏览器' }}</span>
          </div>
          <div class="platform-item">
            <label>HLS 支持:</label>
            <span>{{ hlsSupported ? '✅ 支持' : '❌ 不支持' }}</span>
          </div>
          <div class="platform-item">
            <label>视频格式支持:</label>
            <div class="format-support">
              <div
                v-for="format in supportedFormats"
                :key="format.type"
                class="format-item"
                :class="{ supported: format.supported }"
              >
                {{ format.type }}: {{ format.supported ? '✅' : '❌' }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features List -->
      <section class="features">
        <h2>功能特性</h2>
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">🎬</div>
            <h3>多格式支持</h3>
            <p>支持 MP4, WebM, HLS 等多种视频格式</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎮</div>
            <h3>自定义控件</h3>
            <p>为 Tauri 应用优化的自定义播放控件</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h3>响应式设计</h3>
            <p>适配各种屏幕尺寸和设备</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔊</div>
            <h3>音量控制</h3>
            <p>完整的音量和静音控制功能</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⛶</div>
            <h3>全屏播放</h3>
            <p>支持全屏模式和退出全屏</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🚀</div>
            <h3>跨平台</h3>
            <p>同时支持 Web 和 Tauri 应用</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SimpleVideoPlayer from '@/components/SimpleVideoPlayer.vue'
import videoService, { type VideoConfig } from '@/services/videoService'
import type { HTMLVideoElement } from '@/components/SimpleVideoPlayer.vue'

// Player state
const mainPlayer = ref<InstanceType<typeof SimpleVideoPlayer>>()
const currentPlayer = ref<HTMLVideoElement>()
const isPlaying = ref(false)
const isMuted = ref(false)
const isFullscreen = ref(false)
const volume = ref(1)
const currentTime = ref(0)
const duration = ref(0)
const useCustomControls = ref(false)

// Video data
const videos = ref<VideoConfig[]>([])
const currentVideo = ref<VideoConfig>({
  id: '',
  title: '',
  src: '',
  type: 'video/mp4'
})

// Platform detection
const isTauri = computed(() => {
  return !!(window as any).__TAURI__
})

const hlsSupported = computed(() => {
  return videoService.isHLSSupported()
})

const supportedFormats = computed(() => {
  const formats = [
    { type: 'video/mp4', supported: videoService.isVideoFormatSupported('video/mp4') },
    { type: 'video/webm', supported: videoService.isVideoFormatSupported('video/webm') },
    { type: 'video/ogg', supported: videoService.isVideoFormatSupported('video/ogg') },
    { type: 'application/x-mpegURL', supported: videoService.isVideoFormatSupported('application/x-mpegURL') }
  ]
  return formats
})

// Initialize
onMounted(() => {
  videos.value = videoService.getAllVideos()
  if (videos.value.length > 0) {
    currentVideo.value = videos.value[0]
  }
})

// Video selection
function selectVideo(video: VideoConfig) {
  currentVideo.value = video
  currentTime.value = 0
  duration.value = video.duration || 0
}

// Player events
function onPlayerReady(video: HTMLVideoElement) {
  currentPlayer.value = video
  console.log('Player ready:', video)
}

function onLoadedMetadata(durationValue: number) {
  duration.value = durationValue
  console.log('Video duration:', durationValue)
}

function onPlay() {
  isPlaying.value = true
  videoService.updatePlayerState('isPlaying', true)
  videoService.logVideoEvent('play', currentVideo.value.id)
}

function onPause() {
  isPlaying.value = false
  videoService.updatePlayerState('isPlaying', false)
  videoService.logVideoEvent('pause', currentVideo.value.id)
}

function onEnded() {
  isPlaying.value = false
  videoService.updatePlayerState('isPlaying', false)
  videoService.logVideoEvent('ended', currentVideo.value.id)
}

function onError(error: any) {
  const errorMessage = videoService.handleVideoError(error)
  console.error('Video error:', errorMessage)
  videoService.updatePlayerState('error', errorMessage)
  videoService.logVideoEvent('error', currentVideo.value.id, { error: errorMessage })
}

function onTimeUpdate(time: number) {
  currentTime.value = time
  videoService.updatePlayerState('currentTime', time)
}

// 音量控制函数（如果需要）
function onVolumeChange(vol: number) {
  volume.value = vol
  isMuted.value = vol === 0
  videoService.updatePlayerState('volume', vol)
  videoService.updatePlayerState('isMuted', vol === 0)
}

// Control functions
function togglePlay() {
  mainPlayer.value?.togglePlay()
}

function toggleMute() {
  mainPlayer.value?.toggleMute()
}

function toggleFullscreen() {
  const video = mainPlayer.value?.getVideoElement()
  if (video) {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }
}

// setVolume function removed - SimpleVideoPlayer handles volume internally

function restartVideo() {
  if (mainPlayer.value) {
    const video = mainPlayer.value.getVideoElement()
    if (video) {
      video.currentTime = 0
      video.play()
    }
  }
}

// Utility functions
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.video-demo-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: #666;
}

.demo-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Main Player Section */
.main-player-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto 20px;
  border-radius: 8px;
  overflow: hidden;
}

.video-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.control-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #42b883;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
}

.control-buttons button:hover:not(:disabled) {
  background: #369870;
}

.control-buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
}

.volume-control input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 6px;
  font-family: monospace;
}

/* Video Selection */
.video-selection h2,
.video-info h2,
.platform-info h2,
.features h2 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.video-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.video-card.active {
  border-color: #42b883;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f0f0f0;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
}

.video-info {
  padding: 15px;
}

.video-info h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 8px;
}

.video-info p {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background: #e0f2f1;
  color: #00796b;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

/* Video Information */
.video-info {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.info-item span {
  color: #333;
  font-family: monospace;
  word-break: break-all;
}

.video-src {
  font-size: 0.8rem;
  color: #666;
}

/* Platform Information */
.platform-info {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.platform-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.platform-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}

.platform-item label {
  font-weight: 600;
  color: #555;
  min-width: 120px;
}

.platform-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 8px;
}

.platform-badge.web {
  background: #e3f2fd;
  color: #1976d2;
}

.platform-badge.tauri {
  background: #f3e5f5;
  color: #7b1fa2;
}

.format-support {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

.format-item {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
}

.format-item.supported {
  background: #e8f5e8;
  color: #2e7d32;
}

.format-item:not(.supported) {
  background: #ffebee;
  color: #c62828;
}

/* Features */
.features {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.feature-item h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 8px;
}

.feature-item p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .video-demo-view {
    padding: 15px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .main-player-section,
  .video-info,
  .platform-info,
  .features {
    padding: 20px;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .control-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .progress-info {
    flex-direction: column;
    gap: 5px;
  }
}
</style>