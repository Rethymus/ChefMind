<template>
  <div class="home-view-simple">
    <h1>测试页面</h1>
    <p>如果你能看到这个文字，说明路由和基本渲染是正常的。</p>
    <div class="test-content">
      <el-button type="primary">测试按钮</el-button>
      <el-card class="mt-4">
        <template #header>
          <span>测试卡片</span>
        </template>
        <p>这是一个测试卡片内容</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElCard } from 'element-plus'
</script>

<style scoped>
.home-view-simple {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-content {
  margin-top: 20px;
}

.mt-4 {
  margin-top: 1rem;
}
</style>