<template>
  <div class="ai-view">
    <!-- API 密钥提醒 -->
    <APIKeyReminder ref="apiKeyReminder" />

    <!-- 页面头部 -->
    <div class="ai-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <el-icon class="title-icon"><Setting /></el-icon>
            ChefMind AI 智能助手
          </h1>
          <p class="page-subtitle">选择食材和烹饪条件，让 AI 为您生成专属食谱</p>
        </div>

        <div class="ai-stats">
          <div class="stat-card">
            <div class="stat-number">{{ aiStats.recipesGenerated }}</div>
            <div class="stat-label">生成食谱</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ aiStats.totalAnalyses }}</div>
            <div class="stat-label">AI 分析次数</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要的食谱生成区域 -->
    <div class="recipe-generator-section">
      <el-card class="generator-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h2>🍳 AI 智能生成食谱</h2>
            <p>选择食材、厨具和烹饪方式，让 AI 为您创造美味食谱</p>
          </div>
        </template>

        <div class="generator-form">
          <!-- 食材选择 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><Apple /></el-icon>
              选择食材
            </h3>

            <!-- 常用食材快速选择 -->
            <div class="ingredient-quick-select">
              <div class="ingredient-buttons">
                <el-button
                  v-for="ingredient in commonIngredients"
                  :key="ingredient"
                  :type="selectedIngredients.includes(ingredient) ? 'primary' : 'default'"
                  size="small"
                  @click="toggleIngredient(ingredient)"
                  class="ingredient-btn"
                >
                  {{ ingredient }}
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  @click="showMoreIngredients = true"
                  class="more-btn"
                >
                  更多食材...
                </el-button>
              </div>
            </div>

            <!-- 自定义输入食材 -->
            <div class="custom-ingredient-input">
              <el-input
                v-model="customIngredient"
                placeholder="输入自定义食材（AI会验证是否可食用）"
                size="large"
                @keyup.enter="addCustomIngredient"
                class="custom-input"
              >
                <template #append>
                  <el-button
                    @click="addCustomIngredient"
                    :loading="isValidatingIngredient"
                    type="primary"
                  >
                    <el-icon v-if="!isValidatingIngredient"><Plus /></el-icon>
                    <span v-if="!isValidatingIngredient">添加</span>
                    <span v-else>验证中...</span>
                  </el-button>
                </template>
              </el-input>
            </div>

            <!-- 已选择的食材 -->
            <div class="selected-ingredients" v-if="selectedIngredients.length > 0">
              <span class="label">已选择：</span>
              <el-tag
                v-for="ingredient in selectedIngredients"
                :key="ingredient"
                closable
                @close="removeIngredient(ingredient)"
                class="ingredient-tag"
              >
                {{ ingredient }}
              </el-tag>
            </div>

            <!-- 自动补充食材选项 -->
            <div class="auto-complete-option">
              <el-checkbox v-model="autoCompleteIngredients">
                <div class="auto-complete-label">
                  <span>自动补充食材</span>
                  <el-tooltip
                    content="AI 将自动添加必要的调料和辅料，生成更完善的食谱"
                    placement="top"
                  >
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
              </el-checkbox>
            </div>
          </div>

          <!-- 更多食材弹窗 -->
          <el-dialog
            v-model="showMoreIngredients"
            title="选择更多食材"
            width="600px"
            :show-close="true"
            class="ingredient-dialog"
          >
            <div class="ingredient-categories">
              <div v-if="activeIngredientTab === 'vegetables'" class="ingredient-category">
                <div class="ingredient-grid">
                  <el-button
                    v-for="ingredient in vegetableIngredients"
                    :key="ingredient"
                    :type="selectedIngredients.includes(ingredient) ? 'primary' : 'default'"
                    size="small"
                    @click="toggleIngredient(ingredient)"
                    class="ingredient-grid-btn"
                  >
                    {{ ingredient }}
                  </el-button>
                </div>
              </div>

              <div v-if="activeIngredientTab === 'meat'" class="ingredient-category">
                <div class="ingredient-grid">
                  <el-button
                    v-for="ingredient in meatIngredients"
                    :key="ingredient"
                    :type="selectedIngredients.includes(ingredient) ? 'primary' : 'default'"
                    size="small"
                    @click="toggleIngredient(ingredient)"
                    class="ingredient-grid-btn"
                  >
                    {{ ingredient }}
                  </el-button>
                </div>
              </div>

              <div v-if="activeIngredientTab === 'staple'" class="ingredient-category">
                <div class="ingredient-grid">
                  <el-button
                    v-for="ingredient in stapleIngredients"
                    :key="ingredient"
                    :type="selectedIngredients.includes(ingredient) ? 'primary' : 'default'"
                    size="small"
                    @click="toggleIngredient(ingredient)"
                    class="ingredient-grid-btn"
                  >
                    {{ ingredient }}
                  </el-button>
                </div>
              </div>

              <div v-if="activeIngredientTab === 'seasoning'" class="ingredient-category">
                <div class="ingredient-grid">
                  <el-button
                    v-for="ingredient in seasoningIngredients"
                    :key="ingredient"
                    :type="selectedIngredients.includes(ingredient) ? 'primary' : 'default'"
                    size="small"
                    @click="toggleIngredient(ingredient)"
                    class="ingredient-grid-btn"
                  >
                    {{ ingredient }}
                  </el-button>
                </div>
              </div>

              <div class="ingredient-tabs">
                <el-button-group>
                  <el-button
                    :type="activeIngredientTab === 'vegetables' ? 'primary' : 'default'"
                    @click="activeIngredientTab = 'vegetables'"
                  >
                    蔬菜类
                  </el-button>
                  <el-button
                    :type="activeIngredientTab === 'meat' ? 'primary' : 'default'"
                    @click="activeIngredientTab = 'meat'"
                  >
                    肉类
                  </el-button>
                  <el-button
                    :type="activeIngredientTab === 'staple' ? 'primary' : 'default'"
                    @click="activeIngredientTab = 'staple'"
                  >
                    主食类
                  </el-button>
                  <el-button
                    :type="activeIngredientTab === 'seasoning' ? 'primary' : 'default'"
                    @click="activeIngredientTab = 'seasoning'"
                  >
                    调料
                  </el-button>
                </el-button-group>
              </div>
            </div>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="showMoreIngredients = false">关闭</el-button>
                <el-button type="primary" @click="showMoreIngredients = false">
                  确定（已选择 {{ selectedIngredients.length }} 种食材）
                </el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 增强版烹饪方式选择 -->
          <div class="form-section">
            <!-- EnhancedCookingMethodSelection component removed -->
          </div>

          <!-- 厨具选择 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><Tools /></el-icon>
              厨具选择
            </h3>
            <el-checkbox-group v-model="selectedKitchenware" class="kitchenware-group">
              <el-checkbox label="炒锅">炒锅</el-checkbox>
              <el-checkbox label="蒸锅">蒸锅</el-checkbox>
              <el-checkbox label="电饭煲">电饭煲</el-checkbox>
              <el-checkbox label="烤箱">烤箱</el-checkbox>
              <el-checkbox label="微波炉">微波炉</el-checkbox>
              <el-checkbox label="平底锅">平底锅</el-checkbox>
              <el-checkbox label="砂锅">砂锅</el-checkbox>
              <el-checkbox label="高压锅">高压锅</el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 其他条件 -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="servings-input">
                <el-icon><User /></el-icon>
                用餐人数
              </label>
              <el-input-number
                id="servings-input"
                v-model="servings"
                :min="1"
                :max="10"
                size="large"
                controls-position="right"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="cooking-time-select">
                <el-icon><Clock /></el-icon>
                制作时间
              </label>
              <el-select
                id="cooking-time-select"
                v-model="cookingTime"
                placeholder="选择制作时间"
                size="large"
              >
                <el-option label="15分钟内" value="15分钟内" />
                <el-option label="30分钟内" value="30分钟内" />
                <el-option label="1小时内" value="1小时内" />
                <el-option label="不限时间" value="不限时间" />
              </el-select>
            </div>

            <div class="form-group">
              <label class="form-label" for="difficulty-select">
                <el-icon><Star /></el-icon>
                难度等级
              </label>
              <el-select
                id="difficulty-select"
                v-model="difficulty"
                placeholder="选择难度"
                size="large"
              >
                <el-option label="简单" value="简单" />
                <el-option label="中等" value="中等" />
                <el-option label="困难" value="困难" />
                <el-option label="不限" value="不限" />
              </el-select>
            </div>
          </div>

          <!-- 饮食偏好和限制 -->
          <div class="form-section">
            <h3 class="section-title">
              <el-icon><Opportunity /></el-icon>
              饮食偏好和限制
            </h3>

            <!-- 主要饮食限制 -->
            <div class="dietary-restrictions">
              <h4 class="subsection-title">饮食限制</h4>
              <el-checkbox-group v-model="dietaryRestrictions" class="restriction-group">
                <el-checkbox label="素食主义">素食主义</el-checkbox>
                <el-checkbox label="纯素食">纯素食</el-checkbox>
                <el-checkbox label="无麸质">无麸质</el-checkbox>
                <el-checkbox label="无乳糖">无乳糖</el-checkbox>
                <el-checkbox label="低钠">低钠</el-checkbox>
                <el-checkbox label="低糖">低糖</el-checkbox>
                <el-checkbox label="低脂">低脂</el-checkbox>
                <el-checkbox label="高蛋白">高蛋白</el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 食物过敏和厌恶 -->
            <div class="food-preferences">
              <h4 class="subsection-title">食物过敏和厌恶</h4>

              <!-- 常见过敏原 -->
              <div class="allergen-section">
                <h5>常见过敏原</h5>
                <el-checkbox-group v-model="allergies" class="allergen-group">
                  <el-checkbox label="花生">花生</el-checkbox>
                  <el-checkbox label="坚果">坚果</el-checkbox>
                  <el-checkbox label="海鲜">海鲜</el-checkbox>
                  <el-checkbox label="鸡蛋">鸡蛋</el-checkbox>
                  <el-checkbox label="牛奶">牛奶</el-checkbox>
                  <el-checkbox label="大豆">大豆</el-checkbox>
                  <el-checkbox label="小麦">小麦</el-checkbox>
                  <el-checkbox label="芝麻">芝麻</el-checkbox>
                </el-checkbox-group>
              </div>

              <!-- 味道偏好 -->
              <div class="flavor-preferences">
                <h5>味道偏好</h5>
                <div class="flavor-options">
                  <div class="flavor-item">
                    <span class="flavor-label">辣度：</span>
                    <el-radio-group v-model="spiceLevel" class="spice-options">
                      <el-radio label="none">不吃辣</el-radio>
                      <el-radio label="mild">微辣</el-radio>
                      <el-radio label="medium">中辣</el-radio>
                      <el-radio label="hot">重辣</el-radio>
                    </el-radio-group>
                  </div>

                  <div class="flavor-item">
                    <span class="flavor-label">甜度：</span>
                    <el-radio-group v-model="sweetnessLevel" class="sweetness-options">
                      <el-radio label="none">不甜</el-radio>
                      <el-radio label="low">微甜</el-radio>
                      <el-radio label="medium">适中</el-radio>
                      <el-radio label="high">很甜</el-radio>
                    </el-radio-group>
                  </div>
                </div>
              </div>

              <!-- 不喜欢的食材 -->
              <div class="disliked-ingredients">
                <h5>不喜欢的食材</h5>
                <div class="disliked-input">
                  <el-input
                    v-model="customDislikedIngredient"
                    placeholder="输入不喜欢的食材，如香菜、洋葱等"
                    size="small"
                    @keyup.enter="addDislikedIngredient"
                  >
                    <template #append>
                      <el-button @click="addDislikedIngredient" size="small">
                        <el-icon><Plus /></el-icon>
                        添加
                      </el-button>
                    </template>
                  </el-input>
                </div>
                <div v-if="dislikedIngredients.length > 0" class="disliked-tags">
                  <el-tag
                    v-for="ingredient in dislikedIngredients"
                    :key="ingredient"
                    closable
                    @close="removeDislikedIngredient(ingredient)"
                    type="danger"
                    class="disliked-tag"
                  >
                    {{ ingredient }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="generate-section">
            <el-button
              type="primary"
              size="large"
              :loading="isGenerating"
              @click="generateRecipe"
              :disabled="selectedIngredients.length === 0"
              class="generate-btn"
            >
              <el-icon v-if="!isGenerating"><MagicStick /></el-icon>
              <span v-if="!isGenerating">🎯 生成专属食谱</span>
              <span v-else>AI正在思考中...</span>
            </el-button>
            <p class="generate-tip">💡 提示：选择的食材越多，生成的食谱越丰富</p>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 生成的食谱显示 -->
    <div v-if="generatedRecipe" class="generated-recipe-section">
      <el-card class="recipe-card" shadow="hover">
        <div class="recipe-header">
          <div class="recipe-title-section">
            <h2 class="recipe-title">{{ generatedRecipe.title || generatedRecipe.name }}</h2>
            <div class="recipe-meta">
              <el-tag type="info" size="large">{{ generatedRecipe.difficulty }}</el-tag>
              <el-tag type="warning" size="large">{{ generatedRecipe.cookingTime }}</el-tag>
              <el-tag type="success" size="large">{{ generatedRecipe.servings }}人份</el-tag>
              <el-rate v-model="recipeRating" disabled show-score />
            </div>
          </div>
          <div class="recipe-image-container">
            <div v-if="generatedRecipe.image" class="recipe-image">
              <img
                :src="generatedRecipe.image"
                :alt="generatedRecipe.title || generatedRecipe.name"
              />
            </div>
            <div
              v-else
              class="recipe-svg-cover"
              v-html="
                generateRecipeSvg(generatedRecipe.title || generatedRecipe.name || '土豆煎蛋卷')
              "
            ></div>
          </div>
        </div>

        <p class="recipe-description">{{ generatedRecipe.description }}</p>

        <div class="recipe-content">
          <!-- 食材清单 -->
          <div class="content-section ingredients-section">
            <h3 class="section-title">
              <el-icon><ShoppingBag /></el-icon>
              所需食材
            </h3>
            <div class="ingredients-grid">
              <div
                v-for="ingredient in generatedRecipe.ingredients"
                :key="typeof ingredient === 'string' ? ingredient : ingredient.name"
                class="ingredient-item"
                :class="{ 'auto-completed': isAutoCompletedIngredient(ingredient) }"
              >
                <el-icon class="ingredient-icon"><Apple /></el-icon>
                <span>{{
                  typeof ingredient === 'string'
                    ? ingredient
                    : `${ingredient.name} ${ingredient.amount || ''} ${ingredient.unit || ''}`
                }}</span>
                <el-tag
                  v-if="isAutoCompletedIngredient(ingredient)"
                  size="small"
                  type="info"
                  class="auto-completed-tag"
                  >AI补充</el-tag
                >
              </div>
            </div>
          </div>

          <!-- 制作步骤 -->
          <div class="content-section steps-section">
            <h3 class="section-title">
              <el-icon><List /></el-icon>
              制作步骤
            </h3>
            <div class="steps-list">
              <div
                v-for="(step, index) in generatedRecipe.instructions || generatedRecipe.steps"
                :key="index"
                class="step-item"
              >
                <div class="step-number">{{ index + 1 }}</div>
                <div class="step-content">{{ step }}</div>
              </div>
            </div>
          </div>

          <!-- 营养信息 -->
          <div class="content-section nutrition-section" v-if="generatedRecipe.nutrition">
            <h3 class="section-title">
              <el-icon><DataAnalysis /></el-icon>
              营养信息（每人份）
            </h3>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <div class="nutrition-label">热量</div>
                <div class="nutrition-value">{{ generatedRecipe.nutrition.calories }} 卡</div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-label">蛋白质</div>
                <div class="nutrition-value">{{ generatedRecipe.nutrition.protein }}g</div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-label">碳水化合物</div>
                <div class="nutrition-value">
                  {{ generatedRecipe.nutrition.carbs || generatedRecipe.nutrition.carbohydrates }}g
                </div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-label">脂肪</div>
                <div class="nutrition-value">{{ generatedRecipe.nutrition.fat }}g</div>
              </div>
            </div>
          </div>

          <!-- 烹饪小贴士 -->
          <div class="content-section tips-section" v-if="generatedRecipe.cookingTips">
            <h3 class="section-title">
              <el-icon><Opportunity /></el-icon>
              烹饪小贴士
            </h3>
            <ul class="tips-list">
              <li v-for="tip in generatedRecipe.cookingTips" :key="tip" class="tip-item">
                <el-icon class="tip-icon"><Check /></el-icon>
                {{ tip }}
              </li>
            </ul>
          </div>

          <!-- 标签 -->
          <div class="content-section tags-section" v-if="generatedRecipe.tags">
            <h3 class="section-title">
              <el-icon><PriceTag /></el-icon>
              标签
            </h3>
            <div class="tags-container">
              <el-tag v-for="tag in generatedRecipe.tags" :key="tag" class="recipe-tag" type="info">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="recipe-actions">
          <div class="favorite-section">
            <el-button
              :type="isFavorited ? 'danger' : 'success'"
              size="large"
              @click="toggleFavorite"
              :loading="favoriteLoading"
              class="favorite-btn"
            >
              <el-icon>
                <Collection v-if="!isFavorited" />
                <Star v-else />
              </el-icon>
              {{ isFavorited ? '取消收藏' : '收藏食谱' }}
            </el-button>
            <!-- 收藏状态指示器 -->
            <div v-if="isFavorited" class="favorite-indicator">
              <el-icon class="favorite-icon"><Star /></el-icon>
              <span class="favorite-text">已收藏</span>
            </div>
          </div>
          <el-button type="info" size="large" @click="shareRecipe">
            <el-icon><Share /></el-icon>
            分享食谱
          </el-button>
          <el-button type="primary" size="large" @click="addToShoppingList">
            <el-icon><ShoppingCart /></el-icon>
            加购食材
          </el-button>
          <el-button size="large" @click="generateAnother">
            <el-icon><Refresh /></el-icon>
            再生成一个
          </el-button>
          <el-button type="warning" size="large" @click="startCooking">
            <el-icon><Timer /></el-icon>
            开始烹饪
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 历史记录 -->
    <div class="history-section" v-if="recipeHistory.length > 0">
      <el-card class="history-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>
              <el-icon><Clock /></el-icon>
              最近生成的食谱
            </h3>
            <el-button size="small" link @click="clearHistory"> 清空历史 </el-button>
          </div>
        </template>

        <div class="history-list">
          <div
            v-for="(recipe, index) in recipeHistory.slice(0, 5)"
            :key="index"
            class="history-item"
            @click="loadHistoryRecipe(recipe)"
          >
            <div
              class="history-svg-cover"
              v-html="generateRecipeSvg(recipe.title || recipe.name || '历史菜谱')"
            ></div>
            <div class="history-info">
              <div class="history-title">{{ recipe.title || recipe.name }}</div>
              <div class="history-meta">
                <span>{{ formatDifficulty(recipe.difficulty) }}</span> ·
                <span>{{ formatCookingTime(recipe.cookingTime) }}</span> ·
                <span>{{ formatTime(recipe.createdAt) }}</span>
              </div>
            </div>
            <el-icon class="history-arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { formatDifficulty, formatCookingTime } from '@/utils/formatUtils'
  import { shoppingListService } from '@/services/shoppingListService'
  import { useRecipeStore } from '@/stores/recipe'
  import {
    Setting,
    Apple,
    Tools,
    User,
    Clock,
    Star,
    MagicStick,
    ShoppingBag,
    List,
    DataAnalysis,
    Opportunity,
    Check,
    PriceTag,
    Collection,
    Share,
    Refresh,
    Timer,
    ArrowRight,
    Plus,
    InfoFilled,
    ShoppingCart,
  } from '@element-plus/icons-vue'
  import { aiService } from '@/services/aiService'
  // import type { CookingMethod } from '@/types/recipe' // 暂时未使用
  import APIKeyReminder from '@/components/common/APIKeyReminder.vue'
  import { generateRecipeCardSvg } from '@/utils/svgGenerator'

  // 初始化路由和store
  const router = useRouter()
  const recipeStore = useRecipeStore()
  const apiKeyReminder = ref()

  // 响应式数据
  const selectedIngredients = ref<string[]>([])
  // const selectedCookingMethods = ref<string[]>([]) // 已移除烹饪方式选择
  // const cookingMethodNoRestriction = ref(false) // 已移除烹饪方式选择
  const selectedKitchenware = ref<string[]>([])
  const servings = ref(4)
  const cookingTime = ref('')
  const difficulty = ref('')
  const dietaryRestrictions = ref<string[]>([])
  const healthGoals = ref<string[]>([])
  const allergies = ref<string[]>([])
  const flavorPreferences = ref<string[]>([])
  const spiceLevel = ref('medium')
  const sweetnessLevel = ref('medium')
  const customDislikedIngredient = ref('')
  const dislikedIngredients = ref<string[]>([])
  const isGenerating = ref(false)
  const generatedRecipe = ref<any>(null)
  const recipeRating = ref(4.5)
  const showMoreIngredients = ref(false)
  const activeIngredientTab = ref('vegetables')
  const customIngredient = ref('')
  const isValidatingIngredient = ref(false)
  const autoCompleteIngredients = ref(true) // 默认开启自动补充食材
  const favoriteLoading = ref(false) // 收藏操作加载状态

  // 常见食材（显示在主界面）
  const commonIngredients = [
    '鸡蛋',
    '土豆',
    '番茄',
    '洋葱',
    '大蒜',
    '生姜',
    '猪肉',
    '鸡肉',
    '大米',
    '面条',
    '豆腐',
    '青椒',
    '胡萝卜',
    '白菜',
  ]

  // 食材分类
  const vegetableIngredients = [
    '土豆',
    '番茄',
    '洋葱',
    '大蒜',
    '生姜',
    '胡萝卜',
    '青椒',
    '白菜',
    '菠菜',
    '韭菜',
    '豆角',
    '茄子',
    '冬瓜',
    '南瓜',
    '莲藕',
    '山药',
    '玉米',
    '蘑菇',
    '木耳',
    '银耳',
    '豆芽',
    '芹菜',
    '黄瓜',
    '西红柿',
  ]

  const meatIngredients = [
    '猪肉',
    '牛肉',
    '鸡肉',
    '鸭肉',
    '鱼',
    '虾',
    '蟹',
    '鸡蛋',
    '豆腐',
    '腊肉',
    '香肠',
    '培根',
    '羊肉',
    '排骨',
    '鸡翅',
    '鱼片',
  ]

  const stapleIngredients = [
    '大米',
    '面条',
    '面粉',
    '馒头',
    '面包',
    '土豆',
    '红薯',
    '玉米',
    '小米',
    '燕麦',
    '意大利面',
    '河粉',
    '米粉',
    '饺子皮',
  ]

  const seasoningIngredients = [
    '盐',
    '生抽',
    '老抽',
    '料酒',
    '白糖',
    '香油',
    '胡椒粉',
    '花椒',
    '八角',
    '桂皮',
    '香叶',
    '蚝油',
    '醋',
    '辣椒油',
  ]

  // 统计数据
  const aiStats = reactive({
    recipesGenerated: 89,
    totalAnalyses: 1247,
  })

  // 历史记录
  const recipeHistory = reactive<any[]>([])

  // 方法
  // 生成菜谱SVG封面
  const generateRecipeSvg = (recipeName: string): string => {
    return generateRecipeCardSvg(recipeName, 'medium')
  }

  const removeIngredient = (ingredient: string) => {
    const index = selectedIngredients.value.indexOf(ingredient)
    if (index > -1) {
      selectedIngredients.value.splice(index, 1)
    }
  }

  const toggleIngredient = (ingredient: string) => {
    const index = selectedIngredients.value.indexOf(ingredient)
    if (index > -1) {
      selectedIngredients.value.splice(index, 1)
    } else {
      selectedIngredients.value.push(ingredient)
    }
  }

  // 管理不喜欢的食材
  const addDislikedIngredient = () => {
    if (!customDislikedIngredient.value.trim()) {
      ElMessage.warning('请输入不喜欢的食材名称')
      return
    }

    const ingredient = customDislikedIngredient.value.trim()

    // 检查是否已经添加过
    if (dislikedIngredients.value.includes(ingredient)) {
      ElMessage.warning('该食材已经添加过了')
      customDislikedIngredient.value = ''
      return
    }

    dislikedIngredients.value.push(ingredient)
    customDislikedIngredient.value = ''
    ElMessage.success(`已添加不喜欢的食材：${ingredient}`)
  }

  const removeDislikedIngredient = (ingredient: string) => {
    const index = dislikedIngredients.value.indexOf(ingredient)
    if (index > -1) {
      dislikedIngredients.value.splice(index, 1)
      ElMessage.success(`已移除：${ingredient}`)
    }
  }

  const addCustomIngredient = async () => {
    if (!customIngredient.value.trim()) {
      ElMessage.warning('请输入食材名称')
      return
    }

    const ingredient = customIngredient.value.trim()

    // 检查是否已经添加过
    if (selectedIngredients.value.includes(ingredient)) {
      ElMessage.warning('该食材已经添加过了')
      customIngredient.value = ''
      return
    }

    isValidatingIngredient.value = true

    try {
      // 使用AI验证食材是否可食用
      const isValid = await validateIngredientWithAI(ingredient)

      if (isValid) {
        selectedIngredients.value.push(ingredient)
        customIngredient.value = ''
        ElMessage.success(`已添加食材：${ingredient}`)
      } else {
        ElMessage.error(`"${ingredient}" 不是有效的食材，请重新输入`)
      }
    } catch (error) {
      console.error('验证食材失败:', error)
      ElMessage.error('验证食材失败，请稍后重试')
    } finally {
      isValidatingIngredient.value = false
    }
  }

  const validateIngredientWithAI = async (ingredient: string): Promise<boolean> => {
    try {
      // 简单的本地验证规则
      const invalidKeywords = ['毒', '有害', '不能吃', '危险', '化学', '药物']
      if (invalidKeywords.some(keyword => ingredient.includes(keyword))) {
        return false
      }

      // 使用AI提供商进行验证
      const result = await aiService.validateIngredient(ingredient)

      if (result.reason) {
        ElMessage.info(result.reason)
      }

      return result.isValid
    } catch (error) {
      console.error('❌ AI验证食材失败:', error)

      // 如果AI验证失败，使用简单的白名单验证
      const commonIngredientsList = [
        ...vegetableIngredients,
        ...meatIngredients,
        ...stapleIngredients,
        ...seasoningIngredients,
      ]

      // 模糊匹配
      const isCommon = commonIngredientsList.some(
        common => common.includes(ingredient) || ingredient.includes(common)
      )

      if (isCommon) {
        return true
      }

      // 对于未知食材，默认允许但给出提示
      ElMessage.warning(`无法验证 "${ingredient}" 是否为有效食材，请确保输入正确`)
      return true
    }
  }

  const generateRecipe = async () => {
    if (selectedIngredients.value.length === 0) {
      ElMessage.warning('请至少选择一个食材')
      return
    }

    // 检查是否使用模拟数据
    if (apiKeyReminder.value?.isUsingMockData) {
      ElMessage.info('当前使用模拟数据进行演示，生成的食谱为示例内容')
    }

    isGenerating.value = true

    // 检查AI服务是否需要初始化
    if (!aiService['isInitialized']) {
      ElMessage.info('正在初始化AI服务，请稍候...')
    }

    try {
      const params = {
        ingredients: selectedIngredients.value,
        // cookingMethods: cookingMethodNoRestriction.value ? [] : selectedCookingMethods.value, // 已移除烹饪方式选择
        // noMethodRestriction: cookingMethodNoRestriction.value, // 已移除烹饪方式选择
        kitchenware: selectedKitchenware.value,
        dietaryRestrictions: dietaryRestrictions.value,
        healthGoals: healthGoals.value,
        allergies: allergies.value,
        flavorPreferences: flavorPreferences.value,
        spiceLevel: spiceLevel.value,
        sweetnessLevel: sweetnessLevel.value,
        dislikedIngredients: dislikedIngredients.value,
        servings: servings.value,
        cookingTime: cookingTime.value,
        difficulty: difficulty.value,
        autoCompleteIngredients: autoCompleteIngredients.value, // 添加自动补充食材选项
      }

      // Extract ingredients array from params
      const ingredients = params.ingredients

      // Create preferences object from other params
      const preferences = {
        // cookingMethods: params.cookingMethods, // 已移除烹饪方式选择
        dietaryRestrictions: params.dietaryRestrictions,
        healthGoals: params.healthGoals,
        allergies: params.allergies,
        flavorPreferences: params.flavorPreferences,
        spiceLevel:
          params.spiceLevel === 'none' ? 'mild' : (params.spiceLevel as 'mild' | 'medium' | 'hot'),
        sweetnessLevel: params.sweetnessLevel,
        dislikedIngredients: params.dislikedIngredients,
        servings: params.servings,
        cookingTime: params.cookingTime, // 保持原始字符串格式
        difficulty: params.difficulty,
        kitchenware: params.kitchenware,
        // noMethodRestriction: params.noMethodRestriction, // 已移除烹饪方式选择
        autoCompleteIngredients: params.autoCompleteIngredients,
      }

      const result = await aiService.generateRecipe(ingredients, preferences)
      const recipe = result.recipe

      // 为生成的菜谱添加唯一ID（如果没有的话）
      if (!recipe.id) {
        recipe.id = `recipe_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      }

      generatedRecipe.value = recipe

      // 更新统计数据
      aiStats.recipesGenerated++

      // 添加到历史记录
      recipeHistory.unshift({
        ...recipe,
        createdAt: new Date(),
      })

      ElMessage.success('食谱生成成功！')

      // 滚动到结果区域
      setTimeout(() => {
        const resultElement = document.querySelector('.generated-recipe-section')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (error) {
      console.error('生成食谱失败:', error)

      // 根据错误类型给出更具体的提示
      if (error.message === 'AI服务未初始化') {
        ElMessage.error('AI服务初始化失败，请刷新页面重试')
      } else if (error.message.includes('API密钥')) {
        ElMessage.error('AI服务配置错误，请检查API密钥配置')
      } else if (error.message.includes('网络') || error.message.includes('Network')) {
        ElMessage.error('网络连接失败，请检查网络连接')
      } else {
        ElMessage.error('生成食谱失败，请稍后重试')
      }
    } finally {
      isGenerating.value = false
    }
  }

  // 检查食材是否是AI自动补充的
  const isAutoCompletedIngredient = (ingredient: any): boolean => {
    if (!generatedRecipe.value || !generatedRecipe.value.autoCompletedIngredients) {
      return false
    }

    const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name
    return generatedRecipe.value.autoCompletedIngredients.includes(ingredientName)
  }

  // 检查当前菜谱是否已收藏
  const isFavorited = ref(false)

  // 检查收藏状态的函数
  const checkFavoriteStatus = async () => {
    if (!generatedRecipe.value || !generatedRecipe.value.id) {
      isFavorited.value = false
      return
    }

    try {
      const { favoritesService } = await import('@/services/favoritesService')
      const sessionId = localStorage.getItem('sessionId') || 'default-session'
      isFavorited.value = await favoritesService.isFavorited(sessionId, generatedRecipe.value.id)
    } catch (error) {
      console.error('检查收藏状态失败:', error)
      isFavorited.value = false
    }
  }

  // 切换收藏状态
  const toggleFavorite = async () => {
    if (!generatedRecipe.value) {
      ElMessage.warning('请先生成菜谱后再进行收藏操作')
      return
    }

    favoriteLoading.value = true

    try {
      // 使用 favoritesService 统一处理收藏功能
      const { favoritesService } = await import('@/services/favoritesService')
      const sessionId = localStorage.getItem('sessionId') || 'default-session'

      const currentState = isFavorited.value

      if (currentState) {
        // 取消收藏
        await favoritesService.removeFavorite(sessionId, generatedRecipe.value.id)
        isFavorited.value = false

        ElMessage({
          message: '✨ 已成功取消收藏，您可以在收藏页面中查看其他收藏的菜谱',
          type: 'info',
          duration: 3000,
          showClose: true,
        })
      } else {
        // 添加收藏
        await favoritesService.addFavorite(sessionId, generatedRecipe.value)
        isFavorited.value = true

        ElMessage({
          message: '🎉 菜谱已成功添加到收藏！您可以在"我的收藏"页面中查看和管理所有收藏的菜谱',
          type: 'success',
          duration: 4000,
          showClose: true,
        })
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      ElMessage({
        message: '⚠️ 操作失败，请刷新页面后重试。如问题持续存在，请联系技术支持',
        type: 'error',
        duration: 5000,
        showClose: true,
      })
    } finally {
      favoriteLoading.value = false
    }
  }

  const shareRecipe = () => {
    if (!generatedRecipe.value) return

    // 这里可以实现分享功能
    ElMessage.success('食谱分享链接已复制到剪贴板')
  }

  const addToShoppingList = async () => {
    if (!generatedRecipe.value) return

    try {
      const recipe = generatedRecipe.value
      const recipeId = recipe.id || `recipe_${Date.now()}`
      const recipeName = recipe.title || recipe.name || '未命名食谱'

      // 提取食材列表，保持原始结构以获得更精准的分量信息
      const ingredients: (string | { name: string; amount?: string; unit?: string })[] = []
      recipe.ingredients.forEach((ingredient: any) => {
        if (typeof ingredient === 'string') {
          ingredients.push(ingredient)
        } else if (ingredient.name) {
          // 保持对象结构，让购物清单服务处理分量信息
          ingredients.push({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
          })
        }
      })

      if (ingredients.length === 0) {
        ElMessage.warning('该食谱没有可添加的食材')
        return
      }

      // 调用购物清单服务添加食材
      await shoppingListService.addIngredientsFromRecipe(recipeId, recipeName, ingredients)

      ElMessage.success({
        message: `已将 ${ingredients.length} 种食材添加到购物清单，包含精准分量信息`,
        duration: 3000,
      })

      // 可以选择跳转到购物清单页面
      ElMessageBox.confirm(
        '食材已成功添加到购物清单，包含详细的购买建议。是否立即查看？',
        '添加成功',
        {
          confirmButtonText: '查看购物清单',
          cancelButtonText: '继续浏览',
          type: 'success',
        }
      )
        .then(() => {
          // 使用 Vue Router 跳转到购物清单页面
          router.push('/shopping-list')
        })
        .catch(() => {
          // 用户选择继续浏览，不做操作
        })
    } catch (error) {
      console.error('添加食材到购物清单失败:', error)
      ElMessage.error('添加食材到购物清单失败，请稍后重试')
    }
  }

  const generateAnother = () => {
    generatedRecipe.value = null
    // 可以保持当前的选择，方便用户再次生成
    window.scrollTo({ top: 0, behavior: 'smooth' })
    ElMessage.info('请调整参数后重新生成食谱')
  }

  const startCooking = () => {
    if (!generatedRecipe.value) return

    ElMessageBox.confirm('是否开始烹饪这道菜？系统将启动计时器和步骤指导。', '开始烹饪', {
      confirmButtonText: '开始',
      cancelButtonText: '取消',
      type: 'info',
    })
      .then(() => {
        // 跳转到烹饪指导页面，传递食谱数据
        // 将食谱数据存储在本地存储中，以便在烹饪指导页面获取
        localStorage.setItem('currentCookingRecipe', JSON.stringify(generatedRecipe.value))

        // 跳转到烹饪指导页面
        router.push({
          name: 'CookingGuide',
        })
      })
      .catch(() => {
        // 用户取消
      })
  }

  const loadHistoryRecipe = (recipe: any) => {
    // 确保历史食谱数据完整
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      ElMessage.warning('该食谱数据不完整，无法加载')
      return
    }

    generatedRecipe.value = recipe

    // 滚动到结果区域
    setTimeout(() => {
      const resultElement = document.querySelector('.generated-recipe-section')
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const clearHistory = () => {
    ElMessageBox.confirm('确定要清空所有历史记录吗？', '清空历史', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        recipeHistory.splice(0, recipeHistory.length)
        ElMessage.success('历史记录已清空')
      })
      .catch(() => {
        // 用户取消
      })
  }

  const formatTime = (date: Date) => {
    if (!date) return ''

    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()

    // 小于1小时显示"xx分钟前"
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000))
      return `${minutes} 分钟前`
    }

    // 小于24小时显示"xx小时前"
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000))
      return `${hours} 小时前`
    }

    // 其他情况显示日期
    const d = new Date(date)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

  // 监听 generatedRecipe 变化，更新收藏状态
  watch(
    generatedRecipe,
    async newRecipe => {
      if (newRecipe && newRecipe.id) {
        await checkFavoriteStatus()
      } else {
        isFavorited.value = false
      }
    },
    { immediate: true }
  )

  // 生命周期钩子
  onMounted(() => {
    // 加载历史记录和已收藏的菜谱
    recipeStore.loadSavedRecipes()

    // 模拟加载一些历史记录
    if (recipeHistory.length === 0) {
      recipeHistory.push({
        title: '香煎土豆饼',
        difficulty: '简单',
        cookingTime: '30分钟内',
        servings: 4,
        description: '外酥里嫩的香煎土豆饼，简单易做又美味。',
        ingredients: [
          '土豆 500克',
          '面粉 100克',
          '鸡蛋 1个',
          '葱花 适量',
          '盐 适量',
          '胡椒粉 少许',
          '食用油 适量',
        ],
        instructions: [
          '土豆去皮洗净，擦成丝，挤干水分。',
          '加入面粉、鸡蛋、葱花、盐和胡椒粉，搅拌均匀。',
          '平底锅热油，舀一勺面糊放入锅中，摊成小饼。',
          '小火煎至两面金黄即可。',
        ],
        nutrition: {
          calories: 220,
          protein: '5.5',
          carbs: '35',
          fat: '7',
        },
        cookingTips: ['土豆丝一定要挤干水分，否则不容易成型。', '煎的时候用小火，避免外焦里生。'],
        tags: ['素食', '早餐', '小吃'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
      })

      recipeHistory.push({
        title: '番茄炒蛋',
        difficulty: '简单',
        cookingTime: '15分钟内',
        servings: 2,
        description: '家常经典菜，酸甜可口的番茄搭配嫩滑的鸡蛋。',
        ingredients: ['番茄 2个', '鸡蛋 3个', '葱花 适量', '盐 适量', '白糖 少许', '食用油 适量'],
        instructions: [
          '番茄洗净切块，鸡蛋打散。',
          '热锅冷油，倒入鸡蛋液，快速翻炒至凝固，盛出备用。',
          '锅中再加油，放入番茄块翻炒至出汁。',
          '加入适量盐和白糖调味，倒入炒好的鸡蛋，翻炒均匀即可。',
        ],
        nutrition: {
          calories: 180,
          protein: '10',
          carbs: '8',
          fat: '12',
        },
        cookingTips: ['鸡蛋不要炒老，保持嫩滑口感。', '可以根据个人口味调整酸甜度。'],
        tags: ['家常菜', '快手菜', '营养'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5小时前
      })

      recipeHistory.push({
        title: '红烧排骨',
        difficulty: '中等',
        cookingTime: '1小时内',
        servings: 4,
        description: '色泽红亮，肉质酥烂，香甜可口的经典红烧排骨。',
        ingredients: [
          '猪排骨 500克',
          '姜片 适量',
          '蒜瓣 3-4个',
          '八角 2个',
          '桂皮 1小块',
          '料酒 2勺',
          '生抽 3勺',
          '老抽 1勺',
          '白糖 2勺',
          '食用油 适量',
          '清水 适量',
        ],
        instructions: [
          '排骨洗净，焯水去血水和杂质。',
          '锅中热油，放入姜片、蒜瓣、八角、桂皮爆香。',
          '放入排骨翻炒至表面变色。',
          '加入料酒、生抽、老抽、白糖，翻炒均匀。',
          '加入没过排骨的清水，大火烧开后转小火慢炖40分钟。',
          '收汁后即可出锅。',
        ],
        nutrition: {
          calories: 350,
          protein: '25',
          carbs: '10',
          fat: '22',
        },
        cookingTips: [
          '焯水时加入料酒可以去腥。',
          '炖煮时间越长，排骨越酥烂。',
          '收汁时可以大火快速收汁，但要注意不要糊锅。',
        ],
        tags: ['肉类', '红烧', '家常菜'],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
      })
    }
  })
</script>

<style scoped>
  .ai-view {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .ai-header {
    margin-bottom: 30px;
    background-color: var(--el-color-primary-light-9);
    border-radius: 8px;
    padding: 20px;

    /* Dark mode styles */
    [data-theme='dark'] & {
      background-color: var(--bg-color-secondary);
      color: var(--text-color);
    }
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title-section {
    flex: 1;
  }

  .page-title {
    display: flex;
    align-items: center;
    font-size: 28px;
    margin-bottom: 8px;
    color: var(--el-color-primary);

    [data-theme='dark'] & {
      color: var(--primary-color);
    }
  }

  .title-icon {
    margin-right: 10px;
    font-size: 24px;
  }

  .page-subtitle {
    font-size: 16px;
    color: var(--el-text-color-secondary);
    margin: 0;

    [data-theme='dark'] & {
      color: var(--text-color-secondary);
    }
  }

  .ai-stats {
    display: flex;
    gap: 20px;
  }

  .stat-card {
    background-color: var(--el-bg-color);
    border-radius: 6px;
    padding: 10px 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--el-border-color);

    [data-theme='dark'] & {
      background-color: var(--bg-color-light);
      color: var(--text-color);
      border-color: var(--border-color);
    }
  }

  .stat-number {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-color-primary);

    [data-theme='dark'] & {
      color: var(--primary-color);
    }
  }

  .stat-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);

    [data-theme='dark'] & {
      color: var(--text-color-secondary);
    }
  }

  .recipe-generator-section {
    margin-bottom: 30px;
  }

  .generator-card {
    border-radius: 8px;

    /* Dark mode styles */
    [data-theme='dark'] & {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);

      :deep(.el-card__body) {
        background-color: var(--card-bg);
        color: var(--text-color);
      }

      :deep(.el-card__header) {
        background-color: var(--card-bg);
        color: var(--text-color);
        border-bottom-color: var(--border-color);
      }
    }

    :deep(.el-card__body) {
      background-color: var(--el-bg-color);
      color: var(--el-text-color-primary);
    }

    :deep(.el-card__header) {
      background-color: var(--el-bg-color);
      color: var(--el-text-color-primary);
      border-bottom-color: var(--el-border-color);
    }
  }

  .card-header {
    padding-bottom: 10px;
  }

  .card-header h2 {
    margin: 0 0 8px 0;
    font-size: 22px;

    [data-theme='dark'] & {
      color: var(--text-color);
    }
  }

  .card-header p {
    margin: 0;
    color: var(--el-text-color-secondary);

    [data-theme='dark'] & {
      color: var(--text-color-secondary);
    }
  }

  .generator-form {
    padding: 10px 0;
  }

  .form-section {
    margin-bottom: 25px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    margin-bottom: 15px;

    [data-theme='dark'] & {
      color: var(--text-color) !important;
    }
  }

  .ingredient-quick-select {
    margin-bottom: 15px;
  }

  .ingredient-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ingredient-btn {
    margin: 0;
  }

  .more-btn {
    margin: 0;
  }

  .custom-ingredient-input {
    margin-bottom: 15px;
  }

  .selected-ingredients {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
  }

  .auto-complete-option {
    margin-top: 10px;
  }

  /* 饮食偏好和限制样式 */
  .subsection-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    [data-theme='dark'] & {
      color: var(--text-color) !important;
      border-bottom-color: var(--border-color-lighter) !important;
    }
  }

  .dietary-restrictions,
  .food-preferences {
    margin-bottom: 20px;
  }

  .restriction-group,
  .allergen-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 15px;
  }

  .allergen-section,
  .flavor-preferences,
  .disliked-ingredients {
    margin-bottom: 20px;
  }

  .allergen-section h5,
  .flavor-preferences h5,
  .disliked-ingredients h5 {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    margin: 0 0 10px 0;

    [data-theme='dark'] & {
      color: var(--text-color) !important;
    }
  }

  .flavor-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .flavor-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .flavor-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);
    min-width: 60px;
  }

  .spice-options,
  .sweetness-options {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .disliked-input {
    margin-bottom: 12px;
  }

  .disliked-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .disliked-tag {
    margin: 0;
    font-size: 12px;
  }

  .auto-complete-label {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .info-icon {
    color: var(--el-color-info);
    cursor: help;
  }

  .label {
    font-weight: 500;
  }

  .ingredient-tag {
    margin: 0;
  }

  .ingredient-dialog {
    /* Light mode styles (default) */
    :deep(.el-dialog) {
      background-color: var(--el-bg-color);
      color: var(--el-text-color-primary);
      border: 1px solid var(--el-border-color);
    }

    /* Dark mode styles with enhanced specificity */
    [data-theme='dark'] & :deep(.el-dialog) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
      border-color: var(--border-color) !important;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
    }

    /* Enhanced dialog sections with maximum specificity */
    [data-theme='dark'] & {
      /* Main dialog container */
      :deep(.el-dialog) {
        background-color: var(--card-bg) !important;
      }

      /* Dialog header */
      :deep(.el-dialog__header) {
        background-color: var(--card-bg) !important;
        color: var(--text-color) !important;
        border-bottom-color: var(--border-color) !important;
        padding: 20px 20px 10px 20px !important;
      }

      /* Dialog body - CRITICAL FIX */
      :deep(.el-dialog__body) {
        background-color: var(--card-bg) !important;
        color: var(--text-color) !important;
        padding: 10px 20px !important;

        /* Override any nested white backgrounds */
        * {
          background-color: transparent !important;
        }

        /* Specific fixes for common white background elements */
        .ingredient-category,
        .ingredient-grid,
        .ingredient-tabs {
          background-color: transparent !important;
        }
      }

      /* Dialog footer */
      :deep(.el-dialog__footer) {
        background-color: var(--card-bg) !important;
        color: var(--text-color) !important;
        border-top-color: var(--border-color) !important;
        padding: 10px 20px 20px 20px !important;
      }

      /* Text elements */
      :deep(.el-dialog__title) {
        color: var(--text-color) !important;
        font-weight: 600 !important;
      }

      :deep(.el-dialog__headerbtn .el-icon) {
        color: var(--text-color-secondary) !important;

        &:hover {
          color: var(--text-color) !important;
        }
      }

      /* Ingredient grid buttons with enhanced specificity */
      :deep(.ingredient-grid-btn) {
        background-color: var(--bg-color-light) !important;
        border-color: var(--border-color) !important;
        color: var(--text-color) !important;

        &.el-button--primary {
          background-color: var(--primary-color) !important;
          border-color: var(--primary-color) !important;
          color: white !important;
        }

        &:hover:not(.el-button--primary) {
          background-color: var(--hover-color) !important;
          border-color: var(--primary-color) !important;
        }

        /* Override any Element Plus default backgrounds */
        &,
        &:hover,
        &:focus,
        &:active {
          background-color: var(--bg-color-light) !important;
        }

        &.el-button--primary,
        &.el-button--primary:hover,
        &.el-button--primary:focus,
        &.el-button--primary:active {
          background-color: var(--primary-color) !important;
        }
      }

      /* Tab buttons with enhanced specificity */
      :deep(.el-button-group .el-button) {
        background-color: var(--bg-color-light) !important;
        border-color: var(--border-color) !important;
        color: var(--text-color) !important;

        &.el-button--primary {
          background-color: var(--primary-color) !important;
          border-color: var(--primary-color) !important;
          color: white !important;
        }

        &:hover:not(.el-button--primary) {
          background-color: var(--hover-color) !important;
          border-color: var(--primary-color) !important;
        }
      }

      /* Ingredient category titles */
      :deep(.ingredient-category h4) {
        color: var(--text-color) !important;
        background-color: transparent !important;
      }

      /* Custom ingredient input in dialog */
      :deep(.custom-ingredient-input .el-input) {
        background-color: var(--bg-color-light) !important;
        border-color: var(--border-color) !important;
      }

      :deep(.custom-ingredient-input .el-input .el-input__inner) {
        background-color: var(--bg-color-light) !important;
        color: var(--text-color) !important;
        border-color: var(--border-color) !important;
      }

      :deep(.custom-ingredient-input .el-button) {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
        color: white !important;
      }

      /* Override any remaining white backgrounds in child elements */
      :deep(.el-dialog__body > div),
      :deep(.el-dialog__body > div > div),
      :deep(.ingredient-categories),
      :deep(.ingredient-category),
      :deep(.ingredient-grid) {
        background-color: transparent !important;
      }

      /* Fix for any inline styles that might be applied */
      :deep([style*='background']) {
        background-color: var(--card-bg) !important;
      }
    }
  }

  .ingredient-category {
    margin-bottom: 15px;
  }

  .ingredient-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    margin-bottom: 15px;
  }

  .ingredient-grid-btn {
    margin: 0;
    width: 100%;
  }

  .ingredient-tabs {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .kitchenware-group {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
  }

  .form-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 25px;
  }

  .form-group {
    flex: 1;
    min-width: 200px;
  }

  .form-label {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .generate-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  .generate-btn {
    min-width: 200px;
  }

  .generate-tip {
    margin-top: 10px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .generated-recipe-section {
    margin-bottom: 30px;
  }

  .recipe-card {
    border-radius: 8px;

    /* Dark mode styles */
    [data-theme='dark'] & :deep(.el-card__body) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
    }

    [data-theme='dark'] & :deep(.el-card__header) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
      border-bottom-color: var(--border-color) !important;
    }
  }

  .recipe-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .recipe-title-section {
    flex: 1;
  }

  .recipe-title {
    margin: 0 0 15px 0;
    font-size: 24px;
    color: var(--el-color-primary);

    [data-theme='dark'] & {
      color: var(--primary-color) !important;
    }
  }

  .recipe-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .recipe-image-container {
    width: 200px;
    height: 200px;
    margin-left: 20px;
    border-radius: 8px;
    overflow: hidden; /* 关键：裁剪出圆角效果 */
    position: relative; /* 关键：为绝对定位的SVG提供相对定位容器 */
    /* 添加渐变背景以突出毛玻璃效果 */
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
    background-size: 400% 400%;
    animation: gradientShift 6s ease infinite;
  }

  .recipe-image {
    width: 100%;
    height: 100%;
  }

  .recipe-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .recipe-svg-cover {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    animation: gradientShift 3s ease-in-out infinite;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
      margin: 0;
      padding: 0;
      border: none;
    }
  }

  .recipe-description {
    margin-bottom: 20px;
    font-style: italic;
    color: var(--el-text-color-secondary);

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
  }

  .recipe-content {
    margin-bottom: 20px;
  }

  .content-section {
    margin-bottom: 25px;
  }

  .ingredients-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }

  .ingredient-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    position: relative;
  }

  .ingredient-item.auto-completed {
    background-color: var(--el-color-info-light-9);
    border: 1px dashed var(--el-color-info);
  }

  .auto-completed-tag {
    position: absolute;
    right: 5px;
    top: 5px;
    font-size: 10px;
    padding: 0 4px;
    height: 16px;
    line-height: 16px;
  }

  .ingredient-icon {
    color: var(--el-color-success);
  }

  .steps-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .step-item {
    display: flex;
    gap: 15px;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background-color: var(--el-color-primary);
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
    padding-top: 5px;
  }

  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .nutrition-item {
    padding: 10px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    text-align: center;
  }

  .nutrition-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 5px;
  }

  .nutrition-value {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-color-primary);
  }

  .tips-list {
    padding-left: 0;
    list-style-type: none;
  }

  .tip-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  .tip-icon {
    color: var(--el-color-success);
    margin-top: 3px;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .recipe-tag {
    margin: 0;
  }

  .recipe-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }

  .favorite-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .favorite-btn {
    transition: all 0.3s ease;
  }

  .favorite-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .favorite-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
    padding: 2px 8px;
    border-radius: 12px;
    border: 1px solid var(--el-color-warning-light-7);
    animation: favoriteGlow 2s ease-in-out infinite alternate;
  }

  .favorite-icon {
    font-size: 14px;
    color: var(--el-color-warning);
  }

  .favorite-text {
    font-weight: 500;
  }

  @keyframes favoriteGlow {
    0% {
      box-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
    }
    100% {
      box-shadow: 0 0 15px rgba(255, 193, 7, 0.6);
    }
  }

  .history-section {
    margin-bottom: 30px;
  }

  .history-card {
    border-radius: 8px;

    /* Dark mode styles */
    [data-theme='dark'] & :deep(.el-card__body) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
    }

    [data-theme='dark'] & :deep(.el-card__header) {
      background-color: var(--card-bg) !important;
      color: var(--text-color) !important;
      border-bottom-color: var(--border-color) !important;
    }
  }

  .history-list {
    display: flex;
    flex-direction: column;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px 0;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-lighter);

    [data-theme='dark'] & {
      border-bottom-color: var(--border-color-lighter);
    }
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .history-svg-cover {
    width: 60px;
    height: 45px;
    border-radius: 6px;
    overflow: hidden;
    flex-shrink: 0;
    margin: 0;
    padding: 0;
    position: relative;
    /* 添加动态渐变背景 */
    background: linear-gradient(
      135deg,
      #667eea 0%,
      #764ba2 25%,
      #f093fb 50%,
      #f5576c 75%,
      #4facfe 100%
    );
    background-size: 400% 400%;
    animation: gradientShift 6s ease infinite;

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
      margin: 0;
      padding: 0;
      border: none;
    }
  }

  .history-info {
    flex: 1;
  }

  .history-title {
    font-weight: 500;
    margin-bottom: 5px;

    [data-theme='dark'] & {
      color: var(--text-color) !important;
    }
  }

  .history-meta {
    font-size: 14px;
    color: var(--el-text-color-secondary);

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
  }

  .history-arrow {
    color: var(--el-text-color-secondary);

    [data-theme='dark'] & {
      color: var(--text-color-secondary) !important;
    }
  }

  @media (max-width: 768px) {
    .ai-view {
      padding: 10px;
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
    }

    .ai-stats {
      width: 100%;
      margin-top: 15px;
    }

    .stat-card {
      flex: 1;
    }

    .recipe-header {
      flex-direction: column;
    }

    .recipe-image {
      width: 100%;
      margin-left: 0;
      margin-top: 15px;
    }

    .recipe-actions {
      flex-direction: column;
    }

    .recipe-actions .el-button {
      width: 100%;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Form controls dark mode */
  [data-theme='dark'] .form-section .el-select,
  [data-theme='dark'] .form-section .el-input {
    background-color: var(--bg-color-light) !important;
    color: var(--text-color) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .form-section .el-select .el-input__inner,
  [data-theme='dark'] .form-section .el-input .el-input__inner {
    background-color: var(--bg-color-light) !important;
    color: var(--text-color) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .form-section :deep(.el-select-dropdown) {
    background-color: var(--bg-color-light) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .form-section :deep(.el-select-dropdown__item) {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .form-section :deep(.el-select-dropdown__item.hover) {
    background-color: var(--hover-color) !important;
  }

  [data-theme='dark'] .form-section .subsection-title {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .form-section .el-form-item__label {
    color: var(--text-color) !important;
  }

  /* Preferences section dark mode */
  [data-theme='dark'] .dietary-restrictions {
    background-color: var(--bg-color-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .dietary-restrictions h4 {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .dietary-restrictions .el-checkbox-group {
    background-color: transparent;
  }

  [data-theme='dark'] .dietary-restrictions .el-checkbox {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .dietary-restrictions .el-checkbox__label {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .food-preferences {
    background-color: var(--bg-color-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .food-preferences h4 {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .allergen-section {
    background-color: transparent;
    border-color: var(--border-color);
  }

  [data-theme='dark'] .allergen-section h5 {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .allergen-section .el-checkbox-group {
    background-color: transparent;
  }

  [data-theme='dark'] .allergen-section .el-checkbox {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .allergen-section .el-checkbox__label {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .flavor-preferences {
    background-color: transparent;
    border-color: var(--border-color);
  }

  [data-theme='dark'] .flavor-preferences h5 {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .flavor-options {
    background-color: transparent;
  }

  [data-theme='dark'] .flavor-item {
    border-color: var(--border-color);
  }

  [data-theme='dark'] .flavor-label {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .spice-options .el-radio,
  [data-theme='dark'] .sweetness-options .el-radio {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .spice-options .el-radio__label,
  [data-theme='dark'] .sweetness-options .el-radio__label {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .disliked-ingredients {
    background-color: transparent;
    border-color: var(--border-color);
  }

  [data-theme='dark'] .disliked-ingredients h5 {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .disliked-input .el-input {
    background-color: var(--bg-color-light) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .disliked-input .el-input .el-input__inner {
    background-color: var(--bg-color-light) !important;
    color: var(--text-color) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .disliked-input .el-button {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: white !important;
  }

  [data-theme='dark'] .disliked-tags {
    background-color: transparent;
  }

  [data-theme='dark'] .disliked-tag {
    background-color: var(--danger-color) !important;
    border-color: var(--danger-color) !important;
    color: white !important;
  }

  /* Ingredient selection dark mode */
  [data-theme='dark'] .ingredient-selection {
    background-color: var(--bg-color-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .ingredient-selection h4 {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .ingredient-tabs {
    background-color: transparent;
    border-color: var(--border-color);
  }

  [data-theme='dark'] .ingredient-tabs .el-tabs__nav-wrap {
    background-color: transparent;
  }

  [data-theme='dark'] .ingredient-tabs .el-tabs__nav-scroll {
    background-color: transparent;
  }

  [data-theme='dark'] .ingredient-tabs .el-tabs__nav {
    background-color: transparent;
  }

  [data-theme='dark'] .ingredient-tabs .el-tabs__item {
    color: var(--text-color) !important;
    background-color: transparent;
  }

  [data-theme='dark'] .ingredient-tabs .el-tabs__item.is-active {
    color: var(--primary-color) !important;
    background-color: var(--bg-color-light);
  }

  [data-theme='dark'] .ingredient-tabs .el-tabs__active-bar {
    background-color: var(--primary-color);
  }

  [data-theme='dark'] .ingredient-grid {
    background-color: transparent;
  }

  [data-theme='dark'] .ingredient-item {
    background-color: var(--bg-color-light);
    border-color: var(--border-color);
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .ingredient-item .el-checkbox {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .ingredient-item .el-checkbox__label {
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .custom-ingredient-input {
    background-color: var(--bg-color-light);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .custom-ingredient-input .el-input {
    background-color: var(--bg-color-light) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .custom-ingredient-input .el-input .el-input__inner {
    background-color: var(--bg-color-light) !important;
    color: var(--text-color) !important;
    border-color: var(--border-color) !important;
  }

  [data-theme='dark'] .custom-ingredient-input .el-button {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: white !important;
  }

  [data-theme='dark'] .show-more-btn {
    background-color: var(--bg-color-light);
    border-color: var(--border-color);
    color: var(--text-color) !important;
  }

  [data-theme='dark'] .show-more-btn:hover {
    background-color: var(--hover-color);
    border-color: var(--primary-color);
  }

  /* Generate button dark mode */
  [data-theme='dark'] .generate-section {
    background-color: var(--bg-color-secondary);
    border-color: var(--border-color);
  }

  [data-theme='dark'] .generate-btn {
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
    color: white !important;
  }

  [data-theme='dark'] .generate-btn:hover {
    background-color: var(--primary-dark) !important;
    border-color: var(--primary-dark) !important;
  }

  [data-theme='dark'] .generate-tip {
    color: var(--text-color-secondary) !important;
  }

  /* Global overlay fix for dark mode */
  [data-theme='dark'] {
    :deep(.el-overlay) {
      background-color: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(2px);
    }
  }
</style>
