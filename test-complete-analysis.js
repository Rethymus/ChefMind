// 测试营养分析完整流程
const testCompleteAnalysis = () => {
  console.log('🧪 测试营养分析完整流程...\n')

  // 模拟有完整个人信息但无饮食记录的用户
  const userProfileWithoutMeals = {
    age: 25,
    gender: 'female',
    height: 160,
    weight: 52,
    activityLevel: 'moderate',
    healthGoals: ['保持健康', '增强体质'],
    allergies: [],
    medicalConditions: [],
    meals: [], // 空的饮食记录
  }

  // 模拟有饮食记录的用户
  const userProfileWithMeals = {
    ...userProfileWithoutMeals,
    meals: [
      {
        type: 'breakfast',
        foods: [
          { name: '牛奶', amount: 250, unit: 'ml' },
          { name: '面包', amount: 2, unit: '片' },
        ],
      },
    ],
  }

  console.log('📝 测试场景1：无饮食记录的用户')
  console.log('用户数据：', JSON.stringify(userProfileWithoutMeals, null, 2))
  console.log(
    'hasMealData:',
    userProfileWithoutMeals.meals && userProfileWithoutMeals.meals.length > 0
  )
  console.log('应该显示营养分析按钮：', 'hasUserData && !hasCompletedAnalysis')

  console.log('\n📝 测试场景2：有饮食记录的用户')
  console.log('用户数据：', JSON.stringify(userProfileWithMeals, null, 2))
  console.log('hasMealData:', userProfileWithMeals.meals && userProfileWithMeals.meals.length > 0)
  console.log('应该显示营养分析按钮：', 'hasUserData && !hasCompletedAnalysis')

  console.log('\n🔄 营养分析服务调用流程：')
  console.log('1. performNutritionAnalysis() 被调用')
  console.log('2. 检查 hasUserData - 基本信息是否完整')
  console.log('3. 创建 profileForAnalysis，确保 meals 字段存在')
  console.log('4. 调用 nutritionAnalysisService.analyzeNutrition()')
  console.log('5. calculateCurrentIntake() 处理空meals数组返回0值')
  console.log('6. performAIAnalysis() 根据hasMealData调整提示词')
  console.log('7. GLM服务匹配"营养师"关键词返回模拟数据')

  console.log('\n✅ 预期结果：')
  console.log('- 有基本信息的用户可以看到"开始AI营养分析"按钮')
  console.log('- 点击按钮后能成功调用分析服务')
  console.log('- 返回包含营养建议的结构化数据')
  console.log('- 显示分析完成的成功消息')
}

testCompleteAnalysis()

// 测试 GLM 关键词匹配
console.log('\n🔍 GLM关键词匹配测试：')
const testPrompts = [
  '作为专业营养师，请基于中国居民膳食指南分析以下营养状况',
  '你是一位专业的营养师，请进行营养分析',
  '请进行营养分析和评估',
]

testPrompts.forEach((prompt, index) => {
  console.log(`提示词${index + 1}:`, prompt.substring(0, 50) + '...')
  console.log('包含"营养师":', prompt.includes('营养师'))
  console.log('包含"营养状况":', prompt.includes('营养状况'))
  console.log('包含"营养分析":', prompt.includes('营养分析'))
  console.log(
    '会匹配GLM模拟响应:',
    prompt.includes('营养师') || prompt.includes('营养状况') || prompt.includes('营养分析')
  )
  console.log()
})
