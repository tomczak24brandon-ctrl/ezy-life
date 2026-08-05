import { defineConfig } from 'vite';

export default defineConfig({
  // Pure static site — Vite only copies public/ to dist/, no JS bundling
  base: '/',
  publicDir: 'public',
  build: {
    // No JS entry point; output the HTML as-is with static assets
    rollupOptions: {
      input: 'index.html',
    },
    // Do not process/transform script tags that have no type="module"
    // Vite will copy public/ verbatim; absolute /src/* paths resolve from there
  },
});
