<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Public, read-only CV page reachable via a share link
 * (`/resume/:slug`) — no login required. Fetches directly from the
 * backend's already-public `GET /api/me/:value` (gated server-side by the
 * candidate's `isPublic` flag; same response for "not found" and
 * "private" so a private profile can't be distinguished from a
 * non-existent one) — issue #56. The backend resolves `:value` against
 * the candidate's vanity `slug` FIRST, falling back to `email` for
 * backward compatibility with links shared before issue #117 — this page
 * passes whatever the URL segment is through unchanged, works for either.
 * Records a visit via `POST /api/me/:value/visit` on load, completing the
 * visit-tracking feature (`dashboard-visit-count-integration`) that
 * endpoint was built for but nothing called yet.
 *
 * Layout/markup lives in the shared `CvResumeLayout.vue` (issue #119) —
 * the SAME component `PagePreview.vue` renders, so the two can never
 * drift apart. Theme comes from an OPTIONAL `?theme=` query param the
 * owner's copyable public link already carries (appended in
 * `PageInformation.vue` from their own `useCvTheme` selection) — this is
 * a pure frontend mechanism, no backend field needed, so an anonymous
 * visitor sees the same theme the owner picked without any server-side
 * preference storage.
 *
 * Deliberately bypasses `_axios`'s caller (`handleBase`)/`useCandidate`/
 * `useDocument` — those assume an authenticated dashboard context
 * (`api/v1/` prefix, toast + auto-logout-on-401 side effects that make no
 * sense for an anonymous visitor). Calls `_axios` directly with
 * `customURL` instead, which still shares the same `baseURL`/error-shape
 * handling.
 *
 * Layout note: like `NotFound.vue`, this route has no `meta.requiresAuth`
 * — `App.vue` still picks the shell by the VIEWER's own login state
 * (`LayoutDefault` if the viewer happens to be logged into their own
 * account, `LayoutAuth` otherwise), not by route. Pre-existing app-wide
 * behavior, not something newly introduced here.
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { _axios } from '@/services/axios'
import { resolveTheme } from '@/composables/useCvTheme'
import CvResumeLayout from '@/components/cv/CvResumeLayout.vue'

const route = useRoute()
const identifier = route.params.slug

const loading = ref(true)
const notFound = ref(false)
const data = ref(null)
const theme = computed(() => resolveTheme(route.query.theme))

onMounted(async () => {
    try {
        // Issue #116: optional `?profile=` query param (appended to the
        // copyable public link in PageInformation.vue) — the backend
        // filters each section to that profile's selected subset,
        // falling back to unfiltered on any invalid/foreign/missing id.
        const profileId = typeof route.query.profile === 'string' ? route.query.profile : undefined
        const res = await _axios({
            method: 'get',
            customURL: `api/me/${identifier}`,
            params: profileId ? { profile: profileId } : undefined,
        })
        if (!res?.success || !res?.data) {
            notFound.value = true
            return
        }
        data.value = res.data

        /**
         * Ghi nhận lượt ghé thăm — fire-and-forget, không chặn hiển thị CV
         * nếu ghi nhận thất bại.
         */
        _axios({ method: 'post', customURL: `api/me/${identifier}/visit` }).catch(() => {})
    } catch {
        notFound.value = true
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div v-if="loading" class="text-center py-[3rem]">
        <p class="opacity-75">Đang tải hồ sơ...</p>
    </div>

    <div v-else-if="notFound" class="alert alert-warning text-center mx-auto" style="max-width: 500px">
        <p class="m-0 p-[1rem]">Hồ sơ không tồn tại hoặc không được chia sẻ công khai.</p>
    </div>

    <CvResumeLayout v-else :data="data" :theme="theme" />
</template>
