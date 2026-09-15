<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 *
 * Vue-native rewrite (node `tailwindcss-dropdown-toast-navbar`, part of
 * the Bootstrap -> Tailwind phased migration) — mobile collapse toggle no
 * longer depends on Bootstrap's `Collapse` JS (which was never imported
 * directly by this file anyway — it worked only because `Dropdown.vue`/
 * `Toasts.vue` used to import `bootstrap` JS elsewhere in the bundle,
 * registering Bootstrap's global delegated `data-bs-toggle="collapse"`
 * handler as a side effect). Now that those two no longer import
 * `bootstrap` JS at all, this had to become self-contained.
 *
 * Node `tailwindcss-navbar-component-system`: dropped the bare
 * `.collapse` class from the root div below (kept only `.navbar-collapse`
 * + the dynamic `.show`) — `.collapse` collides with a REAL, unrelated
 * Tailwind utility of the same name (`visibility: collapse`, meant for
 * table rows), which — because Tailwind's `@layer utilities` always
 * outranks any `@layer components` override regardless of source order —
 * would silently force `visibility: collapse` (effectively invisible)
 * onto this element whenever `.show` was present, breaking the open
 * state on both mobile (expanded) and desktop (`.navbar-expand-lg`
 * always-visible) layouts. `.navbar-collapse`/`.show` alone are unique
 * class names with no such collision, and behave identically otherwise.
 */
import { ref } from 'vue'

const expanded = ref(false)
</script>

<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container">
            <a class="navbar-brand" href="#">Resume API</a>
            <button class="navbar-toggler" type="button" @click="expanded = !expanded"
                aria-controls="navbarSupportedContent" :aria-expanded="expanded ? 'true' : 'false'"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-collapse grow" :class="{ show: expanded }"
                :style="{ display: expanded ? 'block' : '' }" id="navbarSupportedContent">
                <slot></slot>
            </div>
        </div>
    </nav>
</template>
