import Swal from 'sweetalert2'
import { buttonClass } from '@/lib/button.lib'
import { t } from '@/i18n'

const actionClasses = {
    confirmButton: buttonClass({ variant: 'danger' }),
    cancelButton: buttonClass({ variant: 'secondary' }),
}

/**
 * Delete confirm (DESIGN.md §4.4): a specific question, "Xóa" / "Hủy".
 * `getHtml` is shown as plain text — it often carries user-entered names.
 */
export const confirmDelete = (props = {}) => {
    const { title = t('confirm.deleteItem'), getHtml = null, callback = () => {} } = props
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
        text: getHtml ? getHtml?.() : '',
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
