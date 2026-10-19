<script>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: card / panel (DESIGN.md §5.1).
 */

import { h } from 'vue'
export default {
    props: {
        class: { type: String, default: '' },
    },
    setup(props, { slots }) {
        return () =>
            h('div', { class: ['rounded-md border border-line bg-surface p-4', props.class] }, slots?.default && slots?.default())
    },
}
</script>
