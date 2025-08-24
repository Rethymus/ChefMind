﻿<template>
  <div class="recipe-detail">
    <div v-if="recipe" class="recipe-content">
      <!-- 食谱标题和评分 -->
      <div class="recipe-header">
        <h1>{{ recipe.name }}</h1>
        <div class="recipe-actions">
          <div class="recipe-rating">
            <span v-for="i in 5" :key="i" :class="['star', { filled: i <= recipe.rating }]">★</span>
            <span class="rating-count">({{ recipe.ratingCount || 0 }})</span>
          </div>
          <div class="action-buttons">
            <button class="action-button favorite" :class="{ active: isFavorite }" @click="toggleFavorite">
              <i class="icon-heart"></i>
              <span>{{ isFavorite ? '已收藏' : '收藏' }}</span>
            </button>
            <button class="action-button share" @click="showShareOptions = true">
              <i class="icon-share"></i>
              <span>分享</span>
            </button>
            <button class="action-button print" @click="printRecipe">
              <i class="icon-print"></i>
              <span>打印</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 食谱图片和描述 -->
      <div class="recipe-media-section">
        <div class="recipe-image" :style="{ backgroundImage: `url(${getSmartRecipeImage(recipe)})` }">
          <div class="recipe-tags" v-if="recipe.tags && recipe.tags.length">
            <span v-for="(tag, index) in recipe.tags" :key="index" class="recipe-tag">{{ tag }}</span>
          </div>
        </div>
        <p class="recipe-description">{{ recipe.description }}</p>
      </div>
      
      <!-- 食谱基本信息 -->
      <div class="recipe-info">
        <div class="info-item">
          <div class="info-icon">⏱️</div>
          <div class="info-content">
            <div class="info-label">烹饪时间</div>
            <div class="info-value">{{ recipe.cookingTime }}</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">📊</div>
          <div class="info-content">
            <div class="info-label">难度</div>
            <div class="info-value">{{ recipe.difficulty }}</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">🍽️</div>
          <div class="info-content">
            <div class="info-label">份量</div>
            <div class="info-value">{{ recipe.servings || '2人份' }}</div>
          </div>
        </div>
      </div>
      
      <!-- 营养信息 -->
      <div v-if="recipe.nutritionInfo" class="nutrition-info">
        <h3 class="section-title">营养信息</h3>
        <div class="nutrition-grid">
          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.calories }}kcal</div>
            <div class="nutrition-label">热量</div>
          </div>
          
          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.protein }}g</div>
            <div class="nutrition-label">蛋白质</div>
          </div>
          
          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.carbs }}g</div>
            <div class="nutrition-label">碳水</div>
          </div>
          
          <div class="nutrition-item">
            <div class="nutrition-value">{{ recipe.nutritionInfo.fat }}g</div>
            <div class="nutrition-label">脂肪</div>
          </div>
        </div>
      </div>
      
      <!-- 食材列表 -->
      <div class="ingredients">
        <h3 class="section-title">食材</h3>
        <ul class="ingredients-list">
          <li v-for="(ingredient, index) in recipe.ingredients" :key="index" class="ingredient-item">
            {{ ingredient }}
          </li>
        </ul>
      </div>
      
      <!-- 烹饪步骤 -->
      <div class="steps">
        <h3 class="section-title">烹饪步骤</h3>
        <ol class="steps-list">
          <li v-for="(step, index) in recipe.steps" :key="index" class="step-item">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">{{ step }}</div>
          </li>
        </ol>
      </div>
      
      <!-- 烹饪小贴士 -->
      <div v-if="recipe.tips" class="tips">
        <h3 class="section-title">小贴士</h3>
        <div class="tips-content">
          {{ recipe.tips }}
        </div>
      </div>
      
      <!-- 相关食谱 -->
      <div v-if="relatedRecipes && relatedRecipes.length > 0" class="related-recipes">
        <h3 class="section-title">相关食谱</h3>
        <div class="related-grid">
          <div 
            v-for="relatedRecipe in relatedRecipes" 
            :key="relatedRecipe.id"
            class="related-item"
            @click="$emit('select-recipe', relatedRecipe)"
          >
            <h4 class="related-title">{{ relatedRecipe.name }}</h4>
            <div class="related-meta">
              <span class="related-time">{{ relatedRecipe.cookingTime }}</span>
              <div class="related-rating">
                <span v-for="i in 5" :key="i" :class="['star', { filled: i <= relatedRecipe.rating }]">★</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分享和保存按钮 -->
      <div class="recipe-actions bottom-actions">
        <button class="action-button shopping-button" @click="addIngredientsToShoppingList">
          <span class="action-icon">🛒</span>
          添加到购物清单
        </button>
      </div>
      
      <!-- 分享选项弹窗 -->
      <div v-if="showShareOptions" class="share-modal">
        <div class="share-modal-content">
          <div class="share-modal-header">
            <h3>分享食谱</h3>
            <button class="close-button" @click="showShareOptions = false">×</button>
          </div>
          
          <div class="share-options">
            <button class="share-option" @click="shareViaWeChat">
              <span class="share-icon wechat">📱</span>
              <span>微信</span>
            </button>
            
            <button class="share-option" @click="shareViaWeibo">
              <span class="share-icon weibo">🔴</span>
              <span>微博</span>
            </button>
            
            <button class="share-option" @click="shareViaQQ">
              <span class="share-icon qq">💬</span>
              <span>QQ</span>
            </button>
            
            <button class="share-option" @click="copyToClipboard">
              <span class="share-icon link">🔗</span>
              <span>复制链接</span>
            </button>
            
            <button class="share-option" @click="generateQRCode">
              <span class="share-icon qrcode">📊</span>
              <span>二维码</span>
            </button>
          </div>
          
          <div v-if="qrCodeUrl" class="qrcode-container">
            <img :src="qrCodeUrl" alt="分享二维码" class="qrcode-image" />
            <button class="download-qrcode" @click="downloadQRCode">下载二维码</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-recipe">
      <div class="no-recipe-icon">🍽️</div>
      <h3>请选择一个食谱查看详情</h3>
      <p>或者使用食谱生成器创建新的食谱</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue'
import { shoppingListService } from '@/services/shoppingListService'
import { getSmartRecipeImage } from '@/utils/imageUtils'

const props = defineProps({
  recipe: {
    type: Object,
    default: null
  },
  relatedRecipes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select-recipe', 'notification'])

// 收藏状态
const isFavorite = ref(false)
const showShareOptions = ref(false)

// 检查食谱是否已收藏
const checkIfFavorite = () => {
  if (!props.recipe) return false
  
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
  return savedRecipes.some((r: any) => r.id === props.recipe.id)
}

// 切换收藏状态
const toggleFavorite = () => {
  if (!props.recipe) return
  
  const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]')
  const existingIndex = savedRecipes.findIndex((r: any) => r.id === props.recipe.id)
  
  if (existingIndex === -1) {
    // 添加到收藏
    savedRecipes.push(props.recipe)
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes))
    isFavorite.value = true
    emit('notification', {
      type: 'success',
      title: '收藏成功',
      message: '食谱已添加到收藏夹'
    })
  } else {
    // 从收藏中移除
    savedRecipes.splice(existingIndex, 1)
    localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes))
    isFavorite.value = false
    emit('notification', {
      type: 'info',
      title: '已取消收藏',
      message: '食谱已从收藏夹中移除'
    })
  }
}


// 监听食谱变化，更新收藏状态
const updateFavoriteStatus = () => {
  if (props.recipe) {
    isFavorite.value = checkIfFavorite()
  }
}

// 初始化时检查收藏状态
updateFavoriteStatus()

// 分享相关变量
const qrCodeUrl = ref('')

// 分享到微信
const shareViaWeChat = () => {
  // 实际应用中可能需要调用微信SDK
  emit('notification', {
    type: 'info',
    title: '微信分享',
    message: '请在微信中打开此页面进行分享'
  })
}

// 分享到微博
const shareViaWeibo = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(props.recipe?.name || '美味食谱')
  window.open(`http://service.weibo.com/share/share.php?url=${url}&title=${title}`, '_blank')
}

// 分享到QQ
const shareViaQQ = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(props.recipe?.name || '美味食谱')
  window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}`, '_blank')
}

// 复制链接到剪贴板
const copyToClipboard = () => {
  const url = window.location.href
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => {
        emit('notification', {
          type: 'success',
          title: '复制成功',
          message: '链接已复制到剪贴板'
        })
        showShareOptions.value = false
      })
      .catch(err => {
        console.error('复制失败:', err)
        fallbackCopyToClipboard(url)
      })
  } else {
    fallbackCopyToClipboard(url)
  }
}

// 复制链接的回退方法
const fallbackCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    document.execCommand('copy')
    emit('notification', {
      type: 'success',
      title: '复制成功',
      message: '链接已复制到剪贴板'
    })
    showShareOptions.value = false
  } catch (err) {
    console.error('复制失败:', err)
    emit('notification', {
      type: 'error',
      title: '复制失败',
      message: '无法复制链接，请手动复制'
    })
  }
  
  document.body.removeChild(textArea)
}

// 生成二维码
const generateQRCode = () => {
  const url = window.location.href
  // 使用在线二维码生成服务
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
}

// 下载二维码
const downloadQRCode = () => {
  if (!qrCodeUrl.value) return
  
  const link = document.createElement('a')
  link.href = qrCodeUrl.value
  link.download = `${props.recipe?.name || '食谱'}-二维码.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 打印食谱
const printRecipe = () => {
  if (!props.recipe) return;
  window.print();
}

// 添加食材到购物清单
const addIngredientsToShoppingList = async () => {
  if (!props.recipe || !props.recipe.ingredients || props.recipe.ingredients.length === 0) return;
  
  try {
    await shoppingListService.addIngredientsFromRecipe(
      props.recipe.id,
      props.recipe.name,
      props.recipe.ingredients
    );
    
    emit('notification', {
      type: 'success',
      title: '添加成功',
      message: '食材已添加到购物清单'
    });
  } catch (error) {
    console.error('添加食材到购物清单失败:', error);
    emit('notification', {
      type: 'error',
      title: '添加失败',
      message: '无法添加食材到购物清单，请稍后再试'
    });
  }
}
</script>

<style scoped>
.recipe-detail {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.recipe-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star {
  color: var(--border-color);
  font-size: 20px;
}

.star.filled {
  color: var(--warning-color);
}

.rating-text {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-left: 5px;
}

.recipe-media-section {
  margin-bottom: 30px;
}

.recipe-image {
  height: 300px;
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  margin-bottom: 20px;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.recipe-tags {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipe-tag {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.recipe-description {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 20px;
  padding: 0 5px;
}

.recipe-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  background-color: var(--bg-color-secondary);
  border-radius: 12px;
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.info-icon {
  font-size: 24px;
  color: var(--primary-color);
}

.info-label {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 5px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--heading-color);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.nutrition-info {
  margin-bottom: 30px;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 15px;
}

.nutrition-item {
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.nutrition-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 5px;
}

.nutrition-label {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.ingredients, .steps, .tips {
  margin-bottom: 30px;
}

.ingredients-list {
  list-style-type: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.ingredient-item {
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 12px 15px;
  font-size: 15px;
  color: var(--text-color);
  display: flex;
  align-items: center;
}

.ingredient-item::before {
  content: '•';
  margin-right: 10px;
  color: var(--primary-color);
  font-size: 18px;
}

.steps-list {
  list-style-type: none;
  padding: 0;
  counter-reset: step-counter;
}

.step-item {
  display: flex;
  margin-bottom: 20px;
  gap: 15px;
}

.step-number {
  background-color: var(--primary-color);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color);
}

.tips-content {
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-color);
  border-left: 4px solid var(--warning-color);
}

.related-recipes {
  margin-bottom: 30px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.related-item {
  background-color: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.related-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 10px 0;
}

.related-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.related-time {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.related-rating .star {
  font-size: 14px;
}

.recipe-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.bottom-actions {
  margin-top: 30px;
  justify-content: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
}

.action-button.favorite {
  background-color: var(--bg-color-secondary);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.action-button.favorite.active {
  background-color: var(--warning-color);
  color: white;
  border: none;
}

.action-button.favorite:hover {
  background-color: var(--warning-color-light);
}

.action-button.share {
  background-color: var(--success-color);
  color: white;
  border: none;
}

.action-button.share:hover {
  background-color: var(--success-color-dark);
}

.action-button.print {
  background-color: var(--bg-color-secondary);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

.action-button.print:hover {
  background-color: var(--hover-color);
}

.shopping-button {
  background-color: var(--info-color, #3498db);
  color: white;
  border: none;
  font-size: 16px;
  padding: 15px 30px;
}

.shopping-button:hover {
  background-color: var(--info-color-dark, #2980b9);
}

/* 分享弹窗样式 */
.share-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.share-modal-content {
  background-color: var(--bg-color);
  border-radius: 12px;
  padding: 25px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.share-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.share-modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-color-secondary);
  cursor: pointer;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.share-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 10px;
  border-radius: 8px;
  background-color: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.share-icon {
  font-size: 24px;
}

.share-icon.wechat {
  color: #07C160;
}

.share-icon.weibo {
  color: #E6162D;
}

.share-icon.qq {
  color: #12B7F5;
}

.share-icon.link {
  color: var(--primary-color);
}

.share-icon.qrcode {
  color: var(--text-color);
}

.qrcode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.qrcode-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.download-qrcode {
  padding: 10px 20px;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-qrcode:hover {
  background-color: var(--primary-color-dark);
}

.action-icon {
  font-size: 18px;
}

.no-recipe {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.no-recipe-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.no-recipe h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--heading-color);
  margin: 0 0 10px 0;
}

.no-recipe p {
  font-size: 16px;
  color: var(--text-color-secondary);
  margin: 0;
}

@media print {
  .recipe-actions, .related-recipes {
    display: none;
  }
  
  .recipe-detail {
    box-shadow: none;
    padding: 0;
  }
}

@media (max-width: 768px) {
  .recipe-detail {
    padding: 20px;
  }
  
  .recipe-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .recipe-title {
    font-size: 24px;
  }
  
  .recipe-info {
    grid-template-columns: 1fr;
  }
  
  .ingredients-list {
    grid-template-columns: 1fr;
  }
  
  .recipe-actions {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    justify-content: center;
  }
}
</style>