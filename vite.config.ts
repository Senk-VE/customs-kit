import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/customs-kit/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        calc: resolve(__dirname, 'calc.html'),
        currency: resolve(__dirname, 'currency.html'),
        base64: resolve(__dirname, 'base64-converter.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
});
