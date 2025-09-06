<template>
  <div class="search-history">
    <div class="history-header">
      <h3 class="history-title">最近搜索</h3>
      <button v-if="searchHistory.length > 0" class="clear-button" @click="clearHistory">
        清除全部
      </button>
    </div>

    <div v-if="searchHistory.length > 0" class="history-list">
      <div
        v-for="(item, index) in searchHistory"
        :key="index"
        class="history-item"
        @click="selectHistoryItem(item)"
      >
        <div class="history-icon">
          <i class="icon-history"></i>
        </div>
        <div class="history-text">{{ item }}</div>
        <button class="remove-button" @click.stop="removeHistoryItem(index)">×</button>
      </div>
    </div>

    <div v-else class="empty-history">
      <div class="empty-icon">🔍</div>
      <p>暂无搜索历史</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  // 定义事件
  const emit = defineEmits<{
    select: [query: string]
    'search-query': [query: string]
  }>()

  // 搜索历史
  const searchHistory = ref<string[]>([])

  // 加载搜索历史
  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem('search-history')
      if (history) {
        searchHistory.value = JSON.parse(history)
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
      searchHistory.value = []
    }
  }

  // 保存搜索历史
  const saveSearchHistory = () => {
    try {
      localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  // 添加搜索历史
  const addSearchHistory = (query: string) => {
    if (!query.trim()) return

    // 移除重复项
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }

    // 添加到最前面
    searchHistory.value.unshift(query)

    // 限制历史记录数量
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }

    // 保存到本地存储
    saveSearchHistory()
  }

  // 选择历史记录项
  const selectHistoryItem = (query: string) => {
    emit('select', query) // 修改为正确的事件名称
  }

  // 移除历史记录项
  const removeHistoryItem = (index: number) => {
    searchHistory.value.splice(index, 1)
    saveSearchHistory()
  }

  // 清空历史记录
  const clearHistory = () => {
    searchHistory.value = []
    saveSearchHistory()
  }

  // 暴露方法给父组件
  defineExpose({
    addSearchHistory,
  })

  // 初始化
  onMounted(() => {
    loadSearchHistory()
  })
</script>

<style lang="scss" scoped>
  .search-history {
    margin-top: 1.5rem;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .history-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0;
  }

  .clear-button {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
      text-decoration: underline;
    }
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.8rem 1rem;
    background-color: var(--bg-color-secondary);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .history-icon {
    color: var(--text-color-secondary);
    font-size: 1rem;
  }

  .history-text {
    flex: 1;
    font-size: 1rem;
    color: var(--text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .remove-button {
    background: none;
    border: none;
    color: var(--text-color-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--bg-color);
      color: var(--text-color);
    }
  }

  .empty-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 0;
    text-align: center;
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-history p {
    font-size: 1rem;
    color: var(--text-color-secondary);
    margin: 0;
  }

  @media (max-width: 768px) {
    .history-title {
      font-size: 1rem;
    }

    .history-item {
      padding: 0.6rem 0.8rem;
    }
  }
</style>
