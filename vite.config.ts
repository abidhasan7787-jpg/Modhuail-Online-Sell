import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Support GitHub Actions automatic base path or relative './' for standalone hosting
  let githubRepo = './';
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1] || '';
    if (repoName.endsWith('.github.io')) {
      githubRepo = '/';
    } else if (repoName) {
      githubRepo = `/${repoName}/`;
    }
  }

  let base = process.env.BASE_PATH || process.env.VITE_BASE || githubRepo;
  if (base && !base.endsWith('/') && !base.startsWith('./')) {
    base = base + '/';
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
