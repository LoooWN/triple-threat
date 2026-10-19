/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/triple-threat/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icone.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Triple Threat',
        short_name: 'Triple Threat',
        description: 'Systèmes et exercices de basket pour le coach et ses joueurs',
        lang: 'fr',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#142130',
        theme_color: '#142130',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'] },
    }),
  ],
  // jsPDF ne charge ces modules que pour convertir du HTML, ce qu'on ne fait pas : inutile de les embarquer.
  build: { rolldownOptions: { external: ['html2canvas', 'dompurify', 'canvg'] } },
  test: { include: ['src/**/*.test.ts'] },
})
