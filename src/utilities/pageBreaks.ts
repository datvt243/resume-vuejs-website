/** CSS px per mm at the 96dpi the browser lays out (and prints) with. */
export const PX_PER_MM = 96 / 25.4

export type Block = { top: number; bottom: number }

/**
 * Where each printed page after the first starts, in on-screen content
 * px. `blocks` are the keep-together boxes (`break-inside: avoid`) in
 * document order; everything between them may break anywhere. A block
 * that would cross a page's bottom moves whole to the next page, pushing
 * all later content down, unless it already starts a page (taller than a
 * page) — then it splits at page-height steps like plain content.
 */
export function pageBreaks(blocks: Block[], contentHeight: number, pageHeight: number): number[] {
    const breaks: number[] = []
    let pageEnd = pageHeight
    // printed y minus on-screen y: the space blocks moved to a new page left behind
    let shift = 0
    const flowTo = (y: number, startsPage: boolean) => {
        while (startsPage ? y >= pageEnd : y > pageEnd) {
            breaks.push(pageEnd - shift)
            pageEnd += pageHeight
        }
    }
    for (const { top, bottom } of blocks) {
        flowTo(top + shift, true)
        if (bottom + shift > pageEnd && top + shift > pageEnd - pageHeight) {
            breaks.push(top)
            shift = pageEnd - top
            pageEnd += pageHeight
        }
    }
    flowTo(contentHeight + shift, false)
    return breaks
}
