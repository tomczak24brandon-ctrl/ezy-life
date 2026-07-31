import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        // Single IIFE bundle — all modules share one global scope,
        // matching the original monolith behavior
        format: 'iife',
        name: 'EZYLife',
        inlineDynamicImports: true,
      }
    }
  }
});
