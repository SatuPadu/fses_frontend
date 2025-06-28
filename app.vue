<template>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
    <GlobalToast />
</template>

<script setup>
import GlobalToast from '~/components/shared/GlobalToast.vue';
</script>