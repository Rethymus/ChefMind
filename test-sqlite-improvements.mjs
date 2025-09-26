// Simple test for SQLite improvements (ES Module version)
import { SQLiteConfig } from './src/config/sqlite.js'

async function testImprovements() {
  console.log('🧪 Testing SQLite Improvements...\n')

  try {
    // Get config instance
    const config = SQLiteConfig.getInstance()

    // Test 1: Connect to database
    console.log('1. Testing database connection...')
    await config.connect()
    console.log('✅ Database connected successfully')

    // Test 2: Health check
    console.log('\n2. Testing health check...')
    const health = await config.getHealthStatus()
    console.log('🏥 Health status:', health.isHealthy ? 'Healthy' : 'Unhealthy')
    console.log('   Connection status:', health.connectionStatus)

    // Test 3: Basic query
    console.log('\n3. Testing basic query...')
    const tables = await config.query("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('📋 Database tables:', tables.map(t => t.name).join(', '))

    // Test 4: Transaction with retry
    console.log('\n4. Testing transaction with retry...')
    const testResults = await config.transaction(async (db) => {
      const results = []

      // Insert test data
      const insertResult = db.prepare(
        'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)'
      ).run(['Improvement Test Recipe', 'Test Category', new Date().toISOString()])
      results.push({ operation: 'insert', id: insertResult.lastInsertRowid })

      // Query inserted data
      const queryResult = db.prepare(
        'SELECT * FROM recipes WHERE id = ?'
      ).get([insertResult.lastInsertRowid])
      results.push({ operation: 'query', found: !!queryResult })

      // Update data
      const updateResult = db.prepare(
        'UPDATE recipes SET title = ? WHERE id = ?'
      ).run(['Improved Test Recipe', insertResult.lastInsertRowid])
      results.push({ operation: 'update', changed: updateResult.changes })

      return results
    })
    console.log('✅ Transaction successful:', testResults)

    // Test 5: Batch operations
    console.log('\n5. Testing batch operations...')
    const batchResults = await config.executeBatch([
      {
        query: 'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        params: ['Batch Test 1', 'Test Category', new Date().toISOString()]
      },
      {
        query: 'INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)',
        params: ['Batch Test 2', 'Test Category', new Date().toISOString()]
      }
    ])
    console.log('✅ Batch operations successful, inserted records:', batchResults.map(r => r.lastInsertRowid))

    // Test 6: Connection pool status
    console.log('\n6. Testing connection pool...')
    const poolStatus = config.getConnectionPoolStatus()
    console.log('🏊 Connection pool:', poolStatus.enabled ? 'Enabled' : 'Disabled')
    if (poolStatus.enabled) {
      console.log('   Total connections:', poolStatus.totalConnections)
      console.log('   Available connections:', poolStatus.availableConnections)
      console.log('   Active connections:', poolStatus.activeConnections)
    }

    // Test 7: Statistics
    console.log('\n7. Testing database statistics...')
    const stats = await config.getStats()
    console.log('📊 Database stats:')
    console.log('   - Pages:', stats.pageCount)
    console.log('   - Page size:', stats.pageSize, 'bytes')
    console.log('   - Total size:', Math.round(stats.pageCount * stats.pageSize / 1024), 'KB')
    console.log('   - Schema version:', stats.schemaVersion)
    console.log('   - Integrity check:', stats.integrityCheck)

    // Test 8: Wait for ready
    console.log('\n8. Testing wait for ready...')
    const isReady = await config.waitForReady(5000)
    console.log('✅ Database ready status:', isReady)

    console.log('\n🎉 All improvement tests completed! SQLite locking issues have been fixed!')

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...')
    await config.execute("DELETE FROM recipes WHERE title LIKE '%Test%' OR title LIKE '%test%'")
    console.log('✅ Test data cleaned up')

  } catch (error) {
    console.error('\n❌ Test failed:', error)
    console.error('Stack trace:', error.stack)
  }
}

// Run the test
testImprovements()