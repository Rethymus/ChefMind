<template>
  <div class="cooking-method-selection">
    <h3 class="section-title">
      <el-icon><Dish /></el-icon>
      烹饪方式
    </h3>
    
    <div class="method-selection-container">
      <!-- 无限制选项 -->
      <div class="no-restriction-option">
        <el-checkbox 
          v-model="noRestriction" 
          @change="handleNoRestrictionChange"
          class="no-restriction-checkbox"
        >
          不限制烹饪方式（AI将选择最适合的方式）
        </el-checkbox>
      </div>
      
      <!-- 烹饪方式多选 -->
      <div class="method-grid" :class="{ 'disabled': noRestriction }">
        <el-checkbox-group 
          v-model="selectedMethodsLocal" 
          @change="handleMethodsChange"
          :disabled="noRestriction"
        >
          <el-checkbox 
            v-for="method in cookingMethodsArray" 
            :key="method.value" 
            :label="method.value"
            class="method-checkbox"
          >
            <div class="method-item">
              <el-icon class="method-icon">
                <component :is="method.icon || 'Dish'" />
              </el-icon>
              <span class="method-name">{{ method.label }}</span>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Dish } from '@element-plus/icons-vue'
import type { CookingMethod } from '@/types/recipe'

const props = defineProps({
  cookingMethods: {
    type: Array,
    default: () => []
  },
  selectedMethods: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:methods', 'update:noRestriction'])

// 本地状态
const selectedMethodsLocal = ref<string[]>([])
const noRestriction = ref(false)

// 计算属性：将烹饪方式数据转换为数组格式
const cookingMethodsArray = computed(() => {
  if (!props.cookingMethods || !Array.isArray(props.cookingMethods)) {
    return []
  }
  
  return props.cookingMethods.map((method: any) => {
    if (typeof method === 'string') {
      return { label: method, value: method }
    }
    return method
  })
})

// 监听父组件传入的选中方法变化
watch(() => props.selectedMethods, (newVal) => {
  if (Array.isArray(newVal)) {
    selectedMethodsLocal.value = [...newVal]
  }
}, { immediate: true })

// 处理方法选择变化
const handleMethodsChange = (methods: string[]) => {
  emit('update:methods', methods)
}

// 处理无限制选项变化
const handleNoRestrictionChange = (val: boolean) => {
  noRestriction.value = val
  emit('update:noRestriction', val)
  
  // 如果选择了无限制，清空已选择的方法
  if (val) {
    selectedMethodsLocal.value = []
    emit('update:methods', [])
  }
}

// 组件挂载时初始化
onMounted(() => {
  // 初始化本地选中状态
  if (Array.isArray(props.selectedMethods)) {
    selectedMethodsLocal.value = [...props.selectedMethods]
  }
})
</script>

<style scoped>
.cooking-method-selection {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: var(--el-text-color-primary);
}

.method-selection-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-restriction-option {
  margin-bottom: 0.5rem;
}

.no-restriction-checkbox {
  font-weight: 500;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.method-grid.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.method-checkbox {
  margin-right: 0;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.method-icon {
  font-size: 1.2rem;
  color: var(--el-color-primary);
}

.method-name {
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .method-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>