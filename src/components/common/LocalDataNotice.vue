<template>
  <aside v-if="visible" class="local-data-notice" aria-label="本地数据与 API Key 提示">
    <p>
      Web 版的 API Key 仅保留在当前页面；菜谱和收藏只保存在此浏览器，并非云端备份。
      请在设置页定期导出数据。
    </p>
    <div>
      <router-link to="/settings">管理本地数据</router-link>
      <button type="button" aria-label="关闭本地数据提示" @click="dismiss">知道了</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const DISMISS_KEY = 'chefmind-local-data-notice-dismissed'
  const isTauriRuntime = typeof window !== 'undefined' && !!window.__TAURI__?.invoke
  const visible = ref(!isTauriRuntime && localStorage.getItem(DISMISS_KEY) !== 'true')

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    visible.value = false
  }
</script>

<style lang="scss" scoped>
  .local-data-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 1rem;
    background: #eaf6ff;
    border-bottom: 1px solid #b9dff5;
    color: #1d4f72;
    font-size: 0.88rem;

    p {
      margin: 0;
      line-height: 1.5;
    }

    div {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      white-space: nowrap;
    }

    a,
    button {
      color: #145b87;
      font: inherit;
      font-weight: 700;
    }

    button {
      border: 0;
      background: transparent;
      cursor: pointer;
      text-decoration: underline;
    }
  }

  @media (max-width: 680px) {
    .local-data-notice {
      display: block;

      div {
        margin-top: 0.5rem;
      }
    }
  }
</style>
