import databaseSingleton from './databaseSingleton'

/**
 * 数据库单例使用示例
 */
class DatabaseExample {
  /**
   * 初始化数据库
   */
  async initializeDatabase(): Promise<void> {
    try {
      await databaseSingleton.initialize()
      console.log('✅ Database ready')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
    }
  }

  /**
   * 用户相关操作示例
   */
  async userExamples(): Promise<void> {
    // 创建用户
    const userResult = databaseSingleton.insert('users', {
      session_id: 'user_123',
      preferences: JSON.stringify({ theme: 'dark', language: 'zh' })
    })
    console.log('👤 User created:', userResult.lastInsertRowid)

    // 查询用户
    const user = databaseSingleton.selectOne('users', { session_id: 'user_123' })
    console.log('👤 Found user:', user)

    // 更新用户偏好
    databaseSingleton.update('users', 
      { preferences: JSON.stringify({ theme: 'light', language: 'en' }) }, 
      { session_id: 'user_123' }
    )

    // 查询所有用户
    const users = databaseSingleton.select('users')
    console.log('👥 All users:', users)
  }

  /**
   * 食谱相关操作示例
   */
  async recipeExamples(): Promise<void> {
    // 创建食谱
    const recipeResult = databaseSingleton.insert('recipes', {
      title: '红烧肉',
      description: '经典中式菜肴',
      ingredients: JSON.stringify(['猪肉', '姜', '葱', '料酒']),
      instructions: JSON.stringify(['切肉', '炒糖色', '炖煮']),
      cooking_time: '60分钟',
      difficulty: '中等',
      servings: 4,
      category: '中餐'
    })
    console.log('🍲 Recipe created:', recipeResult.lastInsertRowid)

    // 查询食谱
    const recipe = databaseSingleton.selectOne('recipes', { id: 1 })
    console.log('🍲 Found recipe:', recipe)

    // 更新食谱视图数
    databaseSingleton.execute(
      'UPDATE recipes SET view_count = view_count + 1 WHERE id = ?',
      [1]
    )

    // 搜索食谱
    const recipes = databaseSingleton.query(
      'SELECT * FROM recipes WHERE title LIKE ?',
      ['%红烧%']
    )
    console.log('🔍 Search results:', recipes)
  }

  /**
   * 收藏相关操作示例
   */
  async favoriteExamples(): Promise<void> {
    // 添加收藏
    databaseSingleton.insert('favorites', {
      session_id: 'user_123',
      recipe_id: 1,
      recipe_title: '红烧肉'
    })

    // 查询用户收藏
    const favorites = databaseSingleton.query(
      'SELECT r.* FROM favorites f JOIN recipes r ON f.recipe_id = r.id WHERE f.session_id = ?',
      ['user_123']
    )
    console.log('❤️ User favorites:', favorites)

    // 删除收藏
    databaseSingleton.delete('favorites', {
      session_id: 'user_123',
      recipe_id: 1
    })
  }

  /**
   * 事务操作示例
   */
  async transactionExample(): Promise<void> {
    try {
      databaseSingleton.transaction((db) => {
        // 在事务中执行多个操作
        const stmt1 = db.prepare('INSERT INTO recipes (title, category) VALUES (?, ?)')
        stmt1.run('糖醋排骨', '中餐')

        const stmt2 = db.prepare('INSERT INTO recipes (title, category) VALUES (?, ?)')
        stmt2.run('宫保鸡丁', '中餐')

        // 如果这里抛出异常，所有操作都会回滚
        return 'Transaction completed'
      })
      console.log('✅ Transaction succeeded')
    } catch (error) {
      console.error('❌ Transaction failed:', error)
    }
  }

  /**
   * 数据库管理操作示例
   */
  async managementExamples(): Promise<void> {
    // 检查表是否存在
    const usersExists = databaseSingleton.tableExists('users')
    console.log('📊 Users table exists:', usersExists)

    // 获取表结构
    const tableInfo = databaseSingleton.getTableInfo('recipes')
    console.log('📋 Table structure:', tableInfo)

    // 获取数据库状态
    const status = databaseSingleton.getStatus()
    console.log('📈 Database status:', status)

    // 优化数据库
    databaseSingleton.optimize()
    console.log('⚡ Database optimized')
  }

  /**
   * 运行所有示例
   */
  async runAllExamples(): Promise<void> {
    await this.initializeDatabase()
    await this.userExamples()
    await this.recipeExamples()
    await this.favoriteExamples()
    await this.transactionExample()
    await this.managementExamples()
  }
}

// 使用示例
async function main() {
  const example = new DatabaseExample()
  await example.runAllExamples()
}

// 导出示例类供其他模块使用
export default DatabaseExample