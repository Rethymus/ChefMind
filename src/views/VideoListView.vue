<template>
  <div class="video-list-view">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">{{ t('video.tutorials') }}</h1>
        <div class="search-container">
          <div class="search-input">
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="t('video.search_placeholder')" 
              @input="handleSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          <div class="filter-dropdown">
            <button class="filter-button" @click="toggleFilterMenu">
              {{ t('video.filter') }} 
              <span class="filter-icon">▼</span>
            </button>
            <div class="filter-menu" v-if="showFilterMenu">
              <div class="filter-section">
                <h4>{{ t('video.categories') }}</h4>
                <div class="filter-options">
                  <label v-for="tag in availableTags" :key="tag" class="filter-option">
                    <input type="checkbox" v-model="selectedTags" :value="tag" @change="applyFilters" />
                    <span>{{ tag }}</span>
                  </label>
                </div>
              </div>
              <div class="filter-section">
                <h4>{{ t('video.sort_by') }}</h4>
                <div class="filter-options">
                  <label v-for="option in sortOptions" :key="option.value" class="filter-option">
                    <input 
                      type="radio" 
                      v-model="sortBy" 
                      :value="option.value" 
                      @change="applyFilters" 
                    />
                    <span>{{ option.label }}</span>
                  </label>
                </div>
              </div>
              <div class="filter-actions">
                <button class="clear-button" @click="clearFilters">
                  {{ t('video.clear_filters') }}
                </button>
                <button class="apply-button" @click="applyFilters">
                  {{ t('video.apply_filters') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ t('app.loading') }}</p>
      </div>

      <div v-else-if="filteredVideos.length === 0" class="empty-state">
        <div class="empty-icon">🎬</div>
        <h2>{{ t('video.no_videos_found') }}</h2>
        <p>{{ t('video.try_different_search') }}</p>
        <button class="reset-button" @click="resetSearch">
          {{ t('video.reset_search') }}
        </button>
      </div>

      <div v-else class="video-grid">
        <div 
          v-for="video in filteredVideos" 
          :key="video.id"
          class="video-card"
          @click="navigateToVideo(video.id)"
        >
          <div class="video-thumbnail">
            <img :src="video.thumbnailUrl" :alt="video.title" v-lazy />
            <div class="video-duration">{{ video.duration }}</div>
            <div class="play-overlay">
              <span class="play-icon">▶</span>
            </div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
            <p class="video-description">{{ truncateText(video.description, 80) }}</p>
            <div class="video-meta">
              <div class="meta-item chef">
                <span class="meta-icon">👨‍🍳</span>
                <span class="meta-text">{{ video.chef }}</span>
              </div>
              <div class="meta-item views">
                <span class="meta-icon">👁️</span>
                <span class="meta-text">{{ formatNumber(video.views) }}</span>
              </div>
            </div>
            <div class="video-tags">
              <span 
                v-for="tag in video.tags.slice(0, 3)" 
                :key="tag"
                class="tag"
              >
                #{{ tag }}
              </span>
              <span v-if="video.tags.length > 3" class="more-tags">+{{ video.tags.length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="filteredVideos.length > 0" class="pagination">
        <button 
          class="pagination-button prev" 
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          &lt; {{ t('app.previous') }}
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in totalPages" 
            :key="page"
            :class="['page-number', { active: page === currentPage }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-button next" 
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          {{ t('app.next') }} &gt;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useVideoTutorialService, VideoTutorial } from '@/services/videoTutorialService'
import { useI18n } from '@/composables/useI18n'

// 国际化
const { t } = useI18n()

// 路由
const router = useRouter()

// 视频服务
const videoService = useVideoTutorialService()

// 状态
const isLoading = ref(true)
const videos = ref<VideoTutorial[]>([])
const searchQuery = ref('')
const showFilterMenu = ref(false)
const selectedTags = ref<string[]>([])
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 12

// 排序选项
const sortOptions = [
  { value: 'newest', label: t('video.sort_newest') },
  { value: 'popular', label: t('video.sort_popular') },
  { value: 'title', label: t('video.sort_title') }
]

// 计算属性
const availableTags = computed(() => {
  const tagsSet = new Set<string>()
  videos.value.forEach(video => {
    video.tags.forEach(tag => tagsSet.add(tag))
  })
  return Array.from(tagsSet).sort()
})

const filteredVideos = computed(() => {
  let result = [...videos.value]
  
  // 应用标签过滤
  if (selectedTags.value.length > 0) {
    result = result.filter(video => 
      selectedTags.value.some(tag => video.tags.includes(tag))
    )
  }
  
  // 应用排序
  switch (sortBy.value) {
    case 'newest':
      result.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      break
    case 'popular':
      result.sort((a, b) => b.views - a.views)
      break
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  return result
})

  const paginatedVideos = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filteredVideos.value.slice(startIndex, startIndex + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(filteredVideos.value.length / itemsPerPage)
})

// 监听搜索查询变化
watch(searchQuery, async (newQuery) => {
  if (newQuery === '') {
    // 如果搜索框被清空，重新加载所有视频
    await loadAllVideos()
  }
})

// 生命周期钩子
onMounted(async () => {
  await loadAllVideos()
})

// 方法
const loadAllVideos = async () => {
  isLoading.value = true
  
  try {
    videos.value = await videoService.getAllVideoTutorials()
    currentPage.value = 1
  } catch (error) {
    console.error('加载视频失败:', error)
    showNotification({
      type: 'error',
      title: t('notification.error'),
      message: t('video.load_error')
    })
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  if (searchQuery.value.trim() === '') {
    return
  }
  
  isLoading.value = true
  
  try {
    videos.value = await videoService.searchVideoTutorials(searchQuery.value)
    currentPage.value = 1
  } catch (error) {
    console.error('搜索视频失败:', error)
  } finally {
    isLoading.value = false
  }
}

const resetSearch = async () => {
  searchQuery.value = ''
  selectedTags.value = []
  sortBy.value = 'newest'
  await loadAllVideos()
}

const toggleFilterMenu = () => {
  showFilterMenu.value = !showFilterMenu.value
}

const clearFilters = () => {
  selectedTags.value = []
  sortBy.value = 'newest'
  applyFilters()
}

const applyFilters = () => {
  currentPage.value = 1
  showFilterMenu.value = false
}

const changePage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const navigateToVideo = (videoId: string) => {
  router.push({
    path: '/video-tutorial',
    query: { id: videoId }
  })
}

// 辅助方法
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
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
.video-list-view {
  padding: 2rem 1rem;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
}

.search-container {
  display: flex;
  gap: 1rem;
  width: 100%;
  
  @media (min-width: 768px) {
    width: auto;
  }
}

.search-input {
  position: relative;
  flex: 1;
  
  input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.5rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--bg-color-secondary);
    color: var(--text-color);
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
    }
    
    &::placeholder {
      color: var(--text-color-secondary);
    }
  }
  
  .search-icon {
    position: absolute;
    left: 0.8rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary);
    pointer-events: none;
  }
}

.filter-dropdown {
  position: relative;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  .filter-icon {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
  }
}

.filter-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 280px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.2rem;
  z-index: 100;
}

.filter-section {
  margin-bottom: 1.2rem;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.8rem 0;
  }
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
  
  span {
    font-size: 0.9rem;
    color: var(--text-color);
  }
}

.filter-actions {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: 1.2rem;
  
  button {
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .clear-button {
    background-color: transparent;
    border: 1px solid var(--border-color);
    color: var(--text-color);
    
    &:hover {
      background-color: var(--hover-color);
    }
  }
  
  .apply-button {
    background-color: var(--primary-color);
    border: none;
    color: white;
    
    &:hover {
      background-color: var(--primary-color-dark);
    }
  }
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

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-color-secondary);
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
  
  .reset-button {
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

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.video-card {
  background-color: var(--bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    
    .play-overlay {
      opacity: 1;
    }
    
    .video-title {
      color: var(--primary-color);
    }
  }
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
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
  
  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    .play-icon {
      width: 50px;
      height: 50px;
      background-color: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 1.2rem;
      color: var(--primary-color);
    }
  }
}

.video-info {
  padding: 1.2rem;
}

.video-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 0.8rem 0;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-description {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}

.video-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  
  .tag {
    padding: 0.2rem 0.6rem;
    background-color: var(--bg-color-secondary);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
  
  .more-tags {
    padding: 0.2rem 0.6rem;
    background-color: var(--bg-color-secondary);
    border-radius: 20px;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  
  .pagination-button {
    padding: 0.6rem 1rem;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background-color: var(--hover-color);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .page-numbers {
    display: flex;
    gap: 0.5rem;
  }
  
  .page-number {
    width: 36px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-color-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.9rem;
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(.active) {
      background-color: var(--hover-color);
    }
    
    &.active {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
  }
}
</style>