<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: catch-all route — empty state (DESIGN.md §5.8) with a way back.
 */

import { t } from '@/i18n'
import { buttonClass } from '@/lib/button.lib'
</script>

<template>
    <main class="flex min-h-screen items-center justify-center">
        <NoData icon="fa-solid fa-circle-info" :title="t('notFound.title')" :description="t('notFound.description')">
            <RouterLink to="/" :class="buttonClass({ variant: 'primary' })">{{ t('notFound.backHome') }}</RouterLink>
        </NoData>
    </main>
</template>
