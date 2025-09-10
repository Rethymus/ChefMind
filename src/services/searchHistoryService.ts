import { dataAccess } from '@/services/database/dataAccess'

/**
 * 搜索历史服务类
 */
export class SearchHistoryService {
  private tableName = 'search_history'

  /**
   * 添加搜索历史记录
   */
  async addSearchHistory(sessionId: string, query: string, resultsCount: number = 0): Promise<void> {
    try {
      const data = {
        session_id: sessionId,
        query,
        results_count: resultsCount,
        created_at: new Date()
      }
      
      await dataAccess.insert(this.tableName, data)
      console.log(`📝 搜索历史记录已保存: ${query}`)
    } catch (error) {
      console.error('添加搜索历史失败:', error)
      // 不抛出错误，避免影响主要功能
    }
  }

  /**
   * 获取用户搜索历史
   */
  async getUserSearchHistory(sessionId: string, limit: number = 50): Promise<Array<{
    id: number
    query: string
    results_count: number
    created_at: string
  }>> {
    try {
      const rows = await dataAccess.find(this.tableName, {
        where: { session_id: sessionId },
        orderBy: 'created_at DESC'
      }, limit)
      
      return rows.map((row: any) => ({
        id: row.id,
        query: row.query,
        results_count: row.results_count,
        created_at: row.created_at
      }))
    } catch (error) {
      console.error('获取搜索历史失败:', error)
      return []
    }
  }

  /**
   * 获取热门搜索
   */
  async getPopularSearches(sessionId?: string, limit: number = 10): Promise<Array<{
    query: string
    search_count: number
    avg_results: number
  }>> {
    try {
      // 由于 dataAccess 不直接支持复杂的聚合查询，我们使用原始 SQL
      // 但通过 dataAccess 的 query 方法执行
      let query = `
        SELECT query, COUNT(*) as search_count, AVG(results_count) as avg_results
        FROM search_history 
      `
      
      const params: any[] = []
      
      if (sessionId) {
        query += ' WHERE session_id = ?'
        params.push(sessionId)
      }
      
      query += ' GROUP BY query ORDER BY search_count DESC, created_at DESC LIMIT ?'
      params.push(limit)
      
      const rows = await dataAccess.query(query, params)
      
      return rows.map((row: any) => ({
        query: row.query,
        search_count: row.search_count,
        avg_results: Math.round(row.avg_results || 0)
      }))
    } catch (error) {
      console.error('获取热门搜索失败:', error)
      return []
    }
  }

  /**
   * 删除搜索历史记录
   */
  async deleteSearchHistory(sessionId: string, historyId?: number): Promise<boolean> {
    try {
      if (historyId) {
        // 删除特定记录
        const record = await dataAccess.findOne(this.tableName, {
          where: { session_id: sessionId, id: historyId }
        })
        if (record) {
          const result = await dataAccess.delete(this.tableName, historyId)
          return result
        }
        return false
      } else {
        // 删除用户所有记录 - 需要批量删除
        const records = await dataAccess.find(this.tableName, {
          where: { session_id: sessionId }
        })
        
        for (const record of records) {
          await dataAccess.delete(this.tableName, record.id)
        }
        
        return records.length > 0
      }
    } catch (error) {
      console.error('删除搜索历史失败:', error)
      return false
    }
  }

  /**
   * 清空用户搜索历史
   */
  async clearUserSearchHistory(sessionId: string): Promise<boolean> {
    return this.deleteSearchHistory(sessionId)
  }

  /**
   * 获取搜索统计
   */
  async getSearchStats(sessionId?: string): Promise<{
    total_searches: number
    recent_searches: number
    unique_queries: number
    avg_results: number
  }> {
    try {
      let whereClause = ''
      const params: any[] = []
      
      if (sessionId) {
        whereClause = 'WHERE session_id = ?'
        params.push(sessionId)
      }
      
      // 总搜索次数
      const totalQuery = `SELECT COUNT(*) as count FROM search_history ${whereClause}`
      const totalResult = await dataAccess.queryOne(totalQuery, params)
      const total_searches = totalResult?.count || 0
      
      // 近期搜索次数（7天内）
      const recentQuery = `SELECT COUNT(*) as count FROM search_history ${whereClause} AND created_at >= datetime('now', '-7 days')`
      const recentResult = await dataAccess.queryOne(recentQuery, params)
      const recent_searches = recentResult?.count || 0
      
      // 唯一查询数量
      const uniqueQuery = `SELECT COUNT(DISTINCT query) as count FROM search_history ${whereClause}`
      const uniqueResult = await dataAccess.queryOne(uniqueQuery, params)
      const unique_queries = uniqueResult?.count || 0
      
      // 平均结果数
      const avgQuery = `SELECT AVG(results_count) as avg FROM search_history ${whereClause}`
      const avgResult = await dataAccess.queryOne(avgQuery, params)
      const avg_results = Math.round(avgResult?.avg || 0)
      
      return {
        total_searches,
        recent_searches,
        unique_queries,
        avg_results
      }
    } catch (error) {
      console.error('获取搜索统计失败:', error)
      return {
        total_searches: 0,
        recent_searches: 0,
        unique_queries: 0,
        avg_results: 0
      }
    }
  }
}

// 导出服务实例
export const searchHistoryService = new SearchHistoryService()
export default searchHistoryService