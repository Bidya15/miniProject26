import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    // Warn only for chunks over 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, always cached
          'vendor-react': ['react', 'react-dom'],
          // Framer Motion is ~200KB — split into its own cacheable chunk
          'vendor-framer': ['framer-motion'],
          // Google OAuth library
          'vendor-google': ['@react-oauth/google'],
          // Axios HTTP client
          'vendor-axios': ['axios'],
        },
      },
    },
  },
})
