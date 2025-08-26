<template>
  <div class="svg-generator-view">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">SVG 菜谱封面生成器</h1>
        <p class="page-subtitle">输入菜品名称，自动生成精美的 SVG 封面图片</p>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-group">
          <label for="dish-name" class="input-label">菜品名称</label>
          <input
            id="dish-name"
            v-model="dishName"
            type="text"
            class="dish-input"
            placeholder="请输入菜品名称，例如：宫保鸡丁"
            @input="generateSvg"
          />
        </div>

        <div class="style-options">
          <div class="options-label">生成选项：</div>
          <div class="style-buttons">
            <button class="style-btn primary" @click="generateSvg">重新生成</button>
          </div>
        </div>

        <div class="size-options">
          <div class="options-label">图片尺寸：</div>
          <select v-model="selectedSize" class="size-select" @change="generateSvg">
            <option value="400x300">400×300 (标准)</option>
            <option value="500x375">500×375 (中等)</option>
            <option value="600x450">600×450 (大图)</option>
            <option value="800x600">800×600 (高清)</option>
          </select>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <div class="preview-container">
          <h3 class="preview-title">实时预览</h3>
          <div class="svg-preview" v-html="generatedSvg"></div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="action-btn primary" @click="downloadSvg">下载 SVG</button>
          <button class="action-btn secondary" @click="copySvgCode">复制代码</button>
          <button class="action-btn tertiary" @click="generateSvg">随机颜色</button>
        </div>
      </div>

      <!-- 代码显示区域 -->
      <div class="code-section">
        <div class="code-header">
          <h3 class="code-title">生成的 SVG 代码</h3>
          <button class="copy-btn" @click="copySvgCode">复制</button>
        </div>
        <pre class="code-block"><code>{{ generatedSvg }}</code></pre>
      </div>

      <!-- 预设示例 -->
      <div class="examples-section">
        <h3 class="examples-title">预设示例</h3>
        <div class="examples-grid">
          <div
            v-for="example in examples"
            :key="example.name"
            class="example-card"
            @click="loadExample(example)"
          >
            <div class="example-preview" v-html="example.svg"></div>
            <div class="example-info">
              <h4 class="example-name">{{ example.name }}</h4>
              <p class="example-style">{{ example.style }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useNotification } from '@/composables/useNotification'

  const { showNotification } = useNotification()

  // 响应式数据
  const dishName = ref('宫保鸡丁')
  const selectedSize = ref('400x300')
  const generatedSvg = ref('')
  const currentColor = ref('#f39c12')

  // 随机颜色库
  const colorPalette = [
    '#f39c12', // 橙色
    '#e74c3c', // 红色
    '#8b4513', // 棕色
    '#c0392b', // 深红色
    '#3498db', // 蓝色
    '#27ae60', // 绿色
    '#9b59b6', // 紫色
    '#e67e22', // 深橙色
    '#2c3e50', // 深蓝色
    '#16a085', // 青绿色
    '#d35400', // 深橙红
    '#8e44ad', // 深紫色
    '#2980b9', // 深蓝色
    '#c0392b', // 深红色
    '#f1c40f', // 黄色
    '#e91e63', // 粉红色
  ]

  // 获取随机颜色
  const getRandomColor = () => {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)]
  }

  // 获取尺寸配置
  const getSizeConfig = () => {
    const [width, height] = selectedSize.value.split('x').map(Number)
    return { width, height }
  }

  // 生成简单风格的 SVG（与首页保持一致）
  const generateSimpleSvg = (name: string) => {
    const { width, height } = getSizeConfig()
    const bgColor = getRandomColor()
    const fontSize = Math.max(16, Math.min(32, width / 15))
    const subtitleSize = Math.max(12, Math.min(18, width / 25))

    // 更新当前颜色
    currentColor.value = bgColor

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="${fontSize}" font-weight="bold" fill="white">${name}</text>
  <text x="${width / 2}" y="${height / 2 + 25}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${subtitleSize}" fill="white">Delicious Recipe</text>
</svg>`
  }

  // 生成 SVG
  const generateSvg = () => {
    if (!dishName.value.trim()) return
    generatedSvg.value = generateSimpleSvg(dishName.value)
  }

  // 下载 SVG
  const downloadSvg = () => {
    if (!generatedSvg.value) return

    const blob = new Blob([generatedSvg.value], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${dishName.value}-simple.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showNotification({
      type: 'success',
      message: 'SVG 文件下载成功！',
    })
  }

  // 复制 SVG 代码
  const copySvgCode = async () => {
    if (!generatedSvg.value) return

    try {
      await navigator.clipboard.writeText(generatedSvg.value)
      showNotification({
        type: 'success',
        message: 'SVG 代码已复制到剪贴板！',
      })
    } catch (error) {
      console.error('复制失败:', error)
      showNotification({
        type: 'error',
        message: '复制失败，请手动复制代码',
      })
    }
  }

  // 预设示例
  const examples = ref([
    {
      name: '宫保鸡丁',
      style: '简单风格',
      svg: generateSimpleSvg('宫保鸡丁'),
    },
    {
      name: '清蒸鲈鱼',
      style: '简单风格',
      svg: generateSimpleSvg('清蒸鲈鱼'),
    },
    {
      name: '红烧肉',
      style: '简单风格',
      svg: generateSimpleSvg('红烧肉'),
    },
    {
      name: '蒜蓉西兰花',
      style: '简单风格',
      svg: generateSimpleSvg('蒜蓉西兰花'),
    },
  ])

  // 加载示例
  const loadExample = (example: any) => {
    dishName.value = example.name
    generateSvg()
  }

  // 页面初始化
  onMounted(() => {
    generateSvg()
  })
</script>

<style scoped lang="scss">
  @import '@/styles/variables.scss';

  .svg-generator-view {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 2rem 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  // 页面标题
  .page-header {
    text-align: center;
    margin-bottom: 3rem;

    .page-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin-bottom: 0.5rem;
      background: linear-gradient(45deg, #3498db, #8e44ad);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .page-subtitle {
      font-size: 1.1rem;
      color: #7f8c8d;
    }
  }

  // 输入区域
  .input-section {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    .input-group {
      margin-bottom: 1.5rem;

      .input-label {
        display: block;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }

      .dish-input {
        width: 100%;
        padding: 1rem;
        border: 2px solid #e1e8ed;
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;

        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
      }
    }

    .style-options,
    .size-options {
      margin-bottom: 1.5rem;

      .options-label {
        display: block;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.8rem;
      }

      .style-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        .style-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e1e8ed;
          border-radius: 25px;
          background: white;
          color: #7f8c8d;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;

          &:hover {
            border-color: #3498db;
            color: #3498db;
          }

          &.active {
            background: #3498db;
            border-color: #3498db;
            color: white;
          }
        }
      }

      .size-select {
        padding: 0.5rem 1rem;
        border: 2px solid #e1e8ed;
        border-radius: 8px;
        background: white;
        font-size: 0.9rem;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: #3498db;
        }
      }
    }
  }

  // 预览区域
  .preview-section {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    .preview-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1rem;
    }

    .svg-preview {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
      background: #f8f9fa;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      border: 2px dashed #e1e8ed;

      :deep(svg) {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;

      .action-btn {
        padding: 0.8rem 1.5rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        &.primary {
          background: #3498db;
          color: white;

          &:hover {
            background: #2980b9;
            transform: translateY(-2px);
          }
        }

        &.secondary {
          background: #95a5a6;
          color: white;

          &:hover {
            background: #7f8c8d;
            transform: translateY(-2px);
          }
        }

        &.tertiary {
          background: #e74c3c;
          color: white;

          &:hover {
            background: #c0392b;
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  // 代码区域
  .code-section {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      .code-title {
        font-size: 1.3rem;
        font-weight: 600;
        color: #2c3e50;
      }

      .copy-btn {
        padding: 0.5rem 1rem;
        background: #27ae60;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s ease;

        &:hover {
          background: #229954;
        }
      }
    }

    .code-block {
      background: #2c3e50;
      color: #ecf0f1;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9rem;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }

  // 示例区域
  .examples-section {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

    .examples-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;

      .example-card {
        border: 2px solid #e1e8ed;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: #3498db;
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(52, 152, 219, 0.2);
        }

        .example-preview {
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;

          :deep(svg) {
            width: 180px;
            height: 135px;
          }
        }

        .example-info {
          padding: 1rem;

          .example-name {
            font-size: 1rem;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.3rem;
          }

          .example-style {
            font-size: 0.8rem;
            color: #7f8c8d;
            margin: 0;
          }
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .page-header .page-title {
      font-size: 2rem;
    }

    .input-section,
    .preview-section,
    .code-section,
    .examples-section {
      padding: 1.5rem;
    }

    .action-buttons {
      justify-content: center;

      .action-btn {
        flex: 1;
        min-width: 120px;
      }
    }

    .examples-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
