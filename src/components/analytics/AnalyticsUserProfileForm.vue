<template>
  <div class="user-profile-form">
    <el-card class="profile-card" shadow="always">
      <template #header>
        <div class="form-header">
          <span class="form-icon">👤</span>
          <span class="form-title">个人信息设置</span>
        </div>
      </template>

      <el-form
        :model="userForm"
        :rules="rules"
        ref="userFormRef"
        label-width="120px"
        class="profile-form"
      >
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>

          <el-form-item label="年龄" prop="age">
            <el-input-number
              v-model="userForm.age"
              :min="1"
              :max="120"
              controls-position="right"
              placeholder="请输入年龄"
            />
            <span class="unit">岁</span>
          </el-form-item>

          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="userForm.gender">
              <el-radio value="male">男性</el-radio>
              <el-radio value="female">女性</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="身高" prop="height">
            <el-input-number
              v-model="userForm.height"
              :min="50"
              :max="250"
              controls-position="right"
              placeholder="请输入身高"
            />
            <span class="unit">cm</span>
          </el-form-item>

          <el-form-item label="体重" prop="weight">
            <el-input-number
              v-model="userForm.weight"
              :min="20"
              :max="200"
              :precision="1"
              :step="0.1"
              controls-position="right"
              placeholder="请输入体重"
            />
            <span class="unit">kg</span>
          </el-form-item>

          <el-form-item label="活动水平" prop="activityLevel">
            <el-select v-model="userForm.activityLevel" placeholder="请选择活动水平">
              <el-option label="轻度活动（久坐办公）" value="low" />
              <el-option label="中度活动（偶尔运动）" value="moderate" />
              <el-option label="高度活动（经常运动）" value="high" />
            </el-select>
          </el-form-item>

          <el-form-item label="健康目标" prop="healthGoals">
            <el-select
              v-model="userForm.healthGoals"
              multiple
              placeholder="请选择健康目标"
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option label="减重" value="减重" />
              <el-option label="增重" value="增重" />
              <el-option label="增肌" value="增肌" />
              <el-option label="改善心血管健康" value="改善心血管健康" />
              <el-option label="增强免疫力" value="增强免疫力" />
              <el-option label="改善消化" value="改善消化" />
              <el-option label="控制血糖" value="控制血糖" />
              <el-option label="降低胆固醇" value="降低胆固醇" />
              <el-option label="抗衰老" value="抗衰老" />
              <el-option label="改善睡眠" value="改善睡眠" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-section">
          <h3 class="section-title">饮食记录</h3>
          <p class="section-desc">请记录您今日的饮食情况，AI将基于此进行营养分析</p>

          <div class="meal-records">
            <div v-for="(meal, index) in userForm.meals" :key="index" class="meal-item">
              <div class="meal-header">
                <h4 class="meal-title">{{ getMealName(meal.type) }}</h4>
                <el-button
                  type="danger"
                  size="small"
                  circle
                  @click="removeMeal(index)"
                  v-if="userForm.meals.length > 1"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <el-form-item :label="`${getMealName(meal.type)}类型`" :prop="`meals.${index}.type`">
                <el-select v-model="meal.type" placeholder="选择餐次">
                  <el-option label="早餐" value="breakfast" />
                  <el-option label="午餐" value="lunch" />
                  <el-option label="晚餐" value="dinner" />
                  <el-option label="加餐" value="snack" />
                </el-select>
              </el-form-item>

              <el-form-item
                :label="`${getMealName(meal.type)}描述`"
                :prop="`meals.${index}.description`"
              >
                <el-input
                  v-model="meal.description"
                  type="textarea"
                  :rows="3"
                  placeholder="请详细描述您的用餐内容，例如：白米饭1碗(150g)、清炒菠菜1盘(200g)、红烧肉3块(100g)、紫菜蛋花汤1碗"
                />
              </el-form-item>
            </div>
          </div>

          <el-button type="primary" plain @click="addMeal" class="add-meal-btn">
            <el-icon><Plus /></el-icon>
            添加餐次
          </el-button>
        </div>

        <div class="form-section">
          <h3 class="section-title">健康状况</h3>

          <el-form-item label="疾病史" prop="medicalConditions">
            <el-select
              v-model="userForm.medicalConditions"
              multiple
              placeholder="请选择相关疾病史（如无则不选）"
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option label="高血压" value="高血压" />
              <el-option label="糖尿病" value="糖尿病" />
              <el-option label="高血脂" value="高血脂" />
              <el-option label="心脏病" value="心脏病" />
              <el-option label="肾脏疾病" value="肾脏疾病" />
              <el-option label="肝脏疾病" value="肝脏疾病" />
              <el-option label="胃肠疾病" value="胃肠疾病" />
              <el-option label="骨质疏松" value="骨质疏松" />
              <el-option label="贫血" value="贫血" />
              <el-option label="甲状腺疾病" value="甲状腺疾病" />
            </el-select>
          </el-form-item>

          <el-form-item label="食物过敏" prop="allergies">
            <el-input
              v-model="userForm.allergies"
              placeholder="请输入过敏食物，多个食物用逗号分隔"
            />
          </el-form-item>

          <el-form-item label="饮食偏好" prop="dietaryPreferences">
            <el-select
              v-model="userForm.dietaryPreferences"
              multiple
              placeholder="请选择饮食偏好"
              collapse-tags
              collapse-tags-tooltip
            >
              <el-option label="素食主义" value="素食主义" />
              <el-option label="低盐饮食" value="低盐饮食" />
              <el-option label="低糖饮食" value="低糖饮食" />
              <el-option label="低脂饮食" value="低脂饮食" />
              <el-option label="无麸质饮食" value="无麸质饮食" />
              <el-option label="地中海饮食" value="地中海饮食" />
              <el-option label="生酮饮食" value="生酮饮食" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            {{ submitting ? '分析中...' : '开始AI营养分析' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Delete, Plus } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'

  // 接口定义
  interface MealRecord {
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    description: string
  }

  interface UserFormData {
    age: number | null
    gender: 'male' | 'female' | ''
    height: number | null
    weight: number | null
    activityLevel: 'low' | 'moderate' | 'high' | ''
    healthGoals: string[]
    meals: MealRecord[]
    medicalConditions: string[]
    allergies: string
    dietaryPreferences: string[]
  }

  // Props & Emits
  interface Props {
    initialData?: Partial<UserFormData>
  }

  interface Emits {
    (_e: 'submit', _data: UserFormData): void
    (_e: 'cancel'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    initialData: () => ({}),
  })

  const emit = defineEmits<Emits>()

  // 响应式数据
  const userFormRef = ref<FormInstance>()
  const submitting = ref(false)

  const userForm = reactive<UserFormData>({
    age: null,
    gender: '',
    height: null,
    weight: null,
    activityLevel: '',
    healthGoals: [],
    meals: [
      { type: 'breakfast', description: '' },
      { type: 'lunch', description: '' },
      { type: 'dinner', description: '' },
    ],
    medicalConditions: [],
    allergies: '',
    dietaryPreferences: [],
    ...props.initialData,
  })

  // 表单验证规则
  const rules: FormRules = {
    age: [
      { required: true, message: '请输入年龄', trigger: 'blur' },
      { type: 'number', min: 1, max: 120, message: '年龄必须在1-120岁之间', trigger: 'blur' },
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    height: [
      { required: true, message: '请输入身高', trigger: 'blur' },
      { type: 'number', min: 50, max: 250, message: '身高必须在50-250cm之间', trigger: 'blur' },
    ],
    weight: [
      { required: true, message: '请输入体重', trigger: 'blur' },
      { type: 'number', min: 20, max: 200, message: '体重必须在20-200kg之间', trigger: 'blur' },
    ],
    activityLevel: [{ required: true, message: '请选择活动水平', trigger: 'change' }],
    healthGoals: [{ type: 'array', min: 1, message: '请至少选择一个健康目标', trigger: 'change' }],
  }

  // 方法
  const getMealName = (type: string) => {
    const names = {
      breakfast: '早餐',
      lunch: '午餐',
      dinner: '晚餐',
      snack: '加餐',
    }
    return names[type as keyof typeof names] || type
  }

  const addMeal = () => {
    userForm.meals.push({
      type: 'snack',
      description: '',
    })
  }

  const removeMeal = (index: number) => {
    if (userForm.meals.length > 1) {
      userForm.meals.splice(index, 1)
    }
  }

  const resetForm = () => {
    ElMessageBox.confirm('确定要重置所有输入吗？', '确认重置', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        userFormRef.value?.resetFields()
        userForm.meals = [
          { type: 'breakfast', description: '' },
          { type: 'lunch', description: '' },
          { type: 'dinner', description: '' },
        ]
        ElMessage.success('表单已重置')
      })
      .catch(() => {
        // 用户取消重置
      })
  }

  const submitForm = async () => {
    console.log('🔥 AnalyticsUserProfileForm.submitForm 被调用')
    if (!userFormRef.value) {
      console.log('❌ userFormRef.value 为空')
      return
    }

    try {
      console.log('🔥 开始表单验证...')
      await userFormRef.value.validate()
      console.log('🔥 表单验证通过')

      // 检查是否至少有一个餐次有描述（可选）
      const hasValidMeal = userForm.meals.some(meal => meal.description.trim())
      if (!hasValidMeal) {
        ElMessage.info('未提供饮食记录，将进行基础营养分析')
      }

      submitting.value = true
      console.log('🔥 准备提交表单数据:', { ...userForm })

      // 提交数据
      emit('submit', { ...userForm })
      console.log('🔥 表单提交事件已触发')
    } catch (error) {
      console.error('❌ 表单验证失败:', error)
      ElMessage.error('请检查表单填写是否完整')
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss" scoped>
  .user-profile-form {
    max-width: 800px;
    margin: 0 auto;

    .profile-card {
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

      .form-header {
        display: flex;
        align-items: center;
        gap: 0.8rem;

        .form-icon {
          font-size: 1.5rem;
        }

        .form-title {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2c3e50;
        }
      }
    }

    .profile-form {
      .form-section {
        margin-bottom: 2rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 15px;
        border-left: 4px solid #3498db;

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          &::before {
            content: '●';
            color: #3498db;
          }
        }

        .section-desc {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
      }

      .unit {
        margin-left: 0.5rem;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .meal-records {
        .meal-item {
          background: white;
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
          border: 1px solid #e9ecef;

          .meal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;

            .meal-title {
              font-size: 1rem;
              font-weight: 600;
              color: #34495e;
              margin: 0;
            }
          }
        }
      }

      .add-meal-btn {
        width: 100%;
        border-style: dashed;
        border-color: #3498db;
        color: #3498db;

        &:hover {
          background: #3498db;
          color: white;
        }
      }

      .form-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e9ecef;

        .el-button {
          min-width: 120px;
          padding: 0.8rem 2rem;
          border-radius: 25px;
          font-weight: 600;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .user-profile-form {
      margin: 0 1rem;

      .profile-form {
        .form-section {
          padding: 1rem;
        }

        .form-actions {
          flex-direction: column;

          .el-button {
            width: 100%;
          }
        }
      }
    }
  }
</style>
