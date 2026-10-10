/**
 * Theme regression test — dark-class detector
 *
 * Rationale: The clinic/staff view was previously built with hardcoded dark-specific
 * Tailwind classes (bg-slate-900, etc.), causing a visible dark-theme regression.
 * This test scans every file in components/clinic/ and asserts none contain
 * the forbidden class patterns.
 *
 * Why a Vitest file-system test rather than an ESLint rule:
 * - No custom ESLint plugin needed
 * - Runs in the same `npm test` pass
 * - Result is deterministic and immediately auditable
 * - Failure message shows exactly which file and which pattern
 *
 * @note If you intentionally add a class on this list (e.g. as a comment in a
 * disabled block), add an `// theme-regression-ok` annotation on that line and
 * update the regex below to skip annotated lines.
 */

import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

// ── Forbidden patterns — hardcoded dark-mode-specific colors ─────────────────
// These are the class names that caused the regression. Adjust as needed.
const FORBIDDEN_PATTERNS = [
  /\bbg-slate-[89]\d{2}\b/,       // bg-slate-800, bg-slate--900
  /\bbg-gray-[89]\d{2}\b/,        // bg-gray-800, bg-gray-900
  /\bbg-zinc-[89]\d{2}\b/,        // bg-zinc-800, bg-zinc-900
  /\bbg-neutral-[89]\d{2}\b/,     // bg-neutral-800, bg-neutral-900
  /\bbg-stone-[89]\d{2}\b/,       // bg-stone-800, bg-stone-900
  /\btext-white\b(?![^\n]*theme-regression-ok)/, // text-white (standalone, not annotated)
  /oklch\(0\.1[0-5]/,             // Very dark oklch values (dark-mode design tokens)
  /\bdark:/,                       // Tailwind dark: variant prefix
]

// ── Collect all files under a directory (recursive) ──────────────────────────
function collectFiles(dir: string): string[] {
  const result: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      result.push(...collectFiles(full))
    } else if (/\.(tsx?|jsx?|css)$/.test(entry)) {
      result.push(full)
    }
  }
  return result
}

describe('Theme regression — clinic/staff view must not contain dark-mode classes', () => {
  const clinicDir = join(process.cwd(), 'components', 'clinic')
  const files = collectFiles(clinicDir)

  it('finds at least one clinic file to scan (sanity check)', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  for (const file of files) {
    it(`${file.replace(process.cwd(), '')} contains no forbidden dark-mode classes`, () => {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')

      for (const pattern of FORBIDDEN_PATTERNS) {
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          // Skip annotated exceptions
          if (line.includes('theme-regression-ok')) continue
          if (pattern.test(line)) {
            // Provide a clear failure message
            expect.fail(
              `Dark-mode regression in ${file.replace(process.cwd(), '')} ` +
              `line ${i + 1}:\n  ${line.trim()}\n` +
              `Matched forbidden pattern: ${pattern}\n` +
              `Use design-token classes (bg-background, text-foreground, bg-card, etc.) instead.`
            )
          }
        }
      }
    })
  }
})
