import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: true,
    allowedHosts: [
      'article.05730116.xyz',
      'dev.example.com',
      'localhost'
    ]
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      base: '/',
      manifest: {
        name: 'Immortal',
        short_name: 'Immortal',
        description: 'Immortal',
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: 'standalone',
        icons: [
          {
            src: '/logo_512.png',
            sizes: '512x512',
            type: 'image/png"',
          }
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
