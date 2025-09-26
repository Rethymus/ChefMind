<template>
  <div class="optimized-input">
    <input
      ref="inputRef"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @compositionstart="handleCompositionStart"
      @compositionupdate="handleCompositionUpdate"
      @compositionend="handleCompositionEnd"
      class="optimized-input-field"
      :class="{
        focused: isFocused,
        composing: isComposing,
        'chinese-mode': isChineseMode,
      }"
    />

    <div class="input-controls">
      <button
        v-if="showInputMethodToggle"
        @click="toggleInputMethod"
        class="input-method-toggle"
        :class="{ chinese: isChineseMode }"
        :title="isChineseMode ? '切换到英文' : '切换到中文'"
      >
        {{ isChineseMode ? '中' : 'En' }}
      </button>

      <button
        v-if="showKeyboardToggle"
        @click="toggleVirtualKeyboard"
        class="keyboard-toggle"
        :class="{ active: isKeyboardVisible }"
        title="显示/隐藏虚拟键盘"
      >
        ⌨️
      </button>
    </div>

    <div v-if="isComposing && compositionText" class="composition-preview">
      {{ compositionText }}
    </div>

    <div v-if="showCandidates && candidates.length > 0" class="candidates-popup">
      <div class="candidates-header">
        <span class="pinyin-display">{{ currentPinyin }}</span>
        <button @click="closeCandidates" class="close-candidates">✕</button>
      </div>
      <div class="candidates-list">
        <div
          v-for="(candidate, index) in candidates"
          :key="index"
          class="candidate-item"
          :class="{ selected: selectedIndex === index }"
          @click="selectCandidate(index)"
        >
          <span class="candidate-index">{{ index + 1 }}.</span>
          <span class="candidate-text">{{ candidate.text }}</span>
          <span class="candidate-pinyin">{{ candidate.pinyin }}</span>
        </div>
      </div>
      <div class="candidates-footer">
        <span class="candidates-hint">按数字键选择，空格键确认</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
  import { useInputMethod } from '@/utils/inputMethodManager'
  import { chineseInputMethod } from '@/utils/chineseInput'

  interface Props {
    modelValue?: string
    type?: string
    placeholder?: string
    showInputMethodToggle?: boolean
    showKeyboardToggle?: boolean
    autoChinese?: boolean
    inputMode?: 'text' | 'search' | 'email' | 'tel'
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    showInputMethodToggle: true,
    showKeyboardToggle: true,
    autoChinese: false,
    inputMode: 'text',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: string]
    focus: [event: FocusEvent]
    blur: [event: FocusEvent]
    input: [event: Event]
    change: [event: Event]
    keydown: [event: KeyboardEvent]
    compositionStart: [event: CompositionEvent]
    compositionUpdate: [event: CompositionEvent]
    compositionEnd: [event: CompositionEvent]
    inputMethodChanged: [language: string]
  }>()

  // 输入法管理
  const {
    status,
    isChineseSupported,
    isChineseActive,
    switchToChinese,
    switchToEnglish,
    toggleInputMethod,
  } = useInputMethod()

  // 虚拟键盘管理

  // 输入框引用
  const inputRef = ref<HTMLInputElement>()

  // 状态管理
  const isFocused = ref(false)
  const isComposing = ref(false)
  const compositionText = ref('')
  const showCandidates = ref(false)
  const candidates = ref<any[]>([])
  const selectedIndex = ref(0)
  const currentPinyin = ref('')

  // 计算属性
  const isChineseMode = computed(() => {
    return props.autoChinese && isChineseActive.value
  })

  const isKeyboardVisible = computed(() => false)

  // 处理输入事件
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.value)
    emit('input', event)
  }

  // 处理焦点事件
  const handleFocus = async (event: FocusEvent) => {
    isFocused.value = true

    // 自动切换到中文模式
    if (props.autoChinese && isChineseSupported.value && !isChineseActive.value) {
      await switchToChinese()
      emit('inputMethodChanged', 'zh')
    }

    emit('focus', event)
  }

  const handleBlur = (event: FocusEvent) => {
    isFocused.value = false
    closeCandidates()
    emit('blur', event)
  }

  // 处理键盘事件
  const handleKeydown = async (event: KeyboardEvent) => {
    emit('keydown', event)

    // 如果正在显示候选词
    if (showCandidates.value && candidates.value.length > 0) {
      switch (event.key) {
        case 'Escape':
          closeCandidates()
          event.preventDefault()
          break
        case ' ':
          selectCandidate(selectedIndex.value)
          event.preventDefault()
          break
        case 'Enter':
          selectCandidate(selectedIndex.value)
          event.preventDefault()
          break
        case 'ArrowUp':
          selectedIndex.value =
            selectedIndex.value > 0 ? selectedIndex.value - 1 : candidates.value.length - 1
          event.preventDefault()
          break
        case 'ArrowDown':
          selectedIndex.value =
            selectedIndex.value < candidates.value.length - 1 ? selectedIndex.value + 1 : 0
          event.preventDefault()
          break
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          const index = parseInt(event.key) - 1
          if (index < candidates.value.length) {
            selectCandidate(index)
            event.preventDefault()
          }
          break
      }
    }

    // 处理输入法切换快捷键
    if (event.ctrlKey && event.shiftKey) {
      await toggleInputMethod()
      emit('inputMethodChanged', status.value.language)
    }

    // 处理中英文切换
    if (event.ctrlKey && event.key === ' ') {
      await toggleInputMethod()
      emit('inputMethodChanged', status.value.language)
    }
  }

  // 处理输入法组合事件
  const handleCompositionStart = (event: CompositionEvent) => {
    isComposing.value = true
    compositionText.value = event.data
    emit('compositionStart', event)
  }

  const handleCompositionUpdate = (event: CompositionEvent) => {
    isComposing.value = true
    compositionText.value = event.data

    // 如果是中文模式，处理拼音输入
    if (isChineseMode.value && event.data) {
      handlePinyinInput(event.data)
    }

    emit('compositionUpdate', event)
  }

  const handleCompositionEnd = (event: CompositionEvent) => {
    isComposing.value = false
    compositionText.value = ''
    emit('compositionEnd', event)
  }

  // 处理拼音输入
  const handlePinyinInput = (text: string) => {
    // 简单的拼音检测逻辑
    if (text && /^[a-zA-Z]+$/.test(text)) {
      currentPinyin.value = text.toLowerCase()
      candidates.value = chineseInputMethod.inputPinyin(currentPinyin.value)
      selectedIndex.value = 0
      showCandidates.value = candidates.value.length > 0
    } else {
      closeCandidates()
    }
  }

  // 选择候选词
  const selectCandidate = (index: number) => {
    if (index >= 0 && index < candidates.value.length) {
      const candidate = candidates.value[index]
      const input = inputRef.value
      if (input) {
        const start = input.selectionStart || 0
        const value = input.value
        const newValue =
          value.slice(0, start - currentPinyin.value.length) + candidate.text + value.slice(start)

        input.value = newValue
        emit('update:modelValue', newValue)
        emit('input', new Event('input'))
        emit('change', new Event('change'))

        // 设置光标位置
        const newPosition = start - currentPinyin.value.length + candidate.text.length
        input.setSelectionRange(newPosition, newPosition)
        input.focus()
      }
      closeCandidates()
    }
  }

  // 关闭候选词
  const closeCandidates = () => {
    showCandidates.value = false
    candidates.value = []
    selectedIndex.value = 0
    currentPinyin.value = ''
  }

  // 切换输入法
  const handleToggleInputMethod = async () => {
    const success = await toggleInputMethod()
    if (success) {
      emit('inputMethodChanged', status.value.language)
    }
  }

  // 切换虚拟键盘
  const toggleVirtualKeyboard = () => {
    // Virtual keyboard functionality removed
  }

  // 自动定位候选词弹窗
  const positionCandidatesPopup = () => {
    // 这里可以实现候选词弹窗的自动定位逻辑
  }

  // 生命周期钩子
  onMounted(() => {
    // 监听输入法状态变化
    const onInputMethodChanged = (newStatus: any) => {
      if (newStatus.language === 'zh') {
        inputRef.value?.setAttribute('lang', 'zh-CN')
      } else {
        inputRef.value?.setAttribute('lang', 'en-US')
      }
    }
  })

  onUnmounted(() => {
    // 清理工作
  })

  // 暴露方法给父组件
  defineExpose({
    focus: () => inputRef.value?.focus(),
    blur: () => inputRef.value?.blur(),
    select: () => inputRef.value?.select(),
    setSelectionRange: (start: number, end: number) =>
      inputRef.value?.setSelectionRange(start, end),
    toggleInputMethod: handleToggleInputMethod,
    toggleVirtualKeyboard,
  })
</script>

<style scoped>
  .optimized-input {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .optimized-input-field {
    width: 100%;
    padding: 10px 40px 10px 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;
    outline: none;
  }

  .optimized-input-field:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }

  .optimized-input-field.focused {
    border-color: #4caf50;
  }

  .optimized-input-field.composing {
    border-color: #ff5722;
  }

  .optimized-input-field.chinese-mode {
    font-family: 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
  }

  .input-controls {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 4px;
  }

  .input-method-toggle {
    width: 24px;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .input-method-toggle:hover {
    background: #f5f5f5;
  }

  .input-method-toggle.chinese {
    background: #ff5722;
    color: white;
    border-color: #ff5722;
  }

  .keyboard-toggle {
    width: 24px;
    height: 24px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #666;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .keyboard-toggle:hover {
    background: #f5f5f5;
  }

  .keyboard-toggle.active {
    background: #4caf50;
    color: white;
    border-color: #4caf50;
  }

  .composition-preview {
    position: absolute;
    top: 100%;
    left: 12px;
    margin-top: 4px;
    padding: 4px 8px;
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    font-size: 14px;
    color: #856404;
    z-index: 10;
  }

  .candidates-popup {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 100;
    max-height: 300px;
    overflow: hidden;
  }

  .candidates-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
  }

  .pinyin-display {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  .close-candidates {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: #999;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .close-candidates:hover {
    background: #f5f5f5;
    color: #666;
  }

  .candidates-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .candidate-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .candidate-item:hover {
    background: #f8f9fa;
  }

  .candidate-item.selected {
    background: #e3f2fd;
  }

  .candidate-index {
    width: 20px;
    color: #666;
    font-size: 12px;
  }

  .candidate-text {
    flex: 1;
    font-size: 16px;
    color: #333;
    margin: 0 8px;
  }

  .candidate-pinyin {
    font-size: 12px;
    color: #999;
  }

  .candidates-footer {
    padding: 8px 12px;
    border-top: 1px solid #eee;
    background: #f8f9fa;
  }

  .candidates-hint {
    font-size: 12px;
    color: #666;
    text-align: center;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .candidates-popup {
      left: -8px;
      right: -8px;
    }

    .candidate-text {
      font-size: 14px;
    }
  }
</style>
