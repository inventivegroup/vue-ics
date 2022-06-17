import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: { entry: 'src/index.ts', name: 'vue-ics', formats: ['es', 'umd', 'cjs'] }
  },
  plugins: [createVuePlugin()]
})
