#!/usr/bin/env node

/**
 * SQLite 数据库初始化脚本
 * 用于创建和初始化 SQLite 数据库
 */

import { databaseInitializer } from '../src/utils/sqliteInitializer.ts'
import { sqliteConfig } from '../src/config/sqlite.ts'

async function initializeDatabase() {
  try {
    console.log('🚀 开始初始化 SQLite 数据库...')
    
    // 初始化数据库
    await databaseInitializer.initialize()
    
    // 获取数据库状态
    const status = sqliteConfig.getStatus()
    console.log('📊 数据库状态:', {
      connected: status.connected,
      path: status.path,
      size: `${(status.size / 1024).toFixed(2)} KB`,
      tableCount: status.tableCount,
      version: status.version
    })
    
    // 显示表信息
    console.log('📋 数据库表信息:')
    const tables = sqliteConfig.query("SELECT name FROM sqlite_master WHERE type='table'")
    tables.forEach(table => {
      const columns = sqliteConfig.getTableInfo(table.name)
      console.log(`  - ${table.name}: ${columns.length} 个字段`)
    })
    
    console.log('✅ 数据库初始化完成!')
    console.log(`📁 数据库文件位置: ${status.path}`)
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error)
    process.exit(1)
  }
}

// 运行初始化
initializeDatabase()