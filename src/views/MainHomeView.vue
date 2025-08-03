<template>
  <div class="home-container">
    <div class="main-content">
      <!-- 标题区域 -->
      <div class="header-section">
        <h1 class="main-title">
          <span class="icon">👨‍🍳</span>
          ChefMind 智食谱
        </h1>
        <p class="subtitle">AI驱动的智能烹饪助手，让每一餐都充满创意</p>
      </div>

      <!-- 功能导航 -->
      <div class="feature-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.name }}
        </button>
      </div>

      <!-- 食谱生成器 -->
      <div v-if="activeTab === 'generator'" class="content-section">
        <div class="generator-container">
          <!-- 食材选择 -->
          <div class="ingredient-section">
            <h3 class="section-title">
              <span class="icon">🥬</span>
              选择食材
            </h3>
            
            <!-- 蔬菜类 -->
            <div class="ingredient-category">
              <h4 class="category-title">蔬菜类</h4>
              <div class="ingredient-grid">
                <button 
                  v-for="ingredient in vegetables" 
                  :key="ingredient"
                  :class="['ingredient-tag', { selected: selectedIngredients.includes(ingredient) }]"
                  @click="toggleIngredient(ingredient)"
                >
                  {{ ingredient }}
                </button>
              </div>
            </div>

            <!-- 肉类 -->
            <div class="ingredient-category">
              <h4 class="category-title">肉类</h4>
              <div class="ingredient-grid">
                <button 
                  v-for="ingredient in meats" 
                  :key="ingredient"
                  :class="['ingredient-tag', { selected: selectedIngredients.includes(ingredient) }]"
                  @click="toggleIngredient(ingredient)"
                >
                  {{ ingredient }}
                </button>
              </div>
            </div>

            <!-- 主食类 -->
            <div class="ingredient-category">
              <h4 class="category-title">主食类</h4>
              <div class="ingredient-grid">
                <button 
                  v-for="ingredient in staples" 
                  :key="ingredient"
                  :class="['ingredient-tag', { selected: selectedIngredients.includes(ingredient) }]"
                  @click="toggleIngredient(ingredient)"
                >
                  {{ ingredient }}
                </button>
              </div>
            </div>

            <!-- 自定义食材输入 -->
            <div class="custom-ingredient">
              <input 
                v-model="customIngredient" 
                type="text" 
                placeholder="输入其他食材..."
                class="custom-input"
                @keyup.enter="addCustomIngredient"
              >
              <button @click="addCustomIngredient" class="add-button">添加</button>
            </div>
          </div>

          <!-- 烹饪方式选择 -->
          <div class="cooking-method-section">
            <h3 class="section-title">
              <span class="icon">🍳</span>
              烹饪方式
            </h3>
            <div class="method-grid">
              <button 
                v-for="method in cookingMethods" 
                :key="method"
                :class="['method-tag', { selected: selectedMethods.includes(method) }]"
                @click="toggleMethod(method)"
              >
                {{ method }}
              </button>
            </div>
          </div>

          <!-- 口味偏好 -->
          <div class="flavor-section">
            <h3 class="section-title">
              <span class="icon">🌶️</span>
              口味偏好
            </h3>
            <div class="flavor-grid">
              <button 
                v-for="flavor in flavors" 
                :key="flavor"
                :class="['flavor-tag', { selected: selectedFlavors.includes(flavor) }]"
                @click="toggleFlavor(flavor)"
              >
                {{ flavor }}
              </button>
            </div>
          </div>

          <!-- 生成按钮 -->
          <div class="generate-section">
            <button 
              @click="generateRecipes" 
              :disabled="selectedIngredients.length === 0 || isGenerating"
              class="generate-button"
            >
              <span v-if="isGenerating" class="loading-spinner">⏳</span>
              <span v-else class="icon">✨</span>
              {{ isGenerating ? '正在生成...' : '生成食谱' }}
            </button>
          </div>
        </div>

        <!-- 推荐菜谱 -->
        <div v-if="recommendedRecipes.length > 0" class="recommended-recipes">
          <h3 class="section-title">
            <span class="icon">⭐</span>
            为您推荐的菜谱
          </h3>
          <div class="recipe-grid">
            <div 
              v-for="recipe in recommendedRecipes" 
              :key="recipe.id"
              class="recipe-card"
              @click="openRecipeModal(recipe)"
            >
              <div class="recipe-icon">
                <span class="icon">📚</span>
              </div>
              <h4 class="recipe-title">{{ recipe.name }}</h4>
              <p class="recipe-description">{{ recipe.description }}</p>
              <div class="recipe-meta">
                <span class="cooking-time">{{ recipe.cookingTime }}</span>
                <div class="rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= recipe.rating }">★</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 烹饪计时器 -->
      <div v-if="activeTab === 'timer'" class="content-section">
        <div class="cooking-timer">
          <h3 class="section-title">
            <span class="icon">⏰</span>
            烹饪计时器
          </h3>
          <div class="timer-display">
            <div class="time-input">
              <input v-model.number="timerMinutes" type="number" min="0" max="59" class="timer-input" placeholder="分钟">
              <span class="time-separator">:</span>
              <input v-model.number="timerSeconds" type="number" min="0" max="59" class="timer-input" placeholder="秒钟">
            </div>
            <div class="timer-controls">
              <button @click="startTimer" :disabled="isTimerRunning" class="timer-button start">开始</button>
              <button @click="pauseTimer" :disabled="!isTimerRunning" class="timer-button pause">暂停</button>
              <button @click="resetTimer" class="timer-button reset">重置</button>
            </div>
            <div v-if="remainingTime > 0" class="countdown">
              {{ formatTime(remainingTime) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 购物清单 -->
      <div v-if="activeTab === 'shopping'" class="content-section">
        <div class="shopping-list">
          <h3 class="section-title">
            <span class="icon">🛒</span>
            购物清单
          </h3>
          <div class="add-item">
            <input 
              v-model="newShoppingItem" 
              type="text" 
              placeholder="添加购物项目..."
              class="shopping-input"
              @keyup.enter="addShoppingItem"
            >
            <button @click="addShoppingItem" class="add-button">添加</button>
          </div>
          <ul class="shopping-items">
            <li v-for="(item, index) in shoppingList" :key="index" class="shopping-item">
              <input 
                type="checkbox" 
                v-model="item.completed" 
                class="item-checkbox"
              >
              <span :class="{ completed: item.completed }" class="item-text">{{ item.name }}</span>
              <button @click="removeShoppingItem(index)" class="remove-button">×</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 营养分析 -->
      <div v-if="activeTab === 'nutrition'" class="content-section">
        <div class="nutrition-analysis">
          <h3 class="section-title">
            <span class="icon">📊</span>
            营养分析
          </h3>
          <div class="nutrition-input">
            <textarea 
              v-model="nutritionInput" 
              placeholder="输入您今天吃的食物，我来帮您分析营养成分..."
              class="nutrition-textarea"
            ></textarea>
            <button @click="analyzeNutrition" class="analyze-button">分析营养</button>
          </div>
          <div v-if="nutritionResult" class="nutrition-result">
            <h4>营养分析结果：</h4>
            <div class="nutrition-chart">
              <div class="nutrition-item">
                <span class="nutrient-name">热量</span>
                <div class="nutrient-bar">
                  <div class="nutrient-fill" :style="{ width: nutritionResult.calories + '%' }"></div>
                </div>
                <span class="nutrient-value">{{ nutritionResult.calories }}%</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">蛋白质</span>
                <div class="nutrient-bar">
                  <div class="nutrient-fill protein" :style="{ width: nutritionResult.protein + '%' }"></div>
                </div>
                <span class="nutrient-value">{{ nutritionResult.protein }}%</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">碳水化合物</span>
                <div class="nutrient-bar">
                  <div class="nutrient-fill carbs" :style="{ width: nutritionResult.carbs + '%' }"></div>
                </div>
                <span class="nutrient-value">{{ nutritionResult.carbs }}%</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrient-name">脂肪</span>
                <div class="nutrient-bar">
                  <div class="nutrient-fill fat" :style="{ width: nutritionResult.fat + '%' }"></div>
                </div>
                <span class="nutrient-value">{{ nutritionResult.fat }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 食谱详情弹窗 -->
    <div v-if="showRecipeModal" class="modal-overlay" @click="closeRecipeModal">
      <div class="recipe-modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedRecipe.name }}</h2>
          <button @click="closeRecipeModal" class="close-button">×</button>
        </div>
        
        <div class="modal-content">
          <div class="recipe-meta-info">
            <div class="meta-item">
              <span class="meta-label">烹饪时间:</span>
              <span class="meta-value">{{ selectedRecipe.cookingTime }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">难度:</span>
              <span class="meta-value">{{ selectedRecipe.difficulty }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">份量:</span>
              <span class="meta-value">{{ selectedRecipe.servings }}</span>
            </div>
          </div>

          <div class="nutrition-details">
            <h3 class="nutrition-title">营养评级</h3>
            <div class="rating-display">
              <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= selectedRecipe.rating }">★</span>
              <span class="rating-text">({{ selectedRecipe.rating }}/5 星)</span>
            </div>
          </div>

          <div class="recipe-section">
            <h3 class="section-header">所需食材</h3>
            <ul class="ingredients-list">
              <li v-for="ingredient in selectedRecipe.ingredients" :key="ingredient" class="ingredient-item">
                {{ ingredient }}
              </li>
            </ul>
          </div>

          <div class="recipe-section">
            <h3 class="section-header">制作步骤</h3>
            <ol class="steps-list">
              <li v-for="(step, index) in selectedRecipe.steps" :key="index" class="step-item">
                {{ step }}
              </li>
            </ol>
          </div>

          <div class="recipe-section">
            <h3 class="section-header">小贴士</h3>
            <div class="tips-content">
              {{ selectedRecipe.tips }}
            </div>
          </div>

          <div class="external-links">
            <h3 class="section-header">相关链接</h3>
            <div class="links-container">
              <a href="https://www.xiachufang.com" target="_blank" class="external-link">
                <span class="link-icon">🔗</span>
                下厨房
              </a>
              <a href="https://www.meishij.net" target="_blank" class="external-link">
                <span class="link-icon">🔗</span>
                美食杰
              </a>
              <a href="https://www.douguo.com" target="_blank" class="external-link">
                <span class="link-icon">🔗</span>
                豆果美食
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainHomeView',
  data() {
    return {
      activeTab: 'generator',
      tabs: [
        { id: 'generator', name: '食谱生成', icon: '🍳' },
        { id: 'timer', name: '烹饪计时', icon: '⏰' },
        { id: 'shopping', name: '购物清单', icon: '🛒' },
        { id: 'nutrition', name: '营养分析', icon: '📊' }
      ],
      
      // 食材数据
      vegetables: [
        '白菜', '萝卜', '胡萝卜', '土豆', '番茄', '黄瓜', '茄子', '豆角', '韭菜', '菠菜',
        '生菜', '芹菜', '大葱', '洋葱', '蒜苗', '青椒', '红椒', '尖椒', '冬瓜', '南瓜',
        '丝瓜', '苦瓜', '西葫芦', '莲藕', '山药', '竹笋', '豆芽', '韭黄', '蒜苔', '芦笋',
        '西兰花', '菜花', '包菜', '紫甘蓝', '油菜', '小白菜', '娃娃菜', '芥菜', '荠菜', '苋菜',
        '空心菜', '茼蒿', '香菜', '薄荷', '罗勒', '迷迭香', '百里香', '牛至', '鼠尾草', '欧芹'
      ],
      meats: [
        '猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '鹅肉', '火鸡', '兔肉', '鹿肉', '野猪肉',
        '猪排骨', '牛排骨', '羊排骨', '鸡翅', '鸡腿', '鸡胸肉', '鸭腿', '鸭胸', '鹅腿', '火鸡腿',
        '猪蹄', '牛蹄筋', '羊蹄', '鸡爪', '鸭掌', '猪肚', '牛肚', '羊肚', '鸡胗', '鸭胗',
        '猪肝', '牛肝', '羊肝', '鸡肝', '鸭肝', '猪肾', '牛肾', '羊肾', '猪心', '牛心',
        '培根', '火腿', '香肠', '腊肉', '咸肉', '熏肉', '肉松', '肉脯', '肉丸', '肉饼'
      ],
      staples: [
        '大米', '小米', '糯米', '黑米', '红米', '紫米', '香米', '泰国香米', '印度香米', '日本大米',
        '面粉', '全麦面粉', '玉米面', '荞麦面', '燕麦', '大麦', '小麦', '高粱', '薏米', '藜麦',
        '面条', '挂面', '拉面', '乌冬面', '意大利面', '通心粉', '螺旋面', '蝴蝶面', '天使面', '宽面',
        '馒头', '包子', '花卷', '烧饼', '油条', '麻花', '煎饼', '薄饼', '春卷皮', '饺子皮',
        '面包', '吐司', '法棍', '贝果', '可颂', '丹麦酥', '司康饼', '马芬', '纸杯蛋糕', '蛋糕'
      ],
      
      cookingMethods: ['炒', '煮', '蒸', '炖', '烤', '炸', '煎', '焖', '烧', '拌', '腌', '熏', '卤', '涮'],
      flavors: ['清淡', '麻辣', '酸甜', '咸鲜', '香辣', '蒜香', '葱香', '姜味', '酱香', '糖醋'],
      
      selectedIngredients: [],
      selectedMethods: [],
      selectedFlavors: [],
      customIngredient: '',
      
      isGenerating: false,
      recommendedRecipes: [],
      
      // 计时器相关
      timerMinutes: 0,
      timerSeconds: 0,
      remainingTime: 0,
      isTimerRunning: false,
      timerInterval: null,
      
      // 购物清单
      shoppingList: [],
      newShoppingItem: '',
      
      // 营养分析
      nutritionInput: '',
      nutritionResult: null,
      
      // 弹窗相关
      showRecipeModal: false,
      selectedRecipe: null
    }
  },
  
  methods: {
    toggleIngredient(ingredient) {
      const index = this.selectedIngredients.indexOf(ingredient);
      if (index > -1) {
        this.selectedIngredients.splice(index, 1);
      } else {
        this.selectedIngredients.push(ingredient);
      }
    },
    
    toggleMethod(method) {
      const index = this.selectedMethods.indexOf(method);
      if (index > -1) {
        this.selectedMethods.splice(index, 1);
      } else {
        this.selectedMethods.push(method);
      }
    },
    
    toggleFlavor(flavor) {
      const index = this.selectedFlavors.indexOf(flavor);
      if (index > -1) {
        this.selectedFlavors.splice(index, 1);
      } else {
        this.selectedFlavors.push(flavor);
      }
    },
    
    async addCustomIngredient() {
      if (this.customIngredient.trim()) {
        // AI验证食材
        const isValid = await this.validateIngredient(this.customIngredient.trim());
        if (isValid) {
          this.selectedIngredients.push(this.customIngredient.trim());
          this.customIngredient = '';
        } else {
          alert('请输入有效的食材名称');
        }
      }
    },
    
    async validateIngredient(ingredient) {
      // 模拟AI验证
      await new Promise(resolve => setTimeout(resolve, 500));
      const invalidIngredients = ['石头', '塑料', '金属', '玻璃', '纸张'];
      return !invalidIngredients.includes(ingredient);
    },
    
    async generateRecipes() {
      if (this.selectedIngredients.length === 0) return;
      
      this.isGenerating = true;
      
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 确保生成至少2个不同烹饪方式的食谱
      const availableMethods = this.selectedMethods.length > 0 ? this.selectedMethods : ['炒', '煮', '蒸'];
      const recipesToGenerate = Math.max(2, Math.min(availableMethods.length, 4));
      
      this.recommendedRecipes = [];
      const usedMethods = [];
      
      for (let i = 0; i < recipesToGenerate; i++) {
        const availableMethodsForThis = availableMethods.filter(m => !usedMethods.includes(m));
        const method = availableMethodsForThis.length > 0 
          ? availableMethodsForThis[Math.floor(Math.random() * availableMethodsForThis.length)]
          : availableMethods[Math.floor(Math.random() * availableMethods.length)];
        
        usedMethods.push(method);
        
        const mainIngredients = this.selectedIngredients.slice(0, 3);
        const recipeName = `${method}${mainIngredients.join('、')}`;
        
        this.recommendedRecipes.push({
          id: i + 1,
          name: recipeName,
          description: `精选${mainIngredients.join('、')}，采用${method}的方式制作`,
          cookingTime: `${15 + Math.floor(Math.random() * 30)}分钟`,
          difficulty: ['简单', '中等', '困难'][Math.floor(Math.random() * 3)],
          servings: `${2 + Math.floor(Math.random() * 4)}人份`,
          rating: 3 + Math.floor(Math.random() * 3), // 3-5星
          ingredients: [
            ...mainIngredients.map(ing => `${ing} 适量`),
            '盐 适量',
            '油 适量',
            '生抽 1勺',
            '料酒 1勺'
          ],
          steps: [
            `将${mainIngredients[0]}洗净切好备用`,
            `热锅下油，爆香配料`,
            `下入主料进行${method}制`,
            '调味炒匀即可出锅',
            '装盘享用美味佳肴'
          ],
          tips: `${method}时火候要掌握好，保持食材的鲜嫩口感。可根据个人喜好调整调料用量。`
        });
      }
      
      this.isGenerating = false;
    },
    
    openRecipeModal(recipe) {
      this.selectedRecipe = recipe;
      this.showRecipeModal = true;
    },
    
    closeRecipeModal() {
      this.showRecipeModal = false;
      this.selectedRecipe = null;
    },
    
    // 计时器方法
    startTimer() {
      const totalSeconds = this.timerMinutes * 60 + this.timerSeconds;
      if (totalSeconds > 0) {
        this.remainingTime = totalSeconds;
        this.isTimerRunning = true;
        this.timerInterval = setInterval(() => {
          this.remainingTime--;
          if (this.remainingTime <= 0) {
            this.resetTimer();
            alert('时间到！');
          }
        }, 1000);
      }
    },
    
    pauseTimer() {
      this.isTimerRunning = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    
    resetTimer() {
      this.isTimerRunning = false;
      this.remainingTime = 0;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },
    
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    // 购物清单方法
    addShoppingItem() {
      if (this.newShoppingItem.trim()) {
        this.shoppingList.push({
          name: this.newShoppingItem.trim(),
          completed: false
        });
        this.newShoppingItem = '';
      }
    },
    
    removeShoppingItem(index) {
      this.shoppingList.splice(index, 1);
    },
    
    // 营养分析方法
    analyzeNutrition() {
      if (this.nutritionInput.trim()) {
        // 模拟营养分析
        this.nutritionResult = {
          calories: Math.floor(Math.random() * 40) + 60,
          protein: Math.floor(Math.random() * 30) + 50,
          carbs: Math.floor(Math.random() * 35) + 45,
          fat: Math.floor(Math.random() * 25) + 35
        };
      }
    }
  },
  
  beforeUnmount() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.main-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 1rem 0 0 0;
  font-weight: 300;
}

.icon {
  margin-right: 0.5rem;
}

.feature-tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.tab-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 1rem 2rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.content-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ingredient-section, .cooking-method-section, .flavor-section {
  margin-bottom: 2rem;
}

.ingredient-category {
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
}

.ingredient-grid, .method-grid, .flavor-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.ingredient-tag, .method-tag, .flavor-tag {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.ingredient-tag:hover, .method-tag:hover, .flavor-tag:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.ingredient-tag.selected, .method-tag.selected, .flavor-tag.selected {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.custom-ingredient {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.custom-input, .shopping-input, .nutrition-textarea {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1rem;
}

.custom-input::placeholder, .shopping-input::placeholder, .nutrition-textarea::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.add-button, .analyze-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.add-button:hover, .analyze-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.generate-section {
  text-align: center;
  margin-top: 2rem;
}

.generate-button {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 1rem 3rem;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.generate-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.generate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.recommended-recipes {
  margin-top: 3rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recipe-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.recipe-icon {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 1rem;
}

.recipe-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.5rem 0;
  color: rgba(0, 0, 0, 0.9);
}

.recipe-description {
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cooking-time {
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
}

.rating {
  display: flex;
  gap: 0.2rem;
}

.star {
  color: #ddd;
  font-size: 1rem;
  transition: color 0.3s ease;
}

.star.active {
  color: #ffd700;
}

.cooking-timer {
  text-align: center;
}

.timer-display {
  max-width: 400px;
  margin: 0 auto;
}

.time-input {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.timer-input {
  width: 80px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 600;
}

.timer-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.time-separator {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.timer-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: white;
}

.timer-button.start {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.timer-button.pause {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.timer-button.reset {
  background: rgba(255, 255, 255, 0.2);
}

.timer-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.timer-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.countdown {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.shopping-list {
  max-width: 600px;
  margin: 0 auto;
}

.add-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.shopping-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shopping-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-bottom: 0.5rem;
}

.item-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.item-text {
  flex: 1;
  color: white;
  font-size: 1rem;
}

.item-text.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.remove-button {
  background: #ff4757;
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.3s ease;
}

.remove-button:hover {
  background: #ff3742;
  transform: scale(1.1);
}

.nutrition-analysis {
  max-width: 800px;
  margin: 0 auto;
}

.nutrition-input {
  margin-bottom: 2rem;
}

.nutrition-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  margin-bottom: 1rem;
}

.nutrition-result h4 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.nutrition-chart {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nutrition-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nutrient-name {
  width: 100px;
  color: white;
  font-weight: 500;
}

.nutrient-bar {
  flex: 1;
  height: 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.nutrient-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
}

.nutrient-fill.protein {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.nutrient-fill.carbs {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.nutrient-fill.fat {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.nutrient-value {
  width: 50px;
  text-align: right;
  color: white;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
}

.recipe-modal {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px 20px 0 0;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.6);
  transition: color 0.3s ease;
}

.close-button:hover {
  color: rgba(0, 0, 0, 0.9);
}

.modal-content {
  padding: 2rem;
}

.recipe-meta-info {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.meta-item {
  text-align: center;
}

.meta-label {
  display: block;
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.5rem;
}

.meta-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
}

.nutrition-details {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.nutrition-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 1rem;
}

.rating-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.rating-text {
  color: rgba(0, 0, 0, 0.7);
  font-weight: 500;
}

.recipe-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-header {
  font-size: 1.2rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.5rem;
}

.ingredients-list, .steps-list {
  margin: 0;
  padding-left: 1.5rem;
}

.ingredient-item, .step-item {
  color: rgba(0, 0, 0, 0.8);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.tips-content {
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.6;
  font-style: italic;
}

.external-links {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.external-link {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(0, 0, 0, 0.8);
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.external-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.link-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .feature-tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .tab-button {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .recipe-grid {
    grid-template-columns: 1fr;
  }
  
  .timer-controls {
    flex-direction: column;
    align-items: center;
  }
  
  .add-item {
    flex-direction: column;
  }
  
  .recipe-meta-info {
    grid-template-columns: 1fr;
  }
  
  .links-container {
    flex-direction: column;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .recipe-modal {
    max-height: 90vh;
  }
}
</style>
