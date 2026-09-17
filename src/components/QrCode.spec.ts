import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import QrCode from './QrCode.vue'

// jsdom has no real <canvas> 2D context, so the actual QR encoding
// (Reed-Solomon, mask selection...) from the `qrcode` package can't run
// here — mock it and verify this component wires props -> library calls
// -> download actions correctly, matching this repo's existing pattern of
// mocking external calls (useCandidate.spec.ts/useDocument.spec.ts).
const toCanvas = vi.fn().mockResolvedValue(undefined)
const toStringMock = vi.fn().mockResolvedValue('<svg></svg>')
vi.mock('qrcode', () => ({
    default: {
        toCanvas: (...args: unknown[]) => toCanvas(...args),
        toString: (...args: unknown[]) => toStringMock(...args),
    },
}))

function mountQrCode(props: Record<string, unknown> = {}) {
    return mount(QrCode, {
        props,
        global: { stubs: { Button: true } },
    })
}

describe('QrCode', () => {
    beforeEach(() => {
        toCanvas.mockClear()
        toStringMock.mockClear()
    })

    it('renders nothing when value is empty', () => {
        const wrapper = mountQrCode({ value: '' })
        expect(wrapper.find('canvas').exists()).toBe(false)
        expect(toCanvas).not.toHaveBeenCalled()
    })

    it('renders a canvas and encodes the given value on mount', async () => {
        const wrapper = mountQrCode({ value: 'https://example.com/resume/vo-tan-dat' })
        await flushPromises()

        expect(wrapper.find('canvas').exists()).toBe(true)
        expect(toCanvas).toHaveBeenCalledTimes(1)
        expect(toCanvas.mock.calls[0][1]).toBe('https://example.com/resume/vo-tan-dat')
    })

    it('re-encodes when value prop changes', async () => {
        const wrapper = mountQrCode({ value: 'https://example.com/resume/a' })
        await flushPromises()
        expect(toCanvas).toHaveBeenCalledTimes(1)

        await wrapper.setProps({ value: 'https://example.com/resume/b' })
        await flushPromises()

        expect(toCanvas).toHaveBeenCalledTimes(2)
        expect(toCanvas.mock.calls[1][1]).toBe('https://example.com/resume/b')
    })

    it('clicking "Tải SVG" asks the library to encode the current value as SVG', async () => {
        const wrapper = mountQrCode({ value: 'https://example.com/resume/vo-tan-dat' })
        await flushPromises()

        // jsdom has no createObjectURL/anchor-click side effects worth
        // asserting on — just confirm the encode step runs with the
        // right value + format when the SVG button (2nd of the 2 stubbed
        // Button components, PNG then SVG per the template) is clicked.
        URL.createObjectURL = vi.fn().mockReturnValue('blob:mock')
        URL.revokeObjectURL = vi.fn()
        await wrapper.findAll('button-stub')[1].trigger('click')
        await flushPromises()

        expect(toStringMock).toHaveBeenCalledWith(
            'https://example.com/resume/vo-tan-dat',
            expect.objectContaining({ type: 'svg' }),
        )
    })
})
