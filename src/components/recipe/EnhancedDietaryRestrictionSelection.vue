<template>
  <div class="dietary-restriction-selection">
    <h3 class="section-title">
      <el-icon><Warning /></el-icon>
      饮食限制与偏好
    </h3>
    
    <div class="dietary-tabs">
      <div class="tab-buttons">
        <el-button-group>
          <el-button 
            :type="activeTab === 'restrictions' ? 'primary' : 'default'"
            @click="activeTab = 'restrictions'"
          >
            饮食限制
          </el-button>
          <el-button 
            :type="activeTab === 'health' ? 'primary' : 'default'"
            @click="activeTab = 'health'"
          >
            健康目标
          </el-button>
          <el-button 
            :type="activeTab === 'allergies' ? 'primary' : 'default'"
            @click="activeTab = 'allergies'"
          >
            过敏原
          </el-button>
          <el-button 
            :type="activeTab === 'flavors' ? 'primary' : 'default'"
            @click="activeTab = 'flavors'"
          >
            口味偏好
          </el-button>
        </el-button-group>
      </div>
      
      <!-- 饮食限制选项 -->
      <div v-if="activeTab === 'restrictions'" class="tab-content">
        <div class="option-grid">
          <el-checkbox 
            v-for="restriction in dietaryRestrictions" 
            :key="restriction.value"
            v-model="selectedRestrictions"
            :label="restriction.value"
            @change="updateDietaryRestrictions"
          >
            <div class="option-item">
              <span class="option-label">{{ restriction.label }}</span>
              <el-tooltip 
                v-if="restriction.description" 
                :content="restriction.description" 
                placement="top"
              >
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </el-checkbox>
        </div>
      </div>
      
      <!-- 健康目标选项 -->
      <div v-if="activeTab === 'health'" class="tab-content">
        <div class="option-grid">
          <el-checkbox 
            v-for="goal in healthGoals" 
            :key="goal.value"
            v-model="selectedHealthGoals"
            :label="goal.value"
            @change="updateHealthGoals"
          >
            <div class="option-item">
              <span class="option-label">{{ goal.label }}</span>
              <el-tooltip 
                v-if="goal.description" 
                :content="goal.description" 
                placement="top"
              >
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </el-checkbox>
        </div>
      </div>
      
      <!-- 过敏原选项 -->
      <div v-if="activeTab === 'allergies'" class="tab-content">
        <div class="option-grid">
          <el-checkbox 
            v-for="allergy in allergies" 
            :key="allergy.value"
            v-model="selectedAllergies"
            :label="allergy.value"
            @change="updateAllergies"
          >
            <div class="option-item">
              <span class="option-label">{{ allergy.label }}</span>
              <el-tooltip 
                v-if="allergy.description" 
                :content="allergy.description" 
                placement="top"
              >
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
          </el-checkbox>
        </div>
        
        <!-- 自定义过敏原输入 -->
        <div class="custom-allergy-input">
          <el-input
            v-model="customAllergy"
            placeholder="输入其他过敏原"
            size="default"
            @keyup.enter="addCustomAllergy"
          >
            <template #append>
              <el-button @click="addCustomAllergy">添加</el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <!-- 口味偏好选项 -->
      <div v-if="activeTab === 'flavors'" class="tab-content">
        <div class="option-grid">
          <el-checkbox 
            v-for="flavor in flavors" 
            :key="flavor.value"
            v-model="selectedFlavors"
            :label="flavor.value"
            @change="updateFlavors"
          >
            <div class="option-item">
              <span class="option-label">{{ flavor.label }}</span>
            </div>
          </el-checkbox>
        </div>
        
        <!-- 辣度选择 -->
        <div class="flavor-slider">
          <div class="slider-label">辣度偏好</div>
          <div class="slider-container">
            <div class="slider-value-label">{{ spiceLevelLabel }}</div>
            <el-slider
              v-model="spiceLevel"
              :min="0"
              :max="4"
              :format-tooltip="formatSpiceLevel"
              @change="updateSpiceLevel"
            />
          </div>
        </div>
        
        <!-- 甜度选择 -->
        <div class="flavor-slider">
          <div class="slider-label">甜度偏好</div>
          <div class="slider-container">
            <div class="slider-value-label">{{ sweetnessLevelLabel }}</div>
            <el-slider
              v-model="sweetnessLevel"
              :min="0"
              :max="4"
              :format-tooltip="formatSweetnessLevel"
              @change="updateSweetnessLevel"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已选择的标签显示 -->
    <div class="selected-tags" v-if="hasSelectedOptions">
      <div class="tags-label">已选择：</div>
      <div class="tags-container">
        <el-tag
          v-for="tag in selectedTags"
          :key="tag.value"
          closable
          @close="removeTag(tag)"
          class="restriction-tag"
          :type="getTagType(tag.category)"
        >
          {{ tag.label }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Warning, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  initialDietaryRestrictions: {
    type: Array,
    default: () => []
  },
  initialHealthGoals: {
    type: Array,
    default: () => []
  },
  initialAllergies: {
    type: Array,
    default: () => []
  },
  initialFlavors: {
    type: Array,
    default: () => []
  },
  initialSpiceLevel: {
    type: String,
    default: 'medium'
  },
  initialSweetnessLevel: {
    type: String,
    default: 'medium'
  }
})

const emit = defineEmits([
  'update:dietaryRestrictions',
  'update:healthGoals',
  'update:allergies',
  'update:flavors',
  'update:spiceLevel',
  'update:sweetnessLevel'
])

// 本地状态
const activeTab = ref('restrictions')
const selectedRestrictions = ref<string[]>([])
const selectedHealthGoals = ref<string[]>([])
const selectedAllergies = ref<string[]>([])
const selectedFlavors = ref<string[]>([])
const customAllergy = ref('')
const spiceLevel = ref(2) // 0-4 范围
const sweetnessLevel = ref(2) // 0-4 范围

// 饮食限制选项
const dietaryRestrictions = [
  { label: '素食', value: 'vegetarian', description: '不含肉类，但可能含蛋和奶制品' },
  { label: '纯素', value: 'vegan', description: '不含任何动物产品' },
  { label: '无麸质', value: 'gluten-free', description: '不含小麦、大麦、黑麦等谷物中的麸质' },
  { label: '低碳水', value: 'low-carb', description: '减少碳水化合物的摄入' },
  { label: '生酮饮食', value: 'keto', description: '高脂肪、适量蛋白质、极低碳水化合物' },
  { label: '无乳糖', value: 'lactose-free', description: '不含乳糖' },
  { label: '低钠', value: 'low-sodium', description: '减少盐分和钠的摄入' },
  { label: '清真', value: 'halal', description: '符合伊斯兰教饮食规定' },
  { label: '犹太洁食', value: 'kosher', description: '符合犹太教饮食规定' },
  { label: '无添加糖', value: 'no-added-sugar', description: '不添加额外的糖分' },
  { label: '无酒精', value: 'alcohol-free', description: '不含酒精成分' },
  { label: '无咖啡因', value: 'caffeine-free', description: '不含咖啡因' },
  { label: '低FODMAP', value: 'low-fodmap', description: '减少发酵性寡糖、双糖、单糖和多元醇' },
  { label: '无辣', value: 'no-spicy', description: '不含辣椒或辛辣调味料' },
  { label: '无蒜', value: 'no-garlic', description: '不含大蒜' },
  { label: '无葱', value: 'no-onion', description: '不含洋葱' }
]

// 健康目标选项
const healthGoals = [
  { label: '减肥', value: 'weight-loss', description: '低热量、低脂肪的食谱' },
  { label: '增肌', value: 'muscle-gain', description: '高蛋白质的食谱' },
  { label: '控制血糖', value: 'blood-sugar-control', description: '低血糖指数的食谱' },
  { label: '心脏健康', value: 'heart-healthy', description: '低饱和脂肪、高不饱和脂肪的食谱' },
  { label: '增强免疫力', value: 'immune-boosting', description: '富含抗氧化剂和维生素的食谱' },
  { label: '改善消化', value: 'digestive-health', description: '富含膳食纤维的食谱' },
  { label: '抗炎', value: 'anti-inflammatory', description: '减少炎症反应的食谱' },
  { label: '增强能量', value: 'energy-boosting', description: '提供持久能量的食谱' },
  { label: '改善睡眠', value: 'better-sleep', description: '有助于睡眠的食谱' },
  { label: '孕期营养', value: 'pregnancy-nutrition', description: '适合孕妇的营养均衡食谱' },
  { label: '儿童友好', value: 'kid-friendly', description: '适合儿童的营养均衡食谱' },
  { label: '老年营养', value: 'senior-nutrition', description: '适合老年人的易消化食谱' }
]

// 过敏原选项
const allergies = [
  { label: '花生', value: 'peanuts', description: '不含花生及其制品' },
  { label: '坚果', value: 'tree-nuts', description: '不含杏仁、核桃、腰果等坚果' },
  { label: '乳制品', value: 'dairy', description: '不含牛奶及其制品' },
  { label: '鸡蛋', value: 'eggs', description: '不含鸡蛋及其制品' },
  { label: '小麦', value: 'wheat', description: '不含小麦及其制品' },
  { label: '大豆', value: 'soy', description: '不含大豆及其制品' },
  { label: '鱼类', value: 'fish', description: '不含鱼类及其制品' },
  { label: '贝类', value: 'shellfish', description: '不含虾、蟹、贝等海鲜' },
  { label: '芝麻', value: 'sesame', description: '不含芝麻及其制品' },
  { label: '芹菜', value: 'celery', description: '不含芹菜及其制品' },
  { label: '芥末', value: 'mustard', description: '不含芥末及其制品' },
  { label: '硫化物', value: 'sulfites', description: '不含亚硫酸盐防腐剂' }
]

// 口味偏好选项
const flavors = [
  { label: '酸味', value: 'sour' },
  { label: '甜味', value: 'sweet' },
  { label: '咸味', value: 'salty' },
  { label: '辣味', value: 'spicy' },
  { label: '苦味', value: 'bitter' },
  { label: '鲜味', value: 'umami' },
  { label: '清淡', value: 'light' },
  { label: '浓郁', value: 'rich' },
  { label: '香草风味', value: 'herbal' },
  { label: '烟熏风味', value: 'smoky' },
  { label: '柑橘风味', value: 'citrusy' },
  { label: '奶油风味', value: 'creamy' },
  { label: '酱油风味', value: 'soy-sauce' },
  { label: '咖喱风味', value: 'curry' },
  { label: '五香风味', value: 'five-spice' },
  { label: '椰香风味', value: 'coconut' }
]

// 辣度标签
const spiceLevelLabel = computed(() => {
  const levels = ['不辣', '微辣', '中辣', '辣', '超辣']
  return levels[spiceLevel.value]
})

// 甜度标签
const sweetnessLevelLabel = computed(() => {
  const levels = ['不甜', '微甜', '中甜', '甜', '超甜']
  return levels[sweetnessLevel.value]
})

// 格式化辣度提示
const formatSpiceLevel = (val: number) => {
  const levels = ['不辣', '微辣', '中辣', '辣', '超辣']
  return levels[val]
}

// 格式化甜度提示
const formatSweetnessLevel = (val: number) => {
  const levels = ['不甜', '微甜', '中甜', '甜', '超甜']
  return levels[val]
}

// 计算已选择的所有标签
const selectedTags = computed(() => {
  const tags = []
  
  // 添加饮食限制标签
  for (const restriction of selectedRestrictions.value) {
    const found = dietaryRestrictions.find(item => item.value === restriction)
    if (found) {
      tags.push({
        label: found.label,
        value: found.value,
        category: 'restriction'
      })
    }
  }
  
  // 添加健康目标标签
  for (const goal of selectedHealthGoals.value) {
    const found = healthGoals.find(item => item.value === goal)
    if (found) {
      tags.push({
        label: found.label,
        value: found.value,
        category: 'health'
      })
    }
  }
  
  // 添加过敏原标签
  for (const allergy of selectedAllergies.value) {
    const found = allergies.find(item => item.value === allergy)
    if (found) {
      tags.push({
        label: found.label,
        value: found.value,
        category: 'allergy'
      })
    } else if (!allergy.includes('-custom')) {
      // 自定义过敏原
      tags.push({
        label: allergy.replace('-custom', ''),
        value: allergy,
        category: 'allergy'
      })
    }
  }
  
  // 添加口味偏好标签
  for (const flavor of selectedFlavors.value) {
    const found = flavors.find(item => item.value === flavor)
    if (found) {
      tags.push({
        label: found.label,
        value: found.value,
        category: 'flavor'
      })
    }
  }
  
  return tags
})

// 是否有选择的选项
const hasSelectedOptions = computed(() => {
  return selectedTags.value.length > 0
})

// 获取标签类型
const getTagType = (category: string) => {
  switch (category) {
    case 'restriction':
      return 'danger'
    case 'health':
      return 'success'
    case 'allergy':
      return 'warning'
    case 'flavor':
      return 'info'
    default:
      return 'info' // 默认使用 info 类型而不是空字符串
  }
}

// 更新饮食限制
const updateDietaryRestrictions = () => {
  emit('update:dietaryRestrictions', selectedRestrictions.value)
}

// 更新健康目标
const updateHealthGoals = () => {
  emit('update:healthGoals', selectedHealthGoals.value)
}

// 更新过敏原
const updateAllergies = () => {
  emit('update:allergies', selectedAllergies.value)
}

// 更新口味偏好
const updateFlavors = () => {
  emit('update:flavors', selectedFlavors.value)
}

// 更新辣度
const updateSpiceLevel = (val: number) => {
  const spiceLevels = ['none', 'mild', 'medium', 'hot', 'extra-hot']
  emit('update:spiceLevel', spiceLevels[val])
}

// 更新甜度
const updateSweetnessLevel = (val: number) => {
  const sweetnessLevels = ['none', 'slight', 'medium', 'sweet', 'very-sweet']
  emit('update:sweetnessLevel', sweetnessLevels[val])
}

// 添加自定义过敏原
const addCustomAllergy = () => {
  if (!customAllergy.value.trim()) {
    return
  }
  
  const allergyName = customAllergy.value.trim()
  const allergyValue = `${allergyName}-custom`
  
  // 检查是否已存在
  if (selectedAllergies.value.includes(allergyValue)) {
    ElMessage.warning(`已添加过 ${allergyName} 过敏原`)
    return
  }
  
  selectedAllergies.value.push(allergyValue)
  updateAllergies()
  customAllergy.value = ''
  ElMessage.success(`已添加 ${allergyName} 过敏原`)
}

// 移除标签
const removeTag = (tag: any) => {
  switch (tag.category) {
    case 'restriction':
      selectedRestrictions.value = selectedRestrictions.value.filter(item => item !== tag.value)
      updateDietaryRestrictions()
      break
    case 'health':
      selectedHealthGoals.value = selectedHealthGoals.value.filter(item => item !== tag.value)
      updateHealthGoals()
      break
    case 'allergy':
      selectedAllergies.value = selectedAllergies.value.filter(item => item !== tag.value)
      updateAllergies()
      break
    case 'flavor':
      selectedFlavors.value = selectedFlavors.value.filter(item => item !== tag.value)
      updateFlavors()
      break
  }
}

// 监听初始值变化
watch(() => props.initialDietaryRestrictions, (newVal) => {
  if (Array.isArray(newVal)) {
    selectedRestrictions.value = [...newVal]
  }
}, { immediate: true })

watch(() => props.initialHealthGoals, (newVal) => {
  if (Array.isArray(newVal)) {
    selectedHealthGoals.value = [...newVal]
  }
}, { immediate: true })

watch(() => props.initialAllergies, (newVal) => {
  if (Array.isArray(newVal)) {
    selectedAllergies.value = [...newVal]
  }
}, { immediate: true })

watch(() => props.initialFlavors, (newVal) => {
  if (Array.isArray(newVal)) {
    selectedFlavors.value = [...newVal]
  }
}, { immediate: true })

watch(() => props.initialSpiceLevel, (newVal) => {
  const spiceLevels = ['none', 'mild', 'medium', 'hot', 'extra-hot']
  const index = spiceLevels.indexOf(newVal)
  if (index !== -1) {
    spiceLevel.value = index
  } else {
    spiceLevel.value = 2 // 默认中辣
  }
}, { immediate: true })

watch(() => props.initialSweetnessLevel, (newVal) => {
  const sweetnessLevels = ['none', 'slight', 'medium', 'sweet', 'very-sweet']
  const index = sweetnessLevels.indexOf(newVal)
  if (index !== -1) {
    sweetnessLevel.value = index
  } else {
    sweetnessLevel.value = 2 // 默认中甜
  }
}, { immediate: true })

// 组件挂载时初始化
onMounted(() => {
  // 初始化本地选中状态
  if (Array.isArray(props.initialDietaryRestrictions)) {
    selectedRestrictions.value = [...props.initialDietaryRestrictions]
  }
  
  if (Array.isArray(props.initialHealthGoals)) {
    selectedHealthGoals.value = [...props.initialHealthGoals]
  }
  
  if (Array.isArray(props.initialAllergies)) {
    selectedAllergies.value = [...props.initialAllergies]
  }
  
  if (Array.isArray(props.initialFlavors)) {
    selectedFlavors.value = [...props.initialFlavors]
  }
})
</script>

<style scoped>
.dietary-restriction-selection {
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

.dietary-tabs {
  margin-bottom: 1rem;
}

.tab-buttons {
  margin-bottom: 1rem;
}

.tab-content {
  padding: 1rem;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-label {
  font-size: 0.95rem;
}

.info-icon {
  font-size: 1rem;
  color: var(--el-color-info);
  cursor: help;
}

.custom-allergy-input {
  margin-top: 1rem;
}

.flavor-slider {
  margin-top: 1.5rem;
  padding: 0 0.5rem;
}

.slider-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-value-label {
  font-size: 0.9rem;
  color: var(--el-color-primary);
  font-weight: 500;
}

.selected-tags {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tags-label {
  font-weight: 500;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.restriction-tag {
  margin-right: 0;
}

@media (max-width: 768px) {
  .option-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .tab-buttons {
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 0.5rem;
  }
}
</style>