/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { h } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { t } from '@/i18n'
const ConvertToBoolean = (props) => {
    const { modelValue: value } = props

    return h(
        'span',
        { class: value ? 'text-success' : 'text-danger' },
        [
            h(FontAwesomeIcon, { icon: value ? 'fa-solid fa-check' : 'fa-solid fa-xmark', 'aria-hidden': 'true' }),
            h('span', { class: 'sr-only' }, value ? t('common.yes') : t('common.no')),
        ],
    )
}

ConvertToBoolean.components = ['FontAwesomeIcon']
ConvertToBoolean.slots = ['default']
ConvertToBoolean.props = {
    modelValue: { type: Boolean, default: false },
}

export default ConvertToBoolean
