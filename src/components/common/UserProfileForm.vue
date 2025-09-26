<template>
  <div class="user-profile-form">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" size="default">
      <!-- 基本信息 -->
      <div class="form-section">
        <h3 class="section-title">基本信息</h3>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="formData.gender">
                <el-radio value="male">男</el-radio>
                <el-radio value="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input-number
                v-model="formData.age"
                :min="1"
                :max="120"
                placeholder="请输入年龄"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身高" prop="height">
              <el-input-number
                v-model="formData.height"
                :min="100"
                :max="250"
                placeholder="请输入身高(cm)"
                style="width: 100%"
              >
                <template #append>cm</template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="体重" prop="weight">
              <el-input-number
                v-model="formData.weight"
                :min="20"
                :max="200"
                :precision="1"
                placeholder="请输入体重(kg)"
                style="width: 100%"
              >
                <template #append>kg</template>
              </el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="活动水平" prop="activityLevel">
              <el-select
                v-model="formData.activityLevel"
                placeholder="请选择活动水平"
                style="width: 100%"
              >
                <el-option label="久坐少动" value="sedentary" />
                <el-option label="轻度活动" value="light" />
                <el-option label="中度活动" value="moderate" />
                <el-option label="高度活动" value="active" />
                <el-option label="极高活动" value="veryActive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <!-- 健康目标 -->
      <div class="form-section">
        <h3 class="section-title">健康目标</h3>

        <el-form-item label="主要目标" prop="healthGoals">
          <el-checkbox-group v-model="formData.healthGoals">
            <el-checkbox value="减重">减重</el-checkbox>
            <el-checkbox value="增重">增重</el-checkbox>
            <el-checkbox value="增肌">增肌</el-checkbox>
            <el-checkbox value="保持健康">保持健康</el-checkbox>
            <el-checkbox value="营养均衡">营养均衡</el-checkbox>
            <el-checkbox value="改善体能">改善体能</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="饮食偏好" prop="dietaryRestrictions">
          <el-checkbox-group v-model="formData.dietaryRestrictions">
            <el-checkbox value="素食">素食</el-checkbox>
            <el-checkbox value="纯素食">纯素食</el-checkbox>
            <el-checkbox value="无麸质">无麸质</el-checkbox>
            <el-checkbox value="低钠">低钠</el-checkbox>
            <el-checkbox value="低糖">低糖</el-checkbox>
            <el-checkbox value="低脂">低脂</el-checkbox>
            <el-checkbox value="清真">清真</el-checkbox>
            <el-checkbox value="无">无</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <!-- 今日饮食记录 -->
      <div class="form-section">
        <h3 class="section-title">
          今日饮食记录
          <el-button type="primary" size="small" @click="addMeal" style="margin-left: 1rem">
            添加用餐记录
          </el-button>
        </h3>

        <div v-if="formData.meals.length === 0" class="empty-meals">
          <el-empty description="暂无饮食记录，请添加今日用餐" size="small" />
        </div>

        <div v-else class="meals-list">
          <div v-for="(meal, mealIndex) in formData.meals" :key="mealIndex" class="meal-card">
            <div class="meal-header">
              <div class="meal-info">
                <el-tag :type="getMealTagType(meal.type)" size="small">
                  {{ getMealTypeName(meal.type) }}
                </el-tag>
                <span class="meal-time" v-if="meal.time">{{ meal.time }}</span>
              </div>
              <el-button type="danger" size="small" text @click="removeMeal(mealIndex)">
                删除
              </el-button>
            </div>

            <div class="foods-list">
              <div v-for="(food, foodIndex) in meal.foods" :key="foodIndex" class="food-item">
                <span class="food-name">{{ food.name }}</span>
                <el-tag size="small" :type="getCategoryType(food.category)">
                  {{ getCategoryName(food.category) }}
                </el-tag>
                <span class="food-amount">{{ getAmountName(food.amount) }}</span>
                <el-button
                  type="danger"
                  size="small"
                  text
                  @click="removeFood(mealIndex, foodIndex)"
                >
                  删除
                </el-button>
              </div>
            </div>

            <el-button type="primary" size="small" text @click="addFoodToMeal(mealIndex)">
              添加食物
            </el-button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving"> 保存 </el-button>
      </div>
    </el-form>

    <!-- 添加用餐对话框 -->
    <el-dialog v-model="showMealDialog" title="添加用餐记录" width="600px">
      <el-form :model="newMeal" label-width="80px">
        <el-form-item label="用餐类型">
          <el-select v-model="newMeal.type" placeholder="请选择用餐类型">
            <el-option label="早餐" value="breakfast" />
            <el-option label="午餐" value="lunch" />
            <el-option label="晚餐" value="dinner" />
            <el-option label="加餐" value="snack" />
          </el-select>
        </el-form-item>
        <el-form-item label="用餐时间">
          <el-time-picker v-model="newMeal.time" format="HH:mm" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMealDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddMeal">确定</el-button>
      </template>
    </el-dialog>

    <!-- 添加食物对话框 -->
    <el-dialog v-model="showFoodDialog" title="添加食物" width="500px">
      <el-form :model="newFood" label-width="80px">
        <el-form-item label="食物名称">
          <el-input v-model="newFood.name" placeholder="请输入食物名称" />
        </el-form-item>
        <el-form-item label="食物分类">
          <el-select v-model="newFood.category" placeholder="请选择食物分类">
            <el-option label="主食" value="staple" />
            <el-option label="蔬菜" value="vegetable" />
            <el-option label="肉类" value="meat" />
            <el-option label="水果" value="fruit" />
            <el-option label="零食" value="snack" />
            <el-option label="饮品" value="drink" />
          </el-select>
        </el-form-item>
        <el-form-item label="分量">
          <el-select v-model="newFood.amount" placeholder="请选择分量">
            <el-option label="小份" value="small" />
            <el-option label="中份" value="medium" />
            <el-option label="大份" value="large" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showFoodDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddFood">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'

  // 类型定义
  interface FoodItem {
    name: string
    category: string
    amount: string
  }

  interface MealRecord {
    type: string
    time: string
    foods: FoodItem[]
  }

  interface UserFormData {
    gender: string
    age: number
    height: number
    weight: number
    activityLevel: string
    healthGoals: string[]
    dietaryRestrictions: string[]
    meals: MealRecord[]
  }

  // Props
  interface Props {
    initialData?: any
  }

  const props = withDefaults(defineProps<Props>(), {
    initialData: () => null,
  })

  // Emits
  const emit = defineEmits<{
    save: [data: any]
    cancel: []
  }>()

  // 响应式数据
  const formRef = ref<FormInstance>()
  const saving = ref(false)
  const showMealDialog = ref(false)
  const showFoodDialog = ref(false)
  const currentMealIndex = ref(-1)

  // 表单数据
  const formData: UserFormData = reactive({
    gender: 'female',
    age: 25,
    height: 165,
    weight: 55,
    activityLevel: 'moderate',
    healthGoals: ['保持健康'],
    dietaryRestrictions: ['无'],
    meals: [] as MealRecord[],
  })

  // 新用餐数据
  const newMeal = reactive({
    type: 'breakfast',
    time: '',
    foods: [] as FoodItem[],
  })

  // 新食物数据
  const newFood = reactive({
    name: '',
    category: 'staple', // 添加食物分类
    amount: 'small', // 简化为大中小份量
  })

  // 表单验证规则
  const formRules: FormRules = {
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    age: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 1, max: 120, message: '年龄必须在1-120之间', trigger: 'blur' },
    ],
    height: [
      { required: true, message: '请输入身高', trigger: 'blur' },
      { type: 'number', min: 100, max: 250, message: '身高必须在100-250cm之间', trigger: 'blur' },
    ],
    weight: [
      { required: true, message: '请输入体重', trigger: 'blur' },
      { type: 'number', min: 20, max: 200, message: '体重必须在20-200kg之间', trigger: 'blur' },
    ],
    activityLevel: [{ required: true, message: '请选择活动水平', trigger: 'change' }],
    healthGoals: [{ type: 'array', min: 1, message: '请至少选择一个健康目标', trigger: 'change' }],
  }

  // 监听初始数据变化
  watch(
    () => props.initialData,
    newData => {
      if (newData) {
        Object.assign(formData, {
          gender: newData.gender || 'female',
          age: newData.age || 25,
          height: newData.height || 165,
          weight: newData.weight || 55,
          activityLevel: newData.activityLevel || 'moderate',
          healthGoals: newData.healthGoals || ['保持健康'],
          dietaryRestrictions: newData.dietaryRestrictions || ['无'],
          meals: newData.meals || [],
        })
      }
    },
    { immediate: true }
  )

  // 获取用餐类型名称
  const getMealTypeName = (type: string) => {
    const typeMap = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    }
    return typeMap[type] || type
  }

  // 获取用餐标签类型
  const getMealTagType = (type: string) => {
    const typeMap = {
      breakfast: 'success',
      lunch: 'primary',
      dinner: 'warning',
      snack: 'info',
    }
    return typeMap[type] || 'info'
  }

  // 获取食物分类名称
  const getCategoryName = (category: string) => {
    const categoryMap = {
      staple: '主食',
      vegetable: '蔬菜',
      meat: '肉类',
      fruit: '水果',
      snack: '零食',
      drink: '饮品',
    }
    return categoryMap[category] || category
  }

  // 获取食物分类标签类型
  const getCategoryType = (category: string) => {
    const typeMap = {
      staple: 'warning',
      vegetable: 'success',
      meat: 'danger',
      fruit: 'primary',
      snack: 'info',
      drink: '',
    }
    return typeMap[category] || 'info'
  }

  // 获取分量名称
  const getAmountName = (amount: string) => {
    const amountMap = {
      small: '小份',
      medium: '中份',
      large: '大份',
    }
    return amountMap[amount] || amount
  }

  // 添加用餐
  const addMeal = () => {
    Object.assign(newMeal, {
      type: 'breakfast',
      time: '',
      foods: [],
    })
    showMealDialog.value = true
  }

  // 确认添加用餐
  const confirmAddMeal = () => {
    if (!newMeal.type) {
      ElMessage.warning('请选择用餐类型')
      return
    }

    const timeStr = newMeal.time
      ? new Date(newMeal.time).toLocaleTimeString('zh-CN', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      : ''

    formData.meals.push({
      type: newMeal.type,
      time: timeStr,
      foods: [],
    })

    showMealDialog.value = false
    ElMessage.success('用餐记录添加成功')
  }

  // 删除用餐
  const removeMeal = (mealIndex: number) => {
    formData.meals.splice(mealIndex, 1)
    ElMessage.success('用餐记录删除成功')
  }

  // 添加食物到用餐
  const addFoodToMeal = (mealIndex: number) => {
    currentMealIndex.value = mealIndex
    Object.assign(newFood, {
      name: '',
      category: 'staple',
      amount: 'small',
    })
    showFoodDialog.value = true
  }

  // 确认添加食物
  const confirmAddFood = () => {
    if (!newFood.name.trim()) {
      ElMessage.warning('请输入食物名称')
      return
    }

    if (currentMealIndex.value >= 0 && currentMealIndex.value < formData.meals.length) {
      formData.meals[currentMealIndex.value].foods.push({
        name: newFood.name.trim(),
        category: newFood.category,
        amount: newFood.amount,
      })

      showFoodDialog.value = false
      ElMessage.success('食物添加成功')
    }
  }

  // 删除食物
  const removeFood = (mealIndex: number, foodIndex: number) => {
    formData.meals[mealIndex].foods.splice(foodIndex, 1)
    ElMessage.success('食物删除成功')
  }

  // 处理保存
  const handleSave = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      saving.value = true

      // 验证是否有饮食记录
      if (formData.meals.length === 0) {
        ElMessage.warning('请至少添加一餐饮食记录以进行营养分析')
        saving.value = false
        return
      }

      // 验证饮食记录是否有食物
      const hasValidMeals = formData.meals.some(meal => meal.foods.length > 0)
      if (!hasValidMeals) {
        ElMessage.warning('请为用餐添加具体的食物')
        saving.value = false
        return
      }

      // 清理数据中的"无"选项
      const cleanData = {
        ...formData,
        dietaryRestrictions: formData.dietaryRestrictions.filter(item => item !== '无'),
      }

      emit('save', cleanData)
    } catch (error) {
      console.error('表单验证失败:', error)
      ElMessage.error('请完善必填信息')
    } finally {
      saving.value = false
    }
  }

  // 处理取消
  const handleCancel = () => {
    emit('cancel')
  }
</script>

<style scoped lang="scss">
  @use '@/styles/variables.scss' as *;

  .user-profile-form {
    .form-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;

      .section-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 1.5rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
        display: flex;
        align-items: center;
      }
    }

    .empty-meals {
      text-align: center;
      padding: 2rem;
    }

    .meals-list {
      .meal-card {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid #e2e8f0;

        .meal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;

          .meal-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            .meal-time {
              font-size: 0.875rem;
              color: #64748b;
            }
          }
        }

        .foods-list {
          margin-bottom: 0.75rem;

          .food-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem;
            background: #f8fafc;
            border-radius: 6px;
            margin-bottom: 0.5rem;

            .food-name {
              font-weight: 500;
              color: #2c3e50;
            }

            .food-amount {
              font-size: 0.875rem;
              color: #64748b;
            }
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 2rem;
      border-top: 1px solid #e2e8f0;
      margin-top: 2rem;
    }
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
  }

  :deep(.el-checkbox) {
    margin-right: 0;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    .user-profile-form {
      .form-section {
        padding: 1rem;
      }

      .meal-card {
        .meal-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .food-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
      }
    }
  }
</style>
