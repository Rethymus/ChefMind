<template>
  <aside
    v-if="isGitHubPages"
    class="github-pages-cors-notice"
    aria-label="GitHub Pages 跨域兼容性提示"
  >
    <p>
      GitHub Pages 版会由浏览器直接请求 AI 供应商。实际调用依赖供应商允许当前 Pages
      域名的 CORS 跨域请求；若无法连接，请检查供应商的跨域策略或改用支持浏览器直连的服务。
    </p>
    <router-link to="/settings">配置供应商</router-link>
  </aside>
</template>

<script setup lang="ts">
  const isGitHubPages = __CHEFMIND_GITHUB_PAGES__
</script>

<style lang="scss" scoped>
  .github-pages-cors-notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.7rem 1rem;
    background: #fff7e6;
    border-bottom: 1px solid #f2d39b;
    color: #78510a;
    font-size: 0.88rem;

    p {
      margin: 0;
      line-height: 1.5;
    }

    a {
      flex: 0 0 auto;
      color: #805600;
      font-weight: 700;
      white-space: nowrap;
    }
  }

  @media (max-width: 680px) {
    .github-pages-cors-notice {
      display: block;

      a {
        display: inline-block;
        margin-top: 0.5rem;
      }
    }
  }
</style>
