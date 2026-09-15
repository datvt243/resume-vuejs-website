<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

// eslint-disable-next-line no-unused-vars -- dùng trong <template lang="pug">, vue-eslint-parser không phân tích được usage trong pug nên báo false positive
const yearNow = new Date().getFullYear()
</script>

<template lang="pug">
footer.py-2.border-t(class="border-[var(--bs-border-color)]")
    .container.text-end.opacity-50
        small.text-sm copyright by <a href="https://github.com/datvt243" target="_blank">me</a> &copy; {{ yearNow }}
</template>
