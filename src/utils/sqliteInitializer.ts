import sqliteConfig from '@/config/sqlite'

/**
 * SQLite 数据库初始化器
 * 专门为 Node.js 环境设计的纯 SQLite 数据库初始化器
 */
export class DatabaseInitializer {
  private static instance: DatabaseInitializer

  private constructor() {}

  public static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer()
    }
    return DatabaseInitializer.instance
  }

  /**
   * 初始化 SQLite 数据库
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing SQLite database...')
      await this.initializeSQLiteDatabase()
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  /**
   * 初始化 SQLite 数据库
   */
  private async initializeSQLiteDatabase(): Promise<void> {
    try {
      const db = sqliteConfig.getConnection()

      // 创建用户表
      this.createUserTable(db)

      // 创建食谱表
      this.createRecipeTable(db)

      // 创建收藏表
      this.createFavoriteTable(db)

      // 创建评分表
      this.createRatingTable(db)

      // 创建购物清单表
      this.createShoppingListTable(db)

      // 创建用户会话表
      this.createUserSessionTable(db)

      // 创建分析数据表
      this.createAnalyticsTable(db)

      // 创建搜索历史表
      this.createSearchHistoryTable(db)

      // 创建同步队列表
      this.createSyncQueueTable(db)

      console.log('✅ Database initialization completed successfully')
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      throw error
    }
  }

  /**
   * 创建用户表
   */
  private createUserTable(db: any): void {
    if (!sqliteConfig.tableExists('users')) {
      const query = `
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
          preferences TEXT, -- JSON 格式的用户偏好设置
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_users_session_id ON users(session_id)')
      console.log('📋 Created users table')
    }
  }

  /**
   * 创建食谱表
   */
  private createRecipeTable(db: any): void {
    if (!sqliteConfig.tableExists('recipes')) {
      const query = `
        CREATE TABLE recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          ingredients TEXT NOT NULL, -- JSON 格式
          instructions TEXT NOT NULL, -- JSON 格式
          cooking_time TEXT,
          difficulty TEXT,
          servings INTEGER DEFAULT 4,
          category TEXT,
          tags TEXT, -- JSON 格式
          nutrition_info TEXT, -- JSON 格式
          image_url TEXT,
          view_count INTEGER DEFAULT 0,
          favorite_count INTEGER DEFAULT 0,
          rating_count INTEGER DEFAULT 0,
          average_rating REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_recipes_title ON recipes(title)')
      db.exec('CREATE INDEX idx_recipes_category ON recipes(category)')
      db.exec('CREATE INDEX idx_recipes_created_at ON recipes(created_at)')
      console.log('📋 Created recipes table')
    }
  }

  /**
   * 创建收藏表
   */
  private createFavoriteTable(db: any): void {
    if (!sqliteConfig.tableExists('favorites')) {
      const query = `
        CREATE TABLE favorites (
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
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_favorites_session_id ON favorites(session_id)')
      db.exec('CREATE INDEX idx_favorites_recipe_id ON favorites(recipe_id)')
      console.log('📋 Created favorites table')
    }
  }

  /**
   * 创建评分表
   */
  private createRatingTable(db: any): void {
    if (!sqliteConfig.tableExists('ratings')) {
      const query = `
        CREATE TABLE ratings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          recipe_id INTEGER NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
          FOREIGN KEY (session_id) REFERENCES users(session_id) ON DELETE CASCADE,
          UNIQUE(session_id, recipe_id)
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_ratings_session_id ON ratings(session_id)')
      db.exec('CREATE INDEX idx_ratings_recipe_id ON ratings(recipe_id)')
      console.log('📋 Created ratings table')
    }
  }

  /**
   * 创建购物清单表
   */
  private createShoppingListTable(db: any): void {
    if (!sqliteConfig.tableExists('shopping_lists')) {
      const query = `
        CREATE TABLE shopping_lists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          name TEXT NOT NULL,
          items TEXT NOT NULL, -- JSON 格式的购物清单项目
          is_completed BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES users(session_id) ON DELETE CASCADE
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_shopping_lists_session_id ON shopping_lists(session_id)')
      console.log('📋 Created shopping_lists table')
    }
  }

  /**
   * 创建用户会话表
   */
  private createUserSessionTable(db: any): void {
    if (!sqliteConfig.tableExists('user_sessions')) {
      const query = `
        CREATE TABLE user_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT UNIQUE NOT NULL,
      user_data TEXT, -- JSON 格式的用户数据
      last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id)')
      db.exec('CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at)')
      console.log('📋 Created user_sessions table')
    }
  }

  /**
   * 创建分析数据表
   */
  private createAnalyticsTable(db: any): void {
    if (!sqliteConfig.tableExists('analytics')) {
      const query = `
        CREATE TABLE analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          event_data TEXT, -- JSON 格式的事件数据
          page TEXT,
          action TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES users(session_id) ON DELETE CASCADE
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_analytics_session_id ON analytics(session_id)')
      db.exec('CREATE INDEX idx_analytics_event_type ON analytics(event_type)')
      db.exec('CREATE INDEX idx_analytics_timestamp ON analytics(timestamp)')
      console.log('📋 Created analytics table')
    }
  }

  /**
   * 创建同步队列表
   */
  private createSyncQueueTable(db: any): void {
    if (!sqliteConfig.tableExists('sync_queue')) {
      const query = `
        CREATE TABLE sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          model_name TEXT NOT NULL,
          doc_id TEXT NOT NULL,
          operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
          payload TEXT, -- JSON 格式的数据负载
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
          attempts INTEGER DEFAULT 0,
          last_attempt_at DATETIME,
          error_message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_sync_queue_status ON sync_queue(status)')
      db.exec('CREATE INDEX idx_sync_queue_model_name ON sync_queue(model_name)')
      db.exec('CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at)')
      console.log('📋 Created sync_queue table')
    }
  }

  /**
   * 清理过期数据
   */
  public cleanup(): void {
    try {
      const db = sqliteConfig.getConnection()
      
      // 清理过期会话（30天未活动）
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      sqliteConfig.execute('DELETE FROM user_sessions WHERE last_activity < ? OR expires_at < ?', [thirtyDaysAgo.toISOString(), thirtyDaysAgo.toISOString()])
      
      // 清理旧的同步记录（已完成超过7天）
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      sqliteConfig.execute('DELETE FROM sync_queue WHERE status = \'completed\' AND updated_at < ?', [sevenDaysAgo.toISOString()])
      
      console.log('🧹 Database cleanup completed')
    } catch (error) {
      console.error('❌ Database cleanup failed:', error)
    }
  }

  /**
   * 创建搜索历史表
   */
  private createSearchHistoryTable(db: any): void {
    if (!sqliteConfig.tableExists('search_history')) {
      const query = `
        CREATE TABLE search_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT NOT NULL,
          query TEXT NOT NULL,
          results_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES users(session_id) ON DELETE CASCADE
        )
      `
      db.exec(query)
      
      // 创建索引
      db.exec('CREATE INDEX idx_search_history_session_id ON search_history(session_id)')
      db.exec('CREATE INDEX idx_search_history_created_at ON search_history(created_at)')
      console.log('📋 Created search_history table')
    }
  }
}

// 导出单例实例
export const databaseInitializer = DatabaseInitializer.getInstance()
export default databaseInitializer