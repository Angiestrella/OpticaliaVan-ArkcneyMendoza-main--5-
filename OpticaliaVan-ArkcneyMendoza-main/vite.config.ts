import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5 todavía usa @import y funciones antiguas de Sass. Esos
        // avisos salen de su código (no del nuestro, que ya usa @use y
        // color.adjust), así que se silencian para que la compilación quede limpia.
        quietDeps: true,
        silenceDeprecations: ['import'],
      },
    },
  },
  build: {
    // three.js (~700 kB) queda en su propio archivo y solo se descarga al
    // elegir el modelo 3D en el probador (import() dinámico), así que no
    // hace más lenta la carga de la página.
    chunkSizeWarningLimit: 800,
  },
})
