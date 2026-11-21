import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

// `npx vite --mode mock` runs the app with made-up data, no database needed (for design checks)
export default defineConfig(({ mode }) => ({
  // also runs on older iPhones (iOS 14 and later)
  build: { target: ['es2019', 'safari14'] },
  resolve: mode === 'mock' ? { alias: { './api.js': fileURLToPath(new URL('./test/api.mock.js', import.meta.url)) } } : {},
}));
