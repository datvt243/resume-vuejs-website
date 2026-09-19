<script>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { h } from 'vue'

export default {
    props: {
        tag: { type: String, default: 'h4' },
        text: { type: String, default: 'Heading' },
    },
    setup(props, { slots }) {
        return () =>
            h(
                'div',
                {
                    // border-b alone would use Tailwind's own default gray
                    // (from preflight), not Bootstrap's theme-reactive
                    // var(--bs-border-color) — arbitrary-value color keeps
                    // this dark/light-mode correct, matching current behavior
                    class: 'heading flex align-item-center justify-between pb-2 mb-[1.5rem] border-b border-[var(--bs-border-color)] uppercase',
                },
                [
                    h('p', { class: [props.tag, ' m-0'] }, props.text),
                    h('div', { class: 'ms-auto' }, slots?.default && slots.default()),
                ],
            )
    },
}
</script>
