import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3001;

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'node_modules'),
      'src': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: PORT,
    host: true,
    open: true,
  },

  preview: {
    port: PORT,
    host: true,
  },

  define: {
    global: 'window',
  },
});