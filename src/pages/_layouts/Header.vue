<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { computed, defineProps, defineEmits } from 'vue'
import { authStore } from '@/stores/auth'
import { candidateStore } from '@/stores/candidate'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import LangSwitch from '@/pages/_layouts/LangSwitch.vue'
import { useI18n } from 'vue-i18n'
import { useCvLang } from '@/composables/useCvLang'
import { API } from '@/config/api.config'
import { escapeHtml } from '@/utilities/index'
import { useDownloadCv } from '@/composables/useDownloadCv'

defineProps({ navOpen: { type: Boolean, default: false } })
defineEmits(['toggle-nav'])

const router = useRouter()
const store = authStore()
const candidate = candidateStore()
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const { theme, toggleTheme } = useTheme()
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const { selectedLang } = useCvLang()
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const { download, isDownloading } = useDownloadCv()
const { t } = useI18n()

const _user = store.getUser

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const _settings = {
    host: window.location.host === 'localhost' ? 'http://localhost:3001/' : API,
    getMe() {
        return _user?.email ? `${this.host}api/me/${_user.email}` : '#'
    },
}

/* const HOST = window.location.host === 'localhost' ? 'http://localhost:3001/' : API
const API_GET_ME = _user?.email ? `${HOST}api/me/${_user.email}` : '#'
const API_DOWNLOAD_PDF = `${HOST}api/v1/download-pdf?token=${_token}` */

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const authRouter = [
    { key: 'header.login', to: '/login' },
    { key: 'header.register', to: '/register' },
]

// DESIGN.md §5.3 — shared by the header's icon-only and secondary buttons
const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const iconBtn = `inline-flex h-10 w-10 shrink-0 items-center justify-center rounded text-fg-2 no-underline hover:bg-surface-2 hover:text-fg lg:h-8 lg:w-8 ${focusRing}`
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const secondaryBtn = `inline-flex h-10 shrink-0 items-center gap-2 rounded border border-line-strong bg-surface px-3 text-sm font-medium text-fg no-underline hover:bg-surface-2 hover:text-fg lg:h-8 ${focusRing}`
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const ghostLink = `inline-flex h-10 items-center whitespace-nowrap rounded px-3 text-sm text-fg-2 no-underline hover:bg-surface-2 hover:text-fg lg:h-8 ${focusRing}`

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const mesUser = computed(() => {
    const { firstName = '', lastName = '' } = candidate.getCandidate || {}
    const name = `${firstName} ${lastName}`.trim() || store.getUser?.email || t('header.account')

    // Dropdown renders `text` via v-html — the name is user data, escape it
    return `<span class="block max-w-16 truncate sm:max-w-32">${escapeHtml(name)}</span>`
})

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
function _handelLogout() {
    store.logOut({ router })
    candidate.clean()
}
</script>

<template lang="pug">
header.sticky.top-0.z-20.flex.h-14.shrink-0.items-center.gap-2.border-b.border-line.bg-surface.px-4(class="lg:px-6")
    template(v-if="!store.isAuthenticated")
        RouterLink.flex.items-center.gap-2.text-fg.no-underline(to="/login" class="hover:text-fg")
            FontAwesomeIcon.text-brand(icon="fa-solid fa-file-lines")
            span.hidden.text-md.font-semibold(class="sm:inline") Resume API
        LangSwitch
        nav.ms-auto.flex.items-center.gap-1(:aria-label="$t('header.account')")
            RouterLink(
                v-for="r in authRouter"
                :key="r.to"
                :to="r.to"
                :class="[ghostLink, { 'bg-surface-2 font-medium text-fg': r.to === $route.path }]"
                :aria-current="r.to === $route.path ? 'page' : undefined"
            ) {{ $t(r.key) }}
            button(
                type="button"
                :class="iconBtn"
                :aria-label="$t(theme === 'dark' ? 'header.themeLight' : 'header.themeDark')"
                @click="toggleTheme"
            )
                FontAwesomeIcon(:icon="theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'")
    template(v-else)
        button(
            type="button"
            :class="[iconBtn, 'lg:hidden']"
            :aria-label="$t('header.openNav')"
            aria-controls="app-sidebar"
            :aria-expanded="navOpen ? 'true' : 'false'"
            @click="$emit('toggle-nav')"
        )
            FontAwesomeIcon(icon="fa-solid fa-bars")
        RouterLink.flex.items-center.gap-2.text-fg.no-underline(to="/" class="hover:text-fg lg:hidden")
            FontAwesomeIcon.text-brand(icon="fa-solid fa-file-lines")
            span.hidden.text-md.font-semibold(class="sm:inline") Resume API
        LangSwitch
        .ms-auto.flex.min-w-0.items-center.gap-1(class="sm:gap-2")
            button(
                type="button"
                :class="iconBtn"
                :aria-label="$t(theme === 'dark' ? 'header.themeLight' : 'header.themeDark')"
                @click="toggleTheme"
            )
                FontAwesomeIcon(:icon="theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'")
            button(
                type="button"
                :class="[secondaryBtn, 'hidden sm:inline-flex']"
                :aria-label="$t('header.downloadCv')"
                :disabled="isDownloading"
                :aria-busy="isDownloading"
                @click="download({ lang: selectedLang })"
            )
                FontAwesomeIcon(:icon="isDownloading ? 'fa-solid fa-spinner' : 'fa-solid fa-download'" :spin="isDownloading")
                span.hidden(class="md:inline") {{ $t('header.downloadCv') }}
            Dropdown.user-menu(:text="mesUser" :label="$t('header.accountMenu')" variant="secondary" split is-sm)
                li
                    a.dropdown-item(:href="_settings.getMe()" target="_blank")
                        FontAwesomeIcon.me-2.text-fg-3(icon="fa-solid fa-code")
                        | {{ $t('header.viewApi') }}
                li.dropdown-divider
                li
                    button.dropdown-item(type="button" @click="_handelLogout")
                        FontAwesomeIcon.me-2.text-danger(icon="fa-solid fa-arrow-right-from-bracket")
                        | {{ $t('header.logout') }}
</template>

<style scoped>
/* The user menu is the rightmost control; open its menu leftward so it stays on screen */
.user-menu :deep(.dropdown-menu) {
    left: auto;
    right: 0;
}
</style>
