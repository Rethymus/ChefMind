#!/usr/bin/env node

/**
 * Simple SQLite database initialization script
 * Creates the chefmind.db file and basic tables
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Database path
const dbPath = path.join(process.cwd(), 'data', 'chefmind.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log('🚀 开始初始化 SQLite 数据库...');
console.log(`📁 数据库路径: ${dbPath}`);

try {
  // Create database connection
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  console.log('📋 创建数据表...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      preferences TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Recipes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      ingredients TEXT NOT NULL,
      instructions TEXT NOT NULL,
      cooking_time TEXT,
      difficulty TEXT,
      servings INTEGER DEFAULT 4,
      category TEXT,
      tags TEXT,
      nutrition_info TEXT,
      image_url TEXT,
      view_count INTEGER DEFAULT 0,
      favorite_count INTEGER DEFAULT 0,
      rating_count INTEGER DEFAULT 0,
      average_rating REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      recipe_id INTEGER NOT NULL,
      recipe_title TEXT,
      recipe_image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (session_id) REFERENCES users(session_id) ON DELETE CASCADE,
      UNIQUE(session_id, recipe_id)
    )
  `);

  // Create indexes
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_favorites_session_id ON favorites(session_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_favorites_recipe_id ON favorites(recipe_id)');

  // Get database info
  const tableCount = db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get().count;
  const stats = fs.statSync(dbPath);

  console.log('✅ 数据库初始化完成!');
  console.log('📊 数据库信息:');
  console.log(`  - 表数量: ${tableCount}`);
  console.log(`  - 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`  - 路径: ${dbPath}`);

  // Close connection
  db.close();

} catch (error) {
  console.error('❌ 数据库初始化失败:', error.message);
  process.exit(1);
}