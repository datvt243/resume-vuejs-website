import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { library } from '@fortawesome/fontawesome-svg-core'
import initFontAwesomeIcon from './initFontAwesomeIcon'

// ESM has no `__dirname` — this project's `src/` is linted as ESM
// (`vitest.config.ts` at repo root gets `__dirname` from Node's CJS
// config-loading shim, but files under `src/` don't).
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Regression guard — added after the SAME class of bug shipped 3 times
 * in a row (issue #58's `fa-camera`, issue #60's `fa-copy`, issue #57's
 * `fa-grip-vertical`): a component references an icon string that was
 * never registered in `initFontAwesomeIcon.js`'s fixed whitelist, so it
 * silently renders nothing + logs a `console.error` in production. Scans
 * every real `icon="..."` string actually used under `src/` and asserts
 * each one resolves against the real registered library — so a 4th
 * instance can't ship without this test catching it first.
 */

const SRC_DIR = path.resolve(__dirname, '..')

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            walk(full, out)
        } else if (entry.name.endsWith('.vue')) {
            out.push(full)
        }
    }
    return out
}

// Matches both `icon="fa-solid fa-x"` (full 2-part form, used directly on
// <FontAwesomeIcon>) and `icon="fa-x"` (short form, used on the project's
// own Button.vue / ItemTemplate.vue wrappers, which always prefix with
// `fa-solid` internally — see initFontAwesomeIcon.js's own icon set,
// every registered icon here is a "fas" solid icon, this codebase has
// never used fa-regular/fa-brands).
const ICON_ATTR_RE = /\bicon\s*=\s*"([^"]+)"/g

function normalizeIconName(raw: string): string | null {
    const trimmed = raw.trim()
    if (!trimmed.startsWith('fa-')) return null // not a font-awesome icon prop (e.g. a different `icon` attr)

    const parts = trimmed.split(/\s+/)
    // 2-part form: "fa-solid fa-grip-vertical" -> take the 2nd token, strip "fa-"
    const last = parts[parts.length - 1]
    return last.replace(/^fa-/, '')
}

describe('initFontAwesomeIcon — every icon actually used in src/ resolves', () => {
    it('has every icon="fa-..." string used across .vue files registered in the library', () => {
        // populate the REAL library exactly like main.ts does
        initFontAwesomeIcon.install({ component: () => {} } as any)

        const files = walk(SRC_DIR)
        const missing: { file: string; icon: string }[] = []
        const checked = new Set<string>()

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8')
            let match: RegExpExecArray | null
            ICON_ATTR_RE.lastIndex = 0
            while ((match = ICON_ATTR_RE.exec(content))) {
                const name = normalizeIconName(match[1])
                if (!name || checked.has(`${file}:${name}`)) continue
                checked.add(`${file}:${name}`)

                const resolved = library.definitions.fas?.[name]
                if (!resolved) {
                    missing.push({ file: path.relative(SRC_DIR, file), icon: name })
                }
            }
        }

        expect(missing, `Unregistered icons found:\n${missing.map(m => `  ${m.file} -> "${m.icon}"`).join('\n')}`).toEqual([])
    })
})
