<script>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */
</script>

<template lang="pug">
TransitionGroup(name="list" class="list" tag="ul")
    slot
</template>

<style scoped lang="scss">
@media (prefers-reduced-motion: no-preference) {
    .list-enter-active,
    .list-leave-active {
        transition:
            opacity 200ms ease-out,
            transform 200ms ease-out;
    }
    .list-enter-from,
    .list-leave-to {
        opacity: 0;
        transform: translateX(8px);
    }
}
</style>
