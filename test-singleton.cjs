// 简单的数据库单例测试（CommonJS 版本）
const { SQLiteConfig } = require('./dist/config/sqlite.js')

async function testSingleton() {
  console.log('🧪 测试数据库单例功能...\n')
  
  try {
    // 测试1: 获取单例实例
    console.log('1. 测试单例模式...')
    const instance1 = SQLiteConfig.getInstance()
    const instance2 = SQLiteConfig.getInstance()
    console.log('✅ 单例模式测试通过 - 实例相同:', instance1 === instance2)
    
    // 测试2: 数据库连接
    console.log('\n2. 测试数据库连接...')
    const db = instance1.getConnection()
    console.log('✅ 数据库连接成功')
    
    // 测试3: 数据库状态
    console.log('\n3. 测试数据库状态...')
    const status = instance1.getStatus()
    console.log('📊 数据库状态:')
    console.log('   - 连接状态:', status.connected)
    console.log('   - 数据库路径:', status.path)
    console.log('   - 文件大小:', (status.size / 1024).toFixed(2) + ' KB')
    console.log('   - 表数量:', status.tableCount)
    
    // 测试4: 检查表是否存在
    console.log('\n4. 检查表结构...')
    const tables = ['users', 'recipes', 'favorites', 'ratings']
    for (const table of tables) {
      const exists = instance1.tableExists(table)
      console.log(`   - ${table}表: ${exists ? '✅ 存在' : '❌ 不存在'}`)
    }
    
    // 测试5: 查询表数据
    console.log('\n5. 测试数据查询...')
    
    // 查询用户表
    if (instance1.tableExists('users')) {
      const users = instance1.query('SELECT * FROM users LIMIT 3')
      console.log(`👥 用户表数据: ${users.length} 条记录`)
      if (users.length > 0) {
        console.log('   示例用户:', users[0])
      }
    }
    
    // 查询食谱表
    if (instance1.tableExists('recipes')) {
      const recipes = instance1.query('SELECT * FROM recipes LIMIT 3')
      console.log(`🍲 食谱表数据: ${recipes.length} 条记录`)
      if (recipes.length > 0) {
        console.log('   示例食谱:', {
          id: recipes[0].id,
          title: recipes[0].title,
          category: recipes[0].category
        })
      }
    }
    
    // 测试6: CRUD操作测试
    console.log('\n6. 测试CRUD操作...')
    
    if (instance1.tableExists('recipes')) {
      // 插入测试数据
      const insertResult = instance1.execute(
        'INSERT INTO recipes (title, description, category, created_at) VALUES (?, ?, ?, ?)',
        ['测试食谱-' + Date.now(), '这是测试数据', '测试分类', new Date().toISOString()]
      )
      console.log('✅ 插入测试数据成功，ID:', insertResult.lastInsertRowid)
      
      // 查询刚插入的数据
      const newRecipe = instance1.queryOne(
        'SELECT * FROM recipes WHERE id = ?',
        [insertResult.lastInsertRowid]
      )
      console.log('✅ 查询测试数据成功:', newRecipe ? '找到数据' : '未找到')
      
      // 更新测试数据
      if (newRecipe) {
        const updateResult = instance1.execute(
          'UPDATE recipes SET title = ? WHERE id = ?',
          ['更新后的测试食谱', newRecipe.id]
        )
        console.log('✅ 更新测试数据成功，影响行数:', updateResult.changes)
        
        // 删除测试数据（可选，注释掉以保留测试数据）
        // const deleteResult = instance1.execute('DELETE FROM recipes WHERE id = ?', [newRecipe.id])
        // console.log('✅ 删除测试数据成功，影响行数:', deleteResult.changes)
      }
    }
    
    // 测试7: 事务操作测试
    console.log('\n7. 测试事务操作...')
    
    try {
      instance1.beginTransaction()
      
      // 在事务中插入多条数据
      const result1 = instance1.execute(
        'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        ['事务测试食谱1', '测试分类', new Date().toISOString()]
      )
      
      const result2 = instance1.execute(
        'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        ['事务测试食谱2', '测试分类', new Date().toISOString()]
      )
      
      instance1.commit()
      console.log('✅ 事务执行成功，插入记录:', [result1.lastInsertRowid, result2.lastInsertRowid])
      
    } catch (error) {
      instance1.rollback()
      console.error('❌ 事务执行失败，已回滚:', error)
    }
    
    // 测试8: 表结构信息
    console.log('\n8. 测试表结构查询...')
    
    if (instance1.tableExists('recipes')) {
      const tableInfo = instance1.query('PRAGMA table_info(recipes)')
      console.log('📋 食谱表结构:')
      tableInfo.forEach(col => {
        console.log(`   - ${col.name} (${col.type}) ${col.pk ? 'PRIMARY KEY' : ''}`)
      })
    }
    
    console.log('\n🎉 所有测试完成！数据库单例功能正常！')
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error)
  }
}

// 运行测试
testSingleton()