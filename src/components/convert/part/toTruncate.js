/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { h } from 'vue'

const ConvertToTruncate = props => {
    const { modelValue: value } = props
    return h('span', { class: 'block max-w-xs truncate', title: value || undefined }, value || '—')
}

ConvertToTruncate.slots = ['default']
ConvertToTruncate.props = ['modelValue']

export default ConvertToTruncate
