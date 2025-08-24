import { ref, watch } from 'vue'

// 语言包
const messages = {
  'zh-CN': {
    // 通用
    'app.name': 'ChefMind',
    'app.slogan': '智能菜谱生成平台',
    'app.loading': '加载中...',
    'app.error': '出错了',
    'app.retry': '重试',
    'app.cancel': '取消',
    'app.confirm': '确认',
    'app.save': '保存',
    'app.delete': '删除',
    'app.edit': '编辑',
    'app.search': '搜索',
    'app.back': '返回',
    
    // 导航
    'nav.home': '首页',
    'nav.search': '搜索',
    'nav.favorites': '收藏',
    'nav.shopping': '购物清单',
    'nav.settings': '设置',
    
    // 首页
    'home.welcome': '欢迎使用ChefMind',
    'home.subtitle': '智能菜谱生成平台',
    'home.description': '输入您的食材，让AI为您生成美味的菜谱',
    'home.get_started': '开始使用',
    'home.popular_recipes': '热门菜谱',
    'home.recommendations': '为您推荐',
    'home.search_placeholder': '搜索菜谱、食材或烹饪方式...',
    
    // 食谱生成器
    'generator.title': '食谱生成器',
    'generator.step1': '食材选择',
    'generator.step2': '烹饪方式',
    'generator.step3': '约束条件',
    'generator.ingredients': '选择您的食材',
    'generator.ingredients_desc': '请选择您想要使用的主要食材，至少选择1种',
    'generator.cooking_methods': '选择烹饪方式',
    'generator.cooking_methods_desc': '请选择您偏好的烹饪方式，可多选',
    'generator.constraints': '设置约束条件',
    'generator.constraints_desc': '请选择您的饮食偏好或限制',
    'generator.add_custom': '添加其他食材...',
    'generator.add': '添加',
    'generator.selected': '已选食材:',
    'generator.next': '下一步',
    'generator.prev': '上一步',
    'generator.generate': '生成食谱',
    'generator.reset': '重新开始',
    'generator.generating': 'AI正在为您生成美味食谱...',
    'generator.wait': '这可能需要几秒钟时间',
    'generator.results': '为您推荐的食谱',
    'generator.no_results': '没有找到匹配的食谱',
    'generator.try_again': '请尝试调整您的选择条件',
    
    // 食谱详情
    'recipe.ingredients': '食材',
    'recipe.steps': '烹饪步骤',
    'recipe.tips': '小贴士',
    'recipe.nutrition': '营养信息',
    'recipe.calories': '热量',
    'recipe.protein': '蛋白质',
    'recipe.carbs': '碳水',
    'recipe.fat': '脂肪',
    'recipe.time': '烹饪时间',
    'recipe.difficulty': '难度',
    'recipe.servings': '份量',
    'recipe.add_to_shopping': '添加到购物清单',
    'recipe.favorite': '收藏食谱',
    'recipe.unfavorite': '取消收藏',
    'recipe.share': '分享食谱',
    'recipe.print': '打印食谱',
    'recipe.comments': '评论',
    'recipe.related': '相关推荐',
    'recipe.no_related': '暂无相关推荐',
    
    // 食材识别
    'recognition.title': '食材识别',
    'recognition.description': '通过拍照或上传图片识别食材，快速添加到食材列表',
    'recognition.camera': '拍照识别',
    'recognition.upload': '上传图片',
    'recognition.recognizing': '正在识别食材，请稍候...',
    'recognition.results': '识别结果',
    'recognition.add': '添加',
    'recognition.added': '已添加',
    'recognition.add_all': '添加全部',
    
    // 收藏页面
    'favorites.title': '我的收藏',
    'favorites.empty': '您还没有收藏任何食谱',
    'favorites.start': '开始探索美食',
    
    // 购物清单
    'shopping.title': '购物清单',
    'shopping.empty': '您的购物清单为空',
    'shopping.add': '添加食材',
    'shopping.clear': '清空清单',
    'shopping.check_all': '全部选中',
    'shopping.uncheck_all': '全部取消',
    
    // 搜索页面
    'search.title': '搜索食谱',
    'search.placeholder': '输入关键词搜索...',
    'search.filters': '筛选',
    'search.time': '烹饪时间',
    'search.difficulty': '难度',
    'search.diet': '饮食偏好',
    'search.apply': '应用筛选',
    'search.reset': '重置',
    'search.results': '搜索结果',
    'search.no_results': '未找到匹配的食谱',
    'search.try_different': '请尝试不同的搜索词或筛选条件',
    
    // 评论
    'comments.title': '评论',
    'comments.write': '写评论',
    'comments.placeholder': '分享您的烹饪体验...',
    'comments.submit': '提交',
    'comments.empty': '暂无评论',
    'comments.be_first': '成为第一个评论的人',
    'comments.your_rating': '您的评分',
    
    // 视频教程
    'video.tutorials': '视频教程',
    'video.search_placeholder': '搜索视频教程...',
    'video.filter': '筛选',
    'video.categories': '分类',
    'video.sort_by': '排序方式',
    'video.sort_newest': '最新发布',
    'video.sort_popular': '最多观看',
    'video.sort_title': '按标题',
    'video.clear_filters': '清除筛选',
    'video.apply_filters': '应用筛选',
    'video.no_videos_found': '未找到视频',
    'video.try_different_search': '请尝试不同的搜索词或筛选条件',
    'video.reset_search': '重置搜索',
    'video.views': '次观看',
    'video.chapters': '章节目录',
    'video.recommended': '推荐视频',
    'video.related_recipe': '相关食谱',
    'video.view_recipe': '查看食谱',
    'video.not_found': '视频未找到',
    'video.not_found_desc': '您请求的视频不存在或已被删除',
    'video.share_video': '分享视频',
    'video.link_copied': '链接已复制到剪贴板',
    'video.shared_via': '已通过{platform}分享',
    'video.like_success': '点赞成功',
    'video.load_error': '加载视频失败',
    
    // 通知
    'notification.success': '成功',
    'notification.error': '错误',
    'notification.info': '提示',
    'notification.warning': '警告',
    
    // 设置
    'settings.title': '设置',
    'settings.theme': '主题',
    'settings.language': '语言',
    'settings.notifications': '通知',
    'settings.clear_data': '清除数据',
    'settings.about': '关于',
    'settings.help': '帮助',
    'settings.feedback': '反馈',
    
    // 主题
    'theme.light': '浅色',
    'theme.dark': '深色',
    'theme.system': '跟随系统',
    'theme.custom': '自定义',
  },
  'en-US': {
    // Common
    'app.name': 'ChefMind',
    'app.slogan': 'AI-Powered Recipe Generator',
    'app.loading': 'Loading...',
    'app.error': 'Error',
    'app.retry': 'Retry',
    'app.cancel': 'Cancel',
    'app.confirm': 'Confirm',
    'app.save': 'Save',
    'app.delete': 'Delete',
    'app.edit': 'Edit',
    'app.search': 'Search',
    'app.back': 'Back',
    
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.favorites': 'Favorites',
    'nav.shopping': 'Shopping List',
    'nav.settings': 'Settings',
    
    // Home
    'home.welcome': 'Welcome to ChefMind',
    'home.subtitle': 'AI-Powered Recipe Generator',
    'home.description': 'Enter your ingredients and let AI generate delicious recipes for you',
    'home.get_started': 'Get Started',
    'home.popular_recipes': 'Popular Recipes',
    'home.recommendations': 'Recommendations',
    'home.search_placeholder': 'Search recipes, ingredients or cooking methods...',
    
    // Recipe Generator
    'generator.title': 'Recipe Generator',
    'generator.step1': 'Ingredients',
    'generator.step2': 'Cooking Methods',
    'generator.step3': 'Constraints',
    'generator.ingredients': 'Choose Your Ingredients',
    'generator.ingredients_desc': 'Please select the main ingredients you want to use, at least 1',
    'generator.cooking_methods': 'Choose Cooking Methods',
    'generator.cooking_methods_desc': 'Please select your preferred cooking methods, multiple choices allowed',
    'generator.constraints': 'Set Constraints',
    'generator.constraints_desc': 'Please select your dietary preferences or restrictions',
    'generator.add_custom': 'Add other ingredients...',
    'generator.add': 'Add',
    'generator.selected': 'Selected Ingredients:',
    'generator.next': 'Next',
    'generator.prev': 'Previous',
    'generator.generate': 'Generate Recipe',
    'generator.reset': 'Start Over',
    'generator.generating': 'AI is generating delicious recipes for you...',
    'generator.wait': 'This may take a few seconds',
    'generator.results': 'Recommended Recipes',
    'generator.no_results': 'No matching recipes found',
    'generator.try_again': 'Please try adjusting your selection criteria',
    
    // Recipe Detail
    'recipe.ingredients': 'Ingredients',
    'recipe.steps': 'Cooking Steps',
    'recipe.tips': 'Tips',
    'recipe.nutrition': 'Nutrition Info',
    'recipe.calories': 'Calories',
    'recipe.protein': 'Protein',
    'recipe.carbs': 'Carbs',
    'recipe.fat': 'Fat',
    'recipe.time': 'Cooking Time',
    'recipe.difficulty': 'Difficulty',
    'recipe.servings': 'Servings',
    'recipe.add_to_shopping': 'Add to Shopping List',
    'recipe.favorite': 'Save Recipe',
    'recipe.unfavorite': 'Remove from Favorites',
    'recipe.share': 'Share Recipe',
    'recipe.print': 'Print Recipe',
    'recipe.comments': 'Comments',
    'recipe.related': 'Related Recipes',
    'recipe.no_related': 'No related recipes',
    
    // Ingredient Recognition
    'recognition.title': 'Ingredient Recognition',
    'recognition.description': 'Recognize ingredients by taking a photo or uploading an image, quickly add them to your ingredient list',
    'recognition.camera': 'Take Photo',
    'recognition.upload': 'Upload Image',
    'recognition.recognizing': 'Recognizing ingredients, please wait...',
    'recognition.results': 'Recognition Results',
    'recognition.add': 'Add',
    'recognition.added': 'Added',
    'recognition.add_all': 'Add All',
    
    // Favorites
    'favorites.title': 'My Favorites',
    'favorites.empty': 'You haven\'t saved any recipes yet',
    'favorites.start': 'Start exploring recipes',
    
    // Shopping List
    'shopping.title': 'Shopping List',
    'shopping.empty': 'Your shopping list is empty',
    'shopping.add': 'Add Ingredients',
    'shopping.clear': 'Clear List',
    'shopping.check_all': 'Check All',
    'shopping.uncheck_all': 'Uncheck All',
    
    // Search
    'search.title': 'Search Recipes',
    'search.placeholder': 'Enter keywords to search...',
    'search.filters': 'Filters',
    'search.time': 'Cooking Time',
    'search.difficulty': 'Difficulty',
    'search.diet': 'Dietary Preferences',
    'search.apply': 'Apply Filters',
    'search.reset': 'Reset',
    'search.results': 'Search Results',
    'search.no_results': 'No matching recipes found',
    'search.try_different': 'Try different keywords or filters',
    
    // Comments
    'comments.title': 'Comments',
    'comments.write': 'Write a Comment',
    'comments.placeholder': 'Share your cooking experience...',
    'comments.submit': 'Submit',
    'comments.empty': 'No comments yet',
    'comments.be_first': 'Be the first to comment',
    'comments.your_rating': 'Your Rating',
    
    // Video Tutorials
    'video.tutorials': 'Video Tutorials',
    'video.search_placeholder': 'Search video tutorials...',
    'video.filter': 'Filter',
    'video.categories': 'Categories',
    'video.sort_by': 'Sort By',
    'video.sort_newest': 'Newest',
    'video.sort_popular': 'Most Viewed',
    'video.sort_title': 'By Title',
    'video.clear_filters': 'Clear Filters',
    'video.apply_filters': 'Apply Filters',
    'video.no_videos_found': 'No Videos Found',
    'video.try_different_search': 'Try different keywords or filters',
    'video.reset_search': 'Reset Search',
    'video.views': 'views',
    'video.chapters': 'Chapters',
    'video.recommended': 'Recommended Videos',
    'video.related_recipe': 'Related Recipe',
    'video.view_recipe': 'View Recipe',
    'video.not_found': 'Video Not Found',
    'video.not_found_desc': 'The video you requested does not exist or has been removed',
    'video.share_video': 'Share Video',
    'video.link_copied': 'Link copied to clipboard',
    'video.shared_via': 'Shared via {platform}',
    'video.like_success': 'Liked successfully',
    'video.load_error': 'Failed to load video',
    
    // Notifications
    'notification.success': 'Success',
    'notification.error': 'Error',
    'notification.info': 'Info',
    'notification.warning': 'Warning',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.clear_data': 'Clear Data',
    'settings.about': 'About',
    'settings.help': 'Help',
    'settings.feedback': 'Feedback',
    
    // Theme
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
    'theme.custom': 'Custom',
  }
}

// 默认语言
const defaultLanguage = 'zh-CN'

// 创建一个全局状态来存储当前语言
const currentLanguage = ref(
  localStorage.getItem('language') || 
  navigator.language || 
  defaultLanguage
)

// 确保语言代码是有效的
if (!messages[currentLanguage.value]) {
  currentLanguage.value = defaultLanguage
}

// 监听语言变化并保存到本地存储
watch(currentLanguage, (newLang) => {
  localStorage.setItem('language', newLang)
  document.documentElement.setAttribute('lang', newLang)
}, { immediate: true })

// 翻译函数
const t = (key: string, params?: Record<string, string | number>): string => {
  const lang = currentLanguage.value
  const langMessages = messages[lang] || messages[defaultLanguage]
  
  let text = langMessages[key] || messages[defaultLanguage][key] || key
  
  // 替换参数
  if (params) {
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{${param}}`, 'g'), String(params[param]))
    })
  }
  
  return text
}

// 设置语言
const setLanguage = (lang: string) => {
  if (messages[lang]) {
    currentLanguage.value = lang
  }
}

// 获取所有可用的语言
const getAvailableLanguages = () => {
  return Object.keys(messages).map(code => ({
    code,
    name: messages[code]['settings.language'] || code
  }))
}

// 导出composable
export function useI18n() {
  return {
    currentLanguage,
    t,
    setLanguage,
    getAvailableLanguages
  }
}