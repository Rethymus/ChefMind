<template>
  <div class="settings-view">
    <section class="settings-hero">
      <div>
        <p class="eyebrow">AI Connection Hub</p>
        <h1>把 ChefMind 接到你的 AI 厨房</h1>
        <p class="hero-copy">
          选择 OpenAI 协议供应商，填入 API Key，ChefMind 就能用你的模型生成菜谱和分析营养。
          {{ isTauriRuntime ? '桌面版会将 Key 保存到操作系统凭据库。' : 'Web 版仅在当前页面内存中暂存 Key。' }}
        </p>
      </div>
      <div class="connection-summary">
        <span class="summary-label">当前模式</span>
        <strong>{{ isMockMode ? '模拟演示' : selectedPreset.name }}</strong>
        <small>{{ savedAtText }}</small>
      </div>
    </section>

    <section class="settings-layout">
      <aside class="settings-sidebar">
        <button class="sidebar-item active">
          <el-icon><Connection /></el-icon>
          AI 连接
        </button>
        <button class="sidebar-item" disabled>
          <el-icon><Lock /></el-icon>
          隐私与本地数据
        </button>
        <button class="sidebar-item" disabled>
          <el-icon><MagicStick /></el-icon>
          实验功能
        </button>
      </aside>

      <main class="settings-panel">
        <div class="panel-header">
          <div>
            <h2>OpenAI 协议 API 配置</h2>
            <p>支持 OpenAI-compatible 的 Chat Completions 服务。</p>
          </div>
          <el-tag :type="connectionTagType" size="large">{{ connectionStatusLabel }}</el-tag>
        </div>

        <div class="form-grid">
          <label class="field">
            <span>供应商预设</span>
            <el-select v-model="selectedPresetId" size="large" @change="applyPreset">
              <el-option
                v-for="preset in aiProviderPresets"
                :key="preset.id"
                :label="preset.name"
                :value="preset.id"
              >
                <div class="preset-option">
                  <strong>{{ preset.name }}</strong>
                  <small>{{ preset.baseUrl || '自定义地址' }}</small>
                </div>
              </el-option>
            </el-select>
          </label>

          <label class="field">
            <span>模型名称</span>
            <el-input v-model="form.model" size="large" placeholder="例如 gpt-4o-mini" />
          </label>

          <label class="field full">
            <span>Base URL</span>
            <el-input
              v-model="form.baseUrl"
              size="large"
              placeholder="https://api.openai.com/v1"
            />
          </label>

          <label class="field full">
            <span>API Key</span>
            <el-input
              v-model="form.apiKey"
              size="large"
              type="password"
              show-password
              placeholder="sk-..."
              autocomplete="off"
            />
          </label>
        </div>

        <div class="provider-note">
          <div>
            <h3>{{ selectedPreset.name }}</h3>
            <p>{{ selectedPreset.description }}</p>
          </div>
          <a
            v-if="selectedPreset.apiKeyUrl"
            :href="selectedPreset.apiKeyUrl"
            target="_blank"
            rel="noreferrer"
          >
            获取 API Key
            <el-icon><TopRight /></el-icon>
          </a>
          <span v-else>自定义供应商请填写对应控制台地址</span>
        </div>

        <div class="credential-notice" role="status">
          <el-icon><Lock /></el-icon>
          <p>
            {{
              isTauriRuntime
                ? '保存后，API Key 仅由桌面端的操作系统凭据库保存；ChefMind 不会将它写入本地数据库。'
                : 'Web 版不会持久化 API Key。刷新页面后需要重新填写；Key 只会在直连你所选供应商时发送给该供应商。'
            }}
          </p>
        </div>

        <div v-if="testResult.message" :class="['test-result', testResult.type]">
          <el-icon>
            <CircleCheck v-if="testResult.type === 'success'" />
            <Warning v-else />
          </el-icon>
          <div>
            <strong>{{ testResult.title }}</strong>
            <p>{{ testResult.message }}</p>
          </div>
        </div>

        <div class="actions">
          <el-button type="primary" size="large" :loading="saving" @click="saveConfig">
            <el-icon><Check /></el-icon>
            保存配置
          </el-button>
          <el-button size="large" :loading="testing" @click="testConnection">
            <el-icon><Connection /></el-icon>
            测试连接
          </el-button>
          <el-button size="large" @click="enableMockMode">
            <el-icon><Monitor /></el-icon>
            切换到模拟模式
          </el-button>
          <el-button v-if="hasStoredCredential" size="large" type="danger" plain @click="removeConfig">
            删除 API 配置
          </el-button>
        </div>

        <div class="trust-grid">
          <article>
            <span>01</span>
            <h3>{{ isTauriRuntime ? '系统凭据库' : '仅本次页面' }}</h3>
            <p>{{ isTauriRuntime ? '桌面端将 Key 保存至操作系统凭据库。' : 'Web 版刷新后不会保留 API Key。' }}</p>
          </article>
          <article>
            <span>02</span>
            <h3>一键验证</h3>
            <p>测试按钮会调用 Chat Completions，验证 Key、Base URL 和模型是否可用。</p>
          </article>
          <article>
            <span>03</span>
            <h3>兼容优先</h3>
            <p>预设常见供应商，也允许你接入任意 OpenAI 协议网关。</p>
          </article>
        </div>

        <section v-if="!isTauriRuntime" class="local-data-tools" aria-labelledby="local-data-title">
          <div>
            <p class="eyebrow">Web local data</p>
            <h3 id="local-data-title">浏览器本地数据与备份</h3>
            <p>
              菜谱、收藏和购物清单会保存在此浏览器的 IndexedDB 中，不会上传到 ChefMind。
              浏览器清理站点数据、无痕模式或存储回收都可能导致数据丢失，请定期导出备份。
            </p>
            <small>{{ storagePersistenceMessage }}</small>
          </div>
          <div class="local-data-actions">
            <el-button :loading="exportingData" @click="exportData">导出本地数据</el-button>
            <el-button :loading="importingData" @click="chooseBackupFile">导入备份</el-button>
            <el-button type="danger" plain :loading="clearingData" @click="clearLocalData">
              清除全部本地数据
            </el-button>
            <input ref="backupFileInput" type="file" accept="application/json" hidden @change="importData" />
          </div>
        </section>
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Check,
    CircleCheck,
    Connection,
    Lock,
    MagicStick,
    Monitor,
    TopRight,
    Warning,
  } from '@element-plus/icons-vue'
  import { aiConfigService } from '@/services/aiConfig'
  import { AIProviderFactory } from '@/services/aiProviders'
  import { aiProviderPresets, getPresetById } from '@/data/aiProviderPresets'
  import { getChatCompletionsUrl, normalizeProviderBaseUrl } from '@/services/providerEndpoint'
  import {
    clearChefMindLocalData,
    createLocalDataBackup,
    downloadLocalDataBackup,
    importLocalDataBackup,
    readLocalDataBackupFile,
    requestPersistentBrowserStorage,
  } from '@/services/localDataBackup'

  const selectedPresetId = ref('openai')
  const saving = ref(false)
  const testing = ref(false)
  const lastSavedAt = ref('')
  const isMockMode = ref(false)
  const hasStoredCredential = ref(false)
  const isTauriRuntime = typeof window !== 'undefined' && !!window.__TAURI__?.invoke
  const exportingData = ref(false)
  const importingData = ref(false)
  const clearingData = ref(false)
  const storagePersistenceMessage = ref('正在检查浏览器存储策略…')
  const backupFileInput = ref<HTMLInputElement | null>(null)
  const form = reactive({
    provider: 'openai',
    baseUrl: '',
    model: '',
    apiKey: '',
  })
  const testResult = reactive({
    type: '' as '' | 'success' | 'error' | 'warning',
    title: '',
    message: '',
  })
  let testAbortController: AbortController | null = null

  const selectedPreset = computed(() => getPresetById(selectedPresetId.value))
  const savedAtText = computed(() =>
    lastSavedAt.value ? `保存于 ${new Date(lastSavedAt.value).toLocaleString()}` : '尚未保存配置'
  )
  const connectionStatusLabel = computed(() => {
    if (testResult.type === 'success') return '连接可用'
    if (isMockMode.value) return '模拟模式'
    if (form.apiKey) return '待测试'
    return '未配置'
  })
  const connectionTagType = computed(() => {
    if (testResult.type === 'success') return 'success'
    if (testResult.type === 'error') return 'danger'
    if (form.apiKey) return 'warning'
    return 'info'
  })

  const completionUrl = computed(() => {
    try {
      return form.baseUrl ? getChatCompletionsUrl(form.baseUrl) : ''
    } catch {
      return ''
    }
  })

  const applyPreset = () => {
    const preset = selectedPreset.value
    form.provider = preset.provider
    if (preset.baseUrl) form.baseUrl = preset.baseUrl
    if (preset.model) form.model = preset.model
    isMockMode.value = preset.id === 'custom' ? isMockMode.value : false
    clearTestResult()
  }

  const clearTestResult = () => {
    testResult.type = ''
    testResult.title = ''
    testResult.message = ''
  }

  const validateForm = () => {
    if (!form.baseUrl.trim()) {
      ElMessage.warning('请填写 Base URL')
      return false
    }
    if (!form.model.trim()) {
      ElMessage.warning('请填写模型名称')
      return false
    }
    if (!form.apiKey.trim()) {
      ElMessage.warning('请填写 API Key')
      return false
    }
    try {
      form.baseUrl = normalizeProviderBaseUrl(form.baseUrl)
    } catch (error) {
      ElMessage.warning(error instanceof Error ? error.message : 'Base URL 无效')
      return false
    }
    return true
  }

  const saveConfig = async () => {
    if (!validateForm()) return
    saving.value = true
    try {
      await aiConfigService.saveApiKey('openai', form.apiKey.trim(), {
        provider: 'openai',
        baseUrl: form.baseUrl,
        model: form.model.trim(),
        presetId: selectedPresetId.value,
      })

      AIProviderFactory.getInstance().switchProvider(
        'openai',
        isTauriRuntime ? undefined : form.apiKey.trim(),
        form.baseUrl,
        form.model.trim()
      )

      isMockMode.value = false
      hasStoredCredential.value = true
      lastSavedAt.value = new Date().toISOString()
      if (isTauriRuntime) form.apiKey = ''
      ElMessage.success(isTauriRuntime ? 'API Key 已保存到系统凭据库' : 'AI 配置已保留在本次页面')
    } catch (error) {
      console.error('保存 AI 配置失败:', error)
      ElMessage.error('保存失败，请稍后重试')
    } finally {
      saving.value = false
    }
  }

  const testConnection = async () => {
    if (!validateForm()) return
    testing.value = true
    clearTestResult()
    testAbortController?.abort()
    testAbortController = new AbortController()
    const timeout = window.setTimeout(() => testAbortController?.abort(), 12000)

    try {
      if (isTauriRuntime) {
        await window.__TAURI__!.invoke!('test_provider_configuration', {
          apiKey: form.apiKey.trim(),
          baseUrl: form.baseUrl,
          model: form.model.trim(),
        })
      } else {
        const response = await fetch(completionUrl.value, {
          method: 'POST',
          signal: testAbortController.signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${form.apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: form.model.trim(),
            messages: [{ role: 'user', content: '请只回复“连接成功”。' }],
            max_tokens: 16,
            temperature: 0,
          }),
        })

        const payloadText = await response.text()
        let payload: any = null
        try {
          payload = payloadText ? JSON.parse(payloadText) : null
        } catch {
          payload = payloadText
        }

        if (!response.ok) {
          const message =
            typeof payload === 'object'
              ? payload?.error?.message || JSON.stringify(payload)
              : String(payload || response.statusText)
          throw new Error(`${response.status} ${response.statusText}: ${sanitizeErrorMessage(message)}`)
        }
      }

      testResult.type = 'success'
      testResult.title = '连接成功'
      testResult.message = `模型 ${form.model.trim()} 已通过 Chat Completions 测试。`
      ElMessage.success('API Key 可用')
    } catch (error: any) {
      console.error('测试连接失败:', error)
      testResult.type = 'error'
      testResult.title = '连接失败'
      testResult.message = getUserFacingConnectionError(error)
      ElMessage.error('连接测试失败')
    } finally {
      window.clearTimeout(timeout)
      testing.value = false
      testAbortController = null
    }
  }

  const sanitizeErrorMessage = (message: string) => {
    let sanitized = message.replace(/sk-[A-Za-z0-9_-]{6,}/g, 'sk-***')
    const currentKey = form.apiKey.trim()
    if (currentKey.length >= 6) {
      sanitized = sanitized.split(currentKey).join('***')
      if (currentKey.length > 10) {
        const firstPart = currentKey.slice(0, 8)
        const lastPart = currentKey.slice(-4)
        sanitized = sanitized.replace(new RegExp(`${escapeRegExp(firstPart)}\\*+${escapeRegExp(lastPart)}`, 'g'), '***')
      }
    }
    return sanitized
  }

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const getUserFacingConnectionError = (error: any) => {
    const message = sanitizeErrorMessage(String(error?.message || ''))
    if (error?.name === 'AbortError') {
      return '测试请求超时。请检查网络、代理或供应商服务状态。'
    }
    if (message.startsWith('401') || message.startsWith('403')) {
      return '认证失败。请确认 API Key、Base URL 与模型名称属于同一供应商。'
    }
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return '浏览器无法访问该 Base URL。请检查地址、跨域策略或网络环境。'
    }
    return message || '测试请求失败，请检查 API Key、Base URL 和模型名称。'
  }

  const enableMockMode = async () => {
    AIProviderFactory.getInstance().switchProvider('mock')
    isMockMode.value = true
    testResult.type = 'warning'
    testResult.title = '已切换到模拟模式'
    testResult.message = 'ChefMind 将使用本地 Mock AI 生成示例内容，适合演示和离线体验。'
    ElMessage.info('已切换到模拟模式')
  }

  const removeConfig = async () => {
    try {
      await ElMessageBox.confirm(
        '这会删除当前 API Key 配置。桌面版也会从操作系统凭据库删除该 Key。',
        '删除 API 配置',
        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
      )
      await aiConfigService.deleteProviderConfig('openai')
      AIProviderFactory.getInstance().switchProvider('mock')
      form.apiKey = ''
      hasStoredCredential.value = false
      isMockMode.value = true
      lastSavedAt.value = ''
      clearTestResult()
      ElMessage.success('API 配置已删除')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.error('删除 API 配置失败')
      }
    }
  }

  const exportData = async () => {
    exportingData.value = true
    try {
      downloadLocalDataBackup(await createLocalDataBackup())
      ElMessage.success('本地数据已导出；API 配置和 API Key 不会包含在备份中')
    } catch (error) {
      console.error('导出本地数据失败:', error)
      ElMessage.error('导出失败，请确认浏览器允许 IndexedDB')
    } finally {
      exportingData.value = false
    }
  }

  const chooseBackupFile = () => backupFileInput.value?.click()

  const importData = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    try {
      await ElMessageBox.confirm(
        '导入会替换当前浏览器中的菜谱、收藏、搜索记录和已保存的本地数据。API 配置不会被导入。',
        '导入本地备份',
        { confirmButtonText: '导入并替换', cancelButtonText: '取消', type: 'warning' }
      )
      importingData.value = true
      await importLocalDataBackup(await readLocalDataBackupFile(file))
      ElMessage.success('备份已导入，页面将刷新以载入数据')
      window.setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('导入本地数据失败:', error)
        ElMessage.error('导入失败：请选择有效的 ChefMind 备份文件')
      }
    } finally {
      importingData.value = false
    }
  }

  const clearLocalData = async () => {
    try {
      await ElMessageBox.confirm(
        '这会删除此浏览器中的菜谱、收藏、购物清单、会话 Key 和 API 配置，且无法撤销。请先导出备份。',
        '清除全部本地数据',
        { confirmButtonText: '清除全部数据', cancelButtonText: '取消', type: 'error' }
      )
      clearingData.value = true
      await clearChefMindLocalData()
      ElMessage.success('本地数据已清除，页面将刷新')
      window.setTimeout(() => window.location.reload(), 500)
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('清除本地数据失败:', error)
        ElMessage.error('清除失败，请关闭其他 ChefMind 页面后重试')
      }
    } finally {
      clearingData.value = false
    }
  }

  onMounted(async () => {
    applyPreset()
    const saved = await aiConfigService.getProviderConfig('openai')
    if (saved) {
      selectedPresetId.value = saved.presetId || 'custom'
      form.provider = 'openai'
      form.baseUrl = saved.baseUrl || form.baseUrl
      form.model = saved.model || form.model
      form.apiKey = isTauriRuntime ? '' : saved.apiKey || ''
      hasStoredCredential.value = saved.isConfigured
      lastSavedAt.value = saved.updatedAt || ''
    }

    isMockMode.value = AIProviderFactory.getInstance().getProviderName() === 'mock'

    if (!isTauriRuntime) {
      try {
        const persisted = await requestPersistentBrowserStorage()
        storagePersistenceMessage.value =
          persisted === true
            ? '浏览器已尽力保留本地数据，但导出备份仍然必要。'
            : '浏览器未承诺长期保留本地数据，请定期导出备份。'
      } catch {
        storagePersistenceMessage.value = '无法确认浏览器存储策略，请定期导出备份。'
      }
    }
  })

  onBeforeUnmount(() => {
    testAbortController?.abort()
  })
</script>

<style lang="scss" scoped>
  .settings-view {
    min-height: 100vh;
    padding: 2rem;
    background:
      linear-gradient(120deg, rgba(39, 174, 96, 0.08), transparent 34%),
      linear-gradient(220deg, rgba(52, 152, 219, 0.12), transparent 38%),
      var(--bg-color-secondary);
  }

  .settings-hero {
    max-width: 1180px;
    margin: 0 auto 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    align-items: flex-end;
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    color: var(--primary-color);
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.78rem;
  }

  h1 {
    margin: 0;
    color: var(--heading-color);
    font-size: 2.35rem;
    line-height: 1.15;
  }

  .hero-copy {
    max-width: 720px;
    margin: 0.85rem 0 0;
    color: var(--text-color-secondary);
    line-height: 1.8;
  }

  .connection-summary {
    min-width: 190px;
    padding: 1rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-color);
    box-shadow: var(--shadow-sm);

    .summary-label,
    small {
      display: block;
      color: var(--text-color-secondary);
      font-size: 0.82rem;
    }

    strong {
      display: block;
      color: var(--heading-color);
      font-size: 1.2rem;
      margin: 0.25rem 0;
    }
  }

  .settings-layout {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 1.25rem;
  }

  .settings-sidebar,
  .settings-panel {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-color);
    box-shadow: var(--shadow-md);
  }

  .settings-sidebar {
    padding: 0.75rem;
    height: fit-content;
  }

  .sidebar-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--text-color);
    font-weight: 650;
    text-align: left;

    &.active {
      background: var(--primary-color-light);
      color: var(--primary-color);
    }

    &:disabled {
      opacity: 0.55;
    }
  }

  .settings-panel {
    padding: 1.5rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.4rem;

    h2 {
      margin: 0 0 0.35rem;
      color: var(--heading-color);
    }

    p {
      margin: 0;
      color: var(--text-color-secondary);
    }
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .field {
    display: grid;
    gap: 0.45rem;

    span {
      color: var(--text-color);
      font-weight: 700;
      font-size: 0.9rem;
    }

    &.full {
      grid-column: 1 / -1;
    }
  }

  .preset-option {
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    small {
      color: var(--text-color-secondary);
    }
  }

  .provider-note,
  .credential-notice,
  .test-result {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .provider-note {
    border: 1px solid rgba(52, 152, 219, 0.24);
    background: rgba(52, 152, 219, 0.08);

    h3,
    p {
      margin: 0;
    }

    p {
      margin-top: 0.25rem;
      color: var(--text-color-secondary);
    }

    a {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--primary-color);
      font-weight: 800;
      text-decoration: none;
      white-space: nowrap;
    }
  }

  .credential-notice {
    justify-content: flex-start;
    border: 1px solid rgba(39, 174, 96, 0.28);
    background: rgba(39, 174, 96, 0.07);
    color: var(--text-color);

    p {
      margin: 0;
      line-height: 1.65;
    }
  }

  .test-result {
    justify-content: flex-start;

    &.success {
      border: 1px solid rgba(39, 174, 96, 0.35);
      background: rgba(39, 174, 96, 0.09);
      color: #1e7e45;
    }

    &.error {
      border: 1px solid rgba(231, 76, 60, 0.35);
      background: rgba(231, 76, 60, 0.09);
      color: #b03a2e;
    }

    &.warning {
      border: 1px solid rgba(243, 156, 18, 0.35);
      background: rgba(243, 156, 18, 0.1);
      color: #9a5c00;
    }

    p {
      margin: 0.2rem 0 0;
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1.2rem 0;
  }

  .trust-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.9rem;

    article {
      padding: 1rem;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-color-secondary);
    }

    span {
      color: var(--primary-color);
      font-weight: 900;
      font-size: 0.8rem;
    }

    h3 {
      margin: 0.35rem 0;
      color: var(--heading-color);
    }

    p {
      margin: 0;
      color: var(--text-color-secondary);
      line-height: 1.65;
    }
  }

  .local-data-tools {
    display: flex;
    justify-content: space-between;
    gap: 1.25rem;
    margin-top: 1.25rem;
    padding: 1.25rem;
    border: 1px solid rgba(52, 152, 219, 0.28);
    border-radius: 8px;
    background: rgba(52, 152, 219, 0.06);

    .eyebrow {
      margin-bottom: 0.25rem;
    }

    h3,
    p {
      margin: 0;
    }

    p {
      max-width: 680px;
      margin-top: 0.45rem;
      color: var(--text-color-secondary);
      line-height: 1.65;
    }

    small {
      display: block;
      margin-top: 0.5rem;
      color: var(--text-color-secondary);
    }
  }

  .local-data-actions {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    justify-content: flex-end;
    gap: 0.75rem;
    min-width: 240px;
  }

  @media (max-width: 900px) {
    .settings-view {
      padding: 1rem;
    }

    .settings-hero,
    .panel-header {
      display: block;
    }

    .connection-summary {
      margin-top: 1rem;
    }

    .settings-layout,
    .form-grid,
    .trust-grid {
      grid-template-columns: 1fr;
    }

    .local-data-tools {
      display: grid;
    }

    .local-data-actions {
      justify-content: flex-start;
    }
  }
</style>
