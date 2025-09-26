#!/usr/bin/env node

/**
 * 验证家常菜数据脚本
 * 显示所有添加的家常菜详细信息
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// 数据库路径
const dbPath = path.join(process.cwd(), 'data', 'chefmind.db');

console.log('🔍 验证家常菜数据...\n');

async function verifyRecipes() {
  try {
    // 检查数据库文件是否存在
    if (!fs.existsSync(dbPath)) {
      console.log('❌ 数据库文件不存在');
      return;
    }

    // 连接数据库
    const db = new Database(dbPath);

    // 1. 获取所有菜谱
    console.log('1. 所有菜谱列表:');
    const allRecipes = db.prepare('SELECT id, title, category, cooking_time, difficulty FROM recipes ORDER BY id').all();
    
    allRecipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. [ID:${recipe.id}] ${recipe.title} (${recipe.category}) - ${recipe.cooking_time} - ${recipe.difficulty}`);
    });

    // 2. 分类统计
    console.log('\n2. 菜谱分类统计:');
    const categories = db.prepare('SELECT category, COUNT(*) as count FROM recipes GROUP BY category ORDER BY count DESC').all();
    categories.forEach(cat => {
      console.log(`   • ${cat.category}: ${cat.count} 道菜`);
    });

    // 3. 显示几道家常菜的详细信息
    console.log('\n3. 家常菜详细信息:');
    
    const sampleRecipes = db.prepare(`
      SELECT * FROM recipes 
      WHERE category IN ('中餐', '家常菜', '川菜', '素菜') 
      ORDER BY id 
      LIMIT 5
    `).all();

    sampleRecipes.forEach((recipe, index) => {
      console.log(`\n📝 菜谱 ${index + 1}: ${recipe.title}`);
      console.log(`   📖 描述: ${recipe.description}`);
      console.log(`   ⏱️  时间: ${recipe.cooking_time}`);
      console.log(`   ⚡ 难度: ${recipe.difficulty}`);
      console.log(`   👨‍👩‍👧‍👦 份量: ${recipe.servings} 人`);
      
      // 解析食材
      try {
        const ingredients = JSON.parse(recipe.ingredients);
        console.log(`   🛒 食材:`);
        ingredients.forEach(ing => {
          console.log(`      - ${ing.name}: ${ing.amount} ${ing.unit || ''}`);
        });
      } catch (e) {
        console.log(`   🛒 食材: ${recipe.ingredients}`);
      }
      
      // 解析步骤
      try {
        const instructions = JSON.parse(recipe.instructions);
        console.log(`   👩‍🍳 步骤:`);
        instructions.forEach((step, i) => {
          console.log(`      ${i + 1}. ${step}`);
        });
      } catch (e) {
        console.log(`   👩‍🍳 步骤: ${recipe.instructions}`);
      }
    });

    // 4. 搜索功能测试
    console.log('\n4. 搜索功能测试:');
    
    const searchKeywords = ['红烧', '鸡蛋', '土豆', '川菜'];
    searchKeywords.forEach(keyword => {
      const results = db.prepare(`
        SELECT id, title, category FROM recipes 
        WHERE title LIKE ? OR description LIKE ? OR category LIKE ?
        LIMIT 3
      `).all(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
      
      console.log(`   🔍 搜索 "${keyword}": ${results.length} 个结果`);
      results.forEach(result => {
        console.log(`      - ${result.title} (${result.category})`);
      });
    });

    // 5. 数据库整体信息
    console.log('\n5. 数据库整体信息:');
    const totalRecipes = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
    const avgCookingTime = db.prepare('SELECT AVG(CAST(REPLACE(cooking_time, "分钟", "") AS REAL)) as avg_time FROM recipes WHERE cooking_time LIKE "%分钟%";').get();
    
    console.log(`   📊 总菜谱数: ${totalRecipes} 道`);
    console.log(`   ⏱️  平均烹饪时间: ${avgCookingTime.avg_time ? avgCookingTime.avg_time.toFixed(1) + '分钟' : '未知'}`);
    
    const difficultyStats = db.prepare('SELECT difficulty, COUNT(*) as count FROM recipes GROUP BY difficulty').all();
    console.log(`   📈 难度分布:`);
    difficultyStats.forEach(stat => {
      console.log(`      • ${stat.difficulty}: ${stat.count} 道`);
    });

    // 关闭数据库连接
    db.close();

    console.log('\n✅ 家常菜数据验证完成！');
    console.log('🎉 数据库已成功添加丰富的中式家常菜数据！');

  } catch (error) {
    console.error('❌ 验证过程发生错误:', error.message);
  }
}

// 运行验证脚本
verifyRecipes();