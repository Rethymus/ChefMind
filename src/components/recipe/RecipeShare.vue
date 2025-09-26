<template>
  <div class="recipe-share">
    <div class="share-options">
      <h3 class="share-title">分享食谱</h3>

      <div class="share-methods">
        <button class="share-method" @click="shareToWeChat">
          <div class="share-icon wechat">
            <span class="icon-text">微信</span>
          </div>
          <div class="share-name">微信</div>
        </button>

        <button class="share-method" @click="shareToWeibo">
          <div class="share-icon weibo">
            <span class="icon-text">微博</span>
          </div>
          <div class="share-name">微博</div>
        </button>

        <button class="share-method" @click="shareToQQ">
          <div class="share-icon qq">
            <span class="icon-text">QQ</span>
          </div>
          <div class="share-name">QQ</div>
        </button>

        <button class="share-method" @click="copyLink">
          <div class="share-icon link">
            <span class="icon-text">链接</span>
          </div>
          <div class="share-name">复制链接</div>
        </button>

        <button class="share-method" @click="generateImage">
          <div class="share-icon image">
            <span class="icon-text">图片</span>
          </div>
          <div class="share-name">生成图片</div>
        </button>
      </div>
    </div>

    <div v-if="showQRCode" class="qrcode-section">
      <h3 class="qrcode-title">扫描二维码分享</h3>
      <div class="qrcode-container" ref="qrcodeContainer"></div>
      <p class="qrcode-tip">使用微信扫一扫，即可查看食谱</p>
    </div>

    <div v-if="generatingImage" class="generating-image">
      <div class="loading-spinner"></div>
      <p>正在生成分享图片...</p>
    </div>

    <div v-if="shareImage" class="share-image-container">
      <div class="share-image-wrapper">
        <img :src="shareImage" alt="食谱分享图片" class="share-image" ref="shareImageRef" />
      </div>
      <div class="share-image-actions">
        <button class="action-button" @click="downloadImage">
          <span class="action-icon">💾</span>
          保存图片
        </button>
        <button class="action-button" @click="shareImage = null">
          <span class="action-icon">✖️</span>
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import QRCode from 'qrcode'
  import html2canvas from 'html2canvas'
  import type { Recipe } from '@/services/recipeService'
  import { formatCookingTime, formatDifficulty, formatServings } from '@/utils/formatUtils'

  // 扩展 Window 接口
  declare global {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    interface Window {
      QRCode: any
      html2canvas: any
    }
  }

  // 定义属性
  const props = defineProps<{
    recipe: Recipe
    visible: boolean
  }>()

  // 定义事件
  const emit = defineEmits<{
    notification: [notification: { type: string; title: string; message: string }]
  }>()

  // 状态
  const showQRCode = ref(false)
  const qrcodeContainer = ref<HTMLElement | null>(null)
  const generatingImage = ref(false)
  const shareImage = ref<string | null>(null)
  const shareImageRef = ref<HTMLImageElement | null>(null)

  // 监听可见性变化
  watch(
    () => props.visible,
    newValue => {
      if (newValue) {
        // 当组件变为可见时，重置状态
        showQRCode.value = false
        shareImage.value = null
      }
    }
  )

  // 分享到微信
  const shareToWeChat = () => {
    showQRCode.value = true
    generateQRCode()
  }

  // 分享到微博
  const shareToWeibo = () => {
    const text = `【${props.recipe.name}】${props.recipe.description}`
    const url = encodeURIComponent(window.location.href)
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${encodeURIComponent(text)}`
    window.open(weiboUrl, '_blank')
  }

  // 分享到QQ
  const shareToQQ = () => {
    const text = `【${props.recipe.name}】${props.recipe.description}`
    const url = encodeURIComponent(window.location.href)
    const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${encodeURIComponent(props.recipe.name)}&summary=${encodeURIComponent(text)}`
    window.open(qqUrl, '_blank')
  }

  // 复制链接
  const copyLink = () => {
    const dummyTextArea = document.createElement('textarea')
    dummyTextArea.value = window.location.href
    document.body.appendChild(dummyTextArea)
    dummyTextArea.select()
    document.execCommand('copy')
    document.body.removeChild(dummyTextArea)

    emit('notification', {
      type: 'success',
      title: '成功',
      message: '链接已复制到剪贴板',
    })
  }

  // 生成二维码
  const generateQRCode = () => {
    if (!qrcodeContainer.value) return

    // 清空容器
    qrcodeContainer.value.innerHTML = ''

    // 生成二维码
    QRCode.toCanvas(
      qrcodeContainer.value,
      window.location.href,
      {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      },
      error => {
        if (error) {
          console.error('生成二维码失败:', error)
          emit('notification', {
            type: 'error',
            title: '错误',
            message: '生成二维码失败，请重试',
          })
        }
      }
    )
  }

  // 生成分享图片
  const generateImage = async () => {
    try {
      generatingImage.value = true

      // 创建一个临时的分享卡片元素
      const shareCard = document.createElement('div')
      shareCard.className = 'recipe-share-card'
      shareCard.style.width = '600px'
      shareCard.style.padding = '30px'
      shareCard.style.backgroundColor = '#ffffff'
      shareCard.style.borderRadius = '12px'
      shareCard.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
      shareCard.style.position = 'fixed'
      shareCard.style.left = '-9999px'
      shareCard.style.top = '-9999px'

      // 添加食谱标题
      const title = document.createElement('h1')
      title.textContent = props.recipe.name
      title.style.fontSize = '28px'
      title.style.fontWeight = '700'
      title.style.color = '#333'
      title.style.marginBottom = '15px'
      title.style.textAlign = 'center'
      shareCard.appendChild(title)

      // 添加分割线
      const divider = document.createElement('div')
      divider.style.height = '2px'
      divider.style.backgroundColor = '#f0f0f0'
      divider.style.margin = '15px 0'
      shareCard.appendChild(divider)

      // 添加食谱描述
      const description = document.createElement('p')
      description.textContent = props.recipe.description
      description.style.fontSize = '16px'
      description.style.lineHeight = '1.6'
      description.style.color = '#666'
      description.style.marginBottom = '20px'
      shareCard.appendChild(description)

      // 添加食谱信息
      const infoContainer = document.createElement('div')
      infoContainer.style.display = 'flex'
      infoContainer.style.justifyContent = 'space-between'
      infoContainer.style.marginBottom = '25px'

      const infoItems = [
        { label: '烹饪时间', value: formatCookingTime(props.recipe.cookingTime), icon: '⏱️' },
        { label: '难度', value: formatDifficulty(props.recipe.difficulty), icon: '📊' },
        { label: '份量', value: formatServings(props.recipe.servings || 2), icon: '🍽️' },
      ]

      infoItems.forEach(item => {
        const infoItem = document.createElement('div')
        infoItem.style.textAlign = 'center'
        infoItem.style.padding = '10px'
        infoItem.style.backgroundColor = '#f9f9f9'
        infoItem.style.borderRadius = '8px'
        infoItem.style.width = '30%'

        const infoIcon = document.createElement('div')
        infoIcon.textContent = item.icon
        infoIcon.style.fontSize = '24px'
        infoIcon.style.marginBottom = '5px'
        infoItem.appendChild(infoIcon)

        const infoLabel = document.createElement('div')
        infoLabel.textContent = item.label
        infoLabel.style.fontSize = '12px'
        infoLabel.style.color = '#999'
        infoLabel.style.marginBottom = '3px'
        infoItem.appendChild(infoLabel)

        const infoValue = document.createElement('div')
        infoValue.textContent = item.value
        infoValue.style.fontSize = '16px'
        infoValue.style.fontWeight = '600'
        infoValue.style.color = '#333'
        infoItem.appendChild(infoValue)

        infoContainer.appendChild(infoItem)
      })

      shareCard.appendChild(infoContainer)

      // 添加食材列表
      const ingredientsTitle = document.createElement('h2')
      ingredientsTitle.textContent = '🥕 食材'
      ingredientsTitle.style.fontSize = '20px'
      ingredientsTitle.style.fontWeight = '600'
      ingredientsTitle.style.color = '#333'
      ingredientsTitle.style.marginBottom = '15px'
      shareCard.appendChild(ingredientsTitle)

      const ingredientsList = document.createElement('ul')
      ingredientsList.style.listStyleType = 'none'
      ingredientsList.style.padding = '0'
      ingredientsList.style.margin = '0 0 25px 0'
      ingredientsList.style.display = 'grid'
      ingredientsList.style.gridTemplateColumns = 'repeat(2, 1fr)'
      ingredientsList.style.gap = '10px'

      props.recipe.ingredients.forEach(ingredient => {
        const ingredientItem = document.createElement('li')
        ingredientItem.textContent = `• ${ingredient}`
        ingredientItem.style.fontSize = '14px'
        ingredientItem.style.color = '#666'
        ingredientItem.style.padding = '5px 0'
        ingredientsList.appendChild(ingredientItem)
      })

      shareCard.appendChild(ingredientsList)

      // 添加二维码和提示
      const qrSection = document.createElement('div')
      qrSection.style.display = 'flex'
      qrSection.style.alignItems = 'center'
      qrSection.style.justifyContent = 'center'
      qrSection.style.flexDirection = 'column'
      qrSection.style.marginTop = '20px'

      const qrCanvas = document.createElement('canvas')
      qrSection.appendChild(qrCanvas)

      const qrText = document.createElement('p')
      qrText.textContent = '扫描二维码查看完整食谱'
      qrText.style.fontSize = '14px'
      qrText.style.color = '#999'
      qrText.style.marginTop = '10px'
      qrSection.appendChild(qrText)

      const appName = document.createElement('div')
      appName.textContent = 'ChefMind 智食谱'
      appName.style.fontSize = '16px'
      appName.style.fontWeight = '600'
      appName.style.color = '#333'
      appName.style.marginTop = '15px'
      qrSection.appendChild(appName)

      shareCard.appendChild(qrSection)

      // 将分享卡片添加到文档中
      document.body.appendChild(shareCard)

      // 生成二维码
      await QRCode.toCanvas(qrCanvas, window.location.href, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })

      // 使用html2canvas将分享卡片转换为图片
      const canvas = await html2canvas(shareCard, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高图片质量
        logging: false,
        useCORS: true,
      })

      // 将canvas转换为图片URL
      shareImage.value = canvas.toDataURL('image/png')

      // 移除临时元素
      document.body.removeChild(shareCard)

      emit('notification', {
        type: 'success',
        title: '成功',
        message: '分享图片生成成功',
      })
    } catch (error) {
      console.error('生成分享图片失败:', error)
      emit('notification', {
        type: 'error',
        title: '错误',
        message: '生成分享图片失败，请重试',
      })
    } finally {
      generatingImage.value = false
    }
  }

  // 下载图片
  const downloadImage = () => {
    if (!shareImage.value) return

    const link = document.createElement('a')
    link.href = shareImage.value
    link.download = `${props.recipe.name}-ChefMind.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    emit('notification', {
      type: 'success',
      title: '成功',
      message: '图片已保存',
    })
  }

  // 生命周期钩子
  onMounted(() => {
    // 动态加载QRCode和html2canvas库
    if (!window.QRCode) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js'
      document.head.appendChild(script)
    }

    if (!window.html2canvas) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
      document.head.appendChild(script)
    }
  })
</script>

<style lang="scss" scoped>
  .recipe-share {
    background-color: var(--bg-color-secondary);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .share-title,
  .qrcode-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--heading-color);
    margin: 0 0 1.5rem 0;
  }

  .share-methods {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: center;
  }

  .share-method {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-3px);
    }
  }

  .share-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: 600;
    color: white;

    &.wechat {
      background-color: #07c160;
    }

    &.weibo {
      background-color: #e6162d;
    }

    &.qq {
      background-color: #12b7f5;
    }

    &.link {
      background-color: #8e44ad;
    }

    &.image {
      background-color: #3498db;
    }
  }

  .share-name {
    font-size: 0.9rem;
    color: var(--text-color);
  }

  .qrcode-section {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .qrcode-container {
    margin-bottom: 1rem;
    background-color: white;
    padding: 1rem;
    border-radius: 8px;
  }

  .qrcode-tip {
    font-size: 0.9rem;
    color: var(--text-color-secondary);
  }

  .generating-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 0;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .share-image-container {
    margin-top: 2rem;
  }

  .share-image-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;

    img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .share-image-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background-color: var(--bg-color);
    color: var(--text-color);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .action-icon {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    .share-methods {
      gap: 1rem;
    }

    .share-icon {
      width: 50px;
      height: 50px;
      font-size: 1rem;
    }

    .share-name {
      font-size: 0.8rem;
    }
  }
</style>
