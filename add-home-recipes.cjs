#!/usr/bin/env node

/**
 * 添加家常菜数据脚本
 * 向数据库中添加常见的中式家常菜
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// 数据库路径
const dbPath = path.join(process.cwd(), 'data', 'chefmind.db');

console.log('🍲 开始添加家常菜数据...\n');

// 家常菜数据
const homeRecipes = [
  {
    title: '红烧肉',
    description: '经典中式家常菜，色泽红亮，肥而不腻',
    ingredients: JSON.stringify([
      { name: '五花肉', amount: '500克', unit: '克' },
      { name: '姜', amount: '3片', unit: '片' },
      { name: '葱', amount: '2根', unit: '根' },
      { name: '料酒', amount: '2汤匙', unit: '汤匙' },
      { name: '生抽', amount: '2汤匙', unit: '汤匙' },
      { name: '老抽', amount: '1汤匙', unit: '汤匙' },
      { name: '冰糖', amount: '30克', unit: '克' },
      { name: '八角', amount: '2个', unit: '个' },
      { name: '桂皮', amount: '1小块', unit: '块' }
    ]),
    instructions: JSON.stringify([
      '五花肉切块，冷水下锅焯水去血沫',
      '热锅冷油，放入冰糖小火炒至融化呈焦糖色',
      '放入五花肉翻炒上色',
      '加入料酒、生抽、老抽继续翻炒',
      '加入姜片、葱段、八角、桂皮',
      '加入适量热水，大火烧开转小火炖煮40分钟',
      '最后大火收汁即可'
    ]),
    cooking_time: '60分钟',
    difficulty: '中等',
    servings: 4,
    category: '中餐',
    tags: JSON.stringify(['红烧', '家常菜', '猪肉']),
    nutrition_info: JSON.stringify({
      calories: 350,
      protein: 25,
      fat: 28,
      carbs: 15
    }),
    image_url: '/images/braised_pork.jpg'
  },
  {
    title: '西红柿炒鸡蛋',
    description: '简单易做的家常菜，酸甜可口',
    ingredients: JSON.stringify([
      { name: '西红柿', amount: '2个', unit: '个' },
      { name: '鸡蛋', amount: '3个', unit: '个' },
      { name: '葱', amount: '1根', unit: '根' },
      { name: '盐', amount: '适量', unit: '适量' },
      { name: '糖', amount: '1茶匙', unit: '茶匙' },
      { name: '食用油', amount: '2汤匙', unit: '汤匙' }
    ]),
    instructions: JSON.stringify([
      '西红柿洗净切块，鸡蛋打散备用',
      '热锅凉油，倒入鸡蛋液炒熟盛出',
      '锅中留底油，放入西红柿块翻炒',
      '加入糖和适量盐调味',
      '炒至西红柿出汁，放入炒好的鸡蛋',
      '快速翻炒均匀即可出锅'
    ]),
    cooking_time: '15分钟',
    difficulty: '简单',
    servings: 2,
    category: '中餐',
    tags: JSON.stringify(['快手菜', '家常菜', '素菜']),
    nutrition_info: JSON.stringify({
      calories: 180,
      protein: 12,
      fat: 10,
      carbs: 8
    }),
    image_url: '/images/tomato_egg.jpg'
  },
  {
    title: '麻婆豆腐',
    description: '川菜经典，麻辣鲜香',
    ingredients: JSON.stringify([
      { name: '嫩豆腐', amount: '1块', unit: '块' },
      { name: '猪肉末', amount: '100克', unit: '克' },
      { name: '豆瓣酱', amount: '2汤匙', unit: '汤匙' },
      { name: '花椒粉', amount: '1茶匙', unit: '茶匙' },
      { name: '葱姜蒜', amount: '适量', unit: '适量' },
      { name: '生抽', amount: '1汤匙', unit: '汤匙' },
      { name: '淀粉', amount: '1茶匙', unit: '茶匙' }
    ]),
    instructions: JSON.stringify([
      '豆腐切块，焯水备用',
      '热锅凉油，放入猪肉末炒散',
      '加入豆瓣酱炒出红油',
      '放入葱姜蒜末炒香',
      '加入适量水，放入豆腐块',
      '小火煮5分钟，加入生抽调味',
      '水淀粉勾芡，撒上花椒粉即可'
    ]),
    cooking_time: '20分钟',
    difficulty: '中等',
    servings: 3,
    category: '川菜',
    tags: JSON.stringify(['麻辣', '豆腐', '川菜']),
    nutrition_info: JSON.stringify({
      calories: 200,
      protein: 15,
      fat: 12,
      carbs: 10
    }),
    image_url: '/images/mapo_tofu.jpg'
  },
  {
    title: '青椒土豆丝',
    description: '清爽可口的家常小炒',
    ingredients: JSON.stringify([
      { name: '土豆', amount: '2个', unit: '个' },
      { name: '青椒', amount: '1个', unit: '个' },
      { name: '大蒜', amount: '2瓣', unit: '瓣' },
      { name: '干辣椒', amount: '2个', unit: '个' },
      { name: '醋', amount: '1汤匙', unit: '汤匙' },
      { name: '盐', amount: '适量', unit: '适量' }
    ]),
    instructions: JSON.stringify([
      '土豆去皮切丝，放入清水中浸泡',
      '青椒切丝，大蒜切片',
      '热锅凉油，放入干辣椒和蒜片爆香',
      '放入土豆丝大火快炒',
      '加入青椒丝继续翻炒',
      '加入醋和盐调味，炒匀即可'
    ]),
    cooking_time: '15分钟',
    difficulty: '简单',
    servings: 2,
    category: '素菜',
    tags: JSON.stringify(['快手菜', '素菜', '家常']),
    nutrition_info: JSON.stringify({
      calories: 120,
      protein: 3,
      fat: 5,
      carbs: 20
    }),
    image_url: '/images/potato_shreds.jpg'
  },
  {
    title: '可乐鸡翅',
    description: '甜咸可口，孩子最爱',
    ingredients: JSON.stringify([
      { name: '鸡翅', amount: '8个', unit: '个' },
      { name: '可乐', amount: '1罐', unit: '罐' },
      { name: '生抽', amount: '2汤匙', unit: '汤匙' },
      { name: '老抽', amount: '1汤匙', unit: '汤匙' },
      { name: '姜', amount: '3片', unit: '片' },
      { name: '料酒', amount: '1汤匙', unit: '汤匙' }
    ]),
    instructions: JSON.stringify([
      '鸡翅两面划几刀，方便入味',
      '鸡翅用料酒和姜片腌制10分钟',
      '热锅少油，放入鸡翅煎至两面金黄',
      '倒入可乐，加入生抽、老抽',
      '大火烧开转小火煮15分钟',
      '最后大火收汁即可'
    ]),
    cooking_time: '30分钟',
    difficulty: '简单',
    servings: 2,
    category: '家常菜',
    tags: JSON.stringify(['鸡翅', '甜咸', '儿童喜爱']),
    nutrition_info: JSON.stringify({
      calories: 280,
      protein: 20,
      fat: 15,
      carbs: 25
    }),
    image_url: '/images/coke_chicken.jpg'
  },
  {
    title: '鱼香肉丝',
    description: '川菜经典，鱼香味浓郁',
    ingredients: JSON.stringify([
      { name: '猪里脊', amount: '200克', unit: '克' },
      { name: '木耳', amount: '适量', unit: '适量' },
      { name: '胡萝卜', amount: '半根', unit: '根' },
      { name: '青椒', amount: '1个', unit: '个' },
      { name: '郫县豆瓣酱', amount: '1汤匙', unit: '汤匙' },
      { name: '醋', amount: '1汤匙', unit: '汤匙' },
      { name: '糖', amount: '1汤匙', unit: '汤匙' }
    ]),
    instructions: JSON.stringify([
      '猪肉切丝，用淀粉、料酒腌制',
      '木耳、胡萝卜、青椒切丝',
      '调鱼香汁：醋、糖、生抽、淀粉混合',
      '热锅凉油，滑炒肉丝盛出',
      '锅中留底油，炒香豆瓣酱',
      '放入蔬菜丝翻炒，加入肉丝',
      '倒入鱼香汁，快速翻炒均匀'
    ]),
    cooking_time: '25分钟',
    difficulty: '中等',
    servings: 3,
    category: '川菜',
    tags: JSON.stringify(['鱼香', '川菜', '肉丝']),
    nutrition_info: JSON.stringify({
      calories: 220,
      protein: 18,
      fat: 12,
      carbs: 15
    }),
    image_url: '/images/fish_pork.jpg'
  },
  {
    title: '清炒时蔬',
    description: '简单健康的蔬菜小炒',
    ingredients: JSON.stringify([
      { name: '青菜', amount: '300克', unit: '克' },
      { name: '大蒜', amount: '3瓣', unit: '瓣' },
      { name: '盐', amount: '适量', unit: '适量' },
      { name: '食用油', amount: '1汤匙', unit: '汤匙' }
    ]),
    instructions: JSON.stringify([
      '青菜洗净，大蒜切片',
      '热锅凉油，放入蒜片爆香',
      '放入青菜大火快速翻炒',
      '加入适量盐调味',
      '炒至青菜变软即可出锅'
    ]),
    cooking_time: '8分钟',
    difficulty: '简单',
    servings: 2,
    category: '素菜',
    tags: JSON.stringify(['快手菜', '素菜', '健康']),
    nutrition_info: JSON.stringify({
      calories: 80,
      protein: 3,
      fat: 5,
      carbs: 10
    }),
    image_url: '/images/vegetables.jpg'
  },
  {
    title: '酸辣土豆丝',
    description: '酸辣开胃的下饭菜',
    ingredients: JSON.stringify([
      { name: '土豆', amount: '2个', unit: '个' },
      { name: '干辣椒', amount: '3个', unit: '个' },
      { name: '大蒜', amount: '2瓣', unit: '瓣' },
      { name: '醋', amount: '2汤匙', unit: '汤匙' },
      { name: '生抽', amount: '1汤匙', unit: '汤匙' },
      { name: '糖', amount: '半茶匙', unit: '茶匙' }
    ]),
    instructions: JSON.stringify([
      '土豆去皮切丝，浸泡去除淀粉',
      '干辣椒切段，大蒜切片',
      '热锅凉油，爆香干辣椒和蒜片',
      '放入土豆丝大火快速翻炒',
      '加入醋、生抽、糖调味',
      '炒至土豆丝变软即可'
    ]),
    cooking_time: '15分钟',
    difficulty: '简单',
    servings: 2,
    category: '家常菜',
    tags: JSON.stringify(['酸辣', '下饭菜', '土豆']),
    nutrition_info: JSON.stringify({
      calories: 130,
      protein: 3,
      fat: 6,
      carbs: 22
    }),
    image_url: '/images/sour_potato.jpg'
  },
  {
    title: '宫保鸡丁',
    description: '经典川菜，麻辣鲜香',
    ingredients: JSON.stringify([
      { name: '鸡胸肉', amount: '200克', unit: '克' },
      { name: '花生米', amount: '50克', unit: '克' },
      { name: '干辣椒', amount: '5个', unit: '个' },
      { name: '花椒', amount: '1茶匙', unit: '茶匙' },
      { name: '葱姜蒜', amount: '适量', unit: '适量' },
      { name: '生抽', amount: '2汤匙', unit: '汤匙' }
    ]),
    instructions: JSON.stringify([
      '鸡胸肉切丁，用淀粉腌制',
      '干辣椒切段，葱切段',
      '热锅凉油，滑炒鸡丁盛出',
      '锅中留底油，爆香干辣椒和花椒',
      '放入葱姜蒜炒香，加入鸡丁',
      '倒入生抽调味，最后加入花生米'
    ]),
    cooking_time: '20分钟',
    difficulty: '中等',
    servings: 3,
    category: '川菜',
    tags: JSON.stringify(['宫保', '川菜', '鸡丁']),
    nutrition_info: JSON.stringify({
      calories: 250,
      protein: 22,
      fat: 15,
      carbs: 12
    }),
    image_url: '/images/kung_pao.jpg'
  },
  {
    title: '番茄鸡蛋汤',
    description: '简单营养的家常汤品',
    ingredients: JSON.stringify([
      { name: '番茄', amount: '2个', unit: '个' },
      { name: '鸡蛋', amount: '2个', unit: '个' },
      { name: '葱花', amount: '适量', unit: '适量' },
      { name: '盐', amount: '适量', unit: '适量' },
      { name: '香油', amount: '几滴', unit: '滴' }
    ]),
    instructions: JSON.stringify([
      '番茄切块，鸡蛋打散',
      '锅中加水烧开，放入番茄块',
      '煮至番茄软烂，缓缓倒入蛋液',
      '加入盐调味，淋入香油',
      '撒上葱花即可'
    ]),
    cooking_time: '10分钟',
    difficulty: '简单',
    servings: 3,
    category: '汤品',
    tags: JSON.stringify(['汤', '快手', '营养']),
    nutrition_info: JSON.stringify({
      calories: 90,
      protein: 8,
      fat: 5,
      carbs: 6
    }),
    image_url: '/images/tomato_soup.jpg'
  },
  {
    title: '回锅肉',
    description: '川菜经典，肥而不腻',
    ingredients: JSON.stringify([
      { name: '五花肉', amount: '300克', unit: '克' },
      { name: '青蒜', amount: '2根', unit: '根' },
      { name: '豆瓣酱', amount: '1汤匙', unit: '汤匙' },
      { name: '甜面酱', amount: '1茶匙', unit: '茶匙' },
      { name: '豆豉', amount: '1茶匙', unit: '茶匙' },
      { name: '姜蒜', amount: '适量', unit: '适量' }
    ]),
    instructions: JSON.stringify([
      '五花肉煮熟后切片',
      '热锅少油，放入肉片煸炒出油',
      '加入豆瓣酱、甜面酱、豆豉炒香',
      '放入姜蒜末继续翻炒',
      '最后加入青蒜段炒匀即可'
    ]),
    cooking_time: '25分钟',
    difficulty: '中等',
    servings: 3,
    category: '川菜',
    tags: JSON.stringify(['川菜', '猪肉', '下饭菜']),
    nutrition_info: JSON.stringify({
      calories: 320,
      protein: 18,
      fat: 25,
      carbs: 8
    }),
    image_url: '/images/twice_cooked_pork.jpg'
  },
  {
    title: '糖醋排骨',
    description: '酸甜可口，色泽红亮',
    ingredients: JSON.stringify([
      { name: '排骨', amount: '500克', unit: '克' },
      { name: '冰糖', amount: '50克', unit: '克' },
      { name: '醋', amount: '3汤匙', unit: '汤匙' },
      { name: '生抽', amount: '2汤匙', unit: '汤匙' },
      { name: '料酒', amount: '1汤匙', unit: '汤匙' },
      { name: '姜片', amount: '3片', unit: '片' }
    ]),
    instructions: JSON.stringify([
      '排骨焯水去血沫',
      '热锅少油，放入冰糖炒至焦糖色',
      '放入排骨翻炒上色',
      '加入料酒、生抽、醋调味',
      '加水没过排骨，小火炖煮30分钟',
      '最后大火收汁即可'
    ]),
    cooking_time: '45分钟',
    difficulty: '中等',
    servings: 3,
    category: '家常菜',
    tags: JSON.stringify(['糖醋', '排骨', '酸甜']),
    nutrition_info: JSON.stringify({
      calories: 280,
      protein: 22,
      fat: 18,
      carbs: 20
    }),
    image_url: '/images/sweet_sour_ribs.jpg'
  },
  {
    title: '干煸豆角',
    description: '麻辣干香，下饭神器',
    ingredients: JSON.stringify([
      { name: '豆角', amount: '300克', unit: '克' },
      { name: '猪肉末', amount: '100克', unit: '克' },
      { name: '干辣椒', amount: '5个', unit: '个' },
      { name: '花椒', amount: '1茶匙', unit: '茶匙' },
      { name: '蒜末', amount: '适量', unit: '适量' },
      { name: '生抽', amount: '1汤匙', unit: '汤匙' }
    ]),
    instructions: JSON.stringify([
      '豆角切段，干辣椒切段',
      '热锅多油，放入豆角炸至表皮起皱',
      '锅中留底油，放入肉末炒散',
      '加入干辣椒、花椒、蒜末炒香',
      '放入豆角翻炒，加入生抽调味'
    ]),
    cooking_time: '20分钟',
    difficulty: '中等',
    servings: 3,
    category: '川菜',
    tags: JSON.stringify(['干煸', '豆角', '麻辣']),
    nutrition_info: JSON.stringify({
      calories: 180,
      protein: 12,
      fat: 10,
      carbs: 15
    }),
    image_url: '/images/dry_fried_beans.jpg'
  },
  {
    title: '蒜蓉粉丝蒸娃娃菜',
    description: '清淡鲜美，营养健康',
    ingredients: JSON.stringify([
      { name: '娃娃菜', amount: '2棵', unit: '棵' },
      { name: '粉丝', amount: '1把', unit: '把' },
      { name: '大蒜', amount: '5瓣', unit: '瓣' },
      { name: '生抽', amount: '2汤匙', unit: '汤匙' },
      { name: '香油', amount: '1茶匙', unit: '茶匙' },
      { name: '葱花', amount: '适量', unit: '适量' }
    ]),
    instructions: JSON.stringify([
      '粉丝泡软，娃娃菜洗净切半',
      '大蒜剁成蒜蓉',
      '盘中铺粉丝，放上娃娃菜',
      '撒上蒜蓉，淋上生抽、香油',
      '上锅蒸10分钟，撒上葱花即可'
    ]),
    cooking_time: '15分钟',
    difficulty: '简单',
    servings: 3,
    category: '素菜',
    tags: JSON.stringify(['蒸菜', '清淡', '健康']),
    nutrition_info: JSON.stringify({
      calories: 120,
      protein: 4,
      fat: 3,
      carbs: 20
    }),
    image_url: '/images/steamed_cabbage.jpg'
  },
  {
    title: '红烧茄子',
    description: '软糯入味，下饭佳品',
    ingredients: JSON.stringify([
      { name: '茄子', amount: '2个', unit: '个' },
      { name: '青椒', amount: '1个', unit: '个' },
      { name: '大蒜', amount: '3瓣', unit: '瓣' },
      { name: '生抽', amount: '2汤匙', unit: '汤匙' },
      { name: '老抽', amount: '1汤匙', unit: '汤匙' },
      { name: '糖', amount: '1茶匙', unit: '茶匙' }
    ]),
    instructions: JSON.stringify([
      '茄子切滚刀块，青椒切块',
      '茄子用盐腌制10分钟，挤干水分',
      '热锅多油，放入茄子炸软',
      '锅中留底油，爆香蒜末',
      '放入青椒翻炒，加入茄子',
      '加入生抽、老抽、糖调味即可'
    ]),
    cooking_time: '20分钟',
    difficulty: '简单',
    servings: 3,
    category: '素菜',
    tags: JSON.stringify(['红烧', '茄子', '下饭']),
    nutrition_info: JSON.stringify({
      calories: 140,
      protein: 3,
      fat: 8,
      carbs: 18
    }),
    image_url: '/images/braised_eggplant.jpg'
  }
];

async function addRecipes() {
  try {
    // 检查数据库文件是否存在
    if (!fs.existsSync(dbPath)) {
      console.log('❌ 数据库文件不存在，请先运行: npm run db:init');
      return;
    }

    // 连接数据库
    const db = new Database(dbPath);
    
    // 检查recipes表是否存在
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='recipes'").get();
    if (!tableExists) {
      console.log('❌ recipes表不存在，请先初始化数据库');
      db.close();
      return;
    }

    console.log(`📋 准备添加 ${homeRecipes.length} 道家常菜...`);

    // 开始插入数据
    let successCount = 0;
    const existingTitles = new Set();

    // 检查已存在的菜谱标题
    const existingRecipes = db.prepare('SELECT title FROM recipes').all();
    existingRecipes.forEach(recipe => {
      existingTitles.add(recipe.title);
    });

    for (const recipe of homeRecipes) {
      // 跳过已存在的菜谱
      if (existingTitles.has(recipe.title)) {
        console.log(`⏭️  跳过已存在的菜谱: ${recipe.title}`);
        continue;
      }

      try {
        const result = db.prepare(`
          INSERT INTO recipes (
            title, description, ingredients, instructions, 
            cooking_time, difficulty, servings, category, 
            tags, nutrition_info, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          recipe.title,
          recipe.description,
          recipe.ingredients,
          recipe.instructions,
          recipe.cooking_time,
          recipe.difficulty,
          recipe.servings,
          recipe.category,
          recipe.tags,
          recipe.nutrition_info,
          recipe.image_url
        );

        console.log(`✅ 添加成功: ${recipe.title} (ID: ${result.lastInsertRowid})`);
        successCount++;
      } catch (error) {
        console.log(`❌ 添加失败: ${recipe.title} - ${error.message}`);
      }
    }

    // 统计信息
    const totalRecipes = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
    const categories = db.prepare('SELECT category, COUNT(*) as count FROM recipes GROUP BY category').all();

    console.log('\n📊 添加结果统计:');
    console.log(`   - 成功添加: ${successCount} 道菜`);
    console.log(`   - 数据库总菜谱数: ${totalRecipes} 道`);
    console.log('   - 分类统计:');
    categories.forEach(cat => {
      console.log(`     • ${cat.category}: ${cat.count} 道`);
    });

    // 关闭数据库连接
    db.close();

    console.log('\n🎉 家常菜数据添加完成！');

  } catch (error) {
    console.error('❌ 添加过程发生错误:', error.message);
  }
}

// 运行添加脚本
addRecipes();