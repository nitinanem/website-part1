/**
 * Global Vitest setup file.
 * Runs before every test file (all environments).
 */

import '@testing-library/jest-dom'

// Silence framer-motion's "motion values require a browser" warnings in jsdom
// by stubbing out matchMedia (not present in jsdom by default).
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })

  // Stub ResizeObserver (used by framer-motion internally)
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
