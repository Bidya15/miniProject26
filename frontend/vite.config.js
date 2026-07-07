import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Pre-compress every JS/CSS asset with gzip (universally supported)
    compression({
      algorithm: 'gzip',
      exclude: [/\.(png|jpe?g|webp|gif|ico|svg)$/],
      threshold: 1024, // only compress files > 1 KB
    }),
    // Also pre-compress with Brotli (better ratio — nginx serves if available)
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(png|jpe?g|webp|gif|ico|svg)$/],
      threshold: 1024,
    }),
  ],

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
    // Target modern browsers — reduces polyfill overhead
    target: 'esnext',
    // Warn only for chunks over 500KB
    chunkSizeWarningLimit: 500,
    // Split CSS per chunk so each page only loads its own CSS
    cssCodeSplit: true,
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
