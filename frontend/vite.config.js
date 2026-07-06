import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    // Generate .gz (gzip) files alongside every JS/CSS asset.
    // When served by a web server that supports pre-compressed files
    // (Nginx, Apache, etc.) the browser receives ~70% smaller files with
    // zero CPU cost at serve time.
    compression({
      algorithm: 'gzip',
      exclude: [/\.(png|jpg|webp|svg|woff2?)$/], // skip already-compressed formats
      threshold: 1024, // only compress files > 1KB
    }),

    // Also generate .br (Brotli) files — typically 15-20% smaller than gzip.
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(png|jpg|webp|svg|woff2?)$/],
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
    // Target modern browsers only — eliminates legacy polyfills.
    // ES2020 is supported by all browsers released after 2020.
    target: 'es2020',

    // Warn for chunks over 500KB
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — tiny, always cached
          'vendor-react': ['react', 'react-dom'],
          // Framer Motion — ~130KB, split and cached independently
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
