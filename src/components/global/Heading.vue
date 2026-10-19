<script>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: page header (level 1, DESIGN.md §4) or section heading
 * (level 2). The default slot holds the actions on the right.
 */

import { h } from 'vue'

export default {
    props: {
        text: { type: String, default: 'Heading' },
        level: { type: [Number, String], default: 2 },
        description: { type: String, default: '' },
    },
    setup(props, { slots }) {
        return () => {
            const isPage = Number(props.level) === 1
            const title = h(
                isPage ? 'h1' : 'h2',
                { class: [isPage ? 'text-lg' : 'text-md', 'm-0 font-semibold text-fg'] },
                props.text,
            )
            const actions = slots.default?.()

            return h(isPage ? 'header' : 'div', { class: ['flex flex-wrap items-start justify-between gap-4', isPage ? 'mb-6' : 'mb-4'] }, [
                h('div', { class: 'min-w-0' }, [
                    title,
                    props.description && h('p', { class: 'mt-1 mb-0 text-sm text-fg-2' }, props.description),
                ]),
                actions && h('div', { class: 'flex items-center gap-2' }, actions),
            ])
        }
    },
}
</script>
