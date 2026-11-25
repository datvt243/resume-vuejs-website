import { describe, it, expect } from 'vitest'
import { pageBreaks } from './pageBreaks'

const H = 1000

describe('pageBreaks', () => {
    it('returns no break for content up to exactly one page', () => {
        expect(pageBreaks([{ top: 0, bottom: 500 }], 900, H)).toEqual([])
        expect(pageBreaks([{ top: 0, bottom: 1000 }], 1000, H)).toEqual([])
    })

    it('breaks plain content at every page height', () => {
        expect(pageBreaks([], 2500, H)).toEqual([1000, 2000])
    })

    it('moves a block crossing the page bottom to the next page', () => {
        expect(pageBreaks([{ top: 0, bottom: 500 }, { top: 800, bottom: 1100 }], 1200, H)).toEqual([800])
    })

    it('carries the space left by a moved block into later pages', () => {
        // A moves 300px down, so B (screen 1600–1800) prints at 1900–2100 and moves too
        expect(pageBreaks([{ top: 700, bottom: 1200 }, { top: 1600, bottom: 1800 }], 1900, H)).toEqual([700, 1600])
    })

    it('splits a block taller than a page at page-height steps once it starts a page', () => {
        expect(pageBreaks([{ top: 900, bottom: 2500 }], 2600, H)).toEqual([900, 1900])
        expect(pageBreaks([{ top: 0, bottom: 1500 }], 1500, H)).toEqual([1000])
    })

    it('breaks before a block that starts exactly at a page bottom', () => {
        expect(pageBreaks([{ top: 1000, bottom: 1200 }], 1200, H)).toEqual([1000])
    })
})
