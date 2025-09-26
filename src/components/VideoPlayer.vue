<template>
  <div class="video-player-container" :class="{ fullscreen: isFullscreen }">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin"
      :poster="poster"
      :controls="controls"
      :preload="preload"
      :width="width"
      :height="height"
      :data-setup="dataSetup"
    >
      <source :src="videoSource" :type="videoType" />
      <p class="vjs-no-js">
        To view this video please enable JavaScript, and consider upgrading to a web browser that
        <a href="https://videojs.com/html5-video-support/" target="_blank"> supports HTML5 video </a
        >.
      </p>
    </video>

    <!-- Custom Controls for Tauri -->
    <div v-if="isTauri && customControls" class="custom-controls">
      <button @click="togglePlay" class="control-btn">
        {{ isPlaying ? '⏸️' : '▶️' }}
      </button>
      <button @click="toggleMute" class="control-btn">
        {{ isMuted ? '🔇' : '🔊' }}
      </button>
      <button @click="toggleFullscreen" class="control-btn">
        {{ isFullscreen ? '⛶' : '⛶' }}
      </button>
      <input
        type="range"
        v-model="volume"
        min="0"
        max="1"
        step="0.1"
        @input="setVolume"
        class="volume-slider"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
  import videojs from 'video.js'
  import 'video.js/dist/video-js.css'
  import type { Player } from 'video.js'

  interface VideoPlayerProps {
    src: string
    type?: string
    poster?: string
    width?: number | string
    height?: number | string
    controls?: boolean
    preload?: 'auto' | 'metadata' | 'none'
    autoplay?: boolean
    muted?: boolean
    loop?: boolean
    fluid?: boolean
    responsive?: boolean
    customControls?: boolean
    hls?: boolean
  }

  const props = withDefaults(defineProps<VideoPlayerProps>(), {
    type: 'video/mp4',
    width: '100%',
    height: 'auto',
    controls: true,
    preload: 'metadata',
    autoplay: false,
    muted: false,
    loop: false,
    fluid: true,
    responsive: true,
    customControls: false,
    hls: true,
  })

  const emit = defineEmits<{
    ready: [player: Player]
    play: []
    pause: []
    ended: []
    error: [error: any]
    timeupdate: [currentTime: number]
    volumechange: [volume: number]
  }>()

  const videoPlayer = ref<HTMLElement>()
  const player = ref<Player>()
  const isPlaying = ref(false)
  const isMuted = ref(props.muted)
  const isFullscreen = ref(false)
  const volume = ref(props.muted ? 0 : 1)

  // Check if running in Tauri environment
  const isTauri = computed(() => {
    return !!(window as any).__TAURI__
  })

  // Computed video source and type
  const videoSource = computed(() => props.src)
  const videoType = computed(() => {
    if (props.src.includes('.m3u8') || (props.hls && props.src.includes('.m3u8'))) {
      return 'application/x-mpegURL'
    }
    return props.type
  })

  // Video.js data setup
  const dataSetup = computed(() => ({
    fluid: props.fluid,
    responsive: props.responsive,
    autoplay: props.autoplay,
    muted: props.muted,
    loop: props.loop,
    controls: props.controls && !props.customControls,
    preload: props.preload,
    html5: {
      vhs: {
        overrideNative: true,
        withCredentials: false,
      },
    },
    techOrder: ['html5'],
  }))

  // Initialize video player
  const initPlayer = () => {
    if (!videoPlayer.value) return

    // Create player instance
    player.value = videojs(videoPlayer.value, dataSetup.value, () => {
      emit('ready', player.value!)

      // Set initial volume
      player.value!.volume(volume.value)
      player.value!.muted(isMuted.value)
    })

    // Setup HLS if needed
    if (props.hls && props.src.includes('.m3u8')) {
      import('hls.js').then(HLS => {
        const hls = new HLS.default()

        if (HLS.default.isSupported()) {
          hls.loadSource(props.src)
          hls.attachMedia(videoPlayer.value!)
        }
      })
    }

    // Event listeners
    player.value!.on('play', () => {
      isPlaying.value = true
      emit('play')
    })

    player.value!.on('pause', () => {
      isPlaying.value = false
      emit('pause')
    })

    player.value!.on('ended', () => {
      isPlaying.value = false
      emit('ended')
    })

    player.value!.on('error', error => {
      emit('error', error)
    })

    player.value!.on('timeupdate', () => {
      emit('timeupdate', player.value!.currentTime())
    })

    player.value!.on('volumechange', () => {
      volume.value = player.value!.volume()
      isMuted.value = player.value!.muted()
      emit('volumechange', volume.value)
    })

    player.value!.on('fullscreenchange', () => {
      isFullscreen.value = player.value!.isFullscreen()
    })
  }

  // Custom control methods
  const togglePlay = () => {
    if (isPlaying.value) {
      player.value?.pause()
    } else {
      player.value?.play()
    }
  }

  const toggleMute = () => {
    if (player.value) {
      player.value.muted(!isMuted.value)
      isMuted.value = player.value.muted()
    }
  }

  const toggleFullscreen = () => {
    if (player.value) {
      if (isFullscreen.value) {
        player.value.exitFullscreen()
      } else {
        player.value.requestFullscreen()
      }
    }
  }

  const setVolume = (event: Event) => {
    const target = event.target as HTMLInputElement
    const newVolume = parseFloat(target.value)
    volume.value = newVolume
    if (player.value) {
      player.value.volume(newVolume)
    }
  }

  // Public methods
  const play = () => player.value?.play()
  const pause = () => player.value?.pause()
  const dispose = () => player.value?.dispose()

  // Watch for props changes
  watch(
    () => props.src,
    newSrc => {
      if (player.value) {
        player.value.src(newSrc)
      }
    }
  )

  watch(
    () => props.muted,
    newMuted => {
      if (player.value) {
        player.value.muted(newMuted)
        isMuted.value = newMuted
      }
    }
  )

  // Lifecycle hooks
  onMounted(() => {
    initPlayer()
  })

  onUnmounted(() => {
    dispose()
  })

  // Expose public methods
  defineExpose({
    play,
    pause,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    setVolume,
    dispose,
  })
</script>

<style scoped>
  .video-player-container {
    position: relative;
    background: #000;
    border-radius: 8px;
    overflow: hidden;
  }

  .video-js {
    width: 100%;
    height: 100%;
  }

  .custom-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 20px 10px 10px;
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
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  .volume-slider {
    flex: 1;
    max-width: 100px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    outline: none;
    cursor: pointer;
  }

  .volume-slider::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }

  .volume-slider::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }

  /* Tauri-specific optimizations */
  :deep(.vjs-control-bar) {
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  }

  :deep(.vjs-play-progress) {
    background: #42b883;
  }

  :deep(.vjs-volume-level) {
    background: #42b883;
  }

  /* Fullscreen styles */
  .video-player-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    border-radius: 0;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .custom-controls {
      padding: 15px 8px 8px;
      gap: 8px;
    }

    .control-btn {
      padding: 6px 10px;
      font-size: 14px;
    }

    .volume-slider {
      max-width: 80px;
    }
  }
</style>
