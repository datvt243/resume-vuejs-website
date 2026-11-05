<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import Header from '@/pages/_layouts/Header.vue'
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
import Footer from '@/pages/_layouts/Footer.vue'

import { ref, watch, onBeforeUnmount, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useVisits } from '@/composables/useVisits'

// lượt xem CV — LayoutDefault là ancestor duy nhất bọc mọi trang dashboard
// nên fetch ở đây, cache vào candidateStore; PageHome.vue chỉ đọc lại giá
// trị cache, không fetch riêng (tránh gọi API 2 lần cùng lúc)
const { getData: reloadVisits } = useVisits()
// pages showing the cached visits retry through this instead of a second useVisits() (would double-fetch on reload)
provide('reloadVisits', reloadVisits)

const route = useRoute()

// drawer < 1024px; từ lg trở lên sidebar luôn hiện, state này bị bỏ qua
const navOpen = ref(false)

function onKeydown(e) {
    if (e.key === 'Escape') navOpen.value = false
}

watch(navOpen, open => {
    if (open) document.addEventListener('keydown', onKeydown)
    else document.removeEventListener('keydown', onKeydown)
})
// nav sub-groups the user toggled; reset on navigation so a group shows open only while one of its pages is active
const toggledGroups = ref({})
watch(
    () => route.path,
    () => {
        navOpen.value = false
        toggledGroups.value = {}
    },
)
function isGroupOpen(item) {
    return toggledGroups.value[item.key] ?? item.children.some(c => c.to === route.path)
}
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
function toggleGroup(item) {
    toggledGroups.value = { ...toggledGroups.value, [item.key]: !isGroupOpen(item) }
}
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const navGroups = [
    {
        label: 'nav.overview',
        items: [
            { key: 'nav.dashboard', to: '/', icon: 'fa-solid fa-gauge' },
            { key: 'nav.visits', to: '/dashboard/visits', icon: 'fa-solid fa-chart-line' },
        ],
    },
    {
        label: 'nav.profile',
        items: [
            { key: 'nav.information', to: '/dashboard/information', icon: 'fa-solid fa-user' },
            { key: 'nav.generalInformation', to: '/dashboard/general-information', icon: 'fa-solid fa-id-card' },
            { key: 'nav.skills', to: '/dashboard/skills', icon: 'fa-solid fa-code' },
            { key: 'nav.languages', to: '/dashboard/languages', icon: 'fa-solid fa-language' },
            { key: 'nav.education', to: '/dashboard/education', icon: 'fa-solid fa-graduation-cap' },
            { key: 'nav.experience', to: '/dashboard/experience', icon: 'fa-solid fa-briefcase' },
            { key: 'nav.project', to: '/dashboard/project', icon: 'fa-solid fa-layer-group' },
            {
                key: 'nav.achievements',
                icon: 'fa-solid fa-award',
                children: [
                    { key: 'nav.award', to: '/dashboard/award', icon: 'fa-solid fa-award' },
                    { key: 'nav.certificate', to: '/dashboard/certificate', icon: 'fa-solid fa-certificate' },
                    { key: 'nav.reference', to: '/dashboard/reference', icon: 'fa-solid fa-address-book' },
                ],
            },
        ],
    },
    {
        label: 'nav.tools',
        items: [
            { key: 'nav.application', to: '/dashboard/application', icon: 'fa-solid fa-paper-plane' },
            { key: 'nav.importCv', to: '/dashboard/import-linkedin', icon: 'fa-solid fa-file-import' },
            { key: 'nav.atsCheck', to: '/dashboard/ats-check', icon: 'fa-solid fa-circle-check' },
            { key: 'nav.cvProfile', to: '/dashboard/profile', icon: 'fa-solid fa-file-lines' },
            { key: 'nav.preview', to: '/dashboard/preview', icon: 'fa-solid fa-eye' },
        ],
    },
]
// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const settingsItem = { key: 'nav.accountSettings', to: '/dashboard/account-settings', icon: 'fa-solid fa-gear' }
</script>

<template lang="pug">
.min-h-screen.bg-bg
    .modal-backdrop.show.z-30(v-if="navOpen" class="lg:hidden" aria-hidden="true" @click="navOpen = false")

    aside#app-sidebar.fixed.inset-y-0.left-0.z-40.flex.w-60.flex-col.border-r.border-line.bg-surface(
        :class="navOpen ? 'translate-x-0' : 'invisible -translate-x-full'"
        class="motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out lg:visible lg:translate-x-0"
    )
        RouterLink.flex.h-14.shrink-0.items-center.gap-2.border-b.border-line.px-4.text-fg.no-underline(to="/" class="hover:text-fg")
            FontAwesomeIcon.text-brand(icon="fa-solid fa-file-lines")
            span.text-md.font-semibold Resume API
        nav.flex-1.space-y-6.overflow-y-auto.px-3.py-4(:aria-label="$t('nav.main')")
            div(v-for="g in navGroups" :key="g.label")
                p.mb-1.px-2.text-xs.text-fg-3 {{ $t(g.label) }}
                ul.space-y-1
                    li(v-for="r in g.items" :key="r.key")
                        template(v-if="r.children")
                            button.nav-item.w-full(
                                type="button"
                                :aria-expanded="isGroupOpen(r) ? 'true' : 'false'"
                                :aria-controls="`nav-group-${r.key}`"
                                @click="toggleGroup(r)"
                            )
                                span.nav-item-icon
                                    FontAwesomeIcon(:icon="r.icon")
                                span.truncate {{ $t(r.key) }}
                                FontAwesomeIcon.ms-auto.text-xs.text-fg-3(
                                    icon="fa-solid fa-chevron-down"
                                    :class="{ 'rotate-180': isGroupOpen(r) }"
                                    class="motion-safe:transition-transform"
                                )
                            ul.mt-1.space-y-1.pl-4(v-show="isGroupOpen(r)" :id="`nav-group-${r.key}`")
                                li(v-for="c in r.children" :key="c.to")
                                    RouterLink.nav-item(:to="c.to" :class="{ active: c.to === $route.path }" :aria-current="c.to === $route.path ? 'page' : undefined")
                                        span.nav-item-icon
                                            FontAwesomeIcon(:icon="c.icon")
                                        span.truncate {{ $t(c.key) }}
                        RouterLink.nav-item(v-else :to="r.to" :class="{ active: r.to === $route.path }" :aria-current="r.to === $route.path ? 'page' : undefined")
                            span.nav-item-icon
                                FontAwesomeIcon(:icon="r.icon")
                            span.truncate {{ $t(r.key) }}
        .border-t.border-line.px-3.py-3
            RouterLink.nav-item(:to="settingsItem.to" :class="{ active: settingsItem.to === $route.path }" :aria-current="settingsItem.to === $route.path ? 'page' : undefined")
                span.nav-item-icon
                    FontAwesomeIcon(:icon="settingsItem.icon")
                span.truncate {{ $t(settingsItem.key) }}

    .flex.min-h-screen.min-w-0.flex-col(class="lg:pl-60")
        Header(:nav-open="navOpen" @toggle-nav="navOpen = !navOpen")
        main.flex-1.px-4.py-4(class="lg:px-6 lg:py-6")
            #reload
            .mx-auto.max-w-6xl
                slot
        Footer
</template>

<style scoped>
.nav-item {
    @apply relative flex h-10 items-center gap-2 rounded px-2 text-sm text-fg-2 no-underline lg:h-8;
    @apply hover:bg-surface-2 hover:text-fg;
    @apply focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent;
}
.nav-item.active {
    @apply bg-surface-2 font-medium text-fg;
}
.nav-item.active::before {
    content: '';
    @apply absolute inset-y-1 left-0 w-0.5 rounded-sm bg-brand;
}
/* FontAwesome sizes its svg at 1em, so the wrapper's font-size sets the 16px icon */
.nav-item-icon {
    @apply flex w-4 shrink-0 justify-center text-md;
}
</style>
