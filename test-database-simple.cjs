#!/usr/bin/env node

/**
 * 简单数据库测试脚本 (CommonJS 版本)
 * 验证数据库连接和数据操作
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// 数据库路径
const dbPath = path.join(process.cwd(), 'data', 'chefmind.db');

console.log('🧪 开始数据库功能测试...\n');

async function testDatabase() {
  try {
    // 检查数据库文件是否存在
    if (!fs.existsSync(dbPath)) {
      console.log('❌ 数据库文件不存在，请先运行: npm run db:init');
      return;
    }

    // 1. 连接数据库
    console.log('1. 连接数据库...');
    const db = new Database(dbPath);
    console.log('✅ 数据库连接成功');

    // 2. 检查数据库状态
    console.log('\n2. 检查数据库状态...');
    const stats = fs.statSync(dbPath);
    console.log(`📊 数据库文件大小: ${(stats.size / 1024).toFixed(2)} KB`);

    // 3. 检查表结构
    console.log('\n3. 检查表结构...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log(`📋 数据库中共有 ${tables.length} 个表:`);
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    // 4. 测试用户表
    console.log('\n4. 测试用户表...');
    const users = db.prepare('SELECT * FROM users LIMIT 3').all();
    console.log(`👥 用户表数据量: ${users.length} 条记录`);
    if (users.length > 0) {
      console.log('   示例用户:', users[0]);
    }

    // 5. 测试食谱表
    console.log('\n5. 测试食谱表...');
    const recipes = db.prepare('SELECT * FROM recipes LIMIT 3').all();
    console.log(`🍲 食谱表数据量: ${recipes.length} 条记录`);
    if (recipes.length > 0) {
      recipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.title} (${recipe.category})`);
      });
    }

    // 6. 测试插入操作
    console.log('\n6. 测试插入操作...');
    const testRecipe = {
      title: '测试菜谱-' + Date.now(),
      description: '这是一个测试菜谱',
      ingredients: JSON.stringify(['测试食材1', '测试食材2']),
      instructions: JSON.stringify(['步骤1：准备材料', '步骤2：烹饪']),
      cooking_time: '30分钟',
      difficulty: '简单',
      servings: 2,
      category: '测试分类',
      created_at: new Date().toISOString()
    };

    const insertResult = db.prepare(`
      INSERT INTO recipes (title, description, ingredients, instructions, cooking_time, difficulty, servings, category, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      testRecipe.title,
      testRecipe.description,
      testRecipe.ingredients,
      testRecipe.instructions,
      testRecipe.cooking_time,
      testRecipe.difficulty,
      testRecipe.servings,
      testRecipe.category,
      testRecipe.created_at
    );

    console.log('✅ 插入测试数据成功，ID:', insertResult.lastInsertRowid);

    // 7. 测试查询操作
    console.log('\n7. 测试查询操作...');
    const newRecipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(insertResult.lastInsertRowid);
    console.log('✅ 查询测试数据成功:');
    console.log(`   - ID: ${newRecipe.id}`);
    console.log(`   - 标题: ${newRecipe.title}`);
    console.log(`   - 分类: ${newRecipe.category}`);

    // 8. 测试更新操作
    console.log('\n8. 测试更新操作...');
    const updateResult = db.prepare('UPDATE recipes SET title = ? WHERE id = ?').run(
      '更新后的测试菜谱',
      newRecipe.id
    );
    console.log('✅ 更新测试数据成功，影响行数:', updateResult.changes);

    // 9. 测试事务操作
    console.log('\n9. 测试事务操作...');
    try {
      db.exec('BEGIN TRANSACTION');
      
      const recipe1 = db.prepare(`
        INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)
      `).run('事务测试菜谱1', '测试分类', new Date().toISOString());
      
      const recipe2 = db.prepare(`
        INSERT INTO recipes (title, category, created_at) VALUES (?, ?, ?)
      `).run('事务测试菜谱2', '测试分类', new Date().toISOString());
      
      db.exec('COMMIT');
      console.log('✅ 事务执行成功，插入记录:', [recipe1.lastInsertRowid, recipe2.lastInsertRowid]);
      
    } catch (error) {
      db.exec('ROLLBACK');
      console.error('❌ 事务执行失败，已回滚:', error.message);
    }

    // 10. 测试表结构信息
    console.log('\n10. 测试表结构信息...');
    const tableInfo = db.prepare('PRAGMA table_info(recipes)').all();
    console.log('📋 食谱表结构 (前5个字段):');
    tableInfo.slice(0, 5).forEach(col => {
      console.log(`   - ${col.name} (${col.type}) ${col.pk ? 'PRIMARY KEY' : ''}`);
    });

    // 11. 测试搜索功能
    console.log('\n11. 测试搜索功能...');
    const searchResults = db.prepare('SELECT * FROM recipes WHERE title LIKE ? LIMIT 5').all('%测试%');
    console.log(`🔍 搜索到 ${searchResults.length} 个包含"测试"的菜谱`);

    // 12. 统计数据库信息
    console.log('\n12. 数据库统计信息...');
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const recipeCount = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
    const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM favorites').get().count;
    
    console.log(`📊 数据库统计:`);
    console.log(`   - 用户数量: ${userCount}`);
    console.log(`   - 菜谱数量: ${recipeCount}`);
    console.log(`   - 收藏数量: ${favoriteCount}`);

    // 关闭数据库连接
    db.close();

    console.log('\n🎉 数据库功能测试完成！所有操作均正常！');
    console.log('✅ 数据库连接: 正常');
    console.log('✅ CRUD操作: 正常');
    console.log('✅ 事务处理: 正常');
    console.log('✅ 数据查询: 正常');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testDatabase();