/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { h } from 'vue'

const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

const ConvertToDate = props => {
    const d = props.modelValue ? new Date(props.modelValue) : null
    const valid = d && !Number.isNaN(d.getTime())
    return h('span', { class: 'tabular-nums' }, valid ? dateFormat.format(d) : '—')
}

ConvertToDate.slots = ['default']
ConvertToDate.props = {
    // ms timestamps (FrmDatePicker) or ISO strings (createdAt-style fields)
    modelValue: { type: [Number, String, null], default: null },
}

export default ConvertToDate
