<template>
  <div 
    class="recipe-card" 
    :class="{ clickable: clickable }"
    @click="handleClick"
  >
    <div class="recipe-image">
      <!-- 如果有传统图片则使用，否则生成 SVG -->
      <img 
        v-if="recipe.image && !recipe.image.includes('.svg') && !forceGenerateSvg" 
        :src="recipe.image" 
        :alt="recipe.title || recipe.name" 
        @error="handleImageError"
      />
      <div 
        v-else
        class="svg-cover"
        v-html="generatedSvg"
      ></div>
      
      <div class="recipe-overlay" v-if="showOverlay">
        <span v-if="recipe.difficulty" class="recipe-difficulty">
          {{ formatDifficulty(recipe.difficulty) }}
        </span>
        <span v-if="recipe.cookingTime" class="recipe-time">
          {{ formatCookingTime(recipe.cookingTime) }}
        </span>
      </div>
    </div>

    <div class="recipe-content">
      <h3 class="recipe-title">{{ recipe.title || recipe.name }}</h3>
      <p v-if="recipe.description" class="recipe-description">{{ recipe.description }}</p>

      <div class="recipe-meta" v-if="showMeta">
        <div v-if="recipe.rating" class="recipe-rating">
          <span class="rating-stars">⭐</span>
          <span class="rating-value">{{ recipe.rating }}</span>
        </div>
        <div v-if="recipe.tags && recipe.tags.length" class="recipe-tags">
          <span 
            v-for="tag in recipe.tags.slice(0, 2)" 
            :key="tag" 
            class="recipe-tag"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="recipe-actions" v-if="showActions">
        <button 
          v-if="showDownloadButton" 
          class="action-btn download-btn" 
          @click.stop="downloadCover"
          title="下载封面"
        >
          📥
        </button>
        <button 
          v-if="showRegenerateButton" 
          class="action-btn regenerate-btn" 
          @click.stop="regenerateCover"
          title="重新生成封面"
        >
          🎨
        </button>
        <button 
          v-if="showFavoriteButton" 
          class="action-btn favorite-btn" 
          @click.stop="$emit('remove-favorite', recipe)"
          title="取消收藏"
        >
          ❌
        </button>
        <button 
          v-if="showCategoryButton" 
          class="action-btn category-btn" 
          @click.stop="$emit('edit-category', recipe)"
          title="修改分类"
        >
          📂
        </button>
        <button 
          v-if="showViewButton" 
          class="action-btn view-btn" 
          @click.stop="$emit('view-details', recipe)"
          title="查看详情"
        >
          👁️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Recipe } from '@/types/recipe'
import { 
  generateRecipeCoverSvg, 
  generateRandomRecipeCoverSvg,
  downloadSvgFile,
  PRESET_SIZES,
  type SvgConfig 
} from '@/utils/svgGenerator'

interface Props {
  recipe: Recipe
  size?: 'small' | 'medium' | 'large' | 'xl'
  clickable?: boolean
  showOverlay?: boolean
  showMeta?: boolean
  showActions?: boolean
  showDownloadButton?: boolean
  showRegenerateButton?: boolean
  showFavoriteButton?: boolean
  showCategoryButton?: boolean
  showViewButton?: boolean
  forceGenerateSvg?: boolean
  randomColor?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  clickable: true,
  showOverlay: true,
  showMeta: true,
  showActions: false,
  showDownloadButton: false,
  showRegenerateButton: false,
  showFavoriteButton: false,
  showCategoryButton: false,
  showViewButton: false,
  forceGenerateSvg: false,
  randomColor: false
})

const emit = defineEmits<{
  click: [recipe: Recipe]
  'remove-favorite': [recipe: Recipe]
  'edit-category': [recipe: Recipe]
  'view-details': [recipe: Recipe]
}>()

const imageError = ref(false)
const generatedSvg = ref('')

// 计算 SVG 配置
const svgConfig = computed((): SvgConfig => {
  const dimensions = PRESET_SIZES[props.size]
  return {
    name: props.recipe.title || props.recipe.name,
    ...dimensions,
    subtitle: '精选菜谱'
  }
})

// 生成 SVG 封面
const generateCover = () => {
  if (props.randomColor) {
    generatedSvg.value = generateRandomRecipeCoverSvg(svgConfig.value)
  } else {
    generatedSvg.value = generateRecipeCoverSvg(svgConfig.value)
  }
}

// 重新生成封面（随机颜色）
const regenerateCover = () => {
  generatedSvg.value = generateRandomRecipeCoverSvg(svgConfig.value)
}

// 下载封面
const downloadCover = () => {
  downloadSvgFile(svgConfig.value, `${props.recipe.title || props.recipe.name}-cover.svg`)
}

// 处理图片加载错误
const handleImageError = () => {
  imageError.value = true
  generateCover()
}

// 处理点击事件
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.recipe)
  }
}

// 格式化工具函数
const formatDifficulty = (difficulty: string | number): string => {
  const difficultyMap: Record<string, string> = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty.toString()] || difficulty.toString()
}

const formatCookingTime = (time: string | number): string => {
  const timeStr = time.toString()
  return timeStr.includes('分钟') ? timeStr : `${timeStr}分钟`
}

// 组件挂载时生成 SVG
onMounted(() => {
  generateCover()
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.recipe-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
  }

  .recipe-image {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;

    img, .svg-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .svg-cover {
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(svg) {
        width: 100%;
        height: 100%;
      }
    }

    .recipe-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.7) 100%
      );
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 1rem;

      .recipe-difficulty,
      .recipe-time {
        background: rgba(255, 255, 255, 0.9);
        color: #333;
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }
    }
  }

  .recipe-content {
    padding: 1rem;

    .recipe-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .recipe-description {
      font-size: 0.9rem;
      color: #7f8c8d;
      margin-bottom: 0.75rem;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .recipe-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;

      .recipe-rating {
        display: flex;
        align-items: center;
        gap: 0.25rem;

        .rating-stars {
          color: #f39c12;
        }

        .rating-value {
          font-size: 0.85rem;
          font-weight: 600;
          color: #2c3e50;
        }
      }

      .recipe-tags {
        display: flex;
        gap: 0.25rem;

        .recipe-tag {
          background: #ecf0f1;
          color: #7f8c8d;
          padding: 0.2rem 0.4rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 500;
        }
      }
    }

    .recipe-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;

      .action-btn {
        background: #ecf0f1;
        border: none;
        border-radius: 6px;
        padding: 0.4rem;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;

        &:hover {
          background: #bdc3c7;
          transform: scale(1.05);
        }

        &.download-btn:hover {
          background: #3498db;
          color: white;
        }

        &.regenerate-btn:hover {
          background: #e74c3c;
          color: white;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .recipe-card {
    .recipe-image {
      height: 150px;
    }

    .recipe-content {
      padding: 0.75rem;

      .recipe-title {
        font-size: 1rem;
      }

      .recipe-description {
        font-size: 0.85rem;
      }
    }
  }
}
</style>
