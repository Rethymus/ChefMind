// 食材图片映射表
export const ingredientImages = {
  // 肉类
  猪肉: '/images/ingredients/pork.jpg',
  牛肉: '/images/ingredients/beef.jpg',
  鸡肉: '/images/ingredients/chicken.jpg',
  羊肉: '/images/ingredients/mutton.jpg',
  鸭肉: '/images/ingredients/duck.jpg',
  排骨: '/images/ingredients/ribs.jpg',
  五花肉: '/images/ingredients/pork-belly.jpg',
  里脊: '/images/ingredients/tenderloin.jpg',

  // 海鲜
  鱼: '/images/ingredients/fish.jpg',
  虾: '/images/ingredients/shrimp.jpg',
  蟹: '/images/ingredients/crab.jpg',
  鱿鱼: '/images/ingredients/squid.jpg',
  带鱼: '/images/ingredients/hairtail.jpg',
  鲈鱼: '/images/ingredients/bass.jpg',
  鲫鱼: '/images/ingredients/crucian.jpg',

  // 蔬菜
  土豆: '/images/ingredients/potato.jpg',
  番茄: '/images/ingredients/tomato.jpg',
  胡萝卜: '/images/ingredients/carrot.jpg',
  白菜: '/images/ingredients/cabbage.jpg',
  菠菜: '/images/ingredients/spinach.jpg',
  韭菜: '/images/ingredients/leek.jpg',
  芹菜: '/images/ingredients/celery.jpg',
  豆角: '/images/ingredients/green-beans.jpg',
  茄子: '/images/ingredients/eggplant.jpg',
  冬瓜: '/images/ingredients/wax-gourd.jpg',
  丝瓜: '/images/ingredients/luffa.jpg',
  黄瓜: '/images/ingredients/cucumber.jpg',
  西红柿: '/images/ingredients/tomato.jpg',
  青椒: '/images/ingredients/green-pepper.jpg',
  洋葱: '/images/ingredients/onion.jpg',
  萝卜: '/images/ingredients/radish.jpg',
  莲藕: '/images/ingredients/lotus-root.jpg',
  蘑菇: '/images/ingredients/mushroom.jpg',
  香菇: '/images/ingredients/shiitake.jpg',
  金针菇: '/images/ingredients/enoki.jpg',

  // 豆制品
  豆腐: '/images/ingredients/tofu.jpg',
  豆干: '/images/ingredients/dried-tofu.jpg',
  豆皮: '/images/ingredients/tofu-skin.jpg',
  豆芽: '/images/ingredients/bean-sprouts.jpg',

  // 蛋类
  鸡蛋: '/images/ingredients/egg.jpg',
  鸭蛋: '/images/ingredients/duck-egg.jpg',
  鹌鹑蛋: '/images/ingredients/quail-egg.jpg',

  // 主食
  米饭: '/images/ingredients/rice.jpg',
  面条: '/images/ingredients/noodles.jpg',
  面粉: '/images/ingredients/flour.jpg',
  饺子皮: '/images/ingredients/dumpling-wrapper.jpg',

  // 调料
  蒜: '/images/ingredients/garlic.jpg',
  姜: '/images/ingredients/ginger.jpg',
  葱: '/images/ingredients/scallion.jpg',
  辣椒: '/images/ingredients/chili.jpg',
  香菜: '/images/ingredients/cilantro.jpg',

  // 默认图片
  default: '/images/ingredients/default.jpg',
}

/**
 * 根据食材获取对应的图片
 * @param ingredients 食材列表
 * @returns 图片URL
 */
export function getIngredientImage(ingredients: string[]): string {
  // 优先匹配主要食材
  const mainIngredients = ['猪肉', '牛肉', '鸡肉', '鱼', '虾', '豆腐', '土豆', '番茄', '鸡蛋']

  for (const mainIngredient of mainIngredients) {
    for (const ingredient of ingredients) {
      if (ingredient.includes(mainIngredient)) {
        return ingredientImages[mainIngredient] || ingredientImages.default
      }
    }
  }

  // 匹配任何已知食材
  for (const ingredient of ingredients) {
    for (const [key, image] of Object.entries(ingredientImages)) {
      if (ingredient.includes(key) && key !== 'default') {
        return image
      }
    }
  }

  return ingredientImages.default
}

/**
 * 根据菜品名称获取对应的图片
 * @param dishName 菜品名称
 * @param ingredients 食材列表
 * @returns 图片URL
 */
export function getDishImage(dishName: string, ingredients: string[]): string {
  // 特殊菜品映射
  const dishImages: Record<string, string> = {
    红烧肉: '/images/dishes/hongshaorou.jpg',
    宫保鸡丁: '/images/dishes/gongbaojiding.jpg',
    麻婆豆腐: '/images/dishes/mapotofu.jpg',
    糖醋里脊: '/images/dishes/tangculiji.jpg',
    鱼香肉丝: '/images/dishes/yuxiangrousi.jpg',
    回锅肉: '/images/dishes/huiguorou.jpg',
    青椒肉丝: '/images/dishes/qingjiarousi.jpg',
    西红柿炒鸡蛋: '/images/dishes/xihongshichaojiadan.jpg',
    蒸蛋羹: '/images/dishes/zhengdangeng.jpg',
    土豆丝: '/images/dishes/tudousi.jpg',
  }

  // 直接匹配菜品名称
  for (const [dish, image] of Object.entries(dishImages)) {
    if (dishName.includes(dish)) {
      return image
    }
  }

  // 如果没有直接匹配，根据食材选择
  return getIngredientImage(ingredients)
}
