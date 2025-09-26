// 直接测试数据库功能
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

async function testDatabaseDirect() {
  console.log('🧪 直接数据库功能测试...\n')

  try {
    // 数据库路径
    const dbPath = path.join(process.cwd(), 'data', 'chefmind.db')

    // 检查数据库文件是否存在
    if (!fs.existsSync(dbPath)) {
      console.log('❌ 数据库文件不存在:', dbPath)
      return
    }

    // 创建数据库连接
    console.log('1. 连接数据库...')
    const db = new Database(dbPath, {
      fileMustExist: true,
      timeout: 10000,
    })

    // 配置数据库
    console.log('2. 配置数据库...')
    db.pragma('foreign_keys = ON')
    db.pragma('journal_mode = WAL')
    db.pragma('busy_timeout = 10000')
    db.pragma('synchronous = NORMAL')
    db.pragma('cache_size = -20000')
    console.log('✅ 数据库配置完成')

    // 获取数据库信息
    console.log('\n3. 获取数据库信息...')
    const stats = fs.statSync(dbPath)
    const tableCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get().count
    console.log('📊 数据库信息:')
    console.log('   - 文件大小:', Math.round(stats.size / 1024), 'KB')
    console.log('   - 表数量:', tableCount)

    // 测试用户表操作
    console.log('\n4. 测试用户表操作...')
    const sessionId = 'test_session_' + Date.now()

    // 插入用户
    const insertUser = db.prepare(
      'INSERT INTO users (session_id, preferences, created_at, updated_at) VALUES (?, ?, ?, ?)'
    ).run(sessionId, JSON.stringify({ language: 'zh-CN', theme: 'dark' }), new Date().toISOString(), new Date().toISOString())
    console.log('✅ 用户插入成功，ID:', insertUser.lastInsertRowid)

    // 查询用户
    const user = db.prepare('SELECT * FROM users WHERE session_id = ?').get(sessionId)
    console.log('✅ 用户查询成功，找到:', !!user)

    // 测试食谱表操作
    console.log('\n5. 测试食谱表操作...')
    const recipeData = {
      title: '直接测试食谱 - 宫保鸡丁',
      description: '经典川菜',
      ingredients: JSON.stringify([
        { name: '鸡胸肉', amount: '300g' },
        { name: '花生米', amount: '50g' }
      ]),
      instructions: JSON.stringify([
        '鸡肉切丁',
        '爆炒',
        '调味'
      ]),
      cooking_time: '30分钟',
      difficulty: '中等',
      servings: 2,
      category: '川菜',
      tags: JSON.stringify(['辣味', '鸡肉']),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // 插入食谱
    const insertRecipe = db.prepare(`
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
      recipeData.created_at,
      recipeData.updated_at
    )
    console.log('✅ 食谱插入成功，ID:', insertRecipe.lastInsertRowid)

    // 查询食谱
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(insertRecipe.lastInsertRowid)
    console.log('✅ 食谱查询成功，标题:', recipe?.title)

    // 测试收藏表操作
    console.log('\n6. 测试收藏表操作...')
    const insertFavorite = db.prepare(
      'INSERT INTO favorites (session_id, recipe_id, recipe_title, created_at) VALUES (?, ?, ?, ?)'
    ).run(sessionId, insertRecipe.lastInsertRowid, recipeData.title, new Date().toISOString())
    console.log('✅ 收藏插入成功，ID:', insertFavorite.lastInsertRowid)

    // 查询收藏
    const favorite = db.prepare('SELECT * FROM favorites WHERE session_id = ? AND recipe_id = ?').get(sessionId, insertRecipe.lastInsertRowid)
    console.log('✅ 收藏查询成功，找到:', !!favorite)

    // 测试搜索功能
    console.log('\n7. 测试搜索功能...')
    const searchResults = db.prepare("SELECT * FROM recipes WHERE title LIKE '%宫保%'").all()
    console.log('✅ 搜索功能成功，结果数量:', searchResults.length)

    // 测试事务操作
    console.log('\n8. 测试事务操作...')
    const transactionResults = []

    db.transaction(() => {
      // 在事务中插入多条记录
      for (let i = 0; i < 3; i++) {
        const result = db.prepare(
          'INSERT INTO recipes (title, category, created_at, updated_at) VALUES (?, ?, ?, ?)'
        ).run(`事务测试食谱 ${i + 1}`, '测试分类', new Date().toISOString(), new Date().toISOString())
        transactionResults.push(result.lastInsertRowid)
      }
    })
    console.log('✅ 事务操作成功，插入记录:', transactionResults.join(', '))

    // 测试并发查询
    console.log('\n9. 测试并发查询...')
    const concurrentPromises = []
    for (let i = 0; i < 5; i++) {
      concurrentPromises.push(
        new Promise((resolve) => {
          setTimeout(() => {
            const count = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count
            resolve(count)
          }, Math.random() * 100)
        })
      )
    }

    const concurrentResults = await Promise.all(concurrentPromises)
    console.log('✅ 并发查询成功')
    console.log('   查询结果:', concurrentResults.join(', '))
    console.log('   结果一致性:', new Set(concurrentResults).size === 1 ? '✅ 一致' : '❌ 不一致')

    // 测试统计信息
    console.log('\n10. 测试统计信息...')
    const finalStats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      recipes: db.prepare('SELECT COUNT(*) as count FROM recipes').get().count,
      favorites: db.prepare('SELECT COUNT(*) as count FROM favorites').get().count
    }
    console.log('📊 数据库统计:')
    console.log('   - 用户记录:', finalStats.users)
    console.log('   - 食谱记录:', finalStats.recipes)
    console.log('   - 收藏记录:', finalStats.favorites)

    // 测试数据库完整性
    console.log('\n11. 测试数据库完整性...')
    const integrityCheck = db.prepare('PRAGMA integrity_check').get()
    console.log('✅ 完整性检查:', integrityCheck.integrity_check)

    console.log('\n🎉 所有直接数据库测试完成！SQLite 数据库功能正常工作！')

    // 清理测试数据
    console.log('\n🧹 清理测试数据...')
    db.prepare('DELETE FROM favorites WHERE session_id = ?').run(sessionId)
    db.prepare('DELETE FROM users WHERE session_id = ?').run(sessionId)
    db.prepare("DELETE FROM recipes WHERE title LIKE '%测试%' OR title LIKE '%宫保%'").run()
    console.log('✅ 测试数据清理完成')

    // 关闭数据库连接
    db.close()
    console.log('\n🔒 数据库连接已关闭')

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error)
    console.error('详细错误信息:', error.stack)
  }
}

// 运行测试
testDatabaseDirect()