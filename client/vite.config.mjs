import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://api:3000'

export default defineConfig(() => ({
  plugins: [react({ jsxRuntime: 'automatic' })],
  ...(process.env.VITEST
    ? {
        esbuild: {
          jsx: 'automatic'
        }
      }
    : {}),
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    globals: true,
    exclude: ['node_modules/**', 'tests/e2e/**']
  }
}))
