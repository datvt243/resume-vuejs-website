/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { h } from 'vue'

const ConvertToText = props => {
    const { modelValue: value } = props
    const empty = value === undefined || value === null || value === ''
    return h('span', { class: 'block max-w-xs truncate', title: empty ? undefined : String(value) }, empty ? '—' : value)
}

ConvertToText.slots = ['default']
ConvertToText.props = ['modelValue']

export default ConvertToText
