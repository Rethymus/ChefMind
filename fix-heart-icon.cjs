// 修复 Heart 图标问题
const fs = require('fs');
const path = require('path');

// 读取 RecipeDetail.vue 文件
const filePath = path.join(__dirname, 'src/components/recipe/RecipeDetail.vue');
let content = fs.readFileSync(filePath, 'utf8');

// 检查是否有使用 Heart 组件的地方
const heartRegex = /<Heart\s|:is="Heart"|Heart\s/g;
const matches = content.match(heartRegex);

if (matches) {
  console.log('找到 Heart 图标使用:', matches);
  
  // 替换 Heart 为 HeartFilled
  content = content.replace(/<Heart\s/g, '<HeartFilled ');
  content = content.replace(/:is="Heart"/g, ':is="HeartFilled"');
  
  // 保存修改后的文件
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('已将 Heart 图标替换为 HeartFilled');
} else {
  console.log('未找到 Heart 图标使用');
}

// 检查其他可能的问题
console.log('检查其他可能的问题...');

// 1. 检查是否有其他文件使用了 Heart 图标
const srcDir = path.join(__dirname, 'src');
function searchInDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      searchInDirectory(fullPath);
    } else if (file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.js')) {
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      if (fileContent.includes('Heart') && !fileContent.includes('HeartFilled') && fullPath !== filePath) {
        console.log(`文件 ${fullPath} 中可能使用了 Heart 图标`);
      }
    }
  }
}

searchInDirectory(srcDir);
console.log('检查完成');