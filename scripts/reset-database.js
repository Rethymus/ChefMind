#!/usr/bin/env node

/**
 * SQLite 数据库重置脚本
 * 用于重置和清理 SQLite 数据库
 */

import fs from 'fs'
import { sqliteConfig } from '../src/config/sqlite.js'

async function resetDatabase() {
  try {
    console.log('🔄 开始重置 SQLite 数据库...')
    
    // 获取数据库路径
    const dbPath = sqliteConfig.getStatus().path
    
    // 关闭数据库连接
    sqliteConfig.disconnect()
    
    // 删除数据库文件
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath)
      console.log(`🗑️  已删除数据库文件: ${dbPath}`)
    }
    
    // 删除 WAL 文件（如果存在）
    const walPath = `${dbPath}-wal`
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath)
      console.log(`🗑️  已删除 WAL 文件: ${walPath}`)
    }
    
    // 删除 SHM 文件（如果存在）
    const shmPath = `${dbPath}-shm`
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath)
      console.log(`🗑️  已删除 SHM 文件: ${shmPath}`)
    }
    
    console.log('✅ 数据库重置完成!')
    
  } catch (error) {
    console.error('❌ 数据库重置失败:', error)
    process.exit(1)
  }
}

// 运行重置
resetDatabase()