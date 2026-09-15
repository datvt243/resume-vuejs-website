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
</script>

<template lang="pug">
.body-container 
    Header
    main.main-container(class="py-[1.5rem]")
        #reload
        .container
            slot
    Footer
</template>

<style scoped lang="scss">
.body-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    .main-container {
        flex-grow: 1;
    }
}
</style>
