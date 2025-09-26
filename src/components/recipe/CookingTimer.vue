<template>
  <div class="cooking-timer">
    <div class="timer-header">
      <h3>
        <el-icon><Timer /></el-icon>
        烹饪计时器
      </h3>
      <button class="add-timer-btn" @click="showAddTimerModal = true" title="添加计时器">
        <el-icon><Plus /></el-icon>
        添加计时器
      </button>
    </div>

    <!-- 计时器列表 -->
    <div class="timers-list" v-if="timers.length > 0">
      <div
        v-for="timer in timers"
        :key="timer.id"
        class="timer-card"
        :class="{
          running: timer.status === 'running',
          paused: timer.status === 'paused',
          finished: timer.status === 'finished',
        }"
      >
        <div class="timer-info">
          <div class="timer-name">{{ timer.name }}</div>
          <div class="timer-description" v-if="timer.description">
            {{ timer.description }}
          </div>
        </div>

        <div class="timer-display">
          <div class="time-remaining">
            {{ formatTime(timer.remainingTime) }}
          </div>
          <div class="time-total">/ {{ formatTime(timer.totalTime) }}</div>
        </div>

        <div class="timer-progress">
          <div class="progress-bar" :style="{ width: getProgressPercentage(timer) + '%' }"></div>
        </div>

        <div class="timer-controls">
          <button
            v-if="timer.status === 'stopped' || timer.status === 'paused'"
            @click="startTimer(timer)"
            class="control-btn start"
            title="开始"
          >
            <el-icon><VideoPlay /></el-icon>
          </button>

          <button
            v-if="timer.status === 'running'"
            @click="pauseTimer(timer)"
            class="control-btn pause"
            title="暂停"
          >
            <el-icon><VideoPause /></el-icon>
          </button>

          <button @click="stopTimer(timer)" class="control-btn stop" title="停止">
            <el-icon><Close /></el-icon>
          </button>

          <button @click="resetTimer(timer)" class="control-btn reset" title="重置">
            <el-icon><RefreshLeft /></el-icon>
          </button>

          <button @click="removeTimer(timer.id)" class="control-btn remove" title="删除">
            <el-icon><Delete /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <el-icon><Timer /></el-icon>
      <p>还没有计时器</p>
      <button class="btn btn-primary" @click="showAddTimerModal = true">添加第一个计时器</button>
    </div>

    <!-- 快速计时器按钮 -->
    <div class="quick-timers">
      <h4>快速计时</h4>
      <div class="quick-timer-buttons">
        <button
          v-for="quickTimer in quickTimers"
          :key="quickTimer.name"
          @click="addQuickTimer(quickTimer)"
          class="quick-timer-btn"
        >
          <i :class="quickTimer.icon"></i>
          <span>{{ quickTimer.name }}</span>
          <small>{{ quickTimer.time }}分钟</small>
        </button>
      </div>
    </div>

    <!-- 添加计时器模态框 -->
    <div class="modal" v-if="showAddTimerModal" @click="closeAddTimerModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加计时器</h3>
          <button class="modal-close" @click="closeAddTimerModal">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>计时器名称</label>
            <input
              type="text"
              v-model="newTimer.name"
              class="form-input"
              placeholder="例如：炒菜、煮汤"
            />
          </div>
          <div class="form-group">
            <label>描述 (可选)</label>
            <input
              type="text"
              v-model="newTimer.description"
              class="form-input"
              placeholder="例如：大火炒制，注意翻炒"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分钟</label>
              <input type="number" v-model="newTimer.minutes" class="form-input" min="0" max="59" />
            </div>
            <div class="form-group">
              <label>秒钟</label>
              <input type="number" v-model="newTimer.seconds" class="form-input" min="0" max="59" />
            </div>
          </div>
          <div class="form-group">
            <label>提醒音效</label>
            <select v-model="newTimer.sound" class="form-select">
              <option value="bell">铃声</option>
              <option value="beep">蜂鸣声</option>
              <option value="chime">钟声</option>
              <option value="ding">叮声</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAddTimerModal">取消</button>
          <button class="btn btn-primary" @click="addTimer">添加</button>
        </div>
      </div>
    </div>

    <!-- 计时器完成通知 -->
    <div class="timer-notification" v-if="finishedTimer" @click="dismissNotification">
      <div class="notification-content">
        <div class="notification-icon">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="notification-text">
          <div class="notification-title">计时器完成！</div>
          <div class="notification-message">{{ finishedTimer.name }} 已完成</div>
        </div>
        <button class="notification-close" @click="dismissNotification">
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import {
    Timer,
    Plus,
    VideoPlay,
    VideoPause,
    RefreshLeft,
    Delete,
    Bell,
    Close,
  } from '@element-plus/icons-vue'

  interface CookingTimer {
    id: string
    name: string
    description?: string
    totalTime: number // 总时间（秒）
    remainingTime: number // 剩余时间（秒）
    status: 'stopped' | 'running' | 'paused' | 'finished'
    sound: string
    intervalId?: number
  }

  interface QuickTimer {
    name: string
    time: number // 分钟
    icon: string
    description?: string
  }

  // 响应式数据
  const timers = ref<CookingTimer[]>([])
  const showAddTimerModal = ref(false)
  const finishedTimer = ref<CookingTimer | null>(null)
  const newTimer = ref({
    name: '',
    description: '',
    minutes: 5,
    seconds: 0,
    sound: 'bell',
  })

  // 快速计时器配置
  const quickTimers: QuickTimer[] = [
    { name: '煮蛋', time: 8, icon: '🥚', description: '水开后煮8分钟' },
    { name: '泡茶', time: 3, icon: '🍵', description: '绿茶冲泡时间' },
    { name: '焖米饭', time: 20, icon: '🍚', description: '电饭煲焖饭' },
    { name: '炒菜', time: 5, icon: '🔥', description: '一般炒菜时间' },
    { name: '煮面条', time: 10, icon: '🍜', description: '面条煮制时间' },
    { name: '蒸蛋羹', time: 15, icon: '☁️', description: '蒸蛋羹时间' },
  ]

  // 添加计时器
  const addTimer = () => {
    const totalSeconds = newTimer.value.minutes * 60 + newTimer.value.seconds

    if (totalSeconds <= 0) {
      alert('请设置有效的时间')
      return
    }

    if (!newTimer.value.name.trim()) {
      alert('请输入计时器名称')
      return
    }

    const timer: CookingTimer = {
      id: Date.now().toString(),
      name: newTimer.value.name.trim(),
      description: newTimer.value.description.trim(),
      totalTime: totalSeconds,
      remainingTime: totalSeconds,
      status: 'stopped',
      sound: newTimer.value.sound,
    }

    timers.value.push(timer)
    closeAddTimerModal()
    saveTimersToStorage()
  }

  // 添加快速计时器
  const addQuickTimer = (quickTimer: QuickTimer) => {
    const timer: CookingTimer = {
      id: Date.now().toString(),
      name: quickTimer.name,
      description: quickTimer.description,
      totalTime: quickTimer.time * 60,
      remainingTime: quickTimer.time * 60,
      status: 'stopped',
      sound: 'bell',
    }

    timers.value.push(timer)
    saveTimersToStorage()
  }

  // 开始计时器
  const startTimer = (timer: CookingTimer) => {
    // 停止其他正在运行的计时器
    timers.value.forEach(t => {
      if (t.id !== timer.id && t.status === 'running') {
        pauseTimer(t)
      }
    })

    timer.status = 'running'

    timer.intervalId = window.setInterval(() => {
      if (timer.remainingTime > 0) {
        timer.remainingTime--
      } else {
        // 计时器完成
        timer.status = 'finished'
        clearInterval(timer.intervalId)
        onTimerFinished(timer)
      }
    }, 1000)

    saveTimersToStorage()
  }

  // 暂停计时器
  const pauseTimer = (timer: CookingTimer) => {
    timer.status = 'paused'
    if (timer.intervalId) {
      clearInterval(timer.intervalId)
      timer.intervalId = undefined
    }
    saveTimersToStorage()
  }

  // 停止计时器
  const stopTimer = (timer: CookingTimer) => {
    timer.status = 'stopped'
    if (timer.intervalId) {
      clearInterval(timer.intervalId)
      timer.intervalId = undefined
    }
    saveTimersToStorage()
  }

  // 重置计时器
  const resetTimer = (timer: CookingTimer) => {
    timer.status = 'stopped'
    timer.remainingTime = timer.totalTime
    if (timer.intervalId) {
      clearInterval(timer.intervalId)
      timer.intervalId = undefined
    }
    saveTimersToStorage()
  }

  // 删除计时器
  const removeTimer = (timerId: string) => {
    const index = timers.value.findIndex(t => t.id === timerId)
    if (index > -1) {
      const timer = timers.value[index]
      if (timer.intervalId) {
        clearInterval(timer.intervalId)
      }
      timers.value.splice(index, 1)
      saveTimersToStorage()
    }
  }

  // 计时器完成处理
  const onTimerFinished = (timer: CookingTimer) => {
    // 播放提醒音效
    playSound(timer.sound)

    // 显示通知
    finishedTimer.value = timer

    // 浏览器通知
    if (Notification.permission === 'granted') {
      new Notification('ChefMind 计时器', {
        body: `${timer.name} 已完成！`,
        icon: '/favicon.ico',
      })
    }

    // 振动提醒（移动设备）
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200])
    }
  }

  // 播放音效
  const playSound = (soundType: string) => {
    try {
      // 使用 Web Audio API 生成简单的提示音
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 根据音效类型设置频率
      const frequencies = {
        bell: 800,
        beep: 1000,
        chime: 600,
        ding: 1200,
      }

      oscillator.frequency.setValueAtTime(
        frequencies[soundType as keyof typeof frequencies] || 800,
        audioContext.currentTime
      )
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 1)
    } catch (error) {
      console.error('播放音效失败:', error)
    }
  }

  // 关闭添加计时器模态框
  const closeAddTimerModal = () => {
    showAddTimerModal.value = false
    newTimer.value = {
      name: '',
      description: '',
      minutes: 5,
      seconds: 0,
      sound: 'bell',
    }
  }

  // 关闭通知
  const dismissNotification = () => {
    finishedTimer.value = null
  }

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 获取进度百分比
  const getProgressPercentage = (timer: CookingTimer): number => {
    if (timer.totalTime === 0) return 0
    return ((timer.totalTime - timer.remainingTime) / timer.totalTime) * 100
  }

  // 保存到本地存储
  const saveTimersToStorage = () => {
    const timersData = timers.value.map(timer => ({
      ...timer,
      intervalId: undefined, // 不保存 intervalId
    }))
    localStorage.setItem('chefmind-timers', JSON.stringify(timersData))
  }

  // 从本地存储加载
  const loadTimersFromStorage = () => {
    const saved = localStorage.getItem('chefmind-timers')
    if (saved) {
      try {
        const savedTimers = JSON.parse(saved)
        timers.value = savedTimers.map((timer: CookingTimer) => ({
          ...timer,
          status: 'stopped', // 重新加载时重置状态
          remainingTime: timer.totalTime, // 重置剩余时间
        }))
      } catch (error) {
        console.error('加载计时器失败:', error)
      }
    }
  }

  // 请求通知权限
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  // 组件挂载时
  onMounted(() => {
    loadTimersFromStorage()
    requestNotificationPermission()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    timers.value.forEach(timer => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId)
      }
    })
  })
</script>

<style lang="scss" scoped>
  .cooking-timer {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    margin: 2rem 0;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    .timer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #f0f0f0;

      h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.5rem;
        color: #2c3e50;
        margin: 0;

        i {
          color: #ff6b6b;
        }
      }

      .add-timer-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: #4ecdc4;
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          background: #45b7aa;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(78, 205, 196, 0.3);
        }
      }
    }

    .timers-list {
      display: grid;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .timer-card {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1.5rem;
      transition: all 0.3s ease;

      &.running {
        border-color: #4ecdc4;
        background: linear-gradient(
          135deg,
          rgba(78, 205, 196, 0.1) 0%,
          rgba(78, 205, 196, 0.05) 100%
        );
      }

      &.paused {
        border-color: #ffc107;
        background: linear-gradient(
          135deg,
          rgba(255, 193, 7, 0.1) 0%,
          rgba(255, 193, 7, 0.05) 100%
        );
      }

      &.finished {
        border-color: #28a745;
        background: linear-gradient(
          135deg,
          rgba(40, 167, 69, 0.1) 0%,
          rgba(40, 167, 69, 0.05) 100%
        );
        animation: pulse-green 2s infinite;
      }

      .timer-info {
        margin-bottom: 1rem;

        .timer-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.2rem;
        }

        .timer-description {
          color: #666;
          font-size: 0.9rem;
        }
      }

      .timer-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 1rem;

        .time-remaining {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c3e50;
          font-family:
            'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', 'Courier New', monospace;
        }

        .time-total {
          font-size: 1rem;
          color: #666;
          margin-left: 0.5rem;
          font-family:
            'DejaVu Sans Mono', 'Noto Sans Mono', 'Liberation Mono', 'Courier New', monospace;
        }
      }

      .timer-progress {
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 1rem;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #4ecdc4, #44a08d);
          border-radius: 4px;
          transition: width 0.3s ease;
        }
      }

      .timer-controls {
        display: flex;
        justify-content: center;
        gap: 0.5rem;

        .control-btn {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;

          &.start {
            background: #28a745;
            color: white;

            &:hover {
              background: #218838;
              transform: scale(1.1);
            }
          }

          &.pause {
            background: #ffc107;
            color: white;

            &:hover {
              background: #e0a800;
              transform: scale(1.1);
            }
          }

          &.stop {
            background: #dc3545;
            color: white;

            &:hover {
              background: #c82333;
              transform: scale(1.1);
            }
          }

          &.reset {
            background: #6c757d;
            color: white;

            &:hover {
              background: #5a6268;
              transform: scale(1.1);
            }
          }

          &.remove {
            background: #dc3545;
            color: white;

            &:hover {
              background: #c82333;
              transform: scale(1.1);
            }
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #666;

      i {
        font-size: 4rem;
        color: #ddd;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
      }
    }

    .quick-timers {
      border-top: 2px solid #f0f0f0;
      padding-top: 2rem;

      h4 {
        color: #2c3e50;
        margin-bottom: 1rem;
        text-align: center;
      }

      .quick-timer-buttons {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
      }

      .quick-timer-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #4ecdc4;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
        }

        i {
          font-size: 1.5rem;
          color: #4ecdc4;
        }

        span {
          font-weight: 600;
          color: #2c3e50;
        }

        small {
          color: #666;
          font-size: 0.8rem;
        }
      }
    }

    // 模态框样式
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;

      .modal-content {
        background: white;
        border-radius: 15px;
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #eee;

        h3 {
          margin: 0;
          color: #2c3e50;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;

          &:hover {
            color: #666;
          }
        }
      }

      .modal-body {
        padding: 1.5rem;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1rem 1.5rem;
        border-top: 1px solid #eee;
      }

      .form-group {
        margin-bottom: 1rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;

          &:focus {
            outline: none;
            border-color: #4ecdc4;
          }
        }
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;

        &.btn-primary {
          background: #4ecdc4;
          color: white;

          &:hover {
            background: #45b7aa;
          }
        }

        &.btn-secondary {
          background: #6c757d;
          color: white;

          &:hover {
            background: #5a6268;
          }
        }
      }
    }

    // 通知样式
    .timer-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 2px solid #28a745;
      border-radius: 15px;
      padding: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      z-index: 1001;
      cursor: pointer;
      animation: slideInRight 0.5s ease;

      .notification-content {
        display: flex;
        align-items: center;
        gap: 1rem;

        .notification-icon {
          width: 40px;
          height: 40px;
          background: #28a745;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          animation: ring 1s infinite;
        }

        .notification-text {
          flex: 1;

          .notification-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.2rem;
          }

          .notification-message {
            color: #666;
            font-size: 0.9rem;
          }
        }

        .notification-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          color: #999;
          cursor: pointer;

          &:hover {
            color: #666;
          }
        }
      }
    }
  }

  // 动画
  @keyframes pulse-green {
    0% {
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes ring {
    0%,
    100% {
      transform: rotate(0deg);
    }
    10%,
    30%,
    50%,
    70%,
    90% {
      transform: rotate(-10deg);
    }
    20%,
    40%,
    60%,
    80% {
      transform: rotate(10deg);
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .cooking-timer {
      padding: 1rem;

      .timer-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;

        .add-timer-btn {
          justify-content: center;
        }
      }

      .timer-card {
        padding: 1rem;

        .timer-display {
          .time-remaining {
            font-size: 2rem;
          }
        }

        .timer-controls {
          gap: 0.3rem;

          .control-btn {
            width: 35px;
            height: 35px;
          }
        }
      }

      .quick-timer-buttons {
        grid-template-columns: repeat(2, 1fr);
      }

      .quick-timer-btn {
        padding: 0.75rem;

        i {
          font-size: 1.2rem;
        }

        span {
          font-size: 0.9rem;
        }
      }

      .timer-notification {
        top: 10px;
        right: 10px;
        left: 10px;
        width: auto;
      }

      .modal-content {
        width: 95%;
        margin: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  }
</style>
