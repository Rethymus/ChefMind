<template>
  <div class="simple-home">
    <div class="container">
      <h1 class="title">ChefMind 智食谱</h1>
      <p class="subtitle">AI驱动的智能菜谱生成平台</p>
      
      <div class="feature-cards">
        <div class="card">
          <div class="card-icon">🍳</div>
          <h3>智能菜谱</h3>
          <p>基于AI技术，根据您的食材和偏好生成个性化菜谱</p>
        </div>
        
        <div class="card">
          <div class="card-icon">⏰</div>
          <h3>烹饪计时器</h3>
          <p>精准的烹饪时间控制，让每道菜都完美呈现</p>
        </div>
        
        <div class="card">
          <div class="card-icon">🛒</div>
          <h3>购物清单</h3>
          <p>智能生成购物清单，让采购变得更加便捷</p>
        </div>
        
        <div class="card">
          <div class="card-icon">📊</div>
          <h3>营养分析</h3>
          <p>详细的营养成分分析，帮助您保持健康饮食</p>
        </div>
      </div>
      
      <div class="quick-start">
        <h2>快速开始</h2>
        <div class="start-buttons">
          <button class="btn-primary" @click="startRecipeGeneration">
            开始生成菜谱
          </button>
          <button class="btn-secondary" @click="viewSavedRecipes">
            查看收藏菜谱
          </button>
        </div>
      </div>
      
      <div class="demo-section">
        <h2>功能演示</h2>
        <div class="demo-content">
          <div class="demo-item">
            <h4>1. 选择食材</h4>
            <p>从丰富的食材库中选择您现有的食材</p>
          </div>
          <div class="demo-item">
            <h4>2. 设置偏好</h4>
            <p>选择烹饪方式、难度等级和用餐人数</p>
          </div>
          <div class="demo-item">
            <h4>3. 生成菜谱</h4>
            <p>AI为您生成详细的个性化菜谱</p>
          </div>
          <div class="demo-item">
            <h4>4. 开始烹饪</h4>
            <p>跟随步骤指导，制作美味佳肴</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startRecipeGeneration = () => {
  router.push('/full')
}

const viewSavedRecipes = () => {
  router.push('/full')
}
</script>

<style lang="scss" scoped>
.simple-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.title {
  text-align: center;
  font-size: 3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.quick-start {
  text-align: center;
  margin-bottom: 4rem;
}

.quick-start h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.start-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.btn-primary {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
  
  &:hover {
    background: linear-gradient(135deg, #44a08d, #4ecdc4);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
  }
}

.btn-secondary {
  background: white;
  color: #4ecdc4;
  border: 2px solid #4ecdc4;
  
  &:hover {
    background: #4ecdc4;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
  }
}

.demo-section {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.demo-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.demo-item {
  text-align: center;
  padding: 1.5rem;
  border-radius: 10px;
  background: #f8f9fa;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
  }
}

.demo-item h4 {
  color: #4ecdc4;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.demo-item p {
  color: #7f8c8d;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .container {
    padding: 0 15px;
  }
  
  .feature-cards {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .start-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .demo-content {
    grid-template-columns: 1fr;
  }
}
</style>