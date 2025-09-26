<template>
  <div class="ingredient-nutrition-analysis">
    <div class="ingredient-input">
      <h4 class="section-title">添加食材进行营养分析</h4>

      <!-- 食材搜索和添加 -->
      <div class="ingredient-search">
        <el-input
          v-model="searchQuery"
          placeholder="搜索食材..."
          :prefix-icon="Search"
          @input="handleSearch"
          clearable
        />

        <div v-if="searchSuggestions.length > 0" class="search-suggestions">
          <div
            v-for="ingredient in searchSuggestions"
            :key="ingredient.id"
            class="suggestion-item"
            @click="addIngredient(ingredient)"
          >
            <img :src="ingredient.image" :alt="ingredient.name" class="ingredient-image" />
            <div class="ingredient-info">
              <div class="ingredient-name">{{ ingredient.name }}</div>
              <div class="ingredient-nutrition">每100g: {{ ingredient.calories }}千卡</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 已添加的食材列表 -->
      <div v-if="selectedIngredients.length > 0" class="selected-ingredients">
        <h5 class="list-title">已添加的食材</h5>
        <div class="ingredients-list">
          <div v-for="(item, index) in selectedIngredients" :key="index" class="ingredient-item">
            <img :src="item.ingredient.image" :alt="item.ingredient.name" class="item-image" />
            <div class="item-info">
              <div class="item-name">{{ item.ingredient.name }}</div>
              <div class="item-amount">
                <el-input-number
                  v-model="item.amount"
                  :min="1"
                  :max="9999"
                  size="small"
                  @change="calculateNutrition"
                />
                <span class="unit">克</span>
              </div>
            </div>
            <div class="item-nutrition">
              <div class="nutrition-value">
                {{ ((item.ingredient.calories * item.amount) / 100).toFixed(0) }}千卡
              </div>
              <div class="nutrition-label">热量</div>
            </div>
            <el-button type="danger" size="small" :icon="Delete" @click="removeIngredient(index)" />
          </div>
        </div>
      </div>

      <!-- 分析按钮 -->
      <div v-if="selectedIngredients.length > 0" class="analysis-actions">
        <el-button
          type="primary"
          size="large"
          @click="startAnalysis"
          :loading="isAnalyzing"
          :icon="Cpu"
        >
          {{ isAnalyzing ? '分析中...' : '分析营养成分' }}
        </el-button>
      </div>
    </div>

    <!-- 快速营养预览 -->
    <div v-if="selectedIngredients.length > 0" class="nutrition-preview">
      <h4 class="section-title">营养成分预览</h4>
      <div class="preview-grid">
        <div class="preview-card">
          <div class="preview-value">{{ totalNutrition.calories.toFixed(0) }}</div>
          <div class="preview-label">总热量 (千卡)</div>
        </div>
        <div class="preview-card">
          <div class="preview-value">{{ totalNutrition.protein.toFixed(1) }}</div>
          <div class="preview-label">蛋白质 (克)</div>
        </div>
        <div class="preview-card">
          <div class="preview-value">{{ totalNutrition.carbs.toFixed(1) }}</div>
          <div class="preview-label">碳水化合物 (克)</div>
        </div>
        <div class="preview-card">
          <div class="preview-value">{{ totalNutrition.fat.toFixed(1) }}</div>
          <div class="preview-label">脂肪 (克)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search, Delete, Cpu } from '@element-plus/icons-vue'

  // 接口定义
  interface IngredientInfo {
    id: string
    name: string
    image: string
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    category: string
  }

  interface SelectedIngredient {
    ingredient: IngredientInfo
    amount: number
  }

  // 事件定义
  const emit = defineEmits<{
    analysisComplete: [result: any]
  }>()

  // 响应式数据
  const searchQuery = ref('')
  const searchSuggestions = ref<IngredientInfo[]>([])
  const selectedIngredients = ref<SelectedIngredient[]>([])
  const isAnalyzing = ref(false)

  // 计算属性
  const totalNutrition = computed(() => {
    return selectedIngredients.value.reduce(
      (total, item) => {
        const factor = item.amount / 100
        return {
          calories: total.calories + item.ingredient.calories * factor,
          protein: total.protein + item.ingredient.protein * factor,
          carbs: total.carbs + item.ingredient.carbs * factor,
          fat: total.fat + item.ingredient.fat * factor,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  })

  // 监听器
  watch(
    selectedIngredients,
    () => {
      calculateNutrition()
    },
    { deep: true }
  )

  // 方法定义
  function handleSearch() {
    if (!searchQuery.value.trim()) {
      searchSuggestions.value = []
      return
    }

    // 模拟搜索延迟
    setTimeout(() => {
      searchSuggestions.value = mockIngredients
        .filter(ingredient =>
          ingredient.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .slice(0, 5)
    }, 300)
  }

  function addIngredient(ingredient: IngredientInfo) {
    // 检查是否已添加
    const exists = selectedIngredients.value.find(item => item.ingredient.id === ingredient.id)
    if (exists) {
      ElMessage.warning('该食材已添加')
      return
    }

    selectedIngredients.value.push({
      ingredient,
      amount: 100,
    })

    searchQuery.value = ''
    searchSuggestions.value = []

    ElMessage.success(`已添加 ${ingredient.name}`)
  }

  function removeIngredient(index: number) {
    selectedIngredients.value.splice(index, 1)
    ElMessage.success('已移除食材')
  }

  function calculateNutrition() {
    // 实时计算营养成分
  }

  async function startAnalysis() {
    if (selectedIngredients.value.length === 0) {
      ElMessage.warning('请先添加食材')
      return
    }

    isAnalyzing.value = true

    try {
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 生成详细分析结果
      const result = {
        ...totalNutrition.value,
        fiber: selectedIngredients.value.reduce((total, item) => {
          return total + (item.ingredient.fiber * item.amount) / 100
        }, 0),
        sugar: Math.random() * 20,
        sodium: Math.random() * 500,
        vitamins: generateVitaminData(),
        minerals: generateMineralData(),
        confidence: 0.92,
        ingredientCount: selectedIngredients.value.length,
        totalWeight: selectedIngredients.value.reduce((total, item) => total + item.amount, 0),
      }

      ElMessage.success('食材营养分析完成！')
      emit('analysisComplete', result)
    } catch (error) {
      console.error('分析失败:', error)
      ElMessage.error('分析失败，请重试')
    } finally {
      isAnalyzing.value = false
    }
  }

  function generateVitaminData() {
    return {
      A: Math.random() * 100,
      C: Math.random() * 100,
      D: Math.random() * 100,
      E: Math.random() * 100,
      K: Math.random() * 100,
      B1: Math.random() * 100,
      B2: Math.random() * 100,
      B6: Math.random() * 100,
      B12: Math.random() * 100,
      folate: Math.random() * 100,
    }
  }

  function generateMineralData() {
    return {
      calcium: Math.random() * 100,
      iron: Math.random() * 100,
      zinc: Math.random() * 100,
      magnesium: Math.random() * 100,
      potassium: Math.random() * 100,
      phosphorus: Math.random() * 100,
    }
  }

  // 模拟食材数据
  const mockIngredients: IngredientInfo[] = [
    {
      id: '1',
      name: '鸡蛋',
      image: '/api/placeholder/40/40',
      calories: 155,
      protein: 13.3,
      carbs: 1.1,
      fat: 11.1,
      fiber: 0,
      category: '蛋类',
    },
    {
      id: '2',
      name: '番茄',
      image: '/api/placeholder/40/40',
      calories: 19,
      protein: 0.9,
      carbs: 4.0,
      fat: 0.2,
      fiber: 1.2,
      category: '蔬菜',
    },
    {
      id: '3',
      name: '牛肉',
      image: '/api/placeholder/40/40',
      calories: 250,
      protein: 26.1,
      carbs: 0,
      fat: 15.0,
      fiber: 0,
      category: '肉类',
    },
    {
      id: '4',
      name: '大米',
      image: '/api/placeholder/40/40',
      calories: 130,
      protein: 2.7,
      carbs: 28.0,
      fat: 0.3,
      fiber: 0.4,
      category: '谷物',
    },
    {
      id: '5',
      name: '西兰花',
      image: '/api/placeholder/40/40',
      calories: 34,
      protein: 2.8,
      carbs: 7.0,
      fat: 0.4,
      fiber: 2.6,
      category: '蔬菜',
    },
    {
      id: '6',
      name: '鸡胸肉',
      image: '/api/placeholder/40/40',
      calories: 165,
      protein: 31.0,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      category: '肉类',
    },
    {
      id: '7',
      name: '苹果',
      image: '/api/placeholder/40/40',
      calories: 52,
      protein: 0.3,
      carbs: 14.0,
      fat: 0.2,
      fiber: 2.4,
      category: '水果',
    },
    {
      id: '8',
      name: '胡萝卜',
      image: '/api/placeholder/40/40',
      calories: 41,
      protein: 0.9,
      carbs: 10.0,
      fat: 0.2,
      fiber: 2.8,
      category: '蔬菜',
    },
  ]
</script>

<style scoped lang="scss">
  .ingredient-nutrition-analysis {
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .ingredient-input {
      margin-bottom: 24px;

      .ingredient-search {
        position: relative;
        margin-bottom: 20px;

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--el-bg-color);
          border: 1px solid var(--el-border-color);
          border-top: none;
          border-radius: 0 0 6px 6px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

          .suggestion-item {
            display: flex;
            align-items: center;
            padding: 12px;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background-color: var(--el-fill-color-light);
            }

            .ingredient-image {
              width: 40px;
              height: 40px;
              border-radius: 6px;
              margin-right: 12px;
              object-fit: cover;
            }

            .ingredient-info {
              flex: 1;

              .ingredient-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                margin-bottom: 2px;
              }

              .ingredient-nutrition {
                font-size: 12px;
                color: var(--el-text-color-secondary);
              }
            }
          }
        }
      }

      .selected-ingredients {
        .list-title {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .ingredients-list {
          .ingredient-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: var(--el-fill-color-lighter);
            border-radius: 8px;
            margin-bottom: 8px;

            .item-image {
              width: 48px;
              height: 48px;
              border-radius: 6px;
              margin-right: 12px;
              object-fit: cover;
            }

            .item-info {
              flex: 1;

              .item-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--el-text-color-primary);
                margin-bottom: 4px;
              }

              .item-amount {
                display: flex;
                align-items: center;
                gap: 8px;

                .unit {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                }
              }
            }

            .item-nutrition {
              text-align: center;
              margin-right: 12px;

              .nutrition-value {
                font-size: 16px;
                font-weight: 600;
                color: var(--el-color-primary);
              }

              .nutrition-label {
                font-size: 12px;
                color: var(--el-text-color-secondary);
              }
            }
          }
        }
      }

      .analysis-actions {
        text-align: center;
        margin-top: 20px;
      }
    }

    .nutrition-preview {
      background: var(--el-fill-color-lighter);
      padding: 20px;
      border-radius: 8px;

      .preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 16px;

        .preview-card {
          text-align: center;
          padding: 16px;
          background: var(--el-bg-color);
          border-radius: 8px;
          border: 1px solid var(--el-border-color-lighter);

          .preview-value {
            font-size: 24px;
            font-weight: 700;
            color: var(--el-color-primary);
            margin-bottom: 4px;
          }

          .preview-label {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .ingredient-item {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 12px;

      .item-info {
        order: -1;
      }

      .item-nutrition {
        text-align: left !important;
        margin-right: 0 !important;
      }
    }

    .preview-grid {
      grid-template-columns: repeat(2, 1fr) !important;
    }
  }
</style>
