<template>
  <div class="recipe-nutrition-analysis">
    <div class="analysis-form">
      <!-- 食谱选择/输入 -->
      <div class="recipe-input-section">
        <h4 class="section-title">选择食谱进行营养分析</h4>

        <el-tabs v-model="inputMode" @tab-change="handleInputModeChange">
          <el-tab-pane label="🔍 搜索食谱" name="search">
            <div class="recipe-search">
              <el-input
                v-model="searchQuery"
                placeholder="搜索食谱名称..."
                :prefix-icon="Search"
                @input="handleSearch"
                clearable
              />

              <div v-if="searchResults.length > 0" class="search-results">
                <div
                  v-for="recipe in searchResults"
                  :key="recipe.id"
                  class="recipe-item"
                  :class="{ active: selectedRecipe?.id === recipe.id }"
                  @click="selectRecipe(recipe)"
                >
                  <div class="recipe-image">
                    <img :src="recipe.image" :alt="recipe.name" />
                  </div>
                  <div class="recipe-info">
                    <h5 class="recipe-name">{{ recipe.name }}</h5>
                    <p class="recipe-description">{{ recipe.description }}</p>
                    <div class="recipe-meta">
                      <span class="meta-item">🕐 {{ recipe.cookingTime }}分钟</span>
                      <span class="meta-item">👥 {{ recipe.servings }}人份</span>
                      <span class="meta-item">⭐ {{ recipe.difficulty }}/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="✍️ 手动输入" name="manual">
            <div class="manual-input">
              <el-form :model="manualRecipe" label-width="80px">
                <el-form-item label="食谱名称">
                  <el-input v-model="manualRecipe.name" placeholder="请输入食谱名称" />
                </el-form-item>

                <el-form-item label="食材清单">
                  <div class="ingredients-input">
                    <div
                      v-for="(ingredient, index) in manualRecipe.ingredients"
                      :key="index"
                      class="ingredient-row"
                    >
                      <el-input v-model="ingredient.name" placeholder="食材名称" style="flex: 1" />
                      <el-input
                        v-model="ingredient.amount"
                        placeholder="用量"
                        style="width: 100px"
                      />
                      <el-input v-model="ingredient.unit" placeholder="单位" style="width: 80px" />
                      <el-button
                        type="danger"
                        :icon="Delete"
                        size="small"
                        @click="removeIngredient(index)"
                      />
                    </div>
                    <el-button @click="addIngredient" :icon="Plus" type="primary">
                      添加食材
                    </el-button>
                  </div>
                </el-form-item>

                <el-form-item label="份数">
                  <el-input-number v-model="manualRecipe.servings" :min="1" :max="20" />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 分析选项 -->
      <div v-if="selectedRecipe || hasManualRecipe" class="analysis-options">
        <h4 class="section-title">分析选项</h4>

        <div class="options-grid">
          <div class="option-group">
            <div class="option-label">分析详细程度</div>
            <el-radio-group v-model="analysisLevel">
              <el-radio label="basic">基础分析</el-radio>
              <el-radio label="detailed">详细分析</el-radio>
              <el-radio label="comprehensive">全面分析</el-radio>
            </el-radio-group>
          </div>

          <div class="option-group">
            <div class="option-label">特殊需求</div>
            <el-checkbox-group v-model="specialRequirements">
              <el-checkbox label="low-sodium">低钠饮食</el-checkbox>
              <el-checkbox label="diabetic">糖尿病饮食</el-checkbox>
              <el-checkbox label="heart-healthy">心脏健康</el-checkbox>
              <el-checkbox label="weight-loss">减重饮食</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="option-group">
            <div class="option-label">年龄组</div>
            <el-select v-model="ageGroup" placeholder="选择年龄组">
              <el-option label="儿童 (2-12岁)" value="child" />
              <el-option label="青少年 (13-18岁)" value="teen" />
              <el-option label="成年人 (19-64岁)" value="adult" />
              <el-option label="老年人 (65岁以上)" value="senior" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 分析按钮 -->
      <div v-if="selectedRecipe || hasManualRecipe" class="analysis-actions">
        <el-button
          type="primary"
          size="large"
          @click="startAnalysis"
          :loading="isAnalyzing"
          :icon="Cpu"
        >
          {{ isAnalyzing ? '分析中...' : '开始营养分析' }}
        </el-button>
      </div>
    </div>

    <!-- 分析进度 -->
    <div v-if="isAnalyzing" class="analysis-progress">
      <h4 class="section-title">分析进度</h4>
      <div class="progress-steps">
        <div
          v-for="(step, index) in analysisSteps"
          :key="step.id"
          class="progress-step"
          :class="{
            active: currentStep === index,
            completed: currentStep > index,
          }"
        >
          <div class="step-icon">
            <el-icon v-if="currentStep > index" class="completed-icon">
              <Check />
            </el-icon>
            <el-icon v-else-if="currentStep === index" class="loading-icon">
              <Loading />
            </el-icon>
            <span v-else class="step-number">{{ index + 1 }}</span>
          </div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Search, Plus, Delete, Cpu, Check, Loading } from '@element-plus/icons-vue'

  // 接口定义
  interface Recipe {
    id: string
    name: string
    description: string
    image: string
    ingredients: Ingredient[]
    cookingTime: number
    servings: number
    difficulty: number
  }

  interface Ingredient {
    name: string
    amount: string
    unit: string
  }

  interface AnalysisStep {
    id: string
    title: string
    description: string
  }

  // 事件定义
  const emit = defineEmits<{
    analysisComplete: [result: any]
  }>()

  // 响应式数据
  const inputMode = ref('search')
  const searchQuery = ref('')
  const searchResults = ref<Recipe[]>([])
  const selectedRecipe = ref<Recipe | null>(null)

  const manualRecipe = ref({
    name: '',
    ingredients: [{ name: '', amount: '', unit: '' }] as Ingredient[],
    servings: 2,
  })

  const analysisLevel = ref('detailed')
  const specialRequirements = ref<string[]>([])
  const ageGroup = ref('adult')

  const isAnalyzing = ref(false)
  const currentStep = ref(0)

  // 计算属性
  const hasManualRecipe = computed(() => {
    return (
      manualRecipe.value.name.trim() !== '' &&
      manualRecipe.value.ingredients.some(ing => ing.name.trim() !== '')
    )
  })

  // 分析步骤
  const analysisSteps: AnalysisStep[] = [
    {
      id: 'parse',
      title: '解析食材',
      description: '正在分析食材成分和用量',
    },
    {
      id: 'calculate',
      title: '计算营养',
      description: '正在计算营养成分含量',
    },
    {
      id: 'evaluate',
      title: '健康评估',
      description: '正在进行健康价值评估',
    },
    {
      id: 'recommend',
      title: '生成建议',
      description: '正在生成个性化建议',
    },
  ]

  // 生命周期
  onMounted(() => {
    loadMockRecipes()
  })

  // 方法定义
  function handleInputModeChange(mode: string) {
    console.log('切换输入模式:', mode)
    selectedRecipe.value = null
  }

  function handleSearch() {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    // 模拟搜索延迟
    setTimeout(() => {
      searchResults.value = mockRecipes.value.filter(
        recipe =>
          recipe.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          recipe.description.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }, 300)
  }

  function selectRecipe(recipe: Recipe) {
    selectedRecipe.value = recipe
    console.log('选择食谱:', recipe.name)
  }

  function addIngredient() {
    manualRecipe.value.ingredients.push({ name: '', amount: '', unit: '' })
  }

  function removeIngredient(index: number) {
    if (manualRecipe.value.ingredients.length > 1) {
      manualRecipe.value.ingredients.splice(index, 1)
    }
  }

  async function startAnalysis() {
    if (!selectedRecipe.value && !hasManualRecipe.value) {
      ElMessage.warning('请先选择或输入食谱')
      return
    }

    isAnalyzing.value = true
    currentStep.value = 0

    try {
      // 模拟分析过程
      for (let i = 0; i < analysisSteps.length; i++) {
        currentStep.value = i
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      currentStep.value = analysisSteps.length

      // 生成模拟分析结果
      const result = generateAnalysisResult()

      ElMessage.success('营养分析完成！')
      emit('analysisComplete', result)
    } catch (error) {
      console.error('分析失败:', error)
      ElMessage.error('分析失败，请重试')
    } finally {
      isAnalyzing.value = false
    }
  }

  function generateAnalysisResult() {
    // 根据选择的食谱或手动输入生成分析结果
    const recipe = selectedRecipe.value || {
      name: manualRecipe.value.name,
      ingredients: manualRecipe.value.ingredients,
      servings: manualRecipe.value.servings,
    }

    // 模拟营养计算
    const baseCalories = recipe.ingredients?.length * 80 || 400

    return {
      calories: baseCalories + Math.random() * 200,
      protein: 15 + Math.random() * 25,
      carbs: 30 + Math.random() * 40,
      fat: 10 + Math.random() * 20,
      fiber: 5 + Math.random() * 15,
      sugar: 10 + Math.random() * 25,
      sodium: 200 + Math.random() * 800,
      vitamins: {
        A: Math.random() * 100,
        C: Math.random() * 100,
        D: Math.random() * 100,
        E: Math.random() * 100,
      },
      minerals: {
        calcium: Math.random() * 100,
        iron: Math.random() * 100,
        zinc: Math.random() * 100,
        magnesium: Math.random() * 100,
      },
      confidence: 0.85 + Math.random() * 0.1,
      analysisLevel: analysisLevel.value,
      specialRequirements: specialRequirements.value,
      ageGroup: ageGroup.value,
      recipeName: recipe.name,
    }
  }

  // 模拟数据
  const mockRecipes = ref<Recipe[]>([])

  function loadMockRecipes() {
    mockRecipes.value = [
      {
        id: '1',
        name: '番茄炒蛋',
        description: '经典家常菜，营养丰富，制作简单',
        image: '/api/placeholder/120/80',
        ingredients: [
          { name: '鸡蛋', amount: '3', unit: '个' },
          { name: '番茄', amount: '2', unit: '个' },
          { name: '食用油', amount: '15', unit: 'ml' },
          { name: '盐', amount: '3', unit: 'g' },
        ],
        cookingTime: 15,
        servings: 2,
        difficulty: 2,
      },
      {
        id: '2',
        name: '青椒肉丝',
        description: '爽脆青椒配嫩滑肉丝，下饭神器',
        image: '/api/placeholder/120/80',
        ingredients: [
          { name: '猪肉丝', amount: '200', unit: 'g' },
          { name: '青椒', amount: '3', unit: '个' },
          { name: '生抽', amount: '10', unit: 'ml' },
          { name: '料酒', amount: '5', unit: 'ml' },
        ],
        cookingTime: 20,
        servings: 3,
        difficulty: 3,
      },
      {
        id: '3',
        name: '蒸蛋羹',
        description: '嫩滑如豆腐的蒸蛋，适合各个年龄段',
        image: '/api/placeholder/120/80',
        ingredients: [
          { name: '鸡蛋', amount: '2', unit: '个' },
          { name: '温水', amount: '150', unit: 'ml' },
          { name: '盐', amount: '2', unit: 'g' },
          { name: '香油', amount: '几滴', unit: '' },
        ],
        cookingTime: 10,
        servings: 1,
        difficulty: 1,
      },
    ]
  }
</script>

<style scoped lang="scss">
  .recipe-nutrition-analysis {
    .section-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .analysis-form {
      .recipe-input-section {
        margin-bottom: 24px;

        .recipe-search {
          .search-results {
            margin-top: 16px;
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid var(--el-border-color);
            border-radius: 8px;

            .recipe-item {
              display: flex;
              padding: 12px;
              border-bottom: 1px solid var(--el-border-color-lighter);
              cursor: pointer;
              transition: background-color 0.2s ease;

              &:hover,
              &.active {
                background-color: var(--el-fill-color-light);
              }

              &:last-child {
                border-bottom: none;
              }

              .recipe-image {
                width: 120px;
                height: 80px;
                margin-right: 12px;
                border-radius: 6px;
                overflow: hidden;

                img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                }
              }

              .recipe-info {
                flex: 1;

                .recipe-name {
                  margin: 0 0 4px 0;
                  font-size: 16px;
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                }

                .recipe-description {
                  margin: 0 0 8px 0;
                  font-size: 14px;
                  color: var(--el-text-color-regular);
                }

                .recipe-meta {
                  display: flex;
                  gap: 12px;

                  .meta-item {
                    font-size: 12px;
                    color: var(--el-text-color-secondary);
                  }
                }
              }
            }
          }
        }

        .manual-input {
          .ingredients-input {
            .ingredient-row {
              display: flex;
              gap: 8px;
              margin-bottom: 8px;
              align-items: center;
            }
          }
        }
      }

      .analysis-options {
        margin-bottom: 24px;

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;

          .option-group {
            .option-label {
              display: block;
              margin-bottom: 8px;
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
            }
          }
        }
      }

      .analysis-actions {
        text-align: center;
      }
    }

    .analysis-progress {
      margin-top: 24px;
      padding: 20px;
      background: var(--el-fill-color-lighter);
      border-radius: 8px;

      .progress-steps {
        .progress-step {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-left: 2px solid var(--el-border-color);
          padding-left: 20px;
          position: relative;

          &.active {
            border-left-color: var(--el-color-primary);

            .step-icon {
              background: var(--el-color-primary);
              color: white;
            }
          }

          &.completed {
            border-left-color: var(--el-color-success);

            .step-icon {
              background: var(--el-color-success);
              color: white;
            }
          }

          .step-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--el-fill-color);
            border: 2px solid var(--el-border-color);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            position: absolute;
            left: -17px;

            .step-number {
              font-size: 14px;
              font-weight: 600;
            }

            .loading-icon {
              animation: spin 1s linear infinite;
            }
          }

          .step-content {
            margin-left: 32px;

            .step-title {
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 2px;
            }

            .step-description {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .options-grid {
      grid-template-columns: 1fr !important;
    }

    .recipe-item {
      .recipe-image {
        width: 80px !important;
        height: 60px !important;
      }
    }

    .ingredient-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }
  }
</style>
