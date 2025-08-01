<template>
  <div style="padding: 20px; background: white; color: black;">
    <h1>最小测试页面</h1>
    <p>如果你能看到这个文字，说明 Vue 路由基本功能正常。</p>
    <div>
      <button @click="count++">点击次数: {{ count }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>