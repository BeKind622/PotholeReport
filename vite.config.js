import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


import { cloudflare } from "@cloudflare/vite-plugin";


// https://vite.dev/config/
export default defineConfig({
  plugins: [VitePWA({ 
    registerType: 'autoUpdate',
    devOptions: {enabled: true}}), react({
    babel: {
      plugins: [['babel-plugin-react-compiler']],
    },
  }), cloudflare()],
})