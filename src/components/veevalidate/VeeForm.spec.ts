import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import VeeForm from './VeeForm.vue'
import type { modelItem } from '@/types/model.type'

// VeeForm.vue imports every Frm* child unconditionally (not just the ones
// a given `fields` prop actually uses) via the `@/components/veevalidate`
// barrel, including `FrmCkediter` -> `CKEditor.vue` ->
// `@ckeditor/ckeditor5-vue`, which requires `lodash-es` (an ESM-only
// package) via `require()` — that throws under Vitest/jsdom regardless of
// whether any field of type 'ckediter' is ever rendered, and even
// `vi.importActual` on the barrel re-evaluates the same broken chain. Import
// each real Frm* part file directly (bypassing both the barrel and
// FrmCkediter.vue entirely) so the mock still renders real child
// components for the field types this suite actually uses ('text',
// 'checkbox').
vi.mock('@/components/veevalidate', async () => {
    const stub = (name: string) => ({ name, render: () => null })
    return {
        FrmInput: (await import('./part/FrmInput.vue')).default,
        FrmCheckbox: (await import('./part/FrmCheckbox.vue')).default,
        FrmTextArea: (await import('./part/FrmTextArea.vue')).default,
        FrmSelect: (await import('./part/FrmSelect.vue')).default,
        FrmCurrency: (await import('./part/FrmCurrency.vue')).default,
        FrmPwd: (await import('./part/FrmPwd.vue')).default,
        FrmDatePicker: (await import('./part/FrmDatePicker.vue')).default,
        FrmCkediter: stub('FrmCkediter'),
    }
})

// Plain text/checkbox fields only — avoids mounting FrmCkediter (wraps the
// real CKEditor5 widget, not viable in jsdom) and FrmInput's optional
// FontAwesomeIcon branch (only renders when `icon` is set).
const fields: modelItem[] = [
    { name: 'name', label: 'Name', type: 'text', default: '', valid: (yup: any) => yup.string().required('required') },
    { name: 'age', label: 'Age', type: 'text', default: 'n/a' },
    { name: 'active', label: 'Active', type: 'checkbox', default: false, checkedValue: false, valid: (yup: any) => yup.boolean() },
] as unknown as modelItem[]

function mountForm(props: Record<string, unknown> = {}) {
    // `FontAwesomeIcon` is only used behind FrmInput's `v-if="props.icon"`
    // (never true here — no field sets `icon`), but Vue's compiler resolves
    // named components unconditionally at the top of the render block, so
    // it still warns "Failed to resolve component" without this stub.
    return mount(VeeForm, { props: { fields, ...props }, global: { stubs: { FontAwesomeIcon: true } } })
}

describe('VeeForm', () => {
    it('renders one input per visible field, skipping type "hidden"', () => {
        const hiddenFields = [...fields, { name: '_id', label: 'ID', type: 'hidden', default: null }] as unknown as modelItem[]
        const wrapper = mountForm({ fields: hiddenFields })

        // 2 text inputs (name, age) + 1 checkbox (active) = 3 visible controls;
        // the hidden `_id` field renders via the dedicated `FrmInput type="hidden"`
        // branch, not the main v-for loop.
        expect(wrapper.findAll('input[type="text"]')).toHaveLength(2)
        expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(1)
    })

    it('submit button is NOT disabled on a pristine form, even with a required field still empty', async () => {
        // Real, verified behavior, not an assumption: vee-validate's `meta.valid`
        // defaults to `true` until a field is actually validated (typically on
        // blur/input) — `useForm` here has no `validateOnMount`. So the
        // `:disabled="!meta.valid"` guard on the submit button does NOT protect
        // a pristine/untouched form. Logged under "Noticed, not done" in the
        // evidence note — out of this task's scope to fix.
        const wrapper = mountForm()
        await flushPromises()

        expect(wrapper.find('button.btn-success').attributes('disabled')).toBeUndefined()
    })

    it('BUG (real, verified — not asserting correctness): typing then clearing a required field does NOT disable submit', async () => {
        // Isolated repro (outside VeeForm.vue, plain vee-validate `useForm` +
        // `useField`) confirms this is not an artifact of the test harness:
        // `meta.valid` only updates after an EXPLICIT `form.validate()` call —
        // neither `handleChange` (fired by typing/setValue) nor `handleBlur`
        // updates it on their own with this vee-validate 4.13.1 setup, and
        // VeeForm.vue never calls `validate()` anywhere. Net effect: the
        // submit button's `:disabled="!meta.valid"` guard is dead in every
        // real user flow (type -> click submit), not just on a pristine form.
        // Flagged prominently in the evidence note as a new, higher-severity
        // finding than this task's scope covers — logged under "Noticed, not
        // done", not fixed here.
        const wrapper = mountForm()
        await wrapper.find('input[type="text"]').setValue('Dat')
        await flushPromises()
        await wrapper.find('input[type="text"]').setValue('')
        await wrapper.find('input[type="text"]').trigger('blur')
        await flushPromises()

        expect(wrapper.find('button.btn-success').attributes('disabled')).toBeUndefined()
    })

    it('typing a value into a required field enables the submit button', async () => {
        const wrapper = mountForm()
        await wrapper.find('input[type="text"]').setValue('Dat')
        await flushPromises()

        expect(wrapper.find('button.btn-success').attributes('disabled')).toBeUndefined()
    })

    it('clicking submit while valid calls submitFn with the current form values', async () => {
        const submitFn = vi.fn()
        const wrapper = mountForm({ submitFn })
        await wrapper.find('input[type="text"]').setValue('Dat')
        await flushPromises()

        await wrapper.find('button.btn-success').trigger('click')

        expect(submitFn).toHaveBeenCalledTimes(1)
        expect(submitFn.mock.calls[0][0]).toMatchObject({ name: 'Dat' })
    })

    it('clicking submit on a pristine form calls submitFn anyway, because pristine meta.valid is true', async () => {
        // Same underlying quirk as the "NOT disabled on a pristine form" test
        // above, taken one step further: `onSubmit()`'s own `if
        // (!meta.value.valid) return false` guard also doesn't block a
        // pristine submit, since `meta.valid` reads `true` before any field is
        // validated. Real behavior, not asserting it is correct.
        const submitFn = vi.fn()
        const wrapper = mountForm({ submitFn })
        await flushPromises()

        await wrapper.find('button.btn-success').trigger('click')

        expect(submitFn).toHaveBeenCalledTimes(1)
    })

    it('BUG (real, verified): clicking submit after touching+clearing a required field still calls submitFn', async () => {
        // Same root cause as the test above — `onSubmit()`'s own `if
        // (!meta.value.valid) return false` guard reads the same dead
        // `meta.valid`, so it doesn't block this submit either.
        const submitFn = vi.fn()
        const wrapper = mountForm({ submitFn })
        await wrapper.find('input[type="text"]').setValue('Dat')
        await flushPromises()
        await wrapper.find('input[type="text"]').setValue('')
        await wrapper.find('input[type="text"]').trigger('blur')
        await flushPromises()

        await wrapper.find('button.btn-success').trigger('click')

        expect(submitFn).toHaveBeenCalledTimes(1)
    })

    it('exposed reset() restores each field to its own model default, not a blind ""', async () => {
        // Regression-shaped test for the class of bug in issue #4 (`e.nam`
        // typo silently breaking reset()) — asserts reset() actually reads
        // each field's declared `default`, including a non-empty-string one
        // ('n/a' for `age`), not a single hardcoded value for every field.
        const wrapper = mountForm()
        await wrapper.find('input[type="text"]').setValue('Dat')
        await flushPromises()
        expect(wrapper.find('input[type="text"]').element.valueOf()).toBeTruthy()

        wrapper.vm.reset()
        await flushPromises()

        const textInputs = wrapper.findAll('input[type="text"]')
        expect((textInputs[0].element as HTMLInputElement).value).toBe('')
        expect((textInputs[1].element as HTMLInputElement).value).toBe('n/a')
    })

    it('changing the `document` prop to a record with no _id resets the form to defaults', async () => {
        const wrapper = mountForm({ document: { name: 'Dat', age: '30' } })
        await flushPromises()

        await wrapper.setProps({ document: { name: '', age: '' } })
        await flushPromises()

        const textInputs = wrapper.findAll('input[type="text"]')
        // no `_id` on the new document -> watcher's own `reset()` call wins,
        // `age` goes back to its model default ('n/a'), not the empty string
        // that was just assigned on the prop.
        expect((textInputs[1].element as HTMLInputElement).value).toBe('n/a')
    })

    it('changing the `document` prop to a record WITH _id loads its values without resetting to defaults', async () => {
        const wrapper = mountForm({ document: {} })
        await flushPromises()

        await wrapper.setProps({ document: { _id: 'e1', name: 'Dat', age: '30' } })
        await flushPromises()

        const textInputs = wrapper.findAll('input[type="text"]')
        expect((textInputs[0].element as HTMLInputElement).value).toBe('Dat')
        expect((textInputs[1].element as HTMLInputElement).value).toBe('30')
    })

    it('resetAfterSave clears the form back to defaults right after a valid submit', async () => {
        const wrapper = mountForm({ resetAfterSave: true })
        const textInputs = wrapper.findAll('input[type="text"]')
        await textInputs[0].setValue('Dat')
        await textInputs[1].setValue('30')
        await flushPromises()

        await wrapper.find('button.btn-success').trigger('click')
        await flushPromises()

        // 'age' has a non-empty model default ('n/a') — a bare resetForm()
        // would empty it instead of restoring that default
        expect((textInputs[0].element as HTMLInputElement).value).toBe('')
        expect((textInputs[1].element as HTMLInputElement).value).toBe('n/a')
    })
})
