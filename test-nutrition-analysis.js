// 测试营养分析功能
const testUserProfile = {
  age: 30,
  gender: 'female',
  height: 165,
  weight: 55,
  activityLevel: 'moderate',
  healthGoals: ['减脂', '增肌'],
  allergies: ['坚果'],
  dietaryPreferences: ['低盐'],
  medicalConditions: [],
  currentDiet: '地中海饮食',
}

// 模拟营养分析提示词
const prompt = `你是一位专业的营养师，请根据以下用户信息进行营养状况分析：

用户信息：${JSON.stringify(testUserProfile)}

请以JSON格式返回分析结果，包含以下字段：
- balanceScore: 营养均衡分数 (0-100)
- recommendations: 营养建议数组
- riskAssessments: 风险评估数组 (包含level, title, description)
- improvementSuggestions: 改善建议数组 (包含category, suggestion)

请确保返回的是有效的JSON格式。`

console.log('测试提示词：')
console.log(prompt)
console.log('\n提示词包含的关键词检查：')
console.log('包含"营养师"：', prompt.includes('营养师'))
console.log('包含"营养状况"：', prompt.includes('营养状况'))
console.log('包含"营养分析"：', prompt.includes('营养分析'))
