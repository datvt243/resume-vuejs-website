<script>
import { h, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { buttonClass } from '@/lib/button.lib'

export default {
    props: {
        text: { type: String, default: '' },
        // primary | secondary | ghost | danger (DESIGN.md §5.3)
        type: { type: String, default: 'secondary' },
        icon: { type: String, default: '' },
        iconPosition: { type: String, default: 'start' },
        // sm (h-7) | md (h-8) | lg (h-10)
        size: { type: String, default: 'md' },
    },
    setup(props, { attrs }) {
        const iconOnly = computed(() => !!props.icon && !props.text)

        if (import.meta.env.DEV && iconOnly.value && !attrs['aria-label']) {
            console.warn(`[Button] icon-only button "${props.icon}" needs an aria-label`)
        }

        const getContent = computed(() => {
            const { icon, text, iconPosition } = props
            const _result = text ? [h('span', text)] : []
            if (icon) {
                const _icon = h(FontAwesomeIcon, { icon })
                iconPosition === 'start' ? _result.unshift(_icon) : _result.push(_icon)
            }
            return _result
        })

        return () =>
            h(
                'button',
                {
                    type: 'button',
                    class: buttonClass({ variant: props.type, size: props.size, iconOnly: iconOnly.value }),
                },
                getContent.value,
            )
    },
}
</script>
