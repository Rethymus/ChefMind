<template>
  <div class="recipe-print-preview">
    <div class="preview-header">
      <h3 class="preview-title">打印预览</h3>
      <div class="preview-actions">
        <button class="preview-action" @click="print">
          <span class="action-icon">🖨️</span>
          打印
        </button>
        <button class="preview-action" @click="downloadPDF">
          <span class="action-icon">📄</span>
          保存为PDF
        </button>
      </div>
    </div>

    <div class="preview-content">
      <div class="preview-frame" ref="previewFrame">
        <div class="print-recipe">
          <!-- 食谱标题 -->
          <div class="print-header">
            <h1 class="print-title">{{ recipe.name }}</h1>
            <div class="print-rating">
              <span v-for="i in 5" :key="i" :class="['print-star', { filled: i <= recipe.rating }]"
                >★</span
              >
              <span class="print-rating-text">({{ recipe.rating }}/5)</span>
            </div>
          </div>

          <!-- 食谱描述 -->
          <p class="print-description">{{ recipe.description }}</p>

          <!-- 食谱基本信息 -->
          <div class="print-info">
            <div class="print-info-item">
              <div class="print-info-icon">⏱️</div>
              <div class="print-info-content">
                <div class="print-info-label">烹饪时间</div>
                <div class="print-info-value">{{ recipe.cookingTime }}</div>
              </div>
            </div>

            <div class="print-info-item">
              <div class="print-info-icon">📊</div>
              <div class="print-info-content">
                <div class="print-info-label">难度</div>
                <div class="print-info-value">{{ recipe.difficulty }}</div>
              </div>
            </div>

            <div class="print-info-item">
              <div class="print-info-icon">🍽️</div>
              <div class="print-info-content">
                <div class="print-info-label">份量</div>
                <div class="print-info-value">{{ recipe.servings || '2人份' }}</div>
              </div>
            </div>
          </div>

          <div class="print-main">
            <!-- 食材列表 -->
            <div class="print-section">
              <h2 class="print-section-title">
                <span class="print-section-icon">🥕</span>
                食材
              </h2>
              <ul class="print-ingredients">
                <li
                  v-for="(ingredient, index) in recipe.ingredients"
                  :key="index"
                  class="print-ingredient"
                >
                  {{ ingredient }}
                </li>
              </ul>
            </div>

            <!-- 烹饪步骤 -->
            <div class="print-section">
              <h2 class="print-section-title">
                <span class="print-section-icon">👨‍🍳</span>
                烹饪步骤
              </h2>
              <ol class="print-steps">
                <li v-for="(step, index) in recipe.steps" :key="index" class="print-step">
                  {{ step }}
                </li>
              </ol>
            </div>

            <!-- 烹饪小贴士 -->
            <div v-if="recipe.tips" class="print-section">
              <h2 class="print-section-title">
                <span class="print-section-icon">💡</span>
                小贴士
              </h2>
              <div class="print-tips">
                {{ recipe.tips }}
              </div>
            </div>

            <!-- 营养信息 -->
            <div v-if="recipe.nutritionInfo" class="print-section">
              <h2 class="print-section-title">
                <span class="print-section-icon">📊</span>
                营养信息
              </h2>
              <div class="print-nutrition">
                <div class="print-nutrition-item">
                  <div class="print-nutrition-label">热量</div>
                  <div class="print-nutrition-value">{{ recipe.nutritionInfo.calories }} kcal</div>
                </div>

                <div class="print-nutrition-item">
                  <div class="print-nutrition-label">蛋白质</div>
                  <div class="print-nutrition-value">{{ recipe.nutritionInfo.protein }} g</div>
                </div>

                <div class="print-nutrition-item">
                  <div class="print-nutrition-label">碳水</div>
                  <div class="print-nutrition-value">{{ recipe.nutritionInfo.carbs }} g</div>
                </div>

                <div class="print-nutrition-item">
                  <div class="print-nutrition-label">脂肪</div>
                  <div class="print-nutrition-value">{{ recipe.nutritionInfo.fat }} g</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 页脚 -->
          <div class="print-footer">
            <div class="print-logo">ChefMind 智食谱</div>
            <div class="print-date">打印日期: {{ formatDate(new Date()) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Recipe } from '@/services/recipeService'
  import html2pdf from 'html2pdf.js'

  // 定义属性
  const props = defineProps<{
    recipe: Recipe
  }>()

  // 定义事件
  const emit = defineEmits<{
    (_e: 'notification', _notification: { type: string; title: string; message: string }): void
  }>()

  // 引用
  const previewFrame = ref<HTMLElement | null>(null)

  // 打印
  const print = () => {
    window.print()
  }

  // 下载PDF
  const downloadPDF = async () => {
    if (!previewFrame.value) return

    try {
      const opt = {
        margin: [10, 10] as [number, number],
        filename: `${props.recipe.name}-ChefMind.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      }

      await html2pdf().from(previewFrame.value).set(opt).save()

      emit('notification', {
        type: 'success',
        title: '成功',
        message: 'PDF已保存',
      })
    } catch (error) {
      console.error('生成PDF失败:', error)
      emit('notification', {
        type: 'error',
        title: '错误',
        message: '生成PDF失败，请重试',
      })
    }
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }
</script>

<style lang="scss" scoped>
  .recipe-print-preview {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .preview-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0;
  }

  .preview-actions {
    display: flex;
    gap: 1rem;
  }

  .preview-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .action-icon {
    font-size: 1.2rem;
  }

  .preview-content {
    background-color: var(--bg-color);
    border-radius: 8px;
    padding: 1rem;
    overflow: auto;
    max-height: 600px;
  }

  .preview-frame {
    background-color: white;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 210mm;
    margin: 0 auto;
  }

  /* 打印样式 */
  .print-recipe {
    font-family:
      'Noto Sans', 'DejaVu Sans', 'WenQuanYi Micro Hei', 'Droid Sans Fallback', 'Arial', sans-serif;
    color: #333;
    line-height: 1.5;
  }

  .print-header {
    margin-bottom: 1.5rem;
  }

  .print-title {
    font-size: 24pt;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .print-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .print-star {
    color: #ddd;
    font-size: 1.2rem;

    &.filled {
      color: #f8c537;
    }
  }

  .print-rating-text {
    font-size: 0.9rem;
    color: #777;
    margin-left: 0.5rem;
  }

  .print-description {
    font-size: 12pt;
    margin-bottom: 1.5rem;
  }

  .print-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    border: 1px solid #eee;
    padding: 1rem;
  }

  .print-info-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .print-info-icon {
    font-size: 1.5rem;
  }

  .print-info-label {
    font-size: 0.8rem;
    color: #777;
    margin-bottom: 0.2rem;
  }

  .print-info-value {
    font-size: 1rem;
    font-weight: 600;
  }

  .print-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .print-section {
    margin-bottom: 1.5rem;
  }

  .print-section-title {
    font-size: 16pt;
    font-weight: 600;
    margin: 0 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .print-section-icon {
    font-size: 1.2rem;
  }

  .print-ingredients {
    list-style-type: none;
    padding: 0;
    margin: 0;
    columns: 2;
  }

  .print-ingredient {
    padding: 0.5rem 0;
    break-inside: avoid;
  }

  .print-steps {
    padding-left: 1.5rem;
  }

  .print-step {
    margin-bottom: 0.8rem;
  }

  .print-tips {
    background-color: #f9f9f9;
    padding: 1rem;
    border-left: 3px solid #f8c537;
  }

  .print-nutrition {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .print-nutrition-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px dotted #eee;
  }

  .print-nutrition-label {
    font-weight: 500;
  }

  .print-footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #777;
  }

  @media (max-width: 768px) {
    .preview-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .preview-actions {
      width: 100%;
      flex-direction: column;
    }

    .preview-content {
      padding: 0.5rem;
    }

    .preview-frame {
      padding: 1rem;
    }

    .print-info {
      flex-direction: column;
      gap: 1rem;
    }

    .print-ingredients {
      columns: 1;
    }

    .print-nutrition {
      grid-template-columns: 1fr;
    }
  }
</style>
