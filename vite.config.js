import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,

    // Add the allowed hosts array here
    allowedHosts: ['backend.infini9.net'],

    proxy: {
      '/api': {
        target: 'https://ixeriox.dev/iXMusicAPI',
        changeOrigin: true,

        // Remove "/api" before forwarding
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
