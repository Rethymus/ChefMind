import type { NutritionInfo } from '@/types/recipe'
import { dataAccess } from '@/services/database/dataAccess'

/**
 * 食谱数据接口（通用适配）
 */
export interface RecipeDocument {
  id: number
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  cookingTime: number
  difficulty: string | number
  servings: number
  category: string
  tags: string[]
  nutritionInfo: NutritionInfo
  imageUrl: string
  cookingMethods: string[]
  createdAt: Date
  updatedAt: Date
  viewCount: number
  favoriteCount: number
  ratingCount: number
  averageRating: number
}

/**
 * 食谱模型类（通用版本，支持浏览器和 Node.js）
 */
export class RecipeModel {
  private tableName = 'recipes'

  /**
   * 创建食谱
   */
  async create(
    recipeData: Omit<RecipeDocument, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecipeDocument> {
    const data = {
      title: recipeData.title,
      description: recipeData.description,
      ingredients: JSON.stringify(recipeData.ingredients),
      instructions: JSON.stringify(recipeData.instructions),
      cooking_time: recipeData.cookingTime,
      difficulty: recipeData.difficulty,
      servings: recipeData.servings,
      category: recipeData.category || 'AI生成',
      tags: JSON.stringify(recipeData.tags),
      nutrition_info: JSON.stringify(recipeData.nutritionInfo),
      image_url: recipeData.imageUrl || '',
      cooking_methods: JSON.stringify(recipeData.cookingMethods || ['炒']),
      view_count: recipeData.viewCount || 0,
      favorite_count: recipeData.favoriteCount || 0,
      rating_count: recipeData.ratingCount || 0,
      average_rating: recipeData.averageRating || 0,
    }

    const result = await dataAccess.insert(this.tableName, data)
    return this.rowToDocument(result)
  }

  /**
   * 根据 ID 查找食谱
   */
  async findById(id: number): Promise<RecipeDocument | null> {
    const row = await dataAccess.findOne(this.tableName, { where: { id } })
    return row ? this.rowToDocument(row) : null
  }

  /**
   * 根据条件查找单个食谱
   */
  async findOne(options: { where: any }): Promise<RecipeDocument | null> {
    const row = await dataAccess.findOne(this.tableName, options)
    return row ? this.rowToDocument(row) : null
  }

  /**
   * 查找所有食谱
   */
  async findAll(limit: number = 50, offset: number = 0): Promise<RecipeDocument[]> {
    const rows = await dataAccess.find(
      this.tableName,
      {
        orderBy: 'created_at DESC',
      },
      limit,
      offset
    )

    return rows.map((row: any) => this.rowToDocument(row))
  }

  /**
   * 根据分类查找食谱
   */
  async findByCategory(category: string, limit: number = 20): Promise<RecipeDocument[]> {
    const rows = await dataAccess.find(
      this.tableName,
      {
        where: { category },
        orderBy: 'created_at DESC',
      },
      limit
    )

    return rows.map((row: any) => this.rowToDocument(row))
  }

  /**
   * 搜索食谱
   */
  async search(query: string, limit: number = 20): Promise<RecipeDocument[]> {
    const searchTerm = `%${query}%`
    const rows = await dataAccess.find(
      this.tableName,
      {
        where: {
          title: searchTerm,
          description: searchTerm,
          category: searchTerm,
          tags: searchTerm,
        },
        orderBy: 'created_at DESC',
      },
      limit
    )

    return rows.map((row: any) => this.rowToDocument(row))
  }

  /**
   * 更新食谱
   */
  async update(id: number, updates: Partial<RecipeDocument>): Promise<RecipeDocument | null> {
    const data: any = {}

    if (updates.title !== undefined) data.title = updates.title
    if (updates.description !== undefined) data.description = updates.description
    if (updates.ingredients !== undefined) data.ingredients = JSON.stringify(updates.ingredients)
    if (updates.instructions !== undefined) data.instructions = JSON.stringify(updates.instructions)
    if (updates.cookingTime !== undefined) data.cooking_time = updates.cookingTime
    if (updates.difficulty !== undefined) data.difficulty = updates.difficulty
    if (updates.servings !== undefined) data.servings = updates.servings
    if (updates.category !== undefined) data.category = updates.category
    if (updates.tags !== undefined) data.tags = JSON.stringify(updates.tags)
    if (updates.nutritionInfo !== undefined)
      data.nutrition_info = JSON.stringify(updates.nutritionInfo)
    if (updates.imageUrl !== undefined) data.image_url = updates.imageUrl
    if (updates.cookingMethods !== undefined)
      data.cooking_methods = JSON.stringify(updates.cookingMethods)
    if (updates.viewCount !== undefined) data.view_count = updates.viewCount
    if (updates.favoriteCount !== undefined) data.favorite_count = updates.favoriteCount
    if (updates.ratingCount !== undefined) data.rating_count = updates.ratingCount
    if (updates.averageRating !== undefined) data.average_rating = updates.averageRating

    if (Object.keys(data).length === 0) {
      return this.findById(id)
    }

    const result = await dataAccess.update(this.tableName, id, data)
    return result ? this.rowToDocument(result) : null
  }

  /**
   * 删除食谱
   */
  async delete(id: number): Promise<boolean> {
    return await dataAccess.delete(this.tableName, id)
  }

  /**
   * 增加浏览次数
   */
  async incrementViewCount(id: number): Promise<void> {
    const recipe = await this.findById(id)
    if (recipe) {
      await dataAccess.update(this.tableName, id, {
        view_count: recipe.viewCount + 1,
      })
    }
  }

  /**
   * 获取热门食谱
   */
  async getPopularRecipes(limit: number = 10): Promise<RecipeDocument[]> {
    // 在内存存储中实现简单的排序逻辑
    const allRecipes = await this.findAll(1000, 0)
    return allRecipes
      .sort((a, b) => {
        const scoreA = a.viewCount * 0.3 + a.favoriteCount * 0.4 + a.averageRating * 0.3
        const scoreB = b.viewCount * 0.3 + b.favoriteCount * 0.4 + b.averageRating * 0.3
        return scoreB - scoreA
      })
      .slice(0, limit)
  }

  /**
   * 获取最新食谱
   */
  async getRecentRecipes(limit: number = 10): Promise<RecipeDocument[]> {
    return await this.findAll(limit, 0)
  }

  /**
   * 数据库行转换为文档对象
   */
  private rowToDocument(row: any): RecipeDocument {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      ingredients: JSON.parse(row.ingredients || '[]'),
      instructions: JSON.parse(row.instructions || '[]'),
      cookingTime: row.cooking_time || row.cookingTime || 30,
      difficulty: row.difficulty || '中等',
      servings: row.servings || 2,
      category: row.category || 'AI生成',
      tags: JSON.parse(row.tags || '[]'),
      nutritionInfo: JSON.parse(row.nutrition_info || row.nutritionInfo || '{}'),
      imageUrl: row.image_url || row.imageUrl || '',
      cookingMethods: JSON.parse(row.cooking_methods || row.cookingMethods || '["炒"]'),
      viewCount: row.view_count || row.viewCount || 0,
      favoriteCount: row.favorite_count || row.favoriteCount || 0,
      ratingCount: row.rating_count || row.ratingCount || 0,
      averageRating: row.average_rating || row.averageRating || 0,
      createdAt: new Date(row.created_at || row.createdAt || Date.now()),
      updatedAt: new Date(row.updated_at || row.updatedAt || Date.now()),
    }
  }
}

// 导出模型实例
export const Recipe = new RecipeModel()
export default Recipe
