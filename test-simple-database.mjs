// 简化的数据库功能测试
import { databaseSingleton } from './src/services/database/databaseSingleton.js'

async function testSimpleDatabaseOperations() {
  console.log('🧪 简化数据库功能测试...\n')

  try {
    // 初始化数据库
    console.log('1. 初始化数据库...')
    await databaseSingleton.initialize()
    console.log('✅ 数据库初始化成功')

    // 获取数据库状态
    console.log('\n2. 获取数据库状态...')
    const status = databaseSingleton.getStatus()
    console.log('📊 数据库状态:')
    console.log('   - 连接状态:', status.connected ? '已连接' : '未连接')
    console.log('   - 数据库路径:', status.path)
    console.log('   - 文件大小:', Math.round(status.size / 1024), 'KB')
    console.log('   - 表数量:', status.tableCount)
    console.log('   - 版本:', status.version)

    // 测试基础查询
    console.log('\n3. 测试基础查询...')
    const tables = databaseSingleton.query("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('📋 数据库表:', tables.map(t => t.name).join(', '))

    // 测试事务操作
    console.log('\n4. 测试事务操作...')
    const result = databaseSingleton.transaction((db) => {
      // 插入测试数据
      const insertResult = db.prepare(
        'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)'
      ).run(['数据库测试食谱', '测试分类', new Date().toISOString()])

      // 查询刚插入的数据
      const queryResult = db.prepare(
        'SELECT * FROM recipes WHERE id = ?'
      ).get([insertResult.lastInsertRowid])

      // 更新数据
      const updateResult = db.prepare(
        'UPDATE recipes SET title = ? WHERE id = ?'
      ).run(['更新的数据库测试食谱', insertResult.lastInsertRowid])

      return {
        insertId: insertResult.lastInsertRowid,
        inserted: insertResult.changes,
        queried: queryResult ? 'found' : 'not found',
        updated: updateResult.changes
      }
    })

    console.log('✅ 事务操作成功')
    console.log('   插入ID:', result.insertId)
    console.log('   插入记录:', result.inserted)
    console.log('   查询结果:', result.queried)
    console.log('   更新记录:', result.updated)

    // 测试并发查询
    console.log('\n5. 测试并发查询...')
    const concurrentPromises = []
    for (let i = 0; i < 3; i++) {
      concurrentPromises.push(
        Promise.resolve().then(() => {
          const count = databaseSingleton.queryOne('SELECT COUNT(*) as count FROM recipes')
          return count.count
        })
      )
    }

    const concurrentResults = await Promise.all(concurrentPromises)
    console.log('✅ 并发查询成功')
    console.log('   查询结果:', concurrentResults.join(', '))
    console.log('   结果一致性:', new Set(concurrentResults).size === 1 ? '✅ 一致' : '❌ 不一致')

    // 测试批量操作
    console.log('\n6. 测试批量操作...')
    const batchResults = []
    for (let i = 0; i < 3; i++) {
      const result = databaseSingleton.insert('recipes', {
        title: `批量测试食谱 ${i + 1}`,
        category: '测试分类',
        created_at: new Date().toISOString()
      })
      batchResults.push(result.lastInsertRowid)
    }
    console.log('✅ 批量操作成功')
    console.log('   插入记录:', batchResults.join(', '))

    // 测试搜索功能
    console.log('\n7. 测试搜索功能...')
    const searchResults = databaseSingleton.query(
      "SELECT * FROM recipes WHERE title LIKE '%测试%'"
    )
    console.log('✅ 搜索功能成功')
    console.log('   搜索结果数量:', searchResults.length)

    // 测试删除操作
    console.log('\n8. 测试删除操作...')
    const deleteResult = databaseSingleton.execute(
      "DELETE FROM recipes WHERE title LIKE '%测试%' OR title LIKE '%数据库%'"
    )
    console.log('✅ 删除操作成功')
    console.log('   删除记录:', deleteResult.changes)

    // 测试连接池状态（如果启用）
    console.log('\n9. 测试连接池状态...')
    try {
      const poolStatus = databaseSingleton.getConnectionPoolStatus()
      console.log('🏊 连接池状态:', poolStatus.enabled ? '已启用' : '未启用')
      if (poolStatus.enabled) {
        console.log('   总连接数:', poolStatus.totalConnections)
        console.log('   可用连接数:', poolStatus.availableConnections)
        console.log('   活跃连接数:', poolStatus.activeConnections)
      }
    } catch (error) {
      console.log('   连接池检查: 未启用或不可用')
    }

    // 测试数据库优化
    console.log('\n10. 测试数据库优化...')
    try {
      databaseSingleton.optimize()
      console.log('✅ 数据库优化成功')
    } catch (error) {
      console.log('⚠️  数据库优化跳过:', error.message)
    }

    console.log('\n🎉 所有简化数据库测试完成！')

    // 最终状态检查
    console.log('\n📊 最终状态检查...')
    const finalStatus = databaseSingleton.getStatus()
    const finalCount = databaseSingleton.queryOne('SELECT COUNT(*) as count FROM recipes')
    console.log('   数据库状态:', finalStatus.connected ? '正常' : '异常')
    console.log('   剩余食谱数量:', finalCount.count)

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error)
    console.error('详细错误信息:', error.stack)
  } finally {
    // 关闭数据库连接
    try {
      databaseSingleton.close()
      console.log('\n🔒 数据库连接已关闭')
    } catch (error) {
      console.log('⚠️  关闭数据库连接时出错:', error.message)
    }
  }
}

// 运行测试
testSimpleDatabaseOperations()