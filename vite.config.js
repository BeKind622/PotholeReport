import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),

    // VitePWA({ 
      // registerType: 'autoUpdate',
      // devOptions: {enabled: true}}),
      
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true,
    allowedHosts: ["oppressive-statistically-randi.ngrok-free.dev"],
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
})
