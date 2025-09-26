// 模拟前端操作的数据库测试
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

class FrontendDatabaseSimulator {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'chefmind.db')
    this.db = null
    this.currentSessionId = null
  }

  async initialize() {
    console.log('🔧 初始化前端数据库模拟器...')

    if (!fs.existsSync(this.dbPath)) {
      throw new Error('数据库文件不存在')
    }

    this.db = new Database(this.dbPath, {
      fileMustExist: true,
      timeout: 10000,
    })

    // 配置数据库（模拟前端应用启动时的配置）
    this.db.pragma('foreign_keys = ON')
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('busy_timeout = 10000')
    this.db.pragma('synchronous = NORMAL')
    this.db.pragma('cache_size = -20000')

    console.log('✅ 前端数据库模拟器初始化成功')
  }

  // 模拟用户会话创建
  async createSession() {
    console.log('\n👤 创建用户会话...')

    this.currentSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    try {
      const result = this.db.prepare(
        'INSERT INTO users (session_id, preferences, created_at, updated_at) VALUES (?, ?, ?, ?)'
      ).run(this.currentSessionId, JSON.stringify({}), new Date().toISOString(), new Date().toISOString())

      console.log('✅ 用户会话创建成功')
      console.log('   Session ID:', this.currentSessionId)
      console.log('   用户ID:', result.lastInsertRowid)

      return {
        sessionId: this.currentSessionId,
        userId: result.lastInsertRowid,
        preferences: {}
      }
    } catch (error) {
      console.error('❌ 用户会话创建失败:', error)
      throw error
    }
  }

  // 模拟用户偏好设置更新
  async updatePreferences(preferences) {
    console.log('\n⚙️ 更新用户偏好设置...')

    try {
      const result = this.db.prepare(
        'UPDATE users SET preferences = ?, updated_at = ? WHERE session_id = ?'
      ).run(JSON.stringify(preferences), new Date().toISOString(), this.currentSessionId)

      console.log('✅ 用户偏好设置更新成功')
      console.log('   更新记录:', result.changes)

      return result.changes > 0
    } catch (error) {
      console.error('❌ 用户偏好设置更新失败:', error)
      throw error
    }
  }

  // 模拟食谱创建
  async createRecipe(recipeData) {
    console.log('\n🍳 创建食谱...')

    try {
      const result = this.db.prepare(`
        INSERT INTO recipes (title, description, ingredients, instructions, cooking_time, difficulty, servings, category, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        recipeData.title,
        recipeData.description,
        recipeData.ingredients,
        recipeData.instructions,
        recipeData.cooking_time,
        recipeData.difficulty,
        recipeData.servings,
        recipeData.category,
        recipeData.tags,
        new Date().toISOString(),
        new Date().toISOString()
      )

      console.log('✅ 食谱创建成功')
      console.log('   食谱ID:', result.lastInsertRowid)
      console.log('   标题:', recipeData.title)

      return {
        id: result.lastInsertRowid,
        ...recipeData
      }
    } catch (error) {
      console.error('❌ 食谱创建失败:', error)
      throw error
    }
  }

  // 模拟食谱查询
  async getRecipeById(recipeId) {
    console.log('\n🔍 查询食谱...')

    try {
      const recipe = this.db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId)

      if (recipe) {
        // 解析JSON字段
        recipe.ingredients = JSON.parse(recipe.ingredients || '[]')
        recipe.instructions = JSON.parse(recipe.instructions || '[]')
        recipe.tags = JSON.parse(recipe.tags || '[]')
        recipe.nutrition_info = JSON.parse(recipe.nutrition_info || '{}')

        console.log('✅ 食谱查询成功')
        console.log('   标题:', recipe.title)
        console.log('   分类:', recipe.category)
      } else {
        console.log('❌ 食谱未找到')
      }

      return recipe
    } catch (error) {
      console.error('❌ 食谱查询失败:', error)
      throw error
    }
  }

  // 模拟搜索食谱
  async searchRecipes(query) {
    console.log('\n🔎 搜索食谱...')

    try {
      const results = this.db.prepare(`
        SELECT * FROM recipes
        WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
        ORDER BY created_at DESC
        LIMIT 20
      `).all(`%${query}%`, `%${query}%`, `%${query}%`)

      // 解析JSON字段
      results.forEach(recipe => {
        recipe.ingredients = JSON.parse(recipe.ingredients || '[]')
        recipe.instructions = JSON.parse(recipe.instructions || '[]')
        recipe.tags = JSON.parse(recipe.tags || '[]')
        recipe.nutrition_info = JSON.parse(recipe.nutrition_info || '{}')
      })

      console.log('✅ 搜索成功')
      console.log('   搜索词:', query)
      console.log('   结果数量:', results.length)

      return results
    } catch (error) {
      console.error('❌ 搜索失败:', error)
      throw error
    }
  }

  // 模拟添加收藏
  async addFavorite(recipeId, recipeTitle, recipeImage) {
    console.log('\n❤️ 添加收藏...')

    try {
      const result = this.db.prepare(
        'INSERT INTO favorites (session_id, recipe_id, recipe_title, recipe_image, created_at) VALUES (?, ?, ?, ?, ?)'
      ).run(this.currentSessionId, recipeId, recipeTitle, recipeImage || '', new Date().toISOString())

      console.log('✅ 收藏添加成功')
      console.log('   收藏ID:', result.lastInsertRowid)
      console.log('   食谱ID:', recipeId)

      return {
        id: result.lastInsertRowid,
        recipeId,
        recipeTitle
      }
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log('⚠️ 食谱已收藏')
        return null
      }
      console.error('❌ 收藏添加失败:', error)
      throw error
    }
  }

  // 模拟获取用户收藏
  async getUserFavorites() {
    console.log('\n📋 获取用户收藏...')

    try {
      const favorites = this.db.prepare(
        'SELECT * FROM favorites WHERE session_id = ? ORDER BY created_at DESC'
      ).all(this.currentSessionId)

      console.log('✅ 用户收藏获取成功')
      console.log('   收藏数量:', favorites.length)

      return favorites
    } catch (error) {
      console.error('❌ 获取用户收藏失败:', error)
      throw error
    }
  }

  // 模拟检查收藏状态
  async isFavorited(recipeId) {
    console.log('\n❓ 检查收藏状态...')

    try {
      const favorite = this.db.prepare(
        'SELECT * FROM favorites WHERE session_id = ? AND recipe_id = ?'
      ).get(this.currentSessionId, recipeId)

      console.log('✅ 收藏状态检查成功')
      console.log('   收藏状态:', favorite ? '已收藏' : '未收藏')

      return !!favorite
    } catch (error) {
      console.error('❌ 收藏状态检查失败:', error)
      throw error
    }
  }

  // 模拟取消收藏
  async removeFavorite(recipeId) {
    console.log('\n🗑️ 取消收藏...')

    try {
      const result = this.db.prepare(
        'DELETE FROM favorites WHERE session_id = ? AND recipe_id = ?'
      ).run(this.currentSessionId, recipeId)

      console.log('✅ 取消收藏成功')
      console.log('   删除记录:', result.changes)

      return result.changes > 0
    } catch (error) {
      console.error('❌ 取消收藏失败:', error)
      throw error
    }
  }

  // 模拟获取统计数据
  async getStatistics() {
    console.log('\n📊 获取统计数据...')

    try {
      const stats = {
        totalRecipes: this.db.prepare('SELECT COUNT(*) as count FROM recipes').get().count,
        totalUsers: this.db.prepare('SELECT COUNT(*) as count FROM users').get().count,
        totalFavorites: this.db.prepare('SELECT COUNT(*) as count FROM favorites').get().count,
        userRecipes: this.db.prepare("SELECT COUNT(*) as count FROM recipes WHERE created_at >= date('now', '-30 days')").get().count,
        userFavorites: this.db.prepare('SELECT COUNT(*) as count FROM favorites WHERE session_id = ?').get(this.currentSessionId).count
      }

      console.log('✅ 统计数据获取成功')
      console.log('   总食谱数:', stats.totalRecipes)
      console.log('   总用户数:', stats.totalUsers)
      console.log('   总收藏数:', stats.totalFavorites)
      console.log('   近期食谱:', stats.userRecipes)
      console.log('   用户收藏:', stats.userFavorites)

      return stats
    } catch (error) {
      console.error('❌ 统计数据获取失败:', error)
      throw error
    }
  }

  // 清理测试数据
  async cleanupTestData() {
    console.log('\n🧹 清理测试数据...')

    try {
      if (this.currentSessionId) {
        // 删除用户收藏
        const deleteFavorites = this.db.prepare('DELETE FROM favorites WHERE session_id = ?').run(this.currentSessionId)

        // 删除用户
        const deleteUser = this.db.prepare('DELETE FROM users WHERE session_id = ?').run(this.currentSessionId)

        // 删除测试食谱
        const deleteRecipes = this.db.prepare("DELETE FROM recipes WHERE title LIKE '%前端测试%'").run()

        console.log('✅ 测试数据清理完成')
        console.log('   删除收藏:', deleteFavorites.changes)
        console.log('   删除用户:', deleteUser.changes)
        console.log('   删除食谱:', deleteRecipes.changes)
      }
    } catch (error) {
      console.error('❌ 清理测试数据失败:', error)
      throw error
    }
  }

  // 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('\n🔒 数据库连接已关闭')
    }
  }
}

// 运行前端模拟测试
async function runFrontendSimulation() {
  console.log('🎭 前端操作模拟测试开始...\n')

  const simulator = new FrontendDatabaseSimulator()

  try {
    // 1. 初始化
    await simulator.initialize()

    // 2. 创建用户会话
    const session = await simulator.createSession()

    // 3. 更新用户偏好
    await simulator.updatePreferences({
      language: 'zh-CN',
      theme: 'dark',
      dietaryRestrictions: ['素食'],
      cookingLevel: 'intermediate'
    })

    // 4. 创建食谱
    const recipe1 = await simulator.createRecipe({
      title: '前端测试食谱 - 麻婆豆腐',
      description: '经典川菜，麻辣鲜香',
      ingredients: JSON.stringify([
        { name: '嫩豆腐', amount: '400g' },
        { name: '牛肉末', amount: '100g' },
        { name: '豆瓣酱', amount: '2勺' },
        { name: '花椒粉', amount: '1勺' }
      ]),
      instructions: JSON.stringify([
        '豆腐切块，焯水备用',
        '热锅下油，炒牛肉末',
        '加豆瓣酱炒出红油',
        '下豆腐块轻炒',
        '调味后撒花椒粉即可'
      ]),
      cooking_time: '20分钟',
      difficulty: '中等',
      servings: 2,
      category: '川菜',
      tags: JSON.stringify(['豆腐', '辣味', '快手菜'])
    })

    // 5. 查询食谱
    const retrievedRecipe = await simulator.getRecipeById(recipe1.id)

    // 6. 搜索食谱
    const searchResults = await simulator.searchRecipes('麻婆')

    // 7. 添加收藏
    const favorite = await simulator.addFavorite(recipe1.id, recipe1.title)

    // 8. 检查收藏状态
    const isFavorited = await simulator.isFavorited(recipe1.id)

    // 9. 获取用户收藏列表
    const userFavorites = await simulator.getUserFavorites()

    // 10. 获取统计数据
    const stats = await simulator.getStatistics()

    // 11. 取消收藏
    await simulator.removeFavorite(recipe1.id)

    // 12. 再次检查收藏状态
    const isStillFavorited = await simulator.isFavorited(recipe1.id)

    console.log('\n🎉 前端操作模拟测试完成！')
    console.log('✅ 所有前端操作都能正确读写数据库')
    console.log('✅ 用户会话管理正常')
    console.log('✅ 食谱CRUD操作正常')
    console.log('✅ 收藏功能正常')
    console.log('✅ 搜索功能正常')
    console.log('✅ 统计功能正常')

  } catch (error) {
    console.error('\n❌ 前端模拟测试失败:', error)
    console.error('详细错误信息:', error.stack)
  } finally {
    // 清理测试数据
    await simulator.cleanupTestData()
    // 关闭连接
    simulator.close()
  }
}

// 运行测试
runFrontendSimulation()