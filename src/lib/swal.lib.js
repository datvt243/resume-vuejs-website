import Swal from 'sweetalert2'
import { buttonClass } from '@/lib/button.lib'
import { t } from '@/i18n'

const actionClasses = {
    confirmButton: buttonClass({ variant: 'danger' }),
    cancelButton: buttonClass({ variant: 'secondary' }),
}

// Typed confirm input: "Xóa" only proceeds once the user types exactly `delete`
export const typedDeleteInput = () => ({
    input: 'text',
    inputValue: '',
    inputPlaceholder: t('confirm.typeDeletePlaceholder'),
    inputValidator: value => (value !== 'delete' ? t('confirm.typeDelete') : undefined),
})

const escapeHtml = text => Object.assign(document.createElement('div'), { textContent: text }).innerHTML

/**
 * Delete confirm (DESIGN.md §4.4): a specific question, "Xóa" / "Hủy".
 * `getHtml` is shown as plain text — it often carries user-entered names.
 * `typed` adds the typed `delete` input, for deletes with no undo.
 */
export const confirmDelete = (props = {}) => {
    const { title = t('confirm.deleteItem'), getHtml = null, typed = false, callback = () => {} } = props
    const text = getHtml ? getHtml?.() : ''
    Swal.fire({
        title,
        icon: 'warning',
        showCloseButton: true,
        showCancelButton: true,
        reverseButtons: true,
        cancelButtonText: t('common.cancel'),
        confirmButtonText: t('common.delete'),
        allowOutsideClick: false,
        customClass: actionClasses,
        buttonsStyling: false,
        ...(typed ? { ...typedDeleteInput(), html: `${escapeHtml(text)}<br>${t('confirm.typeDelete')}` } : { text }),
    }).then(async (result) => {
        if (result.isConfirmed) {
            await callback?.()
        }
    })
}

export const confirmDiscardChanges = async () => {
    const result = await Swal.fire({
        title: t('confirm.unsavedChanges'),
        icon: 'warning',
        showCancelButton: true,
        reverseButtons: true,
        cancelButtonText: t('confirm.stay'),
        confirmButtonText: t('confirm.closeAnyway'),
        customClass: actionClasses,
        buttonsStyling: false,
    })
    return result.isConfirmed
}
