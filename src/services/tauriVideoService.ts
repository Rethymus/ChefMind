import { invoke } from '@tauri-apps/api/tauri'
import type { VideoConfig, VideoPlayerState } from './videoService'

// Tauri-specific video interfaces
export interface VideoInfo {
  duration: number
  width: number
  height: number
  format: string
  size: number
  bitrate: number
}

export interface VideoFormat {
  name: string
  extension: string
  mime_type: string
  supported: boolean
}

export interface VideoCodec {
  name: string
  hardware_accelerated: boolean
  quality: string
}

export interface PlatformInfo {
  os: string
  arch: string
  kernel_version: string
  desktop_environment?: string
  video_drivers: string[]
}

export interface VideoCapabilities {
  hardware_acceleration: boolean
  max_resolution: string
  preferred_format: string
  supported_protocols: string[]
}

export class TauriVideoService {
  // Video information
  static async getVideoInfo(path: string): Promise<VideoInfo> {
    try {
      return await invoke('get_video_info', { path })
    } catch (error) {
      console.error('Failed to get video info:', error)
      throw error
    }
  }

  static async validateVideoFile(path: string): Promise<VideoInfo> {
    try {
      return await invoke('validate_video_file', { path })
    } catch (error) {
      console.error('Failed to validate video file:', error)
      throw error
    }
  }

  static async getVideoMetadata(path: string): Promise<any> {
    try {
      return await invoke('get_video_metadata', { path })
    } catch (error) {
      console.error('Failed to get video metadata:', error)
      throw error
    }
  }

  // Format support
  static async getSupportedVideoFormats(): Promise<VideoFormat[]> {
    try {
      return await invoke('get_supported_video_formats')
    } catch (error) {
      console.error('Failed to get supported video formats:', error)
      throw error
    }
  }

  static async getSupportedCodecs(): Promise<VideoCodec[]> {
    try {
      return await invoke('get_supported_codecs')
    } catch (error) {
      console.error('Failed to get supported codecs:', error)
      throw error
    }
  }

  static async checkVideoFormatSupport(format: string): Promise<boolean> {
    try {
      return await invoke('check_video_format_support', { format })
    } catch (error) {
      console.error('Failed to check video format support:', error)
      return false
    }
  }

  // Platform information
  static async getPlatformInfo(): Promise<PlatformInfo> {
    try {
      return await invoke('get_platform_info')
    } catch (error) {
      console.error('Failed to get platform info:', error)
      throw error
    }
  }

  static async getVideoCapabilities(): Promise<VideoCapabilities> {
    try {
      return await invoke('get_video_capabilities')
    } catch (error) {
      console.error('Failed to get video capabilities:', error)
      throw error
    }
  }

  static async isWayland(): Promise<boolean> {
    try {
      return await invoke('is_wayland')
    } catch (error) {
      console.error('Failed to check Wayland:', error)
      return false
    }
  }

  static async getScreenResolution(): Promise<[number, number]> {
    try {
      return await invoke('get_screen_resolution')
    } catch (error) {
      console.error('Failed to get screen resolution:', error)
      return [1920, 1080] // fallback
    }
  }

  // Video optimization
  static async optimizeVideoForPlatform(path: string): Promise<string> {
    try {
      return await invoke('optimize_video_for_platform', { path })
    } catch (error) {
      console.error('Failed to optimize video for platform:', error)
      throw error
    }
  }

  static async getPlatformVideoPreferences(): Promise<any> {
    try {
      return await invoke('get_platform_video_preferences')
    } catch (error) {
      console.error('Failed to get platform video preferences:', error)
      throw error
    }
  }

  static async isHardwareAccelerationSupported(): Promise<boolean> {
    try {
      return await invoke('is_hardware_acceleration_supported')
    } catch (error) {
      console.error('Failed to check hardware acceleration support:', error)
      return false
    }
  }

  // Utility functions
  static async getSystemVideoCodecs(): Promise<string[]> {
    try {
      return await invoke('get_system_video_codecs')
    } catch (error) {
      console.error('Failed to get system video codecs:', error)
      return []
    }
  }

  // Platform-specific video optimizations
  static getOptimalPlayerConfig(isTauri: boolean): Partial<VideoConfig> {
    if (!isTauri) {
      return {}
    }

    return {
      customControls: true,
      controls: false,
      preload: 'metadata',
      muted: false,
      fluid: true,
      responsive: true,
    }
  }

  // Platform detection and optimization
  static async detectAndOptimizeVideoSettings(videoConfig: VideoConfig): Promise<VideoConfig> {
    try {
      const capabilities = await this.getVideoCapabilities()
      const platformInfo = await this.getPlatformInfo()

      const optimizedConfig = { ...videoConfig }

      // Apply platform-specific optimizations
      if (platformInfo.os === 'linux') {
        optimizedConfig.type = 'video/webm'
      } else if (platformInfo.os === 'windows') {
        optimizedConfig.type = 'video/mp4'
      } else if (platformInfo.os === 'macos') {
        optimizedConfig.type = 'video/mp4'
      }

      // Apply hardware acceleration settings
      if (!capabilities.hardware_acceleration) {
        // Disable hardware-intensive features
        optimizedConfig.customControls = true
      }

      return optimizedConfig
    } catch (error) {
      console.error('Failed to optimize video settings:', error)
      return videoConfig
    }
  }

  // Video quality adaptation based on platform capabilities
  static async getAdaptiveVideoSources(baseSrc: string): Promise<string[]> {
    try {
      const capabilities = await this.getVideoCapabilities()
      const sources: string[] = []

      // Add different quality sources based on capabilities
      if (capabilities.max_resolution.includes('4K')) {
        sources.push(baseSrc.replace('.mp4', '-4k.mp4'))
      }
      if (capabilities.max_resolution.includes('1080p')) {
        sources.push(baseSrc.replace('.mp4', '-1080p.mp4'))
      }
      sources.push(baseSrc.replace('.mp4', '-720p.mp4'))
      sources.push(baseSrc) // fallback

      return sources
    } catch (error) {
      console.error('Failed to get adaptive video sources:', error)
      return [baseSrc]
    }
  }

  // Network-aware video loading
  static async getOptimalVideoSource(sources: string[]): Promise<string> {
    try {
      const platformInfo = await this.getPlatformInfo()

      // Simple selection based on platform
      if (platformInfo.os === 'linux') {
        // Prefer WebM on Linux
        const webmSource = sources.find(src => src.includes('.webm'))
        if (webmSource) return webmSource
      }

      return sources[0] // fallback to first source
    } catch (error) {
      console.error('Failed to get optimal video source:', error)
      return sources[0]
    }
  }

  // Error handling with platform-specific messages
  static handleVideoError(error: any): string {
    console.error('Tauri video error:', error)

    if (error.message?.includes('not found')) {
      return '视频文件未找到，请检查文件路径'
    }
    if (error.message?.includes('permission')) {
      return '没有权限访问视频文件，请检查文件权限'
    }
    if (error.message?.includes('format')) {
      return '不支持此视频格式，请尝试其他格式'
    }
    if (error.message?.includes('network')) {
      return '网络连接错误，请检查网络后重试'
    }

    return '视频播放出现错误，请稍后重试'
  }

  // Performance monitoring
  static async getVideoPerformanceMetrics(): Promise<any> {
    try {
      const platformInfo = await this.getPlatformInfo()
      const capabilities = await this.getVideoCapabilities()

      return {
        platform: platformInfo.os,
        hardware_acceleration: capabilities.hardware_acceleration,
        max_resolution: capabilities.max_resolution,
        preferred_format: capabilities.preferred_format,
        supported_protocols: capabilities.supported_protocols,
        video_drivers: platformInfo.video_drivers,
        desktop_environment: platformInfo.desktop_environment,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('Failed to get video performance metrics:', error)
      return {}
    }
  }
}

// Export default
export default TauriVideoService
