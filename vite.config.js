import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/three/')) return 'three'
          if (id.includes('/gsap/') || id.includes('/lenis/')) return 'motion'
          if (id.includes('react-icons') || id.includes('lucide-react')) return 'icons'
        },
      },
    },
  },
  server: { host: true },
})
