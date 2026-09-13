import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './routers'
import App from './App.vue'

import GlobalComponents from '@/plugins/GlobalComponents'
import initFontAwesomeIcon from '@/plugins/initFontAwesomeIcon'

/**
 * apply the persisted/preferred theme (data-bs-theme) before the app
 * renders, to avoid a light->dark flash on load (issue #62)
 */
import '@/composables/useTheme'

/**
 * css sweetalert2
 */
import './styles/sweetalert2.scss'

/**
 * Tailwind — sole CSS framework as of node `tailwindcss-bootstrap-removal`,
 * the final step of the Bootstrap -> Tailwind phased migration (see
 * agent-hub/haven/diagrams/dev-loop.prime-mermaid.md -> `tailwindcss-setup`
 * through `tailwindcss-bootstrap-removal`). `bootstrap.scss` and the
 * `bootstrap` npm package are gone — every class/component/CSS-variable
 * dependency they used to supply was rebuilt in `./styles/tailwind.css`
 * across the prior nodes (buttons, dropdowns, badges, alerts, forms,
 * grid, navbar, color utilities, spinner, modal, toast, table,
 * input-group, headings, clearfix, `.list`, the self-hosted `--bs-*`
 * root tokens, and this app's own custom CSS that used to live inside
 * bootstrap.scss's tail section).
 */
import './styles/tailwind.css'

/**
 * add store pinia
 */
const pinia = createPinia()

/**
 * init App
 */
const app = createApp(App)

app.config.errorHandler = (err, instance, info) => {
    console.group('ErrorHandler -----------')
    console.log(`${err.toString()}`)
    console.log({ info, instance })
    console.groupEnd()
}

app.use(GlobalComponents)
app.use(initFontAwesomeIcon)
app.use(router)
app.use(pinia)
app.mount('#app')
