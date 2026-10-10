import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// @ts-ignore
export default defineConfig({
  plugins: [react()],
  test: {
    // Default environment: jsdom (for React component tests)
    environment: 'jsdom',
    // Override to node for API and Gemini integration tests
    // @ts-ignore
    environmentMatchGlobs: [
      ['__tests__/api/**', 'node'],
      ['__tests__/gemini/**', 'node'],
    ],
    globals: true,
    setupFiles: ['__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Flag critical paths that must maintain high coverage
      thresholds: {
        // These files contain critical safety logic — warn loudly if coverage drops
        'lib/store/assessments.ts': { statements: 90 },
        'lib/sentiment/classifier.ts': { statements: 90 },
        'app/api/chat/public/route.ts': { statements: 80 },
      },
    },
    // Exclude Next.js internals and the live-key integration test from default run
    exclude: [
      'node_modules/**',
      '.next/**',
      ...(process.env.RUN_LIVE_TEST ? [] : ['__tests__/gemini/rag-integration.test.ts']), // opt-in only, requires real key
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
