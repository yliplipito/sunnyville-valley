// Sunnyville Valley - Vite Configuration
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths work on GitHub Pages, itch.io, and root domains
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
