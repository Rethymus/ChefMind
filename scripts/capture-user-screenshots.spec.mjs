import { test } from '@playwright/test'
import fs from 'node:fs/promises'

const baseUrl = 'http://127.0.0.1:1420'
const outDir = 'docs/screenshots'

const now = new Date().toISOString()
const demoRecipe = {
  id: 'demo-user-recipe',
  title: '番茄鸡蛋面',
  name: '番茄鸡蛋面',
  description: '酸甜开胃的家常面食，适合快速准备一餐。',
  difficulty: '简单',
  cookingTime: '20分钟',
  servings: 2,
  rating: 4.8,
  ingredients: [
    { name: '番茄', amount: '2', unit: '个' },
    { name: '鸡蛋', amount: '2', unit: '个' },
    { name: '面条', amount: '200', unit: '克' },
    { name: '葱花', amount: '10', unit: '克' },
    { name: '盐', amount: '适量', unit: '' },
  ],
  instructions: [
    '番茄洗净切块，鸡蛋打散备用。',
    '热锅倒油，先炒鸡蛋2分钟至凝固后盛出。',
    '锅中留底油，下番茄炒出汤汁。',
    '加入清水煮沸，放入面条煮5分钟至八成熟。',
    '倒回鸡蛋，加盐调味，撒葱花出锅。',
  ],
  steps: [
    { description: '番茄洗净切块，鸡蛋打散备用。' },
    { description: '热锅倒油，先炒鸡蛋2分钟至凝固后盛出。' },
    { description: '锅中留底油，下番茄炒出汤汁。' },
    { description: '加入清水煮沸，放入面条煮5分钟至八成熟。' },
    { description: '倒回鸡蛋，加盐调味，撒葱花出锅。' },
  ],
  nutrition: { calories: 420, protein: 18, carbs: 58, fat: 12 },
  tags: ['家常菜', '快手菜', '面食'],
}

const shoppingItems = [
  {
    id: 'demo-shop-1',
    name: '番茄',
    completed: true,
    category: '食材',
    recipeId: demoRecipe.id,
    recipeName: demoRecipe.title,
    amount: '2',
    unit: '个',
    purchaseAdvice: '选择表皮完整、成熟度适中的番茄',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-shop-2',
    name: '鸡蛋',
    completed: false,
    category: '食材',
    recipeId: demoRecipe.id,
    recipeName: demoRecipe.title,
    amount: '2',
    unit: '个',
    purchaseAdvice: '优先选择新鲜鸡蛋',
    note: '早餐也会用到，多买一盒',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-shop-3',
    name: '面条',
    completed: false,
    category: '主食',
    recipeId: demoRecipe.id,
    recipeName: demoRecipe.title,
    amount: '200',
    unit: '克',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'demo-shop-4',
    name: '生抽',
    completed: false,
    category: '调味料',
    note: '家里快用完了',
    createdAt: now,
    updatedAt: now,
  },
]

const userProfile = {
  name: '演示用户',
  age: 24,
  gender: 'male',
  height: 175,
  weight: 68,
  activityLevel: 'moderate',
  healthGoals: ['增肌', '改善消化'],
  medicalConditions: [],
  allergies: ['花生'],
  dietaryRestrictions: ['低糖饮食'],
  meals: [
    {
      type: 'breakfast',
      foods: [{ name: '燕麦粥1碗、鸡蛋1个、牛奶250ml', amount: 1, unit: '份' }],
      time: now,
    },
    {
      type: 'lunch',
      foods: [{ name: '米饭1碗、番茄炒蛋、清炒菠菜', amount: 1, unit: '份' }],
      time: now,
    },
  ],
}

const nutritionAnalysis = {
  confidenceScore: 0.88,
  dailyNeeds: { calories: 2300, protein: 88, carbs: 290, fat: 70 },
  currentIntake: { calories: 1420, protein: 62, carbs: 180, fat: 42 },
  analysis: {
    balanceScore: 0.76,
    adequacyRatios: { calories: 0.62, protein: 0.7, carbs: 0.62, fat: 0.6 },
    recommendations: [
      '晚餐增加优质蛋白，例如鱼肉、鸡胸肉或豆制品。',
      '保持蔬菜摄入，优先选择深绿色叶菜。',
      '训练日可在运动后补充一份碳水和蛋白组合。',
    ],
    riskAssessments: [
      { level: 'low', title: '热量缺口', description: '当前摄入偏低，注意避免长期能量不足。' },
      { level: 'medium', title: '过敏风险', description: '已标记花生过敏，外食需关注配料表。' },
    ],
    improvementSuggestions: [
      { category: '蛋白质', suggestion: '每餐加入掌心大小的蛋白质来源。' },
      { category: '膳食纤维', suggestion: '增加全谷物、豆类和蔬菜比例。' },
    ],
  },
}

async function shot(page, name, wait = 900) {
  await page.waitForTimeout(wait)
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false })
}

async function goto(page, hash) {
  await page.goto(`${baseUrl}/#${hash}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(700)
}

test('capture ChefMind user journey screenshots', async ({ page }) => {
  test.setTimeout(120_000)
  await fs.mkdir(outDir, { recursive: true })
  await page.setViewportSize({ width: 1440, height: 1000 })

  page.on('dialog', dialog => dialog.accept())

  await goto(page, '/')
  await page.evaluate(({ demoRecipe, shoppingItems, userProfile, nutritionAnalysis }) => {
    localStorage.clear()
    sessionStorage.clear()
    localStorage.setItem('sessionId', 'demo-session')
    localStorage.setItem('currentCookingRecipe', JSON.stringify(demoRecipe))
    localStorage.setItem('chefmind_shopping_list', JSON.stringify(shoppingItems))
    localStorage.setItem(
      'chefmind_shopping_categories',
      JSON.stringify(['食材', '主食', '调味料', '厨具', '其他'])
    )
    localStorage.setItem('chefMind_userProfile', JSON.stringify(userProfile))
    localStorage.setItem('chefMind_nutritionAnalysis', JSON.stringify(nutritionAnalysis))
  }, { demoRecipe, shoppingItems, userProfile, nutritionAnalysis })

  await goto(page, '/')
  await shot(page, '01-home')

  await goto(page, '/search')
  await page.getByPlaceholder(/搜索食谱|食材|烹饪方式/).first().fill('番茄 鸡蛋')
  await page.keyboard.press('Enter')
  await shot(page, '02-search-results', 1400)

  await page.getByText('查看详情').first().click()
  await shot(page, '03-recipe-detail', 1200)

  await page.locator('button').filter({ hasText: /收藏|取消收藏/ }).first().click().catch(() => {})
  await shot(page, '04-recipe-favorite')

  await goto(page, '/favorites')
  await shot(page, '05-favorites')

  await goto(page, '/ai')
  await page.getByRole('button', { name: '鸡蛋' }).first().click()
  await page.getByRole('button', { name: '番茄' }).first().click()
  await page.getByRole('button', { name: '面条' }).first().click()
  await page.locator('label').filter({ hasText: '炒锅' }).first().click()
  await page.locator('label').filter({ hasText: '高蛋白' }).first().click()
  await page.getByPlaceholder('输入不喜欢的食材，如香菜、洋葱等').fill('香菜')
  await page.getByPlaceholder('输入不喜欢的食材，如香菜、洋葱等').press('Enter')
  await shot(page, '06-ai-form-filled')

  await page.getByRole('button', { name: /生成专属食谱/ }).click()
  await page.waitForSelector('.generated-recipe-section', { timeout: 20000 })
  await shot(page, '07-ai-generated-recipe', 1200)

  await page.getByRole('button', { name: /加购食材/ }).click()
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: /继续浏览|查看购物清单/ }).last().click().catch(() => {})
  await shot(page, '08-ai-shopping-confirm', 800)

  await goto(page, '/settings')
  await page.locator('.el-select').first().click()
  await page.getByText('DeepSeek').last().click()
  await page.getByPlaceholder('sk-...').fill('demo-chefmind-user-key')
  await shot(page, '09-settings-config')
  await page.getByRole('button', { name: /保存配置/ }).click()
  await page.getByRole('button', { name: /测试连接/ }).click()
  await shot(page, '10-settings-test-result', 1600)

  await goto(page, '/shopping-list')
  await shot(page, '11-shopping-list')
  await page.getByRole('button', { name: '按菜谱分组' }).click()
  await shot(page, '12-shopping-grouped')
  await page.locator('.item-action.edit').first().click()
  await page.locator('#edit-note').fill('优先购买当天新鲜食材')
  await shot(page, '13-shopping-edit-modal')

  await goto(page, '/cooking-guide')
  await page.locator('.ingredient-item').first().click()
  await page.getByRole('button', { name: /下一步/ }).click()
  await shot(page, '14-cooking-guide-progress')
  await page.locator('.timer-button').first().click().catch(() => {})
  await shot(page, '15-cooking-timer', 500)

  await goto(page, '/analytics')
  await shot(page, '16-analytics-overview')
  await page.getByRole('button', { name: /重新分析|开始分析/ }).first().click()
  await shot(page, '17-analytics-profile-form')

  await goto(page, '/')
  await page.locator('.theme-toggle-button').click()
  await shot(page, '18-theme-selector', 500)

  await page.keyboard.press('Escape').catch(() => {})
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(500)
  await page.getByText('关于我们').first().click()
  await shot(page, '19-footer-about-modal', 500)
})
