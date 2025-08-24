<template>
  <div class="video-tutorial-view">
    <div class="video-container">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ t('app.loading') }}</p>
      </div>
      
      <template v-else-if="tutorial">
        <div class="video-player">
          <div class="video-placeholder" @click="playVideo" v-if="!isPlaying">
            <img :src="tutorial.thumbnailUrl" :alt="tutorial.title" class="thumbnail" />
            <div class="play-button">
              <span class="play-icon">▶</span>
            </div>
            <div class="video-duration">{{ tutorial.duration }}</div>
          </div>
          
          <video 
            ref="videoRef" 
            class="video-element" 
            :src="tutorial.videoUrl" 
            controls 
            preload="metadata"
            @play="handlePlay"
            @pause="handlePause"
            @timeupdate="handleTimeUpdate"
            @ended="handleEnded"
            v-show="isPlaying"
          ></video>
        </div>
        
        <div class="video-info">
          <h1 class="video-title">{{ tutorial.title }}</h1>
          
          <div class="video-meta">
            <div class="meta-item views">
              <span class="meta-icon">👁️</span>
              <span class="meta-value">{{ formatNumber(tutorial.views) }} {{ t('video.views') }}</span>
            </div>
            
            <div class="meta-item date">
              <span class="meta-icon">📅</span>
              <span class="meta-value">{{ formatDate(tutorial.publishDate) }}</span>
            </div>
            
            <div class="meta-item chef">
              <span class="meta-icon">👨‍🍳</span>
              <span class="meta-value">{{ tutorial.chef }}</span>
            </div>
            
            <button class="like-button" @click="likeVideo">
              <span class="like-icon">❤️</span>
              <span class="like-count">{{ formatNumber(tutorial.likes) }}</span>
            </button>
            
            <button class="share-button" @click="shareVideo">
              <span class="share-icon">📤</span>
              <span class="share-text">{{ t('app.share') }}</span>
            </button>
          </div>
          
          <div class="video-description">
            <p>{{ tutorial.description }}</p>
          </div>
          
          <div class="video-tags">
            <span 
              v-for="tag in tutorial.tags" 
              :key="tag"
              class="tag"
            >
              #{{ tag }}
            </span>
          </div>
          
          <div v-if="relatedRecipe" class="related-recipe">
            <h3 class="section-title">{{ t('video.related_recipe') }}</h3>
            <div class="recipe-card" @click="viewRecipe(relatedRecipe.id)">
              <div class="recipe-image">
                <img :src="relatedRecipe.image" :alt="relatedRecipe.title" v-lazy />
              </div>
              <div class="recipe-info">
                <h4 class="recipe-title">{{ relatedRecipe.title }}</h4>
                <div class="recipe-meta">
                  <span class="recipe-time">⏱️ {{ relatedRecipe.cookTime }}分钟</span>
                  <span class="recipe-rating">⭐ {{ relatedRecipe.rating }}</span>
                </div>
                <button class="view-recipe-button">
                  {{ t('video.view_recipe') }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="tutorial.chapters && tutorial.chapters.length > 0" class="video-chapters">
          <h3 class="section-title">{{ t('video.chapters') }}</h3>
          
          <div class="chapters-list">
            <div 
              v-for="(chapter, index) in tutorial.chapters" 
              :key="index"
              :class="['chapter-item', { active: currentChapterIndex === index }]"
              @click="seekToChapter(chapter.startTime)"
            >
              <div class="chapter-number">{{ index + 1 }}</div>
              <div class="chapter-info">
                <div class="chapter-title">{{ chapter.title }}</div>
                <div v-if="chapter.description" class="chapter-description">
                  {{ chapter.description }}
                </div>
              </div>
              <div class="chapter-time">{{ formatTime(chapter.startTime) }}</div>
            </div>
          </div>
        </div>
        
        <div class="recommended-videos">
          <h3 class="section-title">{{ t('video.recommended') }}</h3>
          
          <div class="videos-grid">
            <div 
              v-for="video in recommendedVideos" 
              :key="video.id"
              class="video-card"
              @click="navigateToVideo(video.id)"
            >
              <div class="video-thumbnail">
                <img :src="video.thumbnailUrl" :alt="video.title" v-lazy />
                <div class="video-duration">{{ video.duration }}</div>
              </div>
              <div class="video-card-info">
                <h4 class="video-card-title">{{ video.title }}</h4>
                <div class="video-card-meta">
                  <span class="video-card-chef">{{ video.chef }}</span>
                  <span class="video-card-views">{{ formatNumber(video.views) }} {{ t('video.views') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      
      <div v-else class="error-container">
        <div class="error-icon">❌</div>
        <h2>{{ t('video.not_found') }}</h2>
        <p>{{ t('video.not_found_desc') }}</p>
        <button class="back-button" @click="goBack">
          {{ t('app.back') }}
        </button>
      </div>
    </div>
    
    <!-- 分享模态框 -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal-content share-modal" @click.stop>
        <h2 class="modal-title">{{ t('video.share_video') }}</h2>
        
        <div class="share-options">
          <button class="share-option" @click="shareViaOption('wechat')">
            <span class="option-icon">📱</span>
            <span class="option-name">微信</span>
          </button>
          
          <button class="share-option" @click="shareViaOption('weibo')">
            <span class="option-icon">🔴</span>
            <span class="option-name">微博</span>
          </button>
          
          <button class="share-option" @click="shareViaOption('qq')">
            <span class="option-icon">🐧</span>
            <span class="option-name">QQ</span>
          </button>
          
          <button class="share-option" @click="shareViaOption('link')">
            <span class="option-icon">🔗</span>
            <span class="option-name">复制链接</span>
          </button>
        </div>
        
        <button class="modal-close" @click="showShareModal = false">×</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVideoTutorialService, VideoTutorial } from '@/services/videoTutorialService'
import { useRecipeService } from '@/services/recipeService'
import { useI18n } from '@/composables/useI18n'

// 国际化
const { t } = useI18n()

// 路由
const route = useRoute()
const router = useRouter()

// 服务
const videoService = useVideoTutorialService()
const recipeService = useRecipeService()

// 状态
const isLoading = ref(true)
const tutorial = ref<VideoTutorial | null>(null)
const relatedRecipe = ref<any | null>(null)
const recommendedVideos = ref<VideoTutorial[]>([])
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const currentChapterIndex = ref(0)
const showShareModal = ref(false)

// 生命周期钩子
onMounted(async () => {
  const videoId = route.query.id as string
  
  if (!videoId) {
    router.push('/videos')
    return
  }
  
  await loadVideoData(videoId)
})

onUnmounted(() => {
  // 清理视频播放器
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.src = ''
    videoRef.value.load()
  }
})

// 监听当前时间变化，更新当前章节
watch(currentTime, (newTime) => {
  if (!tutorial.value?.chapters) return
  
  for (let i = tutorial.value.chapters.length - 1; i >= 0; i--) {
    if (newTime >= tutorial.value.chapters[i].startTime) {
      currentChapterIndex.value = i
      break
    }
  }
})

// 方法
const loadVideoData = async (videoId: string) => {
  isLoading.value = true
  
  try {
    // 获取视频教程详情
    const videoData = await videoService.getVideoTutorialById(videoId)
    
    if (!videoData) {
      isLoading.value = false
      return
    }
    
    tutorial.value = videoData
    
    // 增加观看次数
    await videoService.incrementViews(videoId)
    
    // 获取相关食谱
    if (videoData.recipeId) {
      const recipe = await recipeService.getRecipeById(videoData.recipeId.toString())
      relatedRecipe.value = recipe
    }
    
    // 获取推荐视频
    recommendedVideos.value = await videoService.getRecommendedVideos(videoId)
  } catch (error) {
    console.error('加载视频数据失败:', error)
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: t('video.load_error')
    })
  } finally {
    isLoading.value = false
  }
}

const playVideo = () => {
  if (!videoRef.value) return
  
  isPlaying.value = true
  videoRef.value.play()
}

const handlePlay = () => {
  isPlaying.value = true
}

const handlePause = () => {
  // 不隐藏视频元素，只是暂停播放
}

const handleTimeUpdate = () => {
  if (!videoRef.value) return
  currentTime.value = videoRef.value.currentTime
}

const handleEnded = () => {
  isPlaying.value = false
}

const seekToChapter = (time: number) => {
  if (!videoRef.value) return
  
  videoRef.value.currentTime = time
  
  if (!isPlaying.value) {
    playVideo()
  }
}

const likeVideo = async () => {
  if (!tutorial.value) return
  
  try {
    const newLikes = await videoService.likeVideo(tutorial.value.id)
    tutorial.value.likes = newLikes
    
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('video.like_success')
    })
  } catch (error) {
    console.error('点赞视频失败:', error)
  }
}

const shareVideo = () => {
  showShareModal.value = true
}

const shareViaOption = (option: string) => {
  const url = window.location.href
  const title = tutorial.value?.title || ''
  
  if (option === 'link') {
    navigator.clipboard.writeText(url).then(() => {
      showNotification({
        type: 'success',
        title: t('notification.success'),
        message: t('video.link_copied')
      })
    })
  } else {
    // 在实际应用中，这里会调用相应的分享API
    console.log(`分享到 ${option}:`, { url, title })
    
    showNotification({
      type: 'success',
      title: t('notification.success'),
      message: t('video.shared_via').replace('{platform}', option)
    })
  }
  
  showShareModal.value = false
}

const viewRecipe = (recipeId: string) => {
  router.push({
    path: '/recipe-detail',
    query: { id: recipeId }
  })
}

const navigateToVideo = (videoId: string) => {
  router.push({
    path: '/video-tutorial',
    query: { id: videoId }
  })
}

const goBack = () => {
  router.back()
}

// 辅助方法
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' + secs : secs}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

// 显示通知
const showNotification = (notification: { type: string, title: string, message?: string }) => {
  // 创建自定义事件
  const event = new CustomEvent('notification', {
    detail: notification
  })
  
  // 触发事件
  window.dispatchEvent(event)
}
</script>

<style lang="scss" scoped>
.video-tutorial-view {
  padding: 2rem 1rem;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.video-container {
  max-width: 1000px;
  margin: 0 auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(var(--primary-color-rgb), 0.3);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    color: var(--text-color-secondary);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.video-player {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 宽高比 */
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  
  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .play-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    
    .play-icon {
      font-size: 2rem;
      color: white;
    }
  }
  
  &:hover .play-button {
    background-color: var(--primary-color);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  .video-duration {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
    padding: 0.3rem 0.6rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 4px;
    font-size: 0.9rem;
  }
}

.video-element {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: none;
  
  &.playing {
    display: block;
  }
}

.video-info {
  margin-bottom: 2rem;
}

.video-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 1rem 0;
}

.video-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }
  
  .like-button,
  .share-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    cursor: pointer;
    padding: 0;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--primary-color);
    }
  }
}

.video-description {
  font-size: 1rem;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  .tag {
    padding: 0.3rem 0.8rem;
    background-color: var(--bg-color-secondary);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}

.related-recipe {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }
  
  .recipe-card {
    display: flex;
    gap: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
  
  .recipe-image {
    width: 200px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    
    @media (max-width: 768px) {
      width: 100%;
      height: 200px;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .recipe-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .recipe-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.8rem 0;
  }
  
  .recipe-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    margin-bottom: 1rem;
  }
  
  .view-recipe-button {
    margin-top: auto;
    align-self: flex-start;
    padding: 0.8rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary-color-dark);
    }
  }
}

.video-chapters {
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }
  
  .chapters-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .chapter-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: var(--bg-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    &.active {
      background-color: var(--primary-color-light);
      border-left: 4px solid var(--primary-color);
    }
  }
  
  .chapter-number {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: var(--bg-color-secondary);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
    flex-shrink: 0;
    
    .active & {
      background-color: var(--primary-color);
      color: white;
    }
  }
  
  .chapter-info {
    flex: 1;
  }
  
  .chapter-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 0.3rem;
  }
  
  .chapter-description {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }
  
  .chapter-time {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    flex-shrink: 0;
  }
}

.recommended-videos {
  .section-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
  }
  
  .videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .video-card {
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      
      .video-card-title {
        color: var(--primary-color);
      }
    }
  }
  
  .video-thumbnail {
    position: relative;
    width: 100%;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 0.8rem;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-duration {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      padding: 0.2rem 0.5rem;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      border-radius: 4px;
      font-size: 0.8rem;
    }
  }
  
  .video-card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.5rem 0;
    transition: all 0.3s ease;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .video-card-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}

.error-container {
  text-align: center;
  padding: 3rem 1rem;
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ff4d4f;
  }
  
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1rem 0;
  }
  
  p {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin: 0 0 2rem 0;
  }
  
  .back-button {
    padding: 0.8rem 1.5rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary-color-dark);
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0 0 1.5rem 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color-secondary);
  
  &:hover {
    color: var(--text-color);
  }
}

.share-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  
  .share-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--hover-color);
    }
    
    .option-icon {
      font-size: 2rem;
    }
    
    .option-name {
      font-size: 0.9rem;
      color: var(--text-color);
    }
  }
}
</style>