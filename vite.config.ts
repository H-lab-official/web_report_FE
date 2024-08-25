import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      external: ['react-router-dom'],
    },
    outDir: 'dist', // Ensure the output directory is set correctly
    assetsDir: 'assets', // Ensure assets like JS and CSS are correctly placed
  },
  server: {
    port: 3174,
  },
});
