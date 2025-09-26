/**
 * 测试数据库连接功能
 * 通过Tauri命令系统测试数据库访问
 */

import { tauriDatabaseService } from '../src/services/tauriDatabaseService.js'

async function testDatabaseConnection() {
  console.log('🔍 开始测试数据库连接...')

  try {
    // 测试1: 检查数据库状态
    console.log('\n📊 测试1: 检查数据库状态')
    const status = await tauriDatabaseService.getDatabaseStatus()
    console.log('数据库状态:', status)

    // 测试2: 获取收藏数据
    console.log('\n❤️ 测试2: 获取收藏数据')
    const sessionId = 'test_session_001'
    const favorites = await tauriDatabaseService.getFavorites(sessionId)
    console.log(`获取到 ${favorites.length} 条收藏记录`)

    if (favorites.length > 0) {
      console.log('收藏数据示例:')
      favorites.slice(0, 2).forEach((fav, index) => {
        console.log(`${index + 1}. ${fav.recipe_title || fav.title} (ID: ${fav.recipe_id})`)
      })
    }

    // 测试3: 获取菜谱数据
    console.log('\n🍳 测试3: 获取菜谱数据')
    const recipes = await tauriDatabaseService.getAllRecipes(5)
    console.log(`获取到 ${recipes.length} 条菜谱记录`)

    if (recipes.length > 0) {
      console.log('菜谱数据示例:')
      recipes.slice(0, 2).forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title} (难度: ${recipe.difficulty})`)
      })
    }

    // 测试4: 测试查询功能
    console.log('\n🔍 测试4: 测试查询功能')
    const searchResults = await tauriDatabaseService.searchRecipes('鸡', 3)
    console.log(`搜索"鸡"得到 ${searchResults.length} 条结果`)

    console.log('\n✅ 所有数据库测试完成!')

  } catch (error) {
    console.error('❌ 数据库测试失败:', error)
    console.error('错误详情:', error.message || error)

    // 如果是在非Tauri环境中，显示提示信息
    if (typeof window !== 'undefined' && !window.__TAURI__) {
      console.log('\n💡 提示: 此脚本需要在Tauri环境中运行')
      console.log('请使用 npm run tauri dev 启动应用，然后在浏览器控制台中运行此测试')
    }
  }
}

// 导出测试函数
window.testDatabaseConnection = testDatabaseConnection

// 如果直接运行此脚本，自动执行测试
if (typeof window !== 'undefined') {
  console.log('🧪 数据库连接测试脚本已加载')
  console.log('在浏览器控制台中运行 testDatabaseConnection() 开始测试')

  // 如果在Tauri环境中，自动运行测试
  if (window.__TAURI__) {
    console.log('检测到Tauri环境，自动开始测试...')
    setTimeout(testDatabaseConnection, 2000)
  }
}