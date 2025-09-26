<template>
  <div class="dietary-restriction-selection">
    <h3 class="section-title">饮食限制</h3>
    <p class="section-desc">选择您的饮食限制或健康目标，我们将为您定制符合要求的食谱</p>

    <div class="restrictions-container">
      <el-tabs v-model="activeTab" class="restriction-tabs">
        <el-tab-pane label="饮食习惯" name="habits">
          <div class="restriction-options">
            <el-checkbox-group v-model="selectedHabits" @change="emitChanges">
              <el-checkbox v-for="item in dietaryHabits" :key="item.id" :label="item.id">
                <div class="option-content">
                  <span class="option-name">{{ item.name }}</span>
                  <span class="option-desc">{{ item.description }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-tab-pane>

        <el-tab-pane label="健康目标" name="goals">
          <div class="restriction-options">
            <el-checkbox-group v-model="selectedGoals" @change="emitChanges">
              <el-checkbox v-for="item in healthGoals" :key="item.id" :label="item.id">
                <div class="option-content">
                  <span class="option-name">{{ item.name }}</span>
                  <span class="option-desc">{{ item.description }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-tab-pane>

        <el-tab-pane label="过敏原" name="allergies">
          <div class="restriction-options">
            <el-checkbox-group v-model="selectedAllergies" @change="emitChanges">
              <el-checkbox v-for="item in allergens" :key="item.id" :label="item.id">
                <div class="option-content">
                  <span class="option-name">{{ item.name }}</span>
                  <span class="option-desc">{{ item.description }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-tab-pane>

        <el-tab-pane label="口味偏好" name="flavors">
          <div class="restriction-options">
            <el-checkbox-group v-model="selectedFlavors" @change="emitChanges">
              <el-checkbox v-for="item in flavorPreferences" :key="item.id" :label="item.id">
                <div class="option-content">
                  <span class="option-name">{{ item.name }}</span>
                  <span class="option-desc">{{ item.description }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <div class="selected-restrictions">
      <h4>已选择的限制条件</h4>
      <div class="selected-tags">
        <template v-if="allSelectedRestrictions.length > 0">
          <el-tag
            v-for="item in allSelectedRestrictions"
            :key="item.id"
            closable
            @close="removeRestriction(item)"
            :type="getTagType(item.type)"
            effect="dark"
            class="restriction-tag"
          >
            {{ item.name }}
          </el-tag>
        </template>
        <div v-else class="no-selections">未选择任何限制条件，将提供标准食谱</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  interface RestrictionItem {
    id: string
    name: string
    description: string
    type: string
  }

  const props = defineProps<{
    initialDietaryRestrictions?: string[]
    initialHealthGoals?: string[]
    initialAllergies?: string[]
    initialFlavors?: string[]
  }>()

  const emit = defineEmits<{
    (_e: 'update:dietaryRestrictions', _value: string[]): void
    (_e: 'update:healthGoals', _value: string[]): void
    (_e: 'update:allergies', _value: string[]): void
    (_e: 'update:flavors', _value: string[]): void
  }>()

  const activeTab = ref('habits')
  const selectedHabits = ref<string[]>(props.initialDietaryRestrictions || [])
  const selectedGoals = ref<string[]>(props.initialHealthGoals || [])
  const selectedAllergies = ref<string[]>(props.initialAllergies || [])
  const selectedFlavors = ref<string[]>(props.initialFlavors || [])

  // 饮食习惯选项
  const dietaryHabits: RestrictionItem[] = [
    { id: 'vegetarian', name: '素食', description: '不含肉类，但可能含蛋奶', type: 'habits' },
    { id: 'vegan', name: '纯素', description: '不含任何动物产品', type: 'habits' },
    { id: 'pescatarian', name: '鱼素食', description: '含鱼但不含其他肉类', type: 'habits' },
    { id: 'gluten-free', name: '无麸质', description: '不含小麦、大麦等麸质', type: 'habits' },
    { id: 'dairy-free', name: '无乳制品', description: '不含牛奶、奶酪等乳制品', type: 'habits' },
    { id: 'keto', name: '生酮饮食', description: '高脂肪、适量蛋白质、极低碳水', type: 'habits' },
    { id: 'paleo', name: '古饮食', description: '仅含原始人类可获取的食物', type: 'habits' },
    { id: 'halal', name: '清真', description: '符合伊斯兰教饮食规定', type: 'habits' },
    { id: 'kosher', name: '犹太洁食', description: '符合犹太教饮食规定', type: 'habits' },
    { id: 'low-fodmap', name: '低FODMAP', description: '减少易发酵碳水化合物', type: 'habits' },
    { id: 'raw-food', name: '生食', description: '食物不经高温烹饪', type: 'habits' },
    {
      id: 'mediterranean',
      name: '地中海饮食',
      description: '富含橄榄油、鱼类和蔬果',
      type: 'habits',
    },
    { id: 'dash', name: 'DASH饮食', description: '控制高血压的饮食方式', type: 'habits' },
    { id: 'whole30', name: 'Whole30', description: '30天全食物重置计划', type: 'habits' },
  ]

  // 健康目标选项
  const healthGoals: RestrictionItem[] = [
    { id: 'low-calorie', name: '低卡路里', description: '适合减重和控制体重', type: 'goals' },
    { id: 'high-protein', name: '高蛋白', description: '适合增肌和运动恢复', type: 'goals' },
    { id: 'low-carb', name: '低碳水', description: '减少碳水化合物摄入', type: 'goals' },
    { id: 'low-fat', name: '低脂肪', description: '减少脂肪摄入', type: 'goals' },
    { id: 'low-sodium', name: '低钠', description: '适合高血压患者', type: 'goals' },
    { id: 'high-fiber', name: '高纤维', description: '促进消化健康', type: 'goals' },
    { id: 'diabetic', name: '糖尿病友好', description: '控制血糖波动', type: 'goals' },
    { id: 'heart-healthy', name: '心脏健康', description: '有益心血管健康', type: 'goals' },
    { id: 'anti-inflammatory', name: '抗炎', description: '减少炎症反应', type: 'goals' },
    { id: 'immune-boosting', name: '增强免疫', description: '提高免疫系统功能', type: 'goals' },
    { id: 'bone-health', name: '骨骼健康', description: '增强骨密度和骨骼强度', type: 'goals' },
    { id: 'energy-boost', name: '提升能量', description: '增加日常活力和精力', type: 'goals' },
    { id: 'gut-health', name: '肠道健康', description: '改善肠道菌群和消化', type: 'goals' },
    { id: 'skin-health', name: '皮肤健康', description: '改善皮肤状态和光泽', type: 'goals' },
    { id: 'brain-health', name: '脑部健康', description: '促进认知功能和脑健康', type: 'goals' },
    { id: 'detox', name: '排毒', description: '帮助身体清除毒素', type: 'goals' },
    { id: 'muscle-recovery', name: '肌肉恢复', description: '加速运动后肌肉恢复', type: 'goals' },
  ]

  // 过敏原选项
  const allergens: RestrictionItem[] = [
    { id: 'peanut', name: '花生', description: '避免所有花生及花生制品', type: 'allergies' },
    { id: 'tree-nuts', name: '坚果', description: '避免杏仁、核桃等坚果', type: 'allergies' },
    { id: 'shellfish', name: '贝类', description: '避免虾、蟹、贝等海鲜', type: 'allergies' },
    { id: 'fish', name: '鱼类', description: '避免所有鱼类', type: 'allergies' },
    { id: 'egg', name: '鸡蛋', description: '避免鸡蛋及含蛋制品', type: 'allergies' },
    { id: 'soy', name: '大豆', description: '避免豆腐、豆浆等豆制品', type: 'allergies' },
    { id: 'wheat', name: '小麦', description: '避免面包、面条等小麦制品', type: 'allergies' },
    { id: 'milk', name: '牛奶', description: '避免牛奶及奶制品', type: 'allergies' },
    { id: 'sesame', name: '芝麻', description: '避免芝麻及芝麻制品', type: 'allergies' },
    { id: 'sulfites', name: '亚硫酸盐', description: '避免某些干果、葡萄酒等', type: 'allergies' },
    { id: 'celery', name: '芹菜', description: '避免芹菜及芹菜籽', type: 'allergies' },
    { id: 'mustard', name: '芥末', description: '避免芥末及芥末籽', type: 'allergies' },
    { id: 'lupin', name: '羽扇豆', description: '避免羽扇豆及其制品', type: 'allergies' },
    { id: 'molluscs', name: '软体动物', description: '避免贝类、章鱼、鱿鱼等', type: 'allergies' },
    { id: 'crustaceans', name: '甲壳类', description: '避免虾、蟹、龙虾等', type: 'allergies' },
    { id: 'corn', name: '玉米', description: '避免玉米及玉米制品', type: 'allergies' },
    {
      id: 'nightshades',
      name: '茄科植物',
      description: '避免番茄、茄子、辣椒等',
      type: 'allergies',
    },
  ]

  // 口味偏好选项
  const flavorPreferences: RestrictionItem[] = [
    { id: 'spicy', name: '麻辣', description: '喜欢辣味食物', type: 'flavors' },
    { id: 'sweet', name: '甜味', description: '偏好甜味食物', type: 'flavors' },
    { id: 'sour', name: '酸味', description: '偏好酸味食物', type: 'flavors' },
    { id: 'savory', name: '鲜味', description: '偏好鲜味食物', type: 'flavors' },
    { id: 'bitter', name: '苦味', description: '接受苦味食物', type: 'flavors' },
    { id: 'light', name: '清淡', description: '偏好清淡口味', type: 'flavors' },
    { id: 'rich', name: '浓郁', description: '偏好浓郁口味', type: 'flavors' },
    { id: 'aromatic', name: '香气浓郁', description: '偏好香气浓郁的食物', type: 'flavors' },
    { id: 'crispy', name: '酥脆', description: '偏好酥脆口感', type: 'flavors' },
    { id: 'tender', name: '软嫩', description: '偏好软嫩口感', type: 'flavors' },
    { id: 'umami', name: '鲜味', description: '偏好鲜味浓郁的食物', type: 'flavors' },
    { id: 'smoky', name: '烟熏味', description: '偏好烟熏风味', type: 'flavors' },
    { id: 'herbal', name: '草本香', description: '偏好草本香料风味', type: 'flavors' },
    { id: 'citrusy', name: '柑橘味', description: '偏好柑橘类水果风味', type: 'flavors' },
    { id: 'garlic', name: '蒜香', description: '偏好大蒜风味', type: 'flavors' },
    { id: 'ginger', name: '姜味', description: '偏好生姜风味', type: 'flavors' },
    { id: 'fermented', name: '发酵味', description: '偏好发酵食品风味', type: 'flavors' },
    { id: 'nutty', name: '坚果香', description: '偏好坚果风味', type: 'flavors' },
  ]

  // 所有选项的映射
  const allOptions = computed(() => {
    const map = new Map<string, RestrictionItem>()

    dietaryHabits.forEach(item => map.set(item.id, item))
    healthGoals.forEach(item => map.set(item.id, item))
    allergens.forEach(item => map.set(item.id, item))
    flavorPreferences.forEach(item => map.set(item.id, item))

    return map
  })

  // 所有已选择的限制条件
  const allSelectedRestrictions = computed(() => {
    const allSelected = [
      ...selectedHabits.value,
      ...selectedGoals.value,
      ...selectedAllergies.value,
      ...selectedFlavors.value,
    ]

    return allSelected.map(id => allOptions.value.get(id)!).filter(Boolean)
  })

  // 根据类型获取标签样式
  const getTagType = (type: string): 'success' | 'primary' | 'danger' | 'warning' | 'info' => {
    switch (type) {
      case 'habits':
        return 'success'
      case 'goals':
        return 'primary'
      case 'allergies':
        return 'danger'
      case 'flavors':
        return 'warning'
      default:
        return 'info'
    }
  }

  // 移除限制条件
  const removeRestriction = (item: RestrictionItem) => {
    switch (item.type) {
      case 'habits':
        selectedHabits.value = selectedHabits.value.filter(id => id !== item.id)
        break
      case 'goals':
        selectedGoals.value = selectedGoals.value.filter(id => id !== item.id)
        break
      case 'allergies':
        selectedAllergies.value = selectedAllergies.value.filter(id => id !== item.id)
        break
      case 'flavors':
        selectedFlavors.value = selectedFlavors.value.filter(id => id !== item.id)
        break
    }

    emitChanges()
  }

  // 发出变更事件
  const emitChanges = () => {
    emit('update:dietaryRestrictions', selectedHabits.value)
    emit('update:healthGoals', selectedGoals.value)
    emit('update:allergies', selectedAllergies.value)
    emit('update:flavors', selectedFlavors.value)
  }

  // 监听初始值变化
  watch(
    () => props.initialDietaryRestrictions,
    newVal => {
      if (newVal) selectedHabits.value = newVal
    },
    { deep: true }
  )

  watch(
    () => props.initialHealthGoals,
    newVal => {
      if (newVal) selectedGoals.value = newVal
    },
    { deep: true }
  )

  watch(
    () => props.initialAllergies,
    newVal => {
      if (newVal) selectedAllergies.value = newVal
    },
    { deep: true }
  )

  watch(
    () => props.initialFlavors,
    newVal => {
      if (newVal) selectedFlavors.value = newVal
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .dietary-restriction-selection {
    margin-bottom: 2rem;

    .section-title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: var(--el-text-color-primary);
    }

    .section-desc {
      color: var(--el-text-color-secondary);
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
    }

    .restrictions-container {
      margin-bottom: 1.5rem;
      border: 1px solid var(--el-border-color);
      border-radius: 8px;
      padding: 1rem;
      background-color: var(--el-bg-color-page);
    }

    .restriction-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;

      .el-checkbox {
        height: auto;
        margin-right: 0;
        margin-bottom: 0;
        padding: 0.75rem;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        transition: all 0.3s;

        &:hover {
          background-color: var(--el-fill-color-light);
        }

        &.is-checked {
          background-color: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary-light-5);
        }

        .option-content {
          display: flex;
          flex-direction: column;
          margin-left: 0.5rem;

          .option-name {
            font-weight: 500;
            margin-bottom: 0.25rem;
          }

          .option-desc {
            font-size: 0.85rem;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }

    .selected-restrictions {
      h4 {
        font-size: 1rem;
        margin-bottom: 0.75rem;
        color: var(--el-text-color-primary);
      }

      .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        min-height: 40px;

        .restriction-tag {
          margin-right: 0;
        }

        .no-selections {
          color: var(--el-text-color-secondary);
          font-style: italic;
          padding: 0.5rem 0;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .dietary-restriction-selection {
      .restriction-options {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
