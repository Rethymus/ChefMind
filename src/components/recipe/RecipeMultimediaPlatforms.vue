<template>
  <div class="multimedia-platforms">
    <h3 class="section-title">
      <span class="section-icon">🎬</span>
      视频教程
    </h3>
    <p class="section-description">在这些平台上查找相关的烹饪视频教程</p>

    <div class="platforms-grid">
      <button
        v-for="platform in platforms"
        :key="platform.id"
        :class="['platform-button', platform.id]"
        @click="handlePlatformClick(platform.id)"
      >
        <div class="platform-icon">{{ platform.icon }}</div>
        <div class="platform-info">
          <div class="platform-name">{{ platform.name }}</div>
          <div class="platform-desc">{{ platform.description }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { jumpToMultimediaPlatform, MULTIMEDIA_PLATFORMS } from '@/utils/multimediaUtils'

  interface Props {
    recipeName: string
    compact?: boolean // 紧凑模式，显示更少的平台
    showDescription?: boolean // 是否显示描述
  }

  const props = withDefaults(defineProps<Props>(), {
    compact: false,
    showDescription: true,
  })

  const emit = defineEmits<{
    'platform-click': [platform: string, recipeName: string]
  }>()

  // 根据模式选择要显示的平台
  const platforms = computed(() => {
    const allPlatforms = Object.entries(MULTIMEDIA_PLATFORMS).map(([id, config]) => ({
      id,
      name: config.name,
      icon: config.icon,
      description: config.description,
      color: config.color,
    }))

    if (props.compact) {
      // 紧凑模式只显示前4个主要平台
      return allPlatforms.slice(0, 4)
    }

    return allPlatforms
  })

  const handlePlatformClick = (platformId: string) => {
    // 执行跳转
    jumpToMultimediaPlatform(platformId, props.recipeName, {
      trackEvent: (platform, recipeName) => {
        // 发送事件给父组件，用于数据统计
        emit('platform-click', platform, recipeName)
      },
    })
  }
</script>

<style lang="scss" scoped>
  .multimedia-platforms {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1.5rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 0.5rem 0;
  }

  .section-icon {
    font-size: 1.3rem;
  }

  .section-description {
    color: var(--text-color-secondary);
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .platforms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;

    &.compact {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.8rem;
    }
  }

  .platform-button {
    display: flex;
    align-items: center;
    gap: 1rem;
    background-color: var(--bg-color);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 1rem 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    color: inherit;
    text-align: left;

    &:hover {
      border-color: var(--primary-color);
      background-color: var(--hover-color);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    &.bilibili:hover {
      border-color: #00a1d6;
      background: linear-gradient(135deg, rgba(0, 161, 214, 0.1), rgba(0, 161, 214, 0.05));
    }

    &.douyin:hover {
      border-color: #ff0050;
      background: linear-gradient(135deg, rgba(255, 0, 80, 0.1), rgba(255, 0, 80, 0.05));
    }

    &.xiachufang:hover {
      border-color: #7cb342;
      background: linear-gradient(135deg, rgba(124, 179, 66, 0.1), rgba(124, 179, 66, 0.05));
    }

    &.meishitianxia:hover {
      border-color: #ff6b35;
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05));
    }

    &.xiaohongshu:hover {
      border-color: #ff2442;
      background: linear-gradient(135deg, rgba(255, 36, 66, 0.1), rgba(255, 36, 66, 0.05));
    }

    &.douguo:hover {
      border-color: #ffa726;
      background: linear-gradient(135deg, rgba(255, 167, 38, 0.1), rgba(255, 167, 38, 0.05));
    }
  }

  .platform-icon {
    font-size: 2rem;
    min-width: 2.5rem;
    text-align: center;
  }

  .platform-info {
    flex: 1;
  }

  .platform-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 0.25rem;
  }

  .platform-desc {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    line-height: 1.4;
  }

  /* 紧凑模式样式 */
  .platforms-grid.compact .platform-button {
    padding: 0.8rem 1rem;
    gap: 0.8rem;

    .platform-icon {
      font-size: 1.5rem;
      min-width: 2rem;
    }

    .platform-name {
      font-size: 1rem;
      margin-bottom: 0.1rem;
    }

    .platform-desc {
      font-size: 0.8rem;
    }
  }

  /* 移动端适配 */
  @media (max-width: 768px) {
    .multimedia-platforms {
      padding: 1rem;
      margin: 1rem 0;
    }

    .platforms-grid {
      grid-template-columns: 1fr;
      gap: 0.8rem;
    }

    .platform-button {
      padding: 0.8rem 1rem;

      .platform-icon {
        font-size: 1.5rem;
        min-width: 2rem;
      }

      .platform-name {
        font-size: 1rem;
      }

      .platform-desc {
        font-size: 0.85rem;
      }
    }

    .section-title {
      font-size: 1.1rem;
    }

    .section-description {
      font-size: 0.9rem;
    }
  }
</style>
