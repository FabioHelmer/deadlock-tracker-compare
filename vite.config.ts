import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
export default defineConfig({
  base: '/deadlock-tracker-compare/',
  plugins: [react(), tailwindcss()],
})
