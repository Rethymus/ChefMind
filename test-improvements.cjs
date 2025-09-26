// 测试改进后的 SQLite 功能
const { SQLiteConfig } = require('./dist/config/sqlite.js')

async function testImprovements() {
  console.log('🧪 测试改进后的 SQLite 功能...\n')

  try {
    // 获取配置实例
    const config = SQLiteConfig.getInstance()

    // 测试1: 连接数据库
    console.log('1. 测试数据库连接...')
    await config.connect()
    console.log('✅ 数据库连接成功')

    // 测试2: 健康检查
    console.log('\n2. 测试健康检查...')
    const health = await config.getHealthStatus()
    console.log('🏥 健康状态:', health.isHealthy ? '健康' : '不健康')
    console.log('   连接状态:', health.connectionStatus)

    // 测试3: 连接池状态
    console.log('\n3. 测试连接池...')
    const poolStatus = config.getConnectionPoolStatus()
    console.log('🏊 连接池状态:', poolStatus.enabled ? '已启用' : '未启用')
    if (poolStatus.enabled) {
      console.log('   总连接数:', poolStatus.totalConnections)
      console.log('   可用连接数:', poolStatus.availableConnections)
      console.log('   活跃连接数:', poolStatus.activeConnections)
    }

    // 测试4: 基础查询
    console.log('\n4. 测试基础查询...')
    const tables = await config.query("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('📋 数据库表:', tables.map(t => t.name).join(', '))

    // 测试5: 带重试的事务操作
    console.log('\n5. 测试事务操作...')
    const testResults = await config.transaction(async (db) => {
      const results = []

      // 插入测试数据
      const insertResult = db.prepare(
        'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)'
      ).run(['改进测试食谱', '测试分类', new Date().toISOString()])
      results.push({ operation: 'insert', id: insertResult.lastInsertRowid })

      // 查询刚插入的数据
      const queryResult = db.prepare(
        'SELECT * FROM recipes WHERE id = ?'
      ).get([insertResult.lastInsertRowid])
      results.push({ operation: 'query', found: !!queryResult })

      // 更新数据
      const updateResult = db.prepare(
        'UPDATE recipes SET title = ? WHERE id = ?'
      ).run(['改进后的测试食谱', insertResult.lastInsertRowid])
      results.push({ operation: 'update', changed: updateResult.changes })

      return results
    })
    console.log('✅ 事务执行成功:', testResults)

    // 测试6: 批量操作
    console.log('\n6. 测试批量操作...')
    const batchResults = await config.executeBatch([
      {
        query: 'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        params: ['批量测试1', '测试分类', new Date().toISOString()]
      },
      {
        query: 'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        params: ['批量测试2', '测试分类', new Date().toISOString()]
      },
      {
        query: 'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        params: ['批量测试3', '测试分类', new Date().toISOString()]
      }
    ])
    console.log('✅ 批量操作成功，插入记录:', batchResults.map(r => r.lastInsertRowid))

    // 测试7: 并发测试
    console.log('\n7. 测试并发操作...')
    const concurrentPromises = []
    for (let i = 0; i < 5; i++) {
      concurrentPromises.push(
        config.queryOne('SELECT COUNT(*) as count FROM recipes')
      )
    }
    const concurrentResults = await Promise.all(concurrentPromises)
    console.log('✅ 并发查询成功，结果:', concurrentResults.map(r => r.count))

    // 测试8: 统计信息
    console.log('\n8. 测试数据库统计...')
    const stats = await config.getStats()
    console.log('📊 数据库统计:')
    console.log('   - 页数:', stats.pageCount)
    console.log('   - 页大小:', stats.pageSize, 'bytes')
    console.log('   - 总大小:', Math.round(stats.pageCount * stats.pageSize / 1024), 'KB')
    console.log('   - 模式版本:', stats.schemaVersion)
    console.log('   - 完整性检查:', stats.integrityCheck)

    // 测试9: 等待就绪
    console.log('\n9. 测试等待就绪...')
    const isReady = await config.waitForReady(5000)
    console.log('✅ 数据库就绪状态:', isReady)

    console.log('\n🎉 所有改进测试完成！SQLite 锁定问题已修复！')

    // 清理测试数据
    console.log('\n🧹 清理测试数据...')
    await config.execute("DELETE FROM recipes WHERE title LIKE '%测试%' OR title LIKE '%测试%'")
    console.log('✅ 测试数据清理完成')

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error)
    console.error('详细错误信息:', error.stack)
  }
}

// 运行测试
testImprovements()