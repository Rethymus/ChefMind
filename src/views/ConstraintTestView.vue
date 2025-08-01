<template>
  <div class="constraint-test">
    <h1>约束条件测试</h1>
    
    <!-- 当前约束条件状态 -->
    <div class="debug-panel">
      <h3>当前约束条件:</h3>
      <pre>{{ JSON.stringify(constraints, null, 2) }}</pre>
    </div>
    
    <!-- 约束条件选择组件 -->
    <ConstraintSelection
      :constraints="constraints"
      @constraint-update="updateConstraints"
    />
    
    <!-- 操作日志 -->
    <div class="log-panel">
      <h3>操作日志:</h3>
      <div class="log-items">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Constraints } from '@/types/recipe'
import ConstraintSelection from '@/components/recipe/ConstraintSelection.vue'

// 约束条件状态
const constraints = reactive<Constraints>({
  cookingTime: null,
  difficulty: null,
  servings: null,
  dietaryRestrictions: [],
  excludeIngredients: [],
  // 兼容字段
  time: null,
  people: null,
  taste: null
})

// 操作日志
const logs = ref<string[]>([])

// 更新约束条件
const updateConstraints = (newConstraints: Constraints) => {
  const timestamp = new Date().toLocaleTimeString()
  
  // 记录变化
  const changes: string[] = []
  Object.keys(newConstraints).forEach(key => {
    const oldVal = (constraints as any)[key]
    const newVal = (newConstraints as any)[key]
    if (oldVal !== newVal) {
      changes.push(`${key}: ${oldVal} → ${newVal}`)
    }
  })
  
  if (changes.length > 0) {
    logs.value.unshift(`[${timestamp}] ${changes.join(', ')}`)
    if (logs.value.length > 10) {
      logs.value = logs.value.slice(0, 10)
    }
  }
  
  // 更新状态
  Object.assign(constraints, newConstraints)
}

// 初始日志
logs.value.push('[页面加载] 约束条件测试页面已加载')
</script>

<style scoped>
.constraint-test {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.debug-panel, .log-panel {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
}

.debug-panel pre {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
}

.log-items {
  max-height: 300px;
  overflow-y: auto;
}

.log-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

h3 {
  color: #34495e;
  margin-bottom: 12px;
}
</style>
