<template>
  <div class="home-view">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">ChefMind 智食谱</h1>
        <p class="hero-subtitle">AI 驱动的智能烹饪助手，让每一道菜都成为艺术品</p>
        <div class="hero-actions">
          <router-link to="/search" class="cta-button primary">
            <span class="button-icon">🔍</span>
            搜索食谱
          </router-link>
          <router-link to="/ai" class="cta-button secondary">
            <span class="button-icon">🤖</span>
            AI 智能推荐
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <img
          src="/images/homepage-hero.jpg"
          alt="美食图片"
        />
      </div>
    </section>

    <!-- 热门菜谱 -->
    <section class="popular-recipes-section">
      <div class="section-header">
        <h2 class="section-title">热门菜谱</h2>
        <p class="section-subtitle">精选最受欢迎的家常菜谱</p>
      </div>

      <div class="recipes-grid">
        <div
          v-for="recipe in popularRecipes"
          :key="recipe.id"
          class="recipe-card"
          @click="viewRecipe(recipe)"
        >
          <div class="recipe-image">
            <img :src="recipe.image" :alt="recipe.title" />
            <div class="recipe-overlay">
              <span class="recipe-difficulty">{{ formatDifficulty(recipe.difficulty) }}</span>
              <span class="recipe-time">{{ formatCookingTime(recipe.cookingTime) }}</span>
            </div>
          </div>

          <div class="recipe-content">
            <h3 class="recipe-title">{{ recipe.title }}</h3>
            <p class="recipe-description">{{ recipe.description }}</p>

            <div class="recipe-meta">
              <div class="recipe-rating">
                <span class="rating-stars">⭐</span>
                <span class="rating-value">{{ recipe.rating }}</span>
              </div>
              <div class="recipe-tags">
                <span v-for="tag in recipe.tags.slice(0, 2)" :key="tag" class="recipe-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-footer">
        <router-link to="/search" class="view-more-button"> 查看更多菜谱 → </router-link>
      </div>
    </section>

    <!-- 功能特色 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">智能功能</h2>
        <p class="section-subtitle">让烹饪变得更简单、更有趣</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🤖</div>
          <h3 class="feature-title">AI 智能推荐</h3>
          <p class="feature-description">基于你的口味偏好和饮食习惯，智能推荐最适合的菜谱</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3 class="feature-title">智能搜索</h3>
          <p class="feature-description">输入食材或菜名，快速找到心仪的菜谱</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🛒</div>
          <h3 class="feature-title">购物清单</h3>
          <p class="feature-description">一键生成购物清单，让买菜变得井井有条</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">❤️</div>
          <h3 class="feature-title">收藏管理</h3>
          <p class="feature-description">收藏喜欢的菜谱，随时查看和制作</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { popularRecipes } from '@/data/mockData'
  import type { Recipe } from '@/types/recipe'
  import { formatDifficulty, formatCookingTime } from '@/utils/formatUtils'

  const router = useRouter()

  const viewRecipe = (recipe: Recipe) => {
    // 将完整的菜谱数据保存到会话存储
    sessionStorage.setItem('viewRecipe', JSON.stringify(recipe))

    // 跳转到菜谱详情页
    router.push({
      name: 'RecipeDetail',
      query: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        cookingTime: recipe.cookingTime.toString(),
        difficulty: recipe.difficulty,
        rating: recipe.rating.toString(),
      },
    })
  }


</script>

<style lang="scss" scoped>
  .home-view {
    min-height: 100vh;
    background: var(--bg-color);
  }

  .hero-section {
    display: flex;
    align-items: center;
    min-height: 80vh;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    gap: 4rem;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      min-height: 60vh;
      gap: 2rem;
    }
  }

  .hero-content {
    flex: 1;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--heading-color);
    margin-bottom: 1rem;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }
  }

  .hero-subtitle {
    font-size: 1.2rem;
    color: var(--text-color-secondary);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    gap: 1rem;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .cta-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: all 0.3s ease;

    &.primary {
      background: var(--primary-color);
      color: white;

      &:hover {
        background: var(--primary-color-dark);
        transform: translateY(-2px);
      }
    }

    &.secondary {
      background: var(--bg-color-secondary);
      color: var(--text-color);
      border: 2px solid var(--border-color);

      &:hover {
        background: var(--hover-color);
        transform: translateY(-2px);
      }
    }
  }

  .hero-image {
    flex: 1;

    img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }
  }

  .popular-recipes-section,
  .features-section {
    padding: 4rem 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .section-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--heading-color);
    margin-bottom: 1rem;
  }

  .section-subtitle {
    font-size: 1.1rem;
    color: var(--text-color-secondary);
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .recipe-card {
    background: var(--bg-color-secondary);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
  }

  .recipe-image {
    position: relative;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.05);
    }
  }

  .recipe-overlay {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    gap: 0.5rem;

    span {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
    }
  }

  .recipe-content {
    padding: 1.5rem;
  }

  .recipe-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 0.5rem;
  }

  .recipe-description {
    color: var(--text-color-secondary);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .recipe-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .recipe-rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    .rating-value {
      font-weight: 600;
      color: var(--text-color);
    }
  }

  .recipe-tags {
    display: flex;
    gap: 0.5rem;
  }

  .recipe-tag {
    background: var(--primary-color-light);
    color: var(--primary-color);
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .section-footer {
    text-align: center;
  }

  .view-more-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2rem;
    background: var(--primary-color);
    color: white;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      background: var(--primary-color-dark);
      transform: translateY(-2px);
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    background: var(--bg-color-secondary);
    padding: 2rem;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--heading-color);
    margin-bottom: 1rem;
  }

  .feature-description {
    color: var(--text-color-secondary);
    line-height: 1.6;
  }
</style>
