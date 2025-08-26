<template>
  <div style="padding: 20px; background: white;">
    <h1>简单按钮测试</h1>
    
    <div style="border: 2px solid red; padding: 20px; margin: 20px 0;">
      <h2>基础按钮测试</h2>
      <button @click="testBasicClick" style="background: blue; color: white; padding: 10px 20px; border: none; margin: 10px;">
        基础测试按钮
      </button>
      <button @click="showAlert" style="background: green; color: white; padding: 10px 20px; border: none; margin: 10px;">
        显示警告框
      </button>
    </div>

    <div style="border: 2px solid blue; padding: 20px; margin: 20px 0;">
      <h2>循环中的按钮测试</h2>
      <div v-for="(item, index) in testItems" :key="index" style="border: 1px solid gray; padding: 10px; margin: 10px 0;">
        <h3>{{ item.name }}</h3>
        <button @click="clickItem(item, index)" style="background: orange; color: white; padding: 8px 16px; border: none; margin: 5px;">
          点击项目 {{ index + 1 }}
        </button>
        <button @click="removeItem(index)" style="background: red; color: white; padding: 8px 16px; border: none; margin: 5px;">
          删除项目 {{ index + 1 }}
        </button>
      </div>
    </div>

    <div style="border: 2px solid green; padding: 20px; margin: 20px 0;">
      <h2>事件日志</h2>
      <div style="background: #f0f0f0; padding: 10px; height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px;">
        <div v-for="(log, index) in eventLogs" :key="index">
          {{ log }}
        </div>
      </div>
      <button @click="clearLogs" style="background: gray; color: white; padding: 8px 16px; border: none; margin: 10px 0;">
        清空日志
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const eventLogs = ref<string[]>([])
const testItems = ref([
  { id: 1, name: '测试项目 1' },
  { id: 2, name: '测试项目 2' },
  { id: 3, name: '测试项目 3' }
])

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLogs.value.push(`[${timestamp}] ${message}`)
  console.log(`🔍 ButtonTest: ${message}`)
}

const testBasicClick = () => {
  addLog('基础测试按钮被点击')
}

const showAlert = () => {
  addLog('显示警告框按钮被点击')
  alert('警告框测试成功！')
}

const clickItem = (item: any, index: number) => {
  addLog(`点击了项目: ${item.name} (索引: ${index})`)
}

const removeItem = (index: number) => {
  const item = testItems.value[index]
  addLog(`准备删除项目: ${item.name} (索引: ${index})`)
  
  if (confirm(`确定要删除 ${item.name} 吗？`)) {
    testItems.value.splice(index, 1)
    addLog(`已删除项目: ${item.name}`)
  } else {
    addLog('取消删除操作')
  }
}

const clearLogs = () => {
  eventLogs.value = []
  console.clear()
}

// 初始化日志
addLog('组件已加载')
</script>
