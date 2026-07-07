import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/his-data-hub/',
  plugins: [react()],
  server: {
    port: 3001,
  },
})
