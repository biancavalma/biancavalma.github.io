import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

// every build gets a number; the page compares it with version.json to pick up updates at once
const BUILD = String(Date.now());

// `npx vite --mode mock` runs the app with made-up data, no database needed (for design checks)
export default defineConfig(({ mode }) => ({
  // also runs on older iPhones (iOS 14 and later)
  build: { target: ['es2019', 'safari14'] },
  define: { __BUILD__: JSON.stringify(BUILD) },
  plugins: [{ name: 'version-file', generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ v: BUILD }) }); } }],
  resolve: mode === 'mock' ? { alias: { './api.js': fileURLToPath(new URL('./test/api.mock.js', import.meta.url)) } } : {},
}));
