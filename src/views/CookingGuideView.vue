<template>
  <div class="cooking-guide-view">
    <!-- 页面头部 -->
    <div class="cooking-header">
      <div class="header-content">
        <div class="recipe-info">
          <h1 class="recipe-title">{{ recipe?.title || recipe?.name }}</h1>
          <div class="recipe-meta">
            <el-tag type="info">{{ recipe?.difficulty }}</el-tag>
            <el-tag type="warning">{{ recipe?.cookingTime }}</el-tag>
            <el-tag type="success">{{ formatServings(recipe?.servings) }}</el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const recipe = ref(null)

const formatServings = (servings: any) => {
  return servings ? `${servings}人份` : '1人份'
}
</script>