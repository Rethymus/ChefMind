import { ref, reactive } from 'vue'

export interface VideoConfig {
  id: string
  title: string
  description?: string
  src: string
  type?: string
  poster?: string
  duration?: number
  category?: string
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface VideoPlayerState {
  isPlaying: boolean
  isMuted: boolean
  isFullscreen: boolean
  volume: number
  currentTime: number
  duration: number
  loading: boolean
  error: string | null
}

class VideoService {
  private videos = reactive<VideoConfig[]>([])
  private playerState = reactive<VideoPlayerState>({
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    loading: false,
    error: null
  })

  // Predefined video configurations - using existing video files
  private static readonly DEFAULT_VIDEOS: VideoConfig[] = [
    {
      id: 'about-us-video',
      title: 'ChefMind 关于我们',
      description: '了解 ChefMind 智能厨房助手的功能和特色',
      src: '/videos/about_us.mp4',
      poster: '/images/recipe-general-1.jpg',
      type: 'video/mp4',
      category: '介绍',
      tags: ['介绍', '产品特色', '智能厨房'],
      duration: 120
    },
    {
      id: 'demo-video-1',
      title: '烹饪技巧演示',
      description: '演示基本的烹饪技巧和厨房操作方法',
      src: '/videos/about_us.mp4',
      poster: '/images/recipe-general-2.jpg',
      type: 'video/mp4',
      category: '教程',
      tags: ['技巧', '演示', '基础'],
      duration: 120
    }
  ]

  constructor() {
    this.initializeDefaultVideos()
  }

  private initializeDefaultVideos() {
    VideoService.DEFAULT_VIDEOS.forEach(video => {
      this.addVideo(video)
    })
  }

  // Video management methods
  addVideo(video: VideoConfig): void {
    const existingIndex = this.videos.findIndex(v => v.id === video.id)
    if (existingIndex >= 0) {
      this.videos[existingIndex] = { ...video, updatedAt: new Date() }
    } else {
      this.videos.push({ ...video, createdAt: new Date(), updatedAt: new Date() })
    }
  }

  removeVideo(id: string): boolean {
    const index = this.videos.findIndex(v => v.id === id)
    if (index >= 0) {
      this.videos.splice(index, 1)
      return true
    }
    return false
  }

  getVideo(id: string): VideoConfig | undefined {
    return this.videos.find(v => v.id === id)
  }

  getAllVideos(): VideoConfig[] {
    return [...this.videos]
  }

  getVideosByCategory(category: string): VideoConfig[] {
    return this.videos.filter(v => v.category === category)
  }

  getVideosByTag(tag: string): VideoConfig[] {
    return this.videos.filter(v => v.tags?.includes(tag))
  }

  searchVideos(query: string): VideoConfig[] {
    const lowercaseQuery = query.toLowerCase()
    return this.videos.filter(v =>
      v.title.toLowerCase().includes(lowercaseQuery) ||
      v.description?.toLowerCase().includes(lowercaseQuery) ||
      v.category?.toLowerCase().includes(lowercaseQuery) ||
      v.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  // Player state management
  updatePlayerState<K extends keyof VideoPlayerState>(key: K, value: VideoPlayerState[K]): void {
    this.playerState[key] = value
  }

  getPlayerState(): VideoPlayerState {
    return { ...this.playerState }
  }

  resetPlayerState(): void {
    Object.assign(this.playerState, {
      isPlaying: false,
      isMuted: false,
      isFullscreen: false,
      volume: 1,
      currentTime: 0,
      duration: 0,
      loading: false,
      error: null
    })
  }

  // Video format support check
  isVideoFormatSupported(type: string): boolean {
    const videoElement = document.createElement('video')
    return videoElement.canPlayType(type) !== ''
  }

  // HLS stream support
  isHLSSupported(): boolean {
    return !!(window as any).MediaSource || !!(window as any).WebKitMediaSource
  }

  // Video quality detection
  getVideoQuality(src: string): 'low' | 'medium' | 'high' {
    if (src.includes('480p') || src.includes('360p')) return 'low'
    if (src.includes('720p') || src.includes('1080p')) return 'medium'
    return 'high'
  }

  // Video file size estimation
  estimateVideoSize(duration: number, quality: 'low' | 'medium' | 'high' = 'medium'): number {
    const bitrates = {
      low: 0.5,    // 0.5 MB/s
      medium: 1.5, // 1.5 MB/s
      high: 3      // 3 MB/s
    }
    return Math.round(duration * bitrates[quality])
  }

  // Video URL validation
  isValidVideoUrl(url: string): boolean {
    try {
      new URL(url)
      const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.m3u8']
      return videoExtensions.some(ext => url.toLowerCase().includes(ext))
    } catch {
      return false
    }
  }

  // Local video file support
  isLocalVideo(src: string): boolean {
    return src.startsWith('/') || src.startsWith('./') || src.startsWith('../')
  }

  // Video loading strategy
  getLoadingStrategy(src: string): 'lazy' | 'eager' | 'none' {
    if (this.isLocalVideo(src)) return 'eager'
    if (src.includes('m3u8')) return 'lazy'
    return 'eager'
  }

  // Network-aware video loading
  async getOptimalVideoSrc(sources: string[]): Promise<string> {
    const connection = (navigator as any).connection
    if (connection) {
      const effectiveType = connection.effectiveType
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return sources.find(src => src.includes('low')) || sources[0]
      }
      if (effectiveType === '3g') {
        return sources.find(src => src.includes('medium')) || sources[0]
      }
    }
    return sources[0]
  }

  // Video error handling
  handleVideoError(error: any): string {
    console.error('Video error:', error)

    if (error.name === 'NotAllowedError') {
      return '视频播放被浏览器阻止，请检查浏览器设置'
    }
    if (error.name === 'NotSupportedError') {
      return '不支持此视频格式，请尝试其他格式'
    }
    if (error.name === 'NetworkError') {
      return '网络连接错误，请检查网络后重试'
    }
    return '视频播放出现错误，请稍后重试'
  }

  // Tauri-specific optimizations
  getTauriVideoConfig(src: string): Partial<VideoConfig> {
    const isTauri = !!(window as any).__TAURI__
    if (!isTauri) return {}

    return {
      customControls: true,
      controls: false,
      preload: 'metadata',
      muted: false
    }
  }

  // Video analytics (if needed)
  logVideoEvent(event: string, videoId: string, data?: any): void {
    console.log(`Video Event: ${event}`, { videoId, data })
    // Here you could integrate with analytics services
  }

  // Export methods for external use
  exportVideoList(): VideoConfig[] {
    return this.getAllVideos()
  }

  importVideoList(videos: VideoConfig[]): void {
    this.videos.length = 0
    videos.forEach(video => this.addVideo(video))
  }
}

// Export singleton instance
export const videoService = new VideoService()

// Export type for Vue components
export type { VideoConfig, VideoPlayerState }

// Export default
export default videoService