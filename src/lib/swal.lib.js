import Swal from 'sweetalert2'

export const confirmDelete = (props = {}) => {
    const { getHtml = null, callback = () => {} } = props
    Swal.fire({
        title: 'Bạn có chắc là muốn xoá?',
        icon: 'question',
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: 'Huỷ',
        confirmButtonText: 'Xoá',
        allowOutsideClick: false,
        customClass: {
            confirmButton: 'btn btn-danger mx-1',
            cancelButton: 'btn btn-secondary mx-1',
        },
        buttonsStyling: false,
        html: getHtml ? getHtml?.() : '',
    }).then(async (result) => {
        if (result.isConfirmed) {
            await callback?.()
        }
    })
}

export const confirmDiscardChanges = async () => {
    const result = await Swal.fire({
        title: 'Bạn có thay đổi chưa lưu, vẫn đóng?',
        icon: 'warning',
        showCancelButton: true,
        cancelButtonText: 'Ở lại',
        confirmButtonText: 'Vẫn đóng',
        customClass: {
            confirmButton: 'btn btn-danger mx-1',
            cancelButton: 'btn btn-secondary mx-1',
        },
        buttonsStyling: false,
    })
    return result.isConfirmed
}
