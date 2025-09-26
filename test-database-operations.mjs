// 测试数据库操作（前端环境模拟）
import { userDatabaseService, recipeDatabaseService, favoriteDatabaseService } from './src/services/database/index.js'

async function testDatabaseOperations() {
  console.log('🧪 测试数据库操作（前端环境模拟）...\n')

  try {
    // 测试1: 用户会话创建和管理
    console.log('1. 测试用户会话创建和管理...')
    const session = await userDatabaseService.getCurrentSession()
    console.log('✅ 用户会话创建成功')
    console.log('   Session ID:', session.sessionId)

    // 测试2: 用户偏好设置
    console.log('\n2. 测试用户偏好设置...')
    const preferences = {
      language: 'zh-CN',
      theme: 'dark',
      dietaryRestrictions: ['素食'],
      cookingLevel: 'intermediate'
    }
    await userDatabaseService.updatePreferences(session.sessionId, preferences)
    console.log('✅ 用户偏好设置成功')

    const retrievedPreferences = await userDatabaseService.getPreferences(session.sessionId)
    console.log('   偏好设置验证:', JSON.stringify(retrievedPreferences) === JSON.stringify(preferences) ? '✅ 一致' : '❌ 不一致')

    // 测试3: 食谱创建
    console.log('\n3. 测试食谱创建...')
    const recipeData = {
      title: '测试食谱 - 红烧肉',
      description: '经典中式菜肴，肥而不腻',
      ingredients: JSON.stringify([
        { name: '五花肉', amount: '500g' },
        { name: '生抽', amount: '3勺' },
        { name: '老抽', amount: '1勺' },
        { name: '冰糖', amount: '50g' },
        { name: '葱', amount: '2根' }
      ]),
      instructions: JSON.stringify([
        '五花肉切块，焯水去腥',
        '热锅下油，炒糖色',
        '下肉块炒至上色',
        '加生抽、老抽调色',
        '小火炖煮1小时即可'
      ]),
      cookingTime: '90分钟',
      difficulty: '中等',
      servings: 4,
      category: '中式菜肴',
      tags: JSON.stringify(['猪肉', '家常菜', '红烧']),
      nutritionInfo: JSON.stringify({
        calories: 450,
        protein: 25,
        fat: 35,
        carbs: 10
      })
    }

    const createdRecipe = await recipeDatabaseService.createRecipe(recipeData)
    console.log('✅ 食谱创建成功')
    console.log('   食谱ID:', createdRecipe.id)
    console.log('   标题:', createdRecipe.title)

    // 测试4: 食谱查询
    console.log('\n4. 测试食谱查询...')
    const queriedRecipe = await recipeDatabaseService.getRecipeById(createdRecipe.id)
    console.log('✅ 食谱查询成功')
    console.log('   查询结果验证:', queriedRecipe.title === recipeData.title ? '✅ 一致' : '❌ 不一致')

    // 测试5: 食谱搜索
    console.log('\n5. 测试食谱搜索...')
    const searchResults = await recipeDatabaseService.searchRecipes('红烧肉')
    console.log('✅ 食谱搜索成功')
    console.log('   搜索结果数量:', searchResults.length)
    const foundTestRecipe = searchResults.some(recipe => recipe.id === createdRecipe.id)
    console.log('   找到测试食谱:', foundTestRecipe ? '✅ 是' : '❌ 否')

    // 测试6: 收藏功能
    console.log('\n6. 测试收藏功能...')
    const favorite = await favoriteDatabaseService.addFavorite(
      session.sessionId,
      createdRecipe.id,
      createdRecipe.title,
      createdRecipe.imageUrl
    )
    console.log('✅ 收藏添加成功')
    console.log('   收藏ID:', favorite.id)

    // 测试7: 获取用户收藏
    console.log('\n7. 测试获取用户收藏...')
    const userFavorites = await favoriteDatabaseService.getUserFavorites(session.sessionId)
    console.log('✅ 用户收藏查询成功')
    console.log('   收藏数量:', userFavorites.length)
    const hasTestRecipe = userFavorites.some(fav => fav.recipeId === createdRecipe.id)
    console.log('   包含测试食谱:', hasTestRecipe ? '✅ 是' : '❌ 否')

    // 测试8: 检查收藏状态
    console.log('\n8. 测试检查收藏状态...')
    const isFavorited = await favoriteDatabaseService.isFavorited(session.sessionId, createdRecipe.id)
    console.log('✅ 收藏状态检查成功')
    console.log('   是否已收藏:', isFavorited ? '✅ 是' : '❌ 否')

    // 测试9: 取消收藏
    console.log('\n9. 测试取消收藏...')
    const removed = await favoriteDatabaseService.removeFavorite(session.sessionId, createdRecipe.id)
    console.log('✅ 取消收藏成功')
    console.log('   删除结果:', removed ? '✅ 成功' : '❌ 失败')

    // 验证收藏已取消
    const isStillFavorited = await favoriteDatabaseService.isFavorited(session.sessionId, createdRecipe.id)
    console.log('   收藏状态验证:', !isStillFavorited ? '✅ 已取消' : '❌ 仍存在')

    // 测试10: 获取所有食谱
    console.log('\n10. 测试获取所有食谱...')
    const allRecipes = await recipeDatabaseService.getAllRecipes(10, 0)
    console.log('✅ 获取所有食谱成功')
    console.log('   食谱总数:', allRecipes.length)
    console.log('   包含测试食谱:', allRecipes.some(r => r.id === createdRecipe.id) ? '✅ 是' : '❌ 否')

    // 测试11: 按分类查询
    console.log('\n11. 测试按分类查询...')
    const categoryRecipes = await recipeDatabaseService.getRecipesByCategory('中式菜肴')
    console.log('✅ 按分类查询成功')
    console.log('   分类食谱数量:', categoryRecipes.length)
    console.log('   包含测试食谱:', categoryRecipes.some(r => r.id === createdRecipe.id) ? '✅ 是' : '❌ 否')

    // 测试12: 食谱统计
    console.log('\n12. 测试食谱统计...')
    const popularRecipes = await recipeDatabaseService.getPopularRecipes(5)
    const recentRecipes = await recipeDatabaseService.getRecentRecipes(5)
    console.log('✅ 食谱统计成功')
    console.log('   热门食谱数量:', popularRecipes.length)
    console.log('   最新食谱数量:', recentRecipes.length)

    console.log('\n🎉 所有数据库操作测试完成！前端到数据库的数据流程正常工作！')

    // 清理测试数据
    console.log('\n🧹 清理测试数据...')
    await recipeDatabaseService.deleteRecipe(createdRecipe.id)
    console.log('✅ 测试数据清理完成')

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error)
    console.error('详细错误信息:', error.stack)
  }
}

// 运行测试
testDatabaseOperations()