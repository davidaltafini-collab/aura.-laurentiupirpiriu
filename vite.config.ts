import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function nonBlockingAppStyles() {
  return {
    name: 'captur-non-blocking-app-styles',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        (_match, href: string) =>
          `<link rel="preload" as="style" crossorigin href="${href}" data-captur-style onload="this.onload=null;this.rel='stylesheet';document.documentElement.classList.add('captur-styles-ready')"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`,
      );
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), nonBlockingAppStyles()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Allow local environments to disable HMR when needed.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
