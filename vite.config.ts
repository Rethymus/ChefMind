import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const host = process.env.TAURI_DEV_HOST

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use \"@/styles/variables.scss\" as *;`,
        charset: false,
        api: 'modern', // Use modern Sass API to avoid deprecation warnings
      },
    },
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'esbuild',
    cssCodeSplit: true,
    cssMinify: false,
    rollupOptions: {
      external: [],
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus')) {
              return 'elementPlus'
            }
            return 'vendor'
          }
          if (
            id.includes('services/aiService') ||
            id.includes('services/glmService') ||
            id.includes('services/aiConfig')
          ) {
            return 'aiServices'
          }
          if (id.includes('services/database')) {
            return 'database'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1200, // Increased to accommodate large bundles; consider further optimization if needed
  },
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    strictPort: true,
  },
})
