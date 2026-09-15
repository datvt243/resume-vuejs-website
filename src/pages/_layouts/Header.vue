<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { computed } from 'vue'
import { authStore } from '@/stores/auth'
import { candidateStore } from '@/stores/candidate'
import { useTheme } from '@/composables/useTheme'
import { useRouter } from 'vue-router'
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import Navbar from '@/components/Navbar.vue'

import { API } from '@/config/api.config'

const router = useRouter()
const store = authStore()
const candidate = candidateStore()
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const { theme, toggleTheme } = useTheme()

const _user = store.getUser
const _token = store.getToken

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const _settings = {
    host: window.location.host === 'localhost' ? 'http://localhost:3001/' : API,
    getMe() {
        return _user?.email ? `${this.host}api/me/${_user.email}` : '#'
    },
    getFile() {
        return `${this.host}api/v1/download-pdf?token=${_token}`
    },
}

/* const HOST = window.location.host === 'localhost' ? 'http://localhost:3001/' : API
const API_GET_ME = _user?.email ? `${HOST}api/me/${_user.email}` : '#'
const API_DOWNLOAD_PDF = `${HOST}api/v1/download-pdf?token=${_token}` */

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const authRouter = [
    { text: 'Đăng nhập', to: '/login' },
    { text: '/', to: '' },
    { text: 'Đăng ký', to: '/register' },
]

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const mesUser = computed(() => {
    const user = store.getUser
    const fullName = (user => {
        const { firstName = '', lastName = '', email = '' } = user
        const _name = `${firstName} ${lastName} ${email}`.trim()
        return _name || 'User'
    })(user || {})

    return `<small class="opacity-60">Xin chào</small> <span class="hidden sm:inline">, ${fullName}</span>`
})

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
function _handelLogout() {
    store.logOut({ router })
    candidate.clean()
}
</script>

<template lang="pug">
header.py-2.border-b.bg-body-tertiary(class="border-[var(--bs-border-color)]")
    template(v-if="!store.isAuthenticated")
        Navbar.grow
            .ms-auto.border-lg-t
                ul.navbar-nav.ms-auto.mb-2(class="lg:mb-0 lg:items-center")
                    li.nav-item(v-for='(r, i) in authRouter' :key="`router_${i}`")
                        template(v-if="r.to")
                            RouterLink.nav-link(:to="r.to" :class="{ active: r.to === $route.fullPath}") {{ r.text }}
                        span.nav-link.hidden(v-else class="lg:block") /
                    li.nav-item
                        button.btn.btn-sm.btn-outline-secondary.rounded-full(
                            type="button"
                            @click="toggleTheme"
                            :title="theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
                        )
                            FontAwesomeIcon(:icon="theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'")
    .container(v-else)
        nav.navbar.navbar-expand-lg
            a.navbar-brand.font-bold.flex.items-center(href="#")
                FontAwesomeIcon.text-success.me-2(icon="fa-solid fa-file-lines")
                | Resume API
            .ms-auto
                .flex.items-center.gap-2
                    button.btn.btn-sm.btn-outline-secondary.rounded-full(
                        type="button"
                        @click="toggleTheme"
                        :title="theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'"
                    )
                        FontAwesomeIcon(:icon="theme === 'dark' ? 'fa fa-sun' : 'fa fa-moon'")
                    a.btn.btn-sm.btn-outline-success.rounded-pill(:href="_settings.getFile()" target="_blank")
                        span.pe-0(class="md:pe-2")
                            FontAwesomeIcon(icon="fa fa-download")
                        span.hidden(class="md:inline") Download CV
                    Dropdown(:text="mesUser" :style="'outline-light'" split is-sm)
                        li.dropdown-item
                            a.dropdown-link(:href="_settings.getMe()" target="_blank")
                                span.pe-2.text-info
                                    FontAwesomeIcon(icon="fa fa-code")
                                | View API
                        li.dropdown-divider
                        li.dropdown-item
                            span.block.pointer(@click="_handelLogout")
                                span.pe-2.text-danger
                                    FontAwesomeIcon(icon="fa fa-arrow-right-from-bracket")
                                | Logout
</template>
