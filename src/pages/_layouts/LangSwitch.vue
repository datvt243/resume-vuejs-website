<script setup>
/**
 * Header VI | EN switch. One choice sets both the UI language and the CV
 * language, so the info tooltip spells that out. The tooltip opens on hover
 * and on focus (keyboard, or a tap on touch screens). It is anchored to the
 * whole group, not the icon, so it stays on screen at 375px.
 */

import { useCvLang } from '@/composables/useCvLang'

const { selectedLang, setLang } = useCvLang()

const LANG_OPTIONS = [
    { value: 'vi', label: 'VI' },
    { value: 'en', label: 'EN' },
]
</script>

<template>
    <div class="relative flex shrink-0 items-center gap-1">
        <SegmentedControl class="shrink-0 flex-nowrap" :model-value="selectedLang" :options="LANG_OPTIONS" :aria-label="$t('header.language')" @update:model-value="setLang" />
        <div>
            <button
                type="button"
                class="peer inline-flex h-8 w-8 items-center justify-center rounded text-fg-3 hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                :aria-label="$t('header.languageInfoLabel')"
                aria-describedby="lang-switch-tip"
            >
                <FontAwesomeIcon icon="fa-solid fa-circle-info" />
            </button>
            <span
                id="lang-switch-tip"
                role="tooltip"
                class="absolute left-0 top-full z-30 mt-1 hidden w-64 rounded border border-line bg-surface p-2 text-xs text-fg-2 shadow-float peer-hover:block peer-focus:block"
            >
                {{ $t('header.languageInfo') }}
            </span>
        </div>
    </div>
</template>
