<template>
  <div style="padding: 2rem; background: white; margin: 2rem;">
    <h1>简单测试页面</h1>
    <p>如果你能看到这个文字，说明Vue应用正在运行</p>
    <el-button type="primary">测试按钮</el-button>
    <el-icon><Dish /></el-icon>
    <div>当前路由: {{ $route.path }}</div>
  </div>
</template>

<script setup lang="ts">
import { Dish } from '@element-plus/icons-vue'
</script>
