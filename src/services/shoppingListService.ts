/**
 * 购物清单服务 - 提供购物清单相关功能
 */

// 购物清单项目接口
export interface ShoppingItem {
  id: string
  name: string
  completed: boolean
  category: string
  note?: string
  recipeId?: string
  recipeName?: string
  amount?: string
  unit?: string
  purchaseAdvice?: string
  createdAt: string
  updatedAt: string
}

// 购物清单过滤条件
interface ShoppingListFilter {
  category?: string
  completed?: boolean
  search?: string
}

/**
 * 购物清单服务类
 */
class ShoppingListService {
  private readonly STORAGE_KEY = 'chefmind_shopping_list'
  private readonly CATEGORIES_KEY = 'chefmind_shopping_categories'

  /**
   * 获取购物清单
   * @param filter 过滤条件
   * @returns 购物清单项目数组
   */
  async getShoppingList(filter?: ShoppingListFilter): Promise<ShoppingItem[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      let shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 应用过滤条件
      if (filter) {
        if (filter.category) {
          shoppingList = shoppingList.filter(item => item.category === filter.category)
        }

        if (filter.completed !== undefined) {
          shoppingList = shoppingList.filter(item => item.completed === filter.completed)
        }

        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          shoppingList = shoppingList.filter(
            item =>
              item.name.toLowerCase().includes(searchLower) ||
              item.note?.toLowerCase().includes(searchLower)
          )
        }
      }

      return shoppingList
    } catch (error) {
      console.error('获取购物清单失败:', error)
      return []
    }
  }

  /**
   * 添加购物清单项目
   * @param item 购物清单项目（不需要包含id和时间戳）
   * @returns 添加后的购物清单项目
   */
  async addItem(item: Partial<ShoppingItem>): Promise<ShoppingItem> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      const shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 创建新项目
      const now = new Date().toISOString()
      const newItem: ShoppingItem = {
        id: `item_${Date.now()}`,
        name: item.name || '',
        completed: item.completed || false,
        category: item.category || '食材',
        note: item.note,
        recipeId: item.recipeId,
        recipeName: item.recipeName,
        createdAt: now,
        updatedAt: now,
      }

      // 添加到购物清单
      shoppingList.push(newItem)

      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shoppingList))

      return newItem
    } catch (error) {
      console.error('添加购物清单项目失败:', error)
      throw new Error('添加购物清单项目失败')
    }
  }

  /**
   * 批量添加购物清单项目
   * @param items 购物清单项目数组
   * @returns 添加后的购物清单项目数组
   */
  async addItems(items: Partial<ShoppingItem>[]): Promise<ShoppingItem[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      const shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 创建新项目
      const now = new Date().toISOString()
      const newItems: ShoppingItem[] = items.map(item => ({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: item.name || '',
        completed: item.completed || false,
        category: item.category || '食材',
        note: item.note,
        recipeId: item.recipeId,
        recipeName: item.recipeName,
        createdAt: now,
        updatedAt: now,
      }))

      // 添加到购物清单
      shoppingList.push(...newItems)

      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shoppingList))

      return newItems
    } catch (error) {
      console.error('批量添加购物清单项目失败:', error)
      throw new Error('批量添加购物清单项目失败')
    }
  }

  /**
   * 更新购物清单项目
   * @param id 项目ID
   * @param updates 更新内容
   * @returns 更新后的购物清单项目
   */
  async updateItem(id: string, updates: Partial<ShoppingItem>): Promise<ShoppingItem> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      const shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 查找项目
      const index = shoppingList.findIndex(item => item.id === id)
      if (index === -1) {
        throw new Error('购物清单项目不存在')
      }

      // 更新项目
      const updatedItem: ShoppingItem = {
        ...shoppingList[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      shoppingList[index] = updatedItem

      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shoppingList))

      return updatedItem
    } catch (error) {
      console.error('更新购物清单项目失败:', error)
      throw new Error('更新购物清单项目失败')
    }
  }

  /**
   * 删除购物清单项目
   * @param id 项目ID
   * @returns 是否删除成功
   */
  async deleteItem(id: string): Promise<boolean> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      const shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 查找并删除项目
      const index = shoppingList.findIndex(item => item.id === id)
      if (index === -1) {
        return false
      }

      shoppingList.splice(index, 1)

      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shoppingList))

      return true
    } catch (error) {
      console.error('删除购物清单项目失败:', error)
      return false
    }
  }

  /**
   * 清除已完成的购物清单项目
   * @returns 是否清除成功
   */
  async clearCompletedItems(): Promise<boolean> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      const shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 过滤出未完成的项目
      const updatedList = shoppingList.filter(item => !item.completed)

      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList))

      return true
    } catch (error) {
      console.error('清除已完成的购物清单项目失败:', error)
      return false
    }
  }

  /**
   * 从食谱添加食材到购物清单
   * @param recipeId 食谱ID
   * @param recipeName 食谱名称
   * @param ingredients 食材数组（可以是字符串或包含分量信息的对象）
   * @returns 添加后的购物清单项目数组
   */
  async addIngredientsFromRecipe(
    recipeId: string,
    recipeName: string,
    ingredients: (string | { name: string; amount?: string; unit?: string })[]
  ): Promise<ShoppingItem[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      // 从本地存储获取购物清单
      const savedList = localStorage.getItem(this.STORAGE_KEY)
      const shoppingList: ShoppingItem[] = savedList ? JSON.parse(savedList) : []

      // 创建新项目
      const now = new Date().toISOString()
      const newItems: ShoppingItem[] = []

      ingredients.forEach(ingredient => {
        let name: string
        let amount: string | undefined
        let unit: string | undefined
        let purchaseAdvice: string | undefined

        if (typeof ingredient === 'string') {
          name = ingredient
        } else {
          name = ingredient.name
          amount = ingredient.amount
          unit = ingredient.unit

          // 生成购买建议
          if (amount && unit) {
            purchaseAdvice = this.generatePurchaseAdvice(name, amount, unit)
          }
        }

        // 检查是否已存在相同名称的食材
        const existingItem = shoppingList.find(
          item => item.name.toLowerCase() === name.toLowerCase() && !item.completed
        )

        if (!existingItem) {
          newItems.push({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name,
            completed: false,
            category: this.categorizeIngredient(name),
            note: `来自食谱: ${recipeName}`,
            recipeId,
            recipeName,
            amount,
            unit,
            purchaseAdvice,
            createdAt: now,
            updatedAt: now,
          })
        }
      })

      // 添加到购物清单
      shoppingList.push(...newItems)

      // 保存到本地存储
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shoppingList))

      return newItems
    } catch (error) {
      console.error('从食谱添加食材到购物清单失败:', error)
      throw new Error('从食谱添加食材到购物清单失败')
    }
  }

  /**
   * 生成购买建议
   * @param name 食材名称
   * @param amount 分量
   * @param unit 单位
   * @returns 购买建议
   */
  private generatePurchaseAdvice(name: string, amount: string, unit: string): string {
    const numAmount = parseFloat(amount)

    // 使用映射对象来减少复杂度
    const unitHandlers = {
      weight: this.handleWeightUnit.bind(this),
      volume: this.handleVolumeUnit.bind(this),
      count: this.handleCountUnit.bind(this),
      piece: this.handlePieceUnit.bind(this),
      spoon: () => '少量即可，家中常备',
    }

    const unitType = this.getUnitType(unit)
    const handler = unitHandlers[unitType]

    return handler ? handler(numAmount, unit) : `需要${amount}${unit}`
  }

  private getUnitType(unit: string): string {
    if (unit === 'g' || unit === '克') return 'weight'
    if (unit === 'ml' || unit === '毫升') return 'volume'
    if (unit === '个' || unit === '只') return 'count'
    if (unit === '片' || unit === '块') return 'piece'
    if (unit === '勺' || unit === '茶匙' || unit === '汤匙') return 'spoon'
    return 'default'
  }

  private handleWeightUnit(numAmount: number, _unit: string): string {
    if (numAmount <= 100) return '建议购买小包装'
    if (numAmount <= 500) return `约${Math.ceil(numAmount / 100) * 100}g，建议购买500g装`
    return `约${Math.ceil(numAmount / 500) * 500}g，建议购买1kg装`
  }

  private handleVolumeUnit(numAmount: number, _unit: string): string {
    if (numAmount <= 250) return '建议购买小瓶装'
    if (numAmount <= 500) return '建议购买500ml装'
    return '建议购买1L装'
  }

  private handleCountUnit(numAmount: number, _unit: string): string {
    const count = Math.ceil(numAmount)
    if (count <= 3) return `需要${count}个`
    return `需要${count}个，建议多买几个备用`
  }

  private handlePieceUnit(numAmount: number, unit: string): string {
    return `需要${Math.ceil(numAmount)}${unit}`
  }

  /**
   * 根据食材名称自动分类
   * @param name 食材名称
   * @returns 分类
   */
  private categorizeIngredient(name: string): string {
    // 蔬菜类
    const vegetables = [
      '土豆',
      '番茄',
      '洋葱',
      '大蒜',
      '生姜',
      '胡萝卜',
      '青椒',
      '白菜',
      '菠菜',
      '韭菜',
      '豆角',
      '茄子',
      '冬瓜',
      '南瓜',
      '莲藕',
      '山药',
      '玉米',
      '蘑菇',
      '木耳',
      '银耳',
      '豆芽',
      '芹菜',
      '黄瓜',
      '西红柿',
    ]

    // 肉类
    const meats = [
      '猪肉',
      '牛肉',
      '鸡肉',
      '鸭肉',
      '鱼',
      '虾',
      '蟹',
      '鸡蛋',
      '腊肉',
      '香肠',
      '培根',
      '羊肉',
      '排骨',
      '鸡翅',
      '鱼片',
    ]

    // 主食类
    const staples = [
      '大米',
      '面条',
      '面粉',
      '馒头',
      '面包',
      '红薯',
      '小米',
      '燕麦',
      '意大利面',
      '河粉',
      '米粉',
      '饺子皮',
    ]

    // 调味料
    const seasonings = [
      '盐',
      '生抽',
      '老抽',
      '料酒',
      '白糖',
      '香油',
      '胡椒粉',
      '花椒',
      '八角',
      '桂皮',
      '香叶',
      '蚝油',
      '醋',
      '辣椒油',
      '味精',
      '鸡精',
      '孜然',
      '五香粉',
    ]

    if (vegetables.some(veg => name.includes(veg))) {
      return '蔬菜'
    } else if (meats.some(meat => name.includes(meat))) {
      return '肉类'
    } else if (staples.some(staple => name.includes(staple))) {
      return '主食'
    } else if (seasonings.some(seasoning => name.includes(seasoning))) {
      return '调味料'
    }

    return '食材'
  }

  /**
   * 获取可用分类
   * @returns 分类数组
   */
  async getCategories(): Promise<string[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      // 从本地存储获取分类
      const savedCategories = localStorage.getItem(this.CATEGORIES_KEY)
      const defaultCategories = ['食材', '调味料', '厨具', '其他']

      if (savedCategories) {
        return JSON.parse(savedCategories)
      }

      // 如果没有保存的分类，返回默认分类并保存
      localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(defaultCategories))
      return defaultCategories
    } catch (error) {
      console.error('获取可用分类失败:', error)
      return ['食材', '调味料', '厨具', '其他']
    }
  }

  /**
   * 添加新分类
   * @param category 分类名称
   * @returns 更新后的分类数组
   */
  async addCategory(category: string): Promise<string[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      // 从本地存储获取分类
      const savedCategories = localStorage.getItem(this.CATEGORIES_KEY)
      const categories: string[] = savedCategories
        ? JSON.parse(savedCategories)
        : ['食材', '调味料', '厨具', '其他']

      // 检查分类是否已存在
      if (!categories.includes(category)) {
        categories.push(category)

        // 保存到本地存储
        localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories))
      }

      return categories
    } catch (error) {
      console.error('添加新分类失败:', error)
      throw new Error('添加新分类失败')
    }
  }
}

// 导出服务实例
export const shoppingListService = new ShoppingListService()
